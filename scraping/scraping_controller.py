# scraper/scraping_controller.py
import json
import threading
import time
import urllib.parse
from decimal import Decimal

import requests
from django.utils import timezone

from .models import ScrapingState, Product, Store


def save_product_to_db(product_info):
    store, created = Store.objects.get_or_create(id=product_info['store_id'])
    Product.objects.update_or_create(
        id=product_info['id'],
        defaults={
            "name": product_info['name'],
            "category": product_info['category'],
            "sub_category": product_info['sub_category'],
            "price": product_info['price'],
            "comparison_price": product_info['comparison_price'],
            "comparison_unit": product_info['comparison_unit'],
            "currency": product_info['currency'],
            "image": product_info['image'],
            "store": store,
        }
    )


def fetch_data(limit_value, from_value):
    base_url = 'https://cfapi.voikukka.fi/graphql'

    variables = {
        "includeAvailabilities": False,
        "availabilityDate": "2024-05-22",
        "facets": [{
            "key": "brandName",
            "order": "asc"
        }, {
            "key": "labels"
        }],
        "includeAgeLimitedByAlcohol": True,
        "limit": limit_value,
        "queryString": "",
        "searchProvider": "loop54",
        "slug": "",
        "sortForAvailabilityLabelDate": "2024-05-20",
        "storeId": "513971200",
        "useRandomId": True,
        "from": from_value,
    }

    extensions = {
        "persistedQuery": {
            "version": 1,
            "sha256Hash": "cae74194d7b0b9171e56ad2430ff052b96aa058699a49e30230fdb0bffbacd6b"
        }
    }

    variables_encoded = urllib.parse.quote(json.dumps(variables))
    extensions_encoded = urllib.parse.quote(json.dumps(extensions))

    url = f'{base_url}?operationName=RemoteFilteredProducts&variables={variables_encoded}&extensions={extensions_encoded}'

    headers = {
        'accept': '*/*',
        'accept-language': 'en,en-US;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://www.s-kaupat.fi',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        'x-client-name': 'skaupat-web',
        'x-client-version': 'production-c786401e5c4d2fe0b4318ffb25ab622e4cd4d0e4'
    }

    response = requests.get(url, headers=headers)
    return response.json()


def extract_product_info(item):
    id = item['id']
    store_id = item['storeId']
    name = item['name']
    category = item['hierarchyPath'][-1]['name']
    sub_category = item['hierarchyPath'][-2]['name'] if len(item['hierarchyPath']) > 1 else None
    price = Decimal(item['price'])
    comparison_price = Decimal(item['comparisonPrice']) if item['comparisonPrice'] else None
    comparison_unit = item['comparisonUnit'] if item['comparisonUnit'] else None
    currency = "€"
    image_template = item['productDetails']['productImages']['mainImage']['urlTemplate']
    image_url = image_template.replace("{MODIFIERS}", "w384_h384_q75").replace("{EXTENSION}", "jpg")
    return {
        "store_id": store_id,
        "id": id,
        "name": name,
        "category": category,
        "sub_category": sub_category,
        "price": price,
        "comparison_price": comparison_price,
        "comparison_unit": comparison_unit,
        "currency": currency,
        "image": image_url
    }


class ScrapingController:
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.limit_value = 100
        self.from_value = 0
        self.total_records = 32820
        self.scraped_records = 0
        self.force_stop_flag = False

    def start_scraping(self, limit_value):
        if self.is_running:
            return "Scraping is already running"
        self.is_running = True
        self.force_stop_flag = False
        self.limit_value = limit_value
        self._load_state()
        self.thread = threading.Thread(target=self._scrape)
        self.thread.start()
        return "Scraping started"

    def stop_scraping(self):
        if not self.is_running:
            return "Scraping is not running"
        self.is_running = False
        if self.thread:
            self.thread.join()
        self._save_state()
        return "Scraping stopped"

    def force_stop_scraping(self):
        if not self.is_running:
            return "Scraping is not running"
        self.force_stop_flag = True
        self.is_running = False
        if self.thread:
            self.thread.join()
        self._save_state()
        return "Scraping force stopped"

    def _scrape(self):
        while self.is_running and self.scraped_records < self.total_records:
            if self.force_stop_flag:
                print("Force stop flag detected, stopping scraping")
                break
            data = fetch_data(self.limit_value, self.from_value)
            products = data['data']['store']['products']['items']
            if not products:
                break
            for product in products:
                product_info = extract_product_info(product)
                save_product_to_db(product_info)
                print(product_info)  # Print or save the product info
            self.scraped_records += self.limit_value
            self.from_value += self.limit_value
            self._save_state()
            if self.scraped_records >= self.total_records:
                self.is_running = False
                print("Scraping completed")
            time.sleep(1)  # Sleep to avoid being blocked

    def _load_state(self):
        try:
            state = ScrapingState.objects.latest('timestamp')
            self.from_value = state.from_value
            self.scraped_records = state.scraped_records
        except ScrapingState.DoesNotExist:
            self.from_value = 0
            self.scraped_records = 0

    def _save_state(self):
        ScrapingState.objects.create(
            from_value=self.from_value,
            scraped_records=self.scraped_records,
            timestamp=timezone.now()
        )

    def get_status(self):
        remaining = max(self.total_records - self.scraped_records, 0)
        return {
            "is_running": self.is_running,
            "limit_value": self.limit_value,
            "from_value": self.from_value,
            "total_records": self.total_records,
            "scraped_records": self.scraped_records,
            "remaining_records": remaining
        }


controller = ScrapingController()

import json
import random
import threading
import time
import urllib.parse
from decimal import Decimal

import requests
from django.utils import timezone

from common.models import ScrapingState, Product, Store


class ScrapingController:
    def __init__(self, date="2024-05-20", step_length=120, target_records=1000):
        # hardcoded limit value 120 because the API only allows maximum 120 items per request
        # hardcode default date value 2024-05-20 for the sake of this example
        self.is_running = False
        self.thread = None
        # self.date = timezone.now().strftime("%Y-%m-%d")
        self.date = date
        self.step_length = step_length
        self.target_records = target_records
        self.from_value = 0
        self.scraped_records = 0
        self.force_stop_flag = False

    def start_scraping(self):
        if self.is_running:
            return "Scraping is already running"
        self.is_running = True
        self.force_stop_flag = False
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

    def reset_scraping(self):
        if self.is_running:
            return "Cannot reset while scraping is running"
        ScrapingState.objects.all().delete()
        self.from_value = 0
        self.scraped_records = 0
        return "Scraping progress reset"

    def get_status(self):
        remaining = max(self.target_records - self.scraped_records, 0)
        return {
            "is_running": self.is_running,
            "step_length": self.step_length,
            "from": self.from_value,
            "target_records": self.target_records,
            "scraped_records": self.scraped_records,
            "remaining_records": remaining
        }

    @staticmethod
    def fetch_data(date, limit, from_value):
        base_url = 'https://cfapi.voikukka.fi/graphql'

        variables = {
            "includeAvailabilities": False,
            "availabilityDate": date,
            "facets": [{
                "key": "brandName",
                "order": "asc"
            }, {
                "key": "labels"
            }],
            "includeAgeLimitedByAlcohol": True,
            "limit": limit,
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

    @staticmethod
    def extract_product_info(item):
        item_id = item['id']
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
            "id": item_id,
            "name": name,
            "category": category,
            "sub_category": sub_category,
            "price": price,
            "comparison_price": comparison_price,
            "comparison_unit": comparison_unit,
            "currency": currency,
            "image": image_url
        }

    @staticmethod
    def save_product_to_db(product_info):
        store, created = Store.objects.get_or_create(id=product_info['id'])
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

    def _scrape(self):
        backoff_time = 1  # Initial backoff time in seconds
        max_backoff_time = 64  # Maximum backoff time in seconds

        while self.is_running and self.scraped_records < self.target_records:
            if self.force_stop_flag:
                print("Force stop flag detected, stopping scraping")
                break
            try:
                data = self.fetch_data(self.date, self.step_length, self.from_value)
                products = data['data']['store']['products']['items']
                if not products:
                    break
                for product in products:
                    product_info = self.extract_product_info(product)
                    self.save_product_to_db(product_info)
                    print(product_info)  # Print or save the product info
                self.scraped_records += self.step_length
                self.from_value += self.step_length
                self._save_state()
                if self.scraped_records >= self.target_records:
                    self.is_running = False
                    print("Scraping completed")
                backoff_time = 1  # Reset backoff time after successful request
            except Exception as e:
                print(f"Error during scraping: {e}")
                time.sleep(backoff_time)
                backoff_time = min(backoff_time * 2, max_backoff_time)  # Exponential backoff
            sleep_time = random.uniform(1, 3)  # Random sleep between 1 and 3 seconds
            time.sleep(sleep_time)  # Pause to avoid being blocked

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


controller = ScrapingController(date=timezone.now().strftime("%Y-%m-%d"))

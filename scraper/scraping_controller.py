import json
import logging
import random
import threading
import time
import urllib.parse
from decimal import Decimal

import requests
from bs4 import BeautifulSoup
from django.utils import timezone

from common.models import ScrapingState, Product, Store

logger = logging.getLogger(__name__)


class ScrapingController:
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.date = timezone.now().strftime("%Y-%m-%d")
        self.step_length = 120  # Maximum Number of items to fetch per request that the API allows
        self.target_records = 0
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

    @staticmethod
    def fetch_count():
        try:
            # Send a GET request to the URL
            response = requests.get("https://www.s-kaupat.fi/tuotteet")
            response.raise_for_status()  # Check for request errors

            # Parse the HTML content using BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find the element with id="__NEXT_DATA__"
            next_data_element = soup.find(id="__NEXT_DATA__")

            # Check if the element is found
            if next_data_element:
                # Parse next_data_element to JSON
                next_data = json.loads(next_data_element.get_text())

                # Extract the total_ value from the JSON data
                total_ = next_data['props']['pageProps']['apolloState'] \
                    ['Store:{"id":"513971200"}'] \
                    ['products:{"includeAgeLimitedByAlcohol":true,"queryString":"",' \
                     '"searchProvider":"loop54","slug":"",' \
                     '"useRandomId":true}']['total']
                return total_
            else:
                logger.error("Element with id='__NEXT_DATA__' not found.")
                return None
        except requests.RequestException as e:
            logger.error(f"Request error: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return None
        except KeyError as e:
            logger.error(f"Key error: {e}")
            return None

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

    def _scrape(self):
        # get to know how many should be scraped
        self.target_records = self.fetch_count()
        if self.target_records is None:
            logger.error("Failed to fetch total count, aborting scraping")
            self.is_running = False
            return

        backoff_time = 1  # Initial backoff time in seconds
        max_backoff_time = 64  # Maximum backoff time in seconds

        while self.is_running and self.scraped_records < self.target_records:
            if self.force_stop_flag:
                logger.warning("Force stop flag detected, stopping scraping")
                break
            try:
                data = self.fetch_data(self.date, self.step_length, self.from_value)
                products = data['data']['store']['products']['items']
                if not products:
                    break
                for product in products:
                    product_info = self.extract_product_info(product)
                    self.save_product_to_db(product_info)
                    logger.debug(product_info)
                self.scraped_records += self.step_length
                self.from_value += self.step_length
                self._save_state()
                if self.scraped_records >= self.target_records:
                    self.is_running = False
                    logger.info("Scraping completed")
                backoff_time = 1  # Reset backoff time after successful request
            except Exception as e:
                logger.error(f"Error during scraping: {e}")
                time.sleep(backoff_time)
                backoff_time = min(backoff_time * 2, max_backoff_time)  # Exponential backoff
            sleep_time = random.uniform(1, 3)  # Random sleep between 1 and 3 seconds
            time.sleep(sleep_time)  # Pause to avoid being blocked
        self.is_running = False
        logger.info("Scraping task finished or force stopped")

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


controller = ScrapingController()

import json
import urllib.parse
from time import sleep

import requests


def fetch_data(limit_value, from_value):
    # Define the base URL and query parameters
    base_url = 'https://cfapi.voikukka.fi/graphql'

    variables = {
        "includeAvailabilities": False,
        "availabilityDate": "2024-05-20",
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

    # URL-encode the variables and extensions
    variables_encoded = urllib.parse.quote(json.dumps(variables))
    extensions_encoded = urllib.parse.quote(json.dumps(extensions))

    # Construct the complete URL
    url = f'{base_url}?operationName=RemoteFilteredProducts&variables={variables_encoded}&extensions={extensions_encoded}'

    # Define the headers
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

    # Send the GET request
    response = requests.get(url, headers=headers)
    return response.json()


def extract_product_info(item):
    # Extract the desired fields
    item_id = item['id']
    store_id = item['storeId']
    name = item['name']
    category = item['hierarchyPath'][-1]['name']
    sub_category = item['hierarchyPath'][-2]['name']
    price_kg = f"{item['comparisonPrice']}€"
    image_template = item['productDetails']['productImages']['mainImage']['urlTemplate']
    image_url = image_template.replace("{MODIFIERS}", "w384_h384_q75").replace("{EXTENSION}", "jpg")
    return {
        "Store ID": store_id,
        "Item ID": item_id,
        "Name": name,
        "Category": category,
        "Sub-category": sub_category,
        "Price-kg": price_kg,
        "Image": image_url
    }


# Initialize pagination
from_value = 0
limit = 20
all_products = []

for i in range(1):  # Fetch 3 pages
    data = fetch_data(limit, from_value)
    products = data['data']['store']['products']['items']
    if not products:
        break
    for product in products:
        all_products.append(extract_product_info(product))
    from_value += limit
    sleep(1)  # Sleep for 1 second to avoid being blocked

# Print all products
for product in all_products:
    print(product)

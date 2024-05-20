import requests

url = """
https://cfapi.voikukka.fi/graphql?operationName=RemoteProductInfo&variables=%7B%22includeAgeLimitedByAlcohol%22%3Atrue%2C%22includeGlobalFallback%22%3Atrue%2C%22includeAvailabilities%22%3Afalse%2C%22ean%22%3A%222005603200008%22%2C%22storeId%22%3A%22%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22249d942f8ff26b94a7f26aa1a419b2b4a8f4221655ec397cf7fb35d2834da065%22%7D%7D
"""

payload = {}
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

response = requests.request("GET", url, headers=headers, data=payload)
data = response.json()

# Extract the required fields
product = data['data']['product']
name = product['name']
category = product['hierarchyPath'][-1]['name']
sub_category = product['hierarchyPath'][-2]['name']
price_kg = f"{product['comparisonPrice']}€"
image_url_template = product['productDetails']['productImages']['mainImage']['urlTemplate']
image_url = image_url_template.replace('{MODIFIERS}', 'w384_h384_q75').replace('{EXTENSION}', 'jpg')

# Print the extracted information
print(f"Name: {name}, Category: {category}, Sub-category: {sub_category}, Price-kg: {price_kg}, Image: {image_url}")
# Print the extracted information
print(f"Name: {name}")
print(f"Category: {category}")
print(f"Sub-category: {sub_category}")
print(f"Price-kg: {price_kg}")
print(f"Image: {image_url}")

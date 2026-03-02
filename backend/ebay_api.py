import requests
import base64

import os

CLIENT_ID = os.getenv("EBAY_CLIENT_ID")
CLIENT_SECRET = os.getenv("EBAY_CLIENT_SECRET")
def get_ebay_token():
    url = "https://api.sandbox.ebay.com/identity/v1/oauth2/token"

    credentials = f"{EBAY_CLIENT_ID}:{EBAY_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }

    response = requests.post(url, headers=headers, data=data)

    if response.status_code != 200:
        print("eBay Token Error:", response.text)
        return None

    return response.json().get("access_token")


def search_ebay_products(query: str):
    token = get_ebay_token()
    if not token:
        return []

    url = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    }

    params = {
        "q": query,
        "limit": 5
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print("eBay Search Error:", response.text)
        return []

    data = response.json()
    products = []

    if "itemSummaries" in data:
        for item in data["itemSummaries"]:
            products.append({
                "title": item.get("title"),
                "price": item.get("price", {}).get("value"),
                "image": item.get("image", {}).get("imageUrl"),  # ✅ FIXED
                "link": item.get("itemWebUrl"),
                "source": "eBay"
            })

    return products
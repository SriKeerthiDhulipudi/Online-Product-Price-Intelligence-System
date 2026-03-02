import requests

FAKESTORE_URL = "https://fakestoreapi.com/products"

def search_fakestore_products(keyword: str):
    try:
        response = requests.get(FAKESTORE_URL)
        products = response.json()

        # Filter products based on keyword
        filtered = []
        for product in products:
            if keyword.lower() in product["title"].lower():
                filtered.append({
                    "title": product["title"],
                    "price": product["price"],
                    "image": product["image"],
                    "source": "FakeStore"
                })

        return filtered[:5]  # return top 5 matches

    except Exception as e:
        return []
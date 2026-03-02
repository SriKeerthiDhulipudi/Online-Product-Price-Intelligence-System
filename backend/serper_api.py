import requests

SERPER_API_KEY = "7611bf6bb2d7e437affe2344cb7ea002a8f8d4d1"

def search_serper_products(query: str):
    url = "https://google.serper.dev/shopping"

    payload = {
        "q": query,
        "gl": "us",
        "hl": "en"
    }

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        print("Serper Error:", response.text)
        return []

    data = response.json()
    results = []

    if "shopping" in data:
        for item in data["shopping"][:5]:
            results.append({
                "title": item.get("title"),
                "price": item.get("price"),
                "image": item.get("imageUrl") or item.get("thumbnail") or item.get("image"),
                "link": item.get("link"),
                "source": "Serper (Google Shopping)"
            })

    return results
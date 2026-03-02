import requests

SERPAPI_KEY = "48b9b06663a51ac8060467263a1367adba48d2066b0a225b0700ecd22d052644"  # paste your key here

def search_serpapi_products(query: str):
    url = "https://serpapi.com/search.json"

    params = {
        "engine": "google_shopping",  # 🔥 BETTER than amazon engine
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": 5
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print("SerpAPI Error:", response.text)
        return []

    data = response.json()
    products = []

    # 🔥 IMPORTANT: Use shopping_results (not organic_results)
    if "shopping_results" in data:
        for item in data["shopping_results"]:
            products.append({
                "title": item.get("title"),
                "price": item.get("price"),
                "image": item.get("thumbnail"),
                # ✅ FIXED LINK (Multiple fallback options)
                "link": item.get("product_link") or item.get("link") or item.get("serpapi_link"),
                "source": "SerpAPI (Google Shopping)"
            })

    return products
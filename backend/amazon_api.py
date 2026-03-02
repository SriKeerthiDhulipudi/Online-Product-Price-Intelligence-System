import requests

API_KEY = "c2fbc8e7aamshfaec0300ffa4e7ap19a553jsn31ac82def2f1"
URL = "https://real-time-amazon-data.p.rapidapi.com/search"

def search_amazon_products(keyword: str):
    querystring = {"query": keyword, "country": "US", "page": "1"}

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com"
    }

    response = requests.get(URL, headers=headers, params=querystring)
    
    # IMPORTANT: return JSON, not text
    return response.json()
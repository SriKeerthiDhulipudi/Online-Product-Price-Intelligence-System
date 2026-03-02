import requests
from bs4 import BeautifulSoup
import time
import random

HEADERS_LIST = [
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    },
    {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"
    }
]

def get_headers():
    return random.choice(HEADERS_LIST)

def search_amazon_scraper(keyword: str):
    try:
        url = f"https://www.amazon.com/s?k={keyword.replace(' ', '+')}"
        
        # Throttling (VERY IMPORTANT for Task 8)
        time.sleep(random.uniform(2, 4))

        response = requests.get(url, headers=get_headers(), timeout=10)

        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        results = []

        items = soup.select("div[data-component-type='s-search-result']")[:5]

        for item in items:
            title_tag = item.select_one("h2 span")
            price_whole = item.select_one(".a-price-whole")
            price_fraction = item.select_one(".a-price-fraction")
            link_tag = item.select_one("h2 a")

            if not title_tag:
                continue

            title = title_tag.text.strip()

            price = None
            if price_whole and price_fraction:
                price = f"${price_whole.text}{price_fraction.text}"

            link = None
            if link_tag:
                link = "https://www.amazon.com" + link_tag.get("href")

            results.append({
                "title": title,
                "price": price,
                "image": None,
                "link": link,
                "availability": "Unknown",
                "seller_rating": "N/A",
                "shipping": "Not specified",
                "source": "Amazon Scraper"
            })

        return results

    except Exception as e:
        print("Amazon Scraper Error:", e)
        return []
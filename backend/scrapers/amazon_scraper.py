import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def scrape_amazon(keyword: str):
    results = []

    url = f"https://www.amazon.com/s?k={keyword.replace(' ', '+')}"
    logger.info(f"Scraping Amazon: {url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        items = soup.select("div[data-component-type='s-search-result']")[:5]

        for item in items:
            title_elem = item.select_one("h2 span")
            link_elem = item.select_one("h2 a")
            price_whole = item.select_one(".a-price-whole")
            price_fraction = item.select_one(".a-price-fraction")
            image_elem = item.select_one("img.s-image")

            if not title_elem or not price_whole or not price_fraction:
                continue

            title = title_elem.text.strip()
            link = "https://www.amazon.com" + link_elem["href"] if link_elem else ""
            price = f"{price_whole.text}.{price_fraction.text}".replace(",", "")
            image = image_elem["src"] if image_elem else None

            results.append({
                "title": title,
                "price": price,
                "image": image,
                "link": link,
                "source": "Amazon"
            })

        return results

    except Exception as e:
        logger.error(f"Amazon Scraper Error: {e}")
        return []
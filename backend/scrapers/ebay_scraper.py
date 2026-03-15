import time
import random
from bs4 import BeautifulSoup
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_headers():
    agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
    ]
    return {
        "User-Agent": random.choice(agents),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }

def scrape_ebay(keyword: str):
    results = []
    try:
        url = f"https://www.ebay.com/sch/i.html?_nkw={keyword.replace(' ', '+')}"
        logger.info(f"Scraping eBay: {url}")
        
        time.sleep(random.uniform(1.5, 3)) # Respectful throttling
        
        response = requests.get(url, headers=get_headers(), timeout=15)
        if response.status_code != 200:
            logger.error(f"eBay returned {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        items = soup.select(".s-item__wrapper")[:8] # First item is usually systemic 'shop on ebay'
        
        for item in items:
            try:
                title_elem = item.select_one(".s-item__title")
                if not title_elem or "Shop on eBay" in title_elem.text:
                    continue
                    
                title = title_elem.text.strip()
                
                price_elem = item.select_one(".s-item__price")
                if not price_elem:
                    continue
                # Clean price string e.g "$12.99 to $14.99" -> "12.99"
                price_str = price_elem.text.split(" to ")[0].replace("$", "").replace(",", "")
                
                link_elem = item.select_one(".s-item__link")
                link = link_elem.get("href") if link_elem else ""
                
                img_elem = item.select_one(".s-item__image-img")
                image = img_elem.get("src") if img_elem else None
                
                shipping_elem = item.select_one(".s-item__shipping")
                shipping = shipping_elem.text.strip() if shipping_elem else "Variable"
                
                # Default eBay rating assumption as exact rating per item requires deeper scraping
                rating = 4.5
                
                results.append({
                    "title": title,
                    "price": price_str,
                    "image": image,
                    "link": link,
                    "rating": rating,
                    "shipping": shipping,
                    "source": "eBay"
                })
            except Exception as e:
                logger.warning(f"Error parsing eBay item: {e}")
                continue
                
        return results
    except Exception as e:
        logger.error(f"eBay Scraper Error: {e}")
        return []

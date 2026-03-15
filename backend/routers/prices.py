from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Price, Product, PriceAlert, Notification
from pydantic import BaseModel
from cache import get_cache, set_cache
import re

# Scrapers
from scrapers.amazon_scraper import scrape_amazon
from scrapers.ebay_scraper import scrape_ebay

# APIs
from amazon_api import search_amazon_products
from fakestore_api import search_fakestore_products
from serper_api import search_serper_products
from serpapi_api import search_serpapi_products


router = APIRouter(prefix="/api/prices", tags=["prices"])

class PriceAlertCreate(BaseModel):
    product: str
    target_price: float
    email: str

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()


@router.post("/mark-read/{notification_id}")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = 1
        db.commit()
    return {"status": "success"}


# ----------------------------
# Extract numeric price
# ----------------------------
def extract_price_value(price_str):

    if not price_str:
        return 999999.0

    try:
        match = re.search(r'[\d,]+\.?\d*', str(price_str))

        if match:
            return float(match.group().replace(",", ""))

        return 999999.0

    except:
        return 999999.0


# ----------------------------
# Intelligent Deal Score
# ----------------------------
def calculate_intel_score(price, rating, shipping):

    shipping_penalty = 0
    shipping_str = str(shipping).lower()

    if "free" not in shipping_str and "prime" not in shipping_str:
        shipping_penalty = 10

    rating_bonus = 0

    if rating >= 4.5:
        rating_bonus = price * 0.05

    elif rating < 3.5:
        shipping_penalty += price * 0.10

    return (price + shipping_penalty) - rating_bonus


# ----------------------------
# Compare Prices API
# ----------------------------
@router.get("/compare")
def compare_prices(keyword: str, min_rating: float = 0.0, db: Session = Depends(get_db)):

    try:

        cache_key = f"compare:{keyword.lower().strip()}:{min_rating}"

        cached = get_cache(cache_key)

        if cached:
            return cached

        # ----------------------------
        # Get data from sources
        # ----------------------------

        amazon_scraper = scrape_amazon(keyword) or []
        ebay_scraper = scrape_ebay(keyword) or []

        amazon_api = search_amazon_products(keyword) or []
        fakestore = search_fakestore_products(keyword) or []

        serper = search_serper_products(keyword) or []
        serpapi = search_serpapi_products(keyword) or []

        sources = [
            amazon_scraper,
            ebay_scraper,
            amazon_api,
            fakestore,
            serper,
            serpapi
        ]

        all_products = []

        # ----------------------------
        # Create or find product
        # ----------------------------

        product = db.query(Product).filter(
            Product.name.ilike(f"%{keyword}%")
        ).first()

        if not product:

            product = Product(name=keyword)

            db.add(product)
            db.commit()
            db.refresh(product)

        # ----------------------------
        # Process results
        # ----------------------------

        for source in sources:

            if not isinstance(source, list):
                continue

            for item in source:

                if not isinstance(item, dict):
                    continue

                try:

                    price_val = extract_price_value(item.get("price"))
                    rating = float(item.get("rating") or 4.0)
                    shipping = item.get("shipping") or "Free"

                    if rating >= min_rating and price_val < 999999:

                        product_data = {
                            "title": item.get("title", "Unknown Product"),
                            "price": item.get("price"),
                            "price_val": price_val,
                            "image": item.get("image"),
                            "link": item.get("link"),
                            "source": item.get("source", "Unknown Store"),
                            "rating": rating,
                            "shipping": shipping,
                            "intel_score": calculate_intel_score(price_val, rating, shipping)
                        }

                        all_products.append(product_data)

                        new_price = Price(
                            product_id=product.id,
                            product_name=item.get("title", "Unknown"),
                            store_name=item.get("source", "Unknown"),
                            price=price_val,
                            rating=rating,
                            shipping=shipping,
                            product_url=item.get("link")
                        )

                        db.add(new_price)

                        # ----------------------------
                        # Check price alerts
                        # ----------------------------

                        alerts = db.query(PriceAlert).filter(
                            PriceAlert.product_name.ilike(f"%{keyword}%")
                        ).all()

                        for alert in alerts:

                            if price_val <= alert.target_price:
                                print("PRICE DROP ALERT!")
                                print(f"{keyword} dropped to {price_val}")

                                # Create Notification
                                notification = Notification(
                                    message=f"Price drop for {item.get('title')}! Now only ${price_val} on {item.get('source')}.",
                                    product_name=item.get("title"),
                                    old_price=alert.target_price,
                                    new_price=price_val,
                                    is_read=0
                                )
                                db.add(notification)

                except Exception as inner_error:
                    print("Skipping product:", inner_error)

        db.commit()

        # ----------------------------
        # Sort best deals
        # ----------------------------

        all_products.sort(key=lambda x: x.get("intel_score", 999999))

        best_product = all_products[0] if all_products else None

        result = {
            "status": "success",
            "total_products": len(all_products),
            "best_deal": best_product,
            "products": all_products,
            "cached": False
        }

        set_cache(cache_key, {**result, "cached": True})

        return result

    except Exception as e:

        db.rollback()

        print("COMPARE API ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ----------------------------
# Create Price Alert
# ----------------------------
@router.post("/create-alert")
def create_price_alert(alert_data: PriceAlertCreate, db: Session = Depends(get_db)):

    alert = PriceAlert(
        product_name=alert_data.product,
        target_price=alert_data.target_price,
        email=alert_data.email
    )

    db.add(alert)
    db.commit()

    return {
        "status": "success",
        "message": "Price alert created"
    }
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid
import json
from model import predict_image  # matches your latest model.py
from fakestore_api import search_fakestore_products
from amazon_api import search_amazon_products
from serper_api import search_serper_products
from serpapi_api import search_serpapi_products
from ebay_api import search_ebay_products
from scraper_amazon import search_amazon_scraper
from database import init_db, save_price

app = FastAPI()


# Initialize Database on startup
@app.on_event("startup")
def startup():
    init_db()


# CORS (VERY IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount uploads folder (so images can be shown in frontend)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

HISTORY_FILE = "history.json"

# ---------- UPLOAD IMAGE API ----------
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Save file with unique name
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # AI Prediction
        product, confidence = predict_image(file_path)

        # Save history
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)

        new_entry = {
            "filename": unique_name,
            "product": product,
            "confidence": confidence
        }

        history.insert(0, new_entry)

        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=4)

        return {
            "status": "success",
            "detected_product": product,
            "confidence": confidence,
            "image_url": f"http://127.0.0.1:8000/uploads/{unique_name}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- GET HISTORY API ----------
@app.get("/api/history")
def get_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []


# ---------- DELETE IMAGE API ----------
@app.delete("/api/delete/{filename}")
def delete_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    # Remove from history
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)

        history = [item for item in history if item["filename"] != filename]

        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=4)

    return {"status": "deleted"}
# ---------- USER AUTH SYSTEM ----------
USERS_FILE = "users.json"

# Create users file if not exists
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump([], f)


# ---------- REGISTER API ----------
@app.post("/api/register")
async def register(data: dict):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    # Load existing users
    with open(USERS_FILE, "r") as f:
        users = json.load(f)

    # Check if user already exists
    for user in users:
        if user["email"] == email:
            raise HTTPException(status_code=400, detail="User already exists")

    # Add new user
    users.append({
        "email": email,
        "password": password
    })

    # Save users
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

    return {"status": "success", "message": "Registered successfully"}


# ---------- LOGIN API ----------
@app.post("/api/login")
async def login(data: dict):
    email = data.get("username") or data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    # Load users
    if not os.path.exists(USERS_FILE):
        raise HTTPException(status_code=404, detail="No users found")

    with open(USERS_FILE, "r") as f:
        users = json.load(f)

    # Check credentials
    for user in users:
        if user["email"] == email and user["password"] == password:
            return {
                "status": "success",
                "message": "Login successful",
                "user": email
            }

    raise HTTPException(status_code=401, detail="Invalid email or password")


from amazon_api import search_amazon_products

from amazon_api import search_amazon_products
from fastapi import HTTPException


    
    # ---------- MULTI API PRICE COMPARISON ----------
from fastapi import HTTPException
from fakestore_api import search_fakestore_products
from amazon_api import search_amazon_products  # your rapidapi file


def extract_price_value(price):
    if not price:
        return None
    try:
        return float(str(price).replace("$", "").replace(",", ""))
    except:
        return None


@app.get("/api/compare-prices")
def compare_prices(keyword: str, min_rating: float = 0):
    try:
        amazon_results = search_amazon_products(keyword)
        fakestore_results = search_fakestore_products(keyword)
        serper_results = search_serper_products(keyword)
        serpapi_results = search_serpapi_products(keyword)

        all_products = []

        # Combine all sources
        sources = [
            amazon_results,
            fakestore_results,
            serper_results,
            serpapi_results
        ]

        for source in sources:
            if isinstance(source, list):
                for item in source:
                    price = item.get("price", "0")
                    rating = float(item.get("rating", 4.0))  # default rating
                    shipping = item.get("shipping", "Free")

                    # Apply Seller Rating Filter
                    if rating >= min_rating:
                        all_products.append({
                            "title": item.get("title"),
                            "price": price,
                            "image": item.get("image"),
                            "link": item.get("link"),
                            "source": item.get("source"),
                            "rating": rating,
                            "shipping": shipping
                        })

                        # Save to Database automatically 🔥
                        save_price(
                            product_name=item.get("title"),
                            store=item.get("source"),
                            price=str(price),
                            rating=rating,
                            shipping=shipping
                        )

        # Find Best Deal (lowest price)
        def extract_price(p):
            try:
                return float(str(p["price"]).replace("$", "").strip())
            except:
                return 999999

        if all_products:
            best_product = min(all_products, key=extract_price)
        else:
            best_product = None

        return {
            "status": "success",
            "total_products": len(all_products),
            "best_deal": best_product,
            "products": all_products
        }

    except Exception as e:
        return {"error": str(e)}
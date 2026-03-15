from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routers import upload
from database import init_db
from routers import auth, prices, upload, history

app = FastAPI()

# Initialize Database on startup
@app.on_event("startup")
def startup():
    init_db()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create uploads folder if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount uploads folder
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(prices.router)
app.include_router(upload.router)
app.include_router(history.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Price Intelligence API (PostgreSQL + JWT Auth enabled)"
    }
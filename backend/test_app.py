import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from database import get_db, Base
from models import Product, Price, User
from auth import get_password_hash

# Setup Testing Database (In-Memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        # Add Test User
        test_user = User(email="test@example.com", hashed_password=get_password_hash("testpass123"))
        db.add(test_user)
        
        # Add Test Product
        test_product = Product(name="Test Gadget")
        db.add(test_product)
        db.commit()
        db.refresh(test_product)
        
        # Add Test Price
        test_price = Price(
            product_id=test_product.id,
            product_name="Test Gadget Pro",
            store_name="FakeStore",
            price=99.99,
            rating=4.5,
            shipping="Free"
        )
        db.add(test_price)
        db.commit()
    finally:
        db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_login_success(setup_database):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure(setup_database):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_history_endpoint(setup_database):
    response = client.get("/api/history/by-id/1?days=30")
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == 1
    assert "FakeStore" in data["history"]
    assert len(data["history"]["FakeStore"]) > 0
    assert data["history"]["FakeStore"][0]["price"] == 99.99

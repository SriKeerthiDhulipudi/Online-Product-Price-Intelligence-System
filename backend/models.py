from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# -----------------------------
# User Table
# -----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    searches = relationship("SearchHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


# -----------------------------
# Product Table
# -----------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    prices = relationship("Price", back_populates="product")


# -----------------------------
# Price Table
# -----------------------------
class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String, index=True)

    store_name = Column(String, index=True)
    price = Column(Float)
    rating = Column(Float, nullable=True)
    shipping = Column(String, nullable=True)

    product_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="prices")


# -----------------------------
# Search History
# -----------------------------
class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String, index=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="searches")


# -----------------------------
# Price Alerts
# -----------------------------
class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)

    product_name = Column(String)
    target_price = Column(Float)
    email = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------------
# Notifications Table
# -----------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(String)
    product_name = Column(String)
    old_price = Column(Float)
    new_price = Column(Float)
    is_read = Column(Integer, default=0) # 0 for false, 1 for true

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
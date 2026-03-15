from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Price, Product
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("/")
def get_all_history(db: Session = Depends(get_db)):
    return db.query(Price).order_by(Price.created_at.desc()).limit(100).all()

@router.get("/by-id/{product_id}")
def get_price_history_by_id(product_id: int, days: int = 30, db: Session = Depends(get_db)):
    """
    Returns historical price data for a product over the last N days.
    Allows frontend charting of price trends.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    prices = db.query(Price).filter(
        Price.product_id == product_id,
        Price.created_at >= cutoff_date
    ).order_by(Price.created_at.asc()).all()
    
    # Group by store for charting
    history_by_store = {}
    for p in prices:
        if p.store_name not in history_by_store:
            history_by_store[p.store_name] = []
            
        history_by_store[p.store_name].append({
            "date": p.created_at.isoformat(),
            "price": p.price
        })
        
    return {
        "product_id": product.id,
        "product_name": product.name,
        "history": history_by_store
    }

@router.get("/{product_name}")
def get_price_history(product_name: str, db: Session = Depends(get_db)):

    prices = (
        db.query(Price)
        .filter(Price.product_name.ilike(f"%{product_name}%"))
        .order_by(Price.id.asc())
        .all()
    )

    result = []

    for p in prices:
        result.append({
            "price": p.price,
            "store": p.store_name,
            "date": str(p.created_at)
        })

    return result

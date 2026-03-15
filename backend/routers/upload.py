import os
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import SearchHistory
from preprocessing import preprocess_image

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def predict_image(file_path):
    # TODO: Integrate real ML model
    # For testing, we'll return a random product or "iPhone" if the filename suggests it
    fname = os.path.basename(file_path).lower()
    if "iphone" in fname:
        return "iPhone 15", 0.98
    return "Smartphone", 0.85

@router.post("/image-search")
async def image_search(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        product, confidence = predict_image(file_path)

        # Preprocess image
        processed_name = f"proc_{unique_name.split('.')[0]}.jpg"
        processed_path = os.path.join(UPLOAD_DIR, processed_name)
        preprocess_image(file_path, output_path=processed_path)

        # Save to database
        new_search = SearchHistory(query=f"Image Search: {product}")
        db.add(new_search)
        db.commit()

        return {
            "status": "success",
            "product": product,
            "confidence": confidence,
            "image_url": f"http://127.0.0.1:8000/uploads/{unique_name}",
            "processed_url": f"http://127.0.0.1:8000/uploads/{processed_name}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(20).all()
    # Format to match frontend expectations initially
    return [{"id": h.id, "filename": h.query, "product": h.query, "confidence": 1.0, "timestamp": h.created_at} for h in history]

@router.delete("/delete/{filename}")
def delete_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    return {"status": "deleted"}

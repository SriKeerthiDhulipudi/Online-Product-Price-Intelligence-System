import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from PIL import Image

# Load pretrained MobileNetV2 model (AI brain)
model = MobileNetV2(weights="imagenet")

def predict_image(image_path):  # <-- FIXED NAME
    # Load image
    img = Image.open(image_path).convert("RGB")
    
    # Resize to model input size
    img = img.resize((224, 224))
    
    # Convert to array
    img_array = np.array(img)
    
    # Expand dimensions (required for model)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Preprocess for MobileNet
    img_array = preprocess_input(img_array)
    
    # Make prediction
    predictions = model.predict(img_array)
    
    # Decode predictions (top result)
    decoded = decode_predictions(predictions, top=1)[0][0]
    
    product_name = decoded[1]      
    confidence = float(decoded[2])
    
    return product_name, confidence
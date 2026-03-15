import cv2
import numpy as np
import os

def preprocess_image(image_path, output_path=None):
    """
    Preprocess image for AI model:
    - Load & Convert to RGB
    - Resize to 224x224
    - Noise reduction (Gaussian Blur)
    - Normalization (0-1)
    - Convert format (Save as JPEG)
    """
    # Load image using OpenCV
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image at {image_path}")

    # 1. Noise reduction (Gaussian Blur) - do this early to smooth artifacts
    image = cv2.GaussianBlur(image, (5, 5), 0)

    # 2. Resize image to 224x224
    image = cv2.resize(image, (224, 224))

    # 3. Convert BGR to RGB (OpenCV uses BGR by default)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 4. Normalize pixel values (0 to 1) for the returned array
    normalized_array = image_rgb.astype(np.float32) / 255.0

    # 5. Convert format and save
    if output_path:
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        # Save as JPEG (OpenCV uses extension to determine format)
        cv2.imwrite(output_path, image)

    return normalized_array
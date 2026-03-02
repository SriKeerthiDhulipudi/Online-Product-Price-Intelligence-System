import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_path):
    """
    Preprocess image for AI model:
    - Resize
    - Noise reduction
    - RGB conversion
    - Normalization
    """

    # Load image using OpenCV
    image = cv2.imread(image_path)

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Resize image to 224x224 (standard for AI models)
    image = cv2.resize(image, (224, 224))

    # Noise reduction (Gaussian Blur)
    image = cv2.GaussianBlur(image, (5, 5), 0)

    # Normalize pixel values (0 to 1)
    image = image / 255.0

    # Convert to numpy array
    image_array = np.array(image, dtype=np.float32)

    return image_array
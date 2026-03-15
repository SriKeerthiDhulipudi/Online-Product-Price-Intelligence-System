from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

image = Image.open("phone.jpg")

labels = ["phone", "laptop", "shoes", "watch"]

inputs = processor(text=labels, images=image, return_tensors="pt", padding=True)

outputs = model(**inputs)
probs = outputs.logits_per_image.softmax(dim=1)

print(labels[probs.argmax()])
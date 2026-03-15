import base64
import os
from openai import OpenAI

# Load API key from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def predict_image(file_path):

    with open(file_path, "rb") as image_file:
        image_bytes = image_file.read()

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Identify the product in this image. Return only the product name."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=50
        )

        product_name = response.choices[0].message.content.strip()

        return product_name, 0.95

    except Exception as e:
        print("Image prediction error:", e)
        return "Unknown Product", 0.0
import requests

def test_upload():
    url = "http://127.0.0.1:8000/api/upload/image-search"
    file_path = r"C:\Users\srike\.gemini\antigravity\brain\5b2d1d49-5d3c-4a94-bf68-c77ede734c84\test_iphone_image_1773604722724.png"
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
        
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())

if __name__ == "__main__":
    test_upload()

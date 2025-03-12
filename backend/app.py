# backend/app.py
from flask import Flask, request, jsonify
import requests
import os
import base64
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)  

HF_TOKEN = os.getenv("HF_TOKEN")
print(HF_TOKEN)
TEXT_MODEL = "gpt2"  # Replace with your preferred model
IMAGE_MODEL = "stabilityai/stable-diffusion-2-1"

@app.route('/generate-text', methods=['POST'])
def generate_text():
    print(HF_TOKEN)
    data = request.json
    prompt = data.get('prompt', '')
    previous_story = data.get('previous_story', '')
    
    response = requests.post(
        f"https://api-inference.huggingface.co/models/{TEXT_MODEL}",
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "inputs": f"{previous_story}\n{prompt}",
            "parameters": {
                "max_length": 150,
                "temperature": 0.9
            }
        }
    )
    print(response)
    return jsonify({"story": response.json()[0]['generated_text']})

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt', '')
    image_type = data.get('type', 'background')
    
    response = requests.post(
        f"https://api-inference.huggingface.co/models/{IMAGE_MODEL}",
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "inputs": prompt,
            "parameters": {
                "height": 256 if image_type == "character" else 720,
                "width": 256 if image_type == "character" else 1280
            }
        }
    )
    # Ensure the response is successful
    if response.status_code != 200:
        return jsonify({"error": "Failed to generate image"}), response.status_code

    # Convert binary image data to base64
    image_base64 = base64.b64encode(response.content).decode("utf-8")
    return jsonify({"image_url": f"data:image/png;base64,{image_base64}"})

if __name__ == '__main__':
    app.run(port=5000)
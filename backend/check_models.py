from google import genai
from dotenv import load_dotenv
import os

print("🚀 Starting...")

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API Key Found:", api_key is not None)

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say Hello"
    )

    print("✅ Gemini Connected")
    print(response.text)

except Exception as e:
    print("❌ Error:")
    print(e) 
import os
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# -----------------------------
# Voice IDs
# -----------------------------
VOICE_IDS = {
    "en": "21m00Tcm4TlvDq8ikWAM",   # Rachel (English)
    "hi": "WBmxqeNTu1MpgKdx1VAn",   # Hindi Voice
    "te": "WBmxqeNTu1MpgKdx1VAn",   # Telugu (using multilingual voice)
}


def text_to_speech(text: str, language: str = "en"):
    """
    Convert text to speech using ElevenLabs.
    Supports English, Hindi and Telugu.
    """

    voice_id = VOICE_IDS.get(language, VOICE_IDS["en"])

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.2,
            "use_speaker_boost": True
        }
    }

    try:
        response = requests.post(
            url,
            json=data,
            headers=headers,
            timeout=30
        )

        if response.status_code == 200:
            return response.content

        print("ElevenLabs Error")
        print(response.status_code)
        print(response.text)

        return None

    except Exception as e:
        print("Voice Error:", e)
        return None
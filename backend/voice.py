import os
from typing import Optional
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# -----------------------------
# ElevenLabs Multilingual Voice IDs
# -----------------------------
VOICE_IDS = {
    "en": "21m00Tcm4TlvDq8ikWAM",   # Rachel (English)
    "hi": "WBmxqeNTu1MpgKdx1VAn",   # Hindi Voice
    "te": "WBmxqeNTu1MpgKdx1VAn",   # Telugu Voice
    "es": "ErXwobaYiN019PkySvjV",   # Antoni (Multilingual)
    "fr": "ErXwobaYiN019PkySvjV",   # French
    "de": "ErXwobaYiN019PkySvjV",   # German
    "it": "ErXwobaYiN019PkySvjV",   # Italian
    "pt": "ErXwobaYiN019PkySvjV",   # Portuguese
    "default": "21m00Tcm4TlvDq8ikWAM",
}


def text_to_speech(text: str, language: str = "en") -> Optional[bytes]:
    """
    Convert text to speech using ElevenLabs API with eleven_multilingual_v2 model.
    """
    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API Key not configured.")
        return None

    if not text or not text.strip():
        return None

    # Sanitize text: keep up to 1000 characters for snappy voice synthesis response
    clean_text = text.replace("🚨", "").replace("🟢", "").replace("🔴", "").replace("🟡", "").replace("📊", "").replace("👨‍⚕️", "").replace("🏥", "").replace("💰", "").replace("🩺", "").replace("📋", "").replace("🕒", "").replace("⚠️", "")
    clean_text = clean_text.strip()[:1000]

    base_lang = (language or "en").split("-")[0].lower()
    voice_id = VOICE_IDS.get(base_lang, VOICE_IDS["default"])

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    data = {
        "text": clean_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.15,
            "use_speaker_boost": True,
        },
    }

    try:
        response = requests.post(
            url,
            json=data,
            headers=headers,
            timeout=15,
        )

        if response.status_code == 200:
            return response.content

        print(f"ElevenLabs TTS Error [{response.status_code}]: {response.text[:200]}")
        return None

    except Exception as e:
        print(f"Voice generation request error: {e}")
        return None
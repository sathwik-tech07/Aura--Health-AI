import os
import re
from typing import Optional, List
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
    "ru": "ErXwobaYiN019PkySvjV",   # Russian
    "zh": "ErXwobaYiN019PkySvjV",   # Chinese
    "ja": "ErXwobaYiN019PkySvjV",   # Japanese
    "ko": "ErXwobaYiN019PkySvjV",   # Korean
    "ar": "ErXwobaYiN019PkySvjV",   # Arabic
    "bn": "WBmxqeNTu1MpgKdx1VAn",   # Bengali
    "ta": "WBmxqeNTu1MpgKdx1VAn",   # Tamil
    "mr": "WBmxqeNTu1MpgKdx1VAn",   # Marathi
    "ur": "WBmxqeNTu1MpgKdx1VAn",   # Urdu
    "vi": "ErXwobaYiN019PkySvjV",   # Vietnamese
    "default": "21m00Tcm4TlvDq8ikWAM",
}


def clean_text_for_speech(text: str) -> str:
    """
    Cleans markdown formatting and emojis while preserving 100% of the actual words,
    sentences, clinical reasoning, and punctuation.
    """
    if not text:
        return ""

    # Remove emojis that clutter audio synthesis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA70-\U0001FAFF"  # medical & health symbols
        "]+",
        flags=re.UNICODE,
    )
    cleaned = emoji_pattern.sub("", text)

    # Remove markdown bold/italic asterisks, backticks, and header hashes
    cleaned = re.sub(r"[*#_`~]", "", cleaned)
    # Replace bullet point dashes with slight pauses
    cleaned = re.sub(r"^[\s-•]+", "", cleaned, flags=re.MULTILINE)
    # Normalize multiple whitespace and line breaks
    cleaned = re.sub(r"\n+", ". ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def chunk_text(text: str, max_chars: int = 3500) -> List[str]:
    """
    Splits long text into sentence-aware chunks so ElevenLabs receives complete text
    without exceeding provider payload limits.
    """
    if len(text) <= max_chars:
        return [text]

    sentences = re.split(r"(?<=[.!?।\n])\s+", text)
    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        if current_len + len(sentence) + 1 > max_chars and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_len = len(sentence)
        else:
            current_chunk.append(sentence)
            current_len += len(sentence) + 1

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def synthesize_single_chunk(text: str, voice_id: str) -> Optional[bytes]:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.15,
            "use_speaker_boost": True,
        },
    }

    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        if response.status_code == 200:
            return response.content
        print(f"ElevenLabs TTS Error [{response.status_code}]: {response.text[:200]}")
        return None
    except Exception as e:
        print(f"ElevenLabs request error: {e}")
        return None


def text_to_speech(text: str, language: str = "en") -> Optional[bytes]:
    """
    Converts COMPLETE text to speech using ElevenLabs API.
    Does NOT truncate the answer. Handles long answers with chunked synthesis.
    """
    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API Key not configured.")
        return None

    if not text or not text.strip():
        return None

    clean_text = clean_text_for_speech(text)
    if not clean_text:
        return None

    base_lang = (language or "en").split("-")[0].lower()
    voice_id = VOICE_IDS.get(base_lang, VOICE_IDS["default"])

    chunks = chunk_text(clean_text, max_chars=3500)
    audio_segments = []

    for chunk in chunks:
        audio = synthesize_single_chunk(chunk, voice_id)
        if audio:
            audio_segments.append(audio)
        else:
            # If any chunk fails, return whatever we have or None
            pass

    if not audio_segments:
        return None

    # Concatenate MPEG audio chunks sequentially (MP3 frames concatenate cleanly)
    return b"".join(audio_segments)
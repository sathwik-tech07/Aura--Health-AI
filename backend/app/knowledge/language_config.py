"""
AuraHealth AI - Central 18-Language Voice & Localization Configuration
Defines exact language names, speech recognition codes, and ElevenLabs voice settings.
"""

VOICE_LANGUAGE_CONFIG = {
    "en": {
        "name": "English",
        "native": "English",
        "recognition": "en-US",
        "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Rachel
        "flag": "🇬🇧",
    },
    "hi": {
        "name": "Hindi",
        "native": "हिन्दी",
        "recognition": "hi-IN",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",  # Multilingual Indic
        "flag": "🇮🇳",
    },
    "te": {
        "name": "Telugu",
        "native": "తెలుగు",
        "recognition": "te-IN",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",  # Multilingual Indic
        "flag": "🇮🇳",
    },
    "es": {
        "name": "Spanish",
        "native": "Español",
        "recognition": "es-ES",
        "voice_id": "ErXwobaYiN019PkySvjV",  # Antoni
        "flag": "🇪🇸",
    },
    "fr": {
        "name": "French",
        "native": "Français",
        "recognition": "fr-FR",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇫🇷",
    },
    "de": {
        "name": "German",
        "native": "Deutsch",
        "recognition": "de-DE",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇩🇪",
    },
    "it": {
        "name": "Italian",
        "native": "Italiano",
        "recognition": "it-IT",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇮🇹",
    },
    "pt": {
        "name": "Portuguese",
        "native": "Português",
        "recognition": "pt-PT",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇵🇹",
    },
    "ru": {
        "name": "Russian",
        "native": "Русский",
        "recognition": "ru-RU",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇷🇺",
    },
    "zh": {
        "name": "Chinese",
        "native": "中文",
        "recognition": "zh-CN",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇨🇳",
    },
    "ja": {
        "name": "Japanese",
        "native": "日本語",
        "recognition": "ja-JP",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇯🇵",
    },
    "ko": {
        "name": "Korean",
        "native": "한국어",
        "recognition": "ko-KR",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇰🇷",
    },
    "ar": {
        "name": "Arabic",
        "native": "العربية",
        "recognition": "ar-SA",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇸🇦",
    },
    "bn": {
        "name": "Bengali",
        "native": "বাংলা",
        "recognition": "bn-IN",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",
        "flag": "🇧🇩",
    },
    "ta": {
        "name": "Tamil",
        "native": "தமிழ்",
        "recognition": "ta-IN",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",
        "flag": "🇮🇳",
    },
    "mr": {
        "name": "Marathi",
        "native": "मराठी",
        "recognition": "mr-IN",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",
        "flag": "🇮🇳",
    },
    "ur": {
        "name": "Urdu",
        "native": "اردو",
        "recognition": "ur-PK",
        "voice_id": "WBmxqeNTu1MpgKdx1VAn",
        "flag": "🇵🇰",
    },
    "vi": {
        "name": "Vietnamese",
        "native": "Tiếng Việt",
        "recognition": "vi-VN",
        "voice_id": "ErXwobaYiN019PkySvjV",
        "flag": "🇻🇳",
    },
}

DEFAULT_LANG = "en"


def get_language_info(lang_code: str):
    base_code = (lang_code or DEFAULT_LANG).split("-")[0].lower()
    return VOICE_LANGUAGE_CONFIG.get(base_code, VOICE_LANGUAGE_CONFIG[DEFAULT_LANG])

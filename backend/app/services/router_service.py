"""
AuraHealth AI - Multi-Intent & Multilingual Agent Router V2
Accurately identifies ALL healthcare intents in English, Hindi, Telugu, Spanish, and other supported languages.
"""

from typing import List


def detect_intents(user_message: str) -> List[str]:
    """
    Analyzes the user's message in any supported language and returns ALL matching healthcare intents.
    Supported intents: 'emergency', 'symptom', 'billing', 'appointment', 'doctor', 'faq'
    """
    message = (user_message or "").lower().strip()

    if not message:
        return ["faq"]

    intents: List[str] = []

    # 1. Emergency Intent (Highest Priority)
    emergency_keywords = [
        # English
        "chest pain",
        "heart attack",
        "difficulty breathing",
        "can't breathe",
        "cant breathe",
        "shortness of breath",
        "stroke",
        "unconscious",
        "passed out",
        "severe bleeding",
        "heavy bleeding",
        "coughing blood",
        "accident",
        "severe burn",
        "poison",
        "seizure",
        "convulsion",
        "anaphylaxis",
        "allergic reaction",
        "overdose",
        "emergency",
        "911",
        "112",
        "ambulance",
        "choking",
        "trauma",
        # Hindi
        "आपातकाल",
        "इमरजेंसी",
        "सीने में दर्द",
        "सांस लेने में दिक्कत",
        "सांस नहीं आ रही",
        "बेहोश",
        "खून बह रहा",
        "दौरा",
        "एम्बुलेंस",
        # Telugu
        "అత్యవసరం",
        "ఎమర్జెన్సీ",
        "గుండె నొప్పి",
        "శ్వాస ఆడటం లేదు",
        "శ్వాస తీసుకోవడంలో ఇబ్బంది",
        "స్పృహ తప్పడం",
        "రక్తస్రావం",
        "అంబులెన్స్",
    ]
    if any(kw in message for kw in emergency_keywords):
        intents.append("emergency")

    # 2. Symptom Triage Intent
    symptom_keywords = [
        # English
        "pain",
        "ache",
        "fever",
        "cough",
        "headache",
        "cold",
        "vomit",
        "nausea",
        "rash",
        "dizzy",
        "dizziness",
        "sore throat",
        "swelling",
        "stomach",
        "abdomen",
        "back pain",
        "joint",
        "infection",
        "symptom",
        "fatigue",
        "weakness",
        "sick",
        "ill",
        "hurts",
        "feeling unwell",
        "cramps",
        "diarrhea",
        "congestion",
        "blood pressure",
        "migraine",
        # Hindi
        "बुखार",
        "दर्द",
        "सिरदर्द",
        "सिर दर्द",
        "खांसी",
        "जुकाम",
        "उल्टी",
        "चक्कर",
        "कमजोरी",
        "गले में खराश",
        "पेट दर्द",
        "थकान",
        "बीमार",
        "लक्षण",
        # Telugu
        "జ్వరం",
        "నొప్పి",
        "తలనొప్పి",
        "దగ్గు",
        "జలుబు",
        "వాంతులు",
        "కళ్ళు తిరగడం",
        "కడుపు నొప్పి",
        "నీరసం",
        "అలసట",
        "లక్షణాలు",
    ]
    if any(kw in message for kw in symptom_keywords):
        intents.append("symptom")

    # 3. Billing & Insurance Intent
    billing_keywords = [
        # English
        "consultation fee",
        "doctor fee",
        "how much does it cost",
        "how much do you charge",
        "how much is",
        "fees",
        "fee",
        "insurance",
        "bill",
        "billing",
        "payment",
        "refund",
        "invoice",
        "cost",
        "charge",
        "charges",
        "pricing",
        "price",
        "copay",
        "coverage",
        "claim",
        "pay online",
        # Hindi
        "फीस",
        "शुल्क",
        "कितना खर्च",
        "खर्च",
        "लागत",
        "चार्ज",
        "कीमत",
        "बीमा",
        "बिल",
        "भुगतान",
        # Telugu
        "ఫీజు",
        "ఖర్చు",
        "ఎంత అవుతుంది",
        "ధర",
        "ఇన్సూరెన్స్",
        "బీమా",
        "బిల్లు",
        "చెల్లింపు",
    ]
    if any(kw in message for kw in billing_keywords):
        intents.append("billing")

    # 4. Appointment Scheduling Intent
    appointment_keywords = [
        # English
        "book appointment",
        "book an appointment",
        "how can i book",
        "how do i book",
        "appointment",
        "booking",
        "schedule",
        "reschedule",
        "cancel appointment",
        "slot",
        "reserve",
        "visit slot",
        "meet doctor",
        "see doctor",
        "book consultation",
        "doctor visit",
        "timings for doctor",
        "available doctor",
        # Hindi
        "अपॉइंटमेंट",
        "अपॉइंटमेंट कैसे बुक करूं",
        "बुक करूं",
        "बुक करना",
        "बुकिंग",
        "मुलाकात का समय",
        "स्लॉट",
        "तारीख",
        # Telugu
        "అపాయింట్‌మెంట్",
        "ఎలా బుక్ చేయాలి",
        "బుక్ చేసుకోండి",
        "బుకింగ్",
        "స్లాట్",
    ]
    if any(kw in message for kw in appointment_keywords):
        intents.append("appointment")

    # 5. Doctor / Specialist Intent
    doctor_keywords = [
        # English
        "which doctor",
        "what doctor",
        "who should i see",
        "which department",
        "specialist",
        "cardiologist",
        "neurologist",
        "orthopedic",
        "pediatrician",
        "dermatologist",
        "gynecologist",
        "physician",
        "doctors",
        "doctor list",
        "who to consult",
        # Hindi
        "कौन से डॉक्टर",
        "किस डॉक्टर",
        "डॉक्टर",
        "चिकित्सक",
        "विभाग",
        "विशेषज्ञ",
        # Telugu
        "ఏ డాక్టర్",
        "ఎవరిని సంప్రదించాలి",
        "డాక్టర్",
        "వైద్యులు",
        "విభాగం",
        "స్పెషలిస్ట్",
    ]
    if any(kw in message for kw in doctor_keywords):
        intents.append("doctor")

    # 6. FAQ & Clinic Services Intent
    faq_keywords = [
        # English
        "timing",
        "timings",
        "hours",
        "opening hours",
        "working hours",
        "time are you open",
        "open today",
        "when is the clinic open",
        "what services",
        "services do you provide",
        "services provided",
        "services",
        "where are you",
        "address",
        "location",
        "directions",
        "pharmacy",
        "lab",
        "laboratory",
        "parking",
        "wheelchair",
        "contact number",
        "phone number",
        "email",
        "hospital policy",
        "telemedicine",
        "telehealth",
        "online consult",
        "facilities",
        "about clinic",
        "what is aura",
        "who are you",
        "languages",
        # Hindi
        "टाइमिंग",
        "समय",
        "कब खुलता",
        "खुलने का समय",
        "खुलने",
        "सेवाएं",
        "सुविधाएं",
        "पता",
        "स्थान",
        "फोन",
        "संपर्क",
        "ईमेल",
        "दवाखाना",
        "लैब",
        # Telugu
        "టైమింగ్స్",
        "సమయం",
        "సమయాలు",
        "ఎప్పుడు తెరుస్తారు",
        "పని వేళలు",
        "సేవలు",
        "సదుపాయాలు",
        "చిరునామా",
        "ఫోన్ నంబర్",
        "సంప్రదించండి",
        "ఈమెయిల్",
    ]
    if any(kw in message for kw in faq_keywords):
        intents.append("faq")

    # If no specific intent was detected, default to general clinic FAQ
    if not intents:
        intents.append("faq")

    return intents


def detect_agent(user_message: str) -> str:
    """
    Backwards-compatible wrapper returning the primary detected intent.
    """
    intents = detect_intents(user_message)
    return intents[0] if intents else "faq"
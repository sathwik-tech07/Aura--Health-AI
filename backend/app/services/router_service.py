"""
AuraHealth AI - Multi-Intent Agent Router V2
Accurately identifies ALL intents in a single user message (e.g. symptom + doctor + billing + appointment + emergency + faq).
"""

from typing import List


def detect_intents(user_message: str) -> List[str]:
    """
    Analyzes the user's message and returns ALL matching healthcare intents.
    Supported intents: 'emergency', 'symptom', 'billing', 'appointment', 'doctor', 'faq', 'general'
    """
    message = (user_message or "").lower().strip()

    if not message:
        return ["faq"]

    intents: List[str] = []

    # 1. Emergency Intent (Highest Priority)
    emergency_keywords = [
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
    ]
    if any(kw in message for kw in emergency_keywords):
        intents.append("emergency")

    # 2. Symptom Triage Intent
    symptom_keywords = [
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
    ]
    if any(kw in message for kw in symptom_keywords):
        intents.append("symptom")

    # 3. Billing & Insurance Intent
    billing_keywords = [
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
    ]
    if any(kw in message for kw in billing_keywords):
        intents.append("billing")

    # 4. Appointment Scheduling Intent
    appointment_keywords = [
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
    ]
    if any(kw in message for kw in appointment_keywords):
        intents.append("appointment")

    # 5. Doctor / Specialist Intent
    doctor_keywords = [
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
    ]
    if any(kw in message for kw in doctor_keywords):
        intents.append("doctor")

    # 6. FAQ & Clinic Services Intent
    faq_keywords = [
        "what services",
        "services do you provide",
        "services provided",
        "services",
        "where are you",
        "address",
        "location",
        "directions",
        "opening hours",
        "timing",
        "working hours",
        "open today",
        "pharmacy",
        "lab",
        "laboratory",
        "parking",
        "wheelchair",
        "contact number",
        "phone number",
        "hospital policy",
        "telemedicine",
        "telehealth",
        "online consult",
        "facilities",
        "about clinic",
        "what is aura",
        "who are you",
    ]
    if any(kw in message for kw in faq_keywords):
        intents.append("faq")

    # If no specific intent was detected:
    if not intents:
        if len(message.split()) > 3:
            intents.append("symptom")
        else:
            intents.append("faq")

    return intents


def detect_agent(user_message: str) -> str:
    """
    Backwards-compatible wrapper returning the primary detected intent.
    """
    intents = detect_intents(user_message)
    return intents[0] if intents else "faq"
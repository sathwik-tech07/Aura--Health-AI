"""
AuraHealth AI - Specialized Agent Intent Router V2
Directs patient inquiries accurately across 5 specialized healthcare agents:
1. Emergency Agent
2. Billing & Insurance Agent
3. Appointment Agent
4. Symptom Triage Agent
5. FAQ & Clinic Information Agent
"""

def detect_agent(user_message: str) -> str:
    message = (user_message or "").lower().strip()

    if not message:
        return "faq"

    # 1. Emergency Keywords (Highest Priority)
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
    ]

    for kw in emergency_keywords:
        if kw in message:
            return "emergency"

    # 2. Billing & Insurance Keywords (Priority over general doctor/consultation words)
    billing_keywords = [
        "consultation fee",
        "doctor fee",
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
        "pricing",
        "price",
        "copay",
        "coverage",
        "claim",
        "how much",
        "pay online",
    ]

    for kw in billing_keywords:
        if kw in message:
            return "billing"

    # 3. Appointment Scheduling Keywords
    appointment_keywords = [
        "book appointment",
        "appointment",
        "book",
        "booking",
        "schedule",
        "reschedule",
        "cancel appointment",
        "slot",
        "consultation",
        "meet doctor",
        "see doctor",
        "timings for doctor",
        "doctor visit",
        "available doctor",
    ]

    for kw in appointment_keywords:
        if kw in message:
            return "appointment"

    # 4. Symptom Triage Keywords
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
    ]

    for kw in symptom_keywords:
        if kw in message:
            return "symptom"

    # 5. Clinic FAQ / Information Keywords
    faq_keywords = [
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
        "online consult",
        "facilities",
        "about clinic",
        "what is aura",
        "who are you",
        "help",
    ]

    for kw in faq_keywords:
        if kw in message:
            return "faq"

    # Default heuristic: descriptive long messages go to symptom triage, short general to FAQ
    if len(message.split()) > 3:
        return "symptom"

    return "faq"
def detect_agent(user_message: str) -> str:
    message = user_message.lower()

    # Emergency keywords
    emergency_keywords = [
        "chest pain",
        "heart attack",
        "difficulty breathing",
        "can't breathe",
        "stroke",
        "unconscious",
        "severe bleeding",
        "accident",
        "burn",
        "poison",
        "seizure",
        "emergency",
    ]

    # Appointment keywords
    appointment_keywords = [
        "appointment",
        "book",
        "schedule",
        "doctor",
        "consultation",
    ]

    # Billing keywords
    billing_keywords = [
        "bill",
        "billing",
        "payment",
        "insurance",
        "refund",
        "invoice",
        "fee",
    ] 
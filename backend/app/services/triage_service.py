from datetime import datetime

HIGH_RISK = [
    "chest pain",
    "heart attack",
    "difficulty breathing",
    "shortness of breath",
    "can't breathe",
    "stroke",
    "unconscious",
    "loss of consciousness",
    "severe bleeding",
    "heavy bleeding",
]

MODERATE_RISK = [
    "fever",
    "vomiting",
    "abdominal pain",
    "persistent cough",
    "dizziness",
    "headache",
]

LOW_RISK = [
    "cold",
    "runny nose",
    "sore throat",
    "body pain",
    "fatigue",
]


def analyze_symptoms(message: str):

    text = message.lower()

    matched = []

    priority = "🟢 LEVEL 5"
    risk_score = 20
    confidence = 85
    department = "General Medicine"
    doctor = "General Physician"
    fee = "₹500"
    next_action = "Book an appointment if symptoms continue."

    # ---------------- HIGH ----------------

    for symptom in HIGH_RISK:

        if symptom in text:

            matched.append(symptom)

            priority = "🔴 LEVEL 1"

            risk_score = 95

            confidence = 96

            department = "Emergency Department"

            doctor = "Dr. Priya Sharma (Cardiologist)"

            fee = "₹800"

            next_action = (
                "Seek immediate emergency medical care."
            )

    # ---------------- MODERATE ----------------

    if priority == "🟢 LEVEL 5":

        for symptom in MODERATE_RISK:

            if symptom in text:

                matched.append(symptom)

                priority = "🟡 LEVEL 3"

                risk_score = 65

                confidence = 91

                department = "General Medicine"

                doctor = "Dr. Rahul Verma"

                fee = "₹600"

                next_action = (
                    "Consult a doctor within 24 hours."
                )

    # ---------------- LOW ----------------

    if priority == "🟢 LEVEL 5":

        for symptom in LOW_RISK:

            if symptom in text:

                matched.append(symptom)

    return {

        "priority": priority,

        "risk_score": risk_score,

        "confidence": confidence,

        "department": department,

        "doctor": doctor,

        "fee": fee,

        "matched": matched,

        "next_action": next_action,

        "generated": datetime.now().strftime("%d %b %Y %I:%M %p"),
    }
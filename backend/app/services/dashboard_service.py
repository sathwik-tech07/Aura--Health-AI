from app.services.triage_service import analyze_symptoms


def generate_dashboard(user_message):

    result = analyze_symptoms(user_message)

    return {
        "priority": result["priority"],
        "risk_score": result["risk_score"],
        "confidence": result["confidence"],
        "department": result["department"],
        "doctor": result["doctor"],
        "consultation_fee": result["fee"],
        "symptoms": result["matched"],
        "next_action": result["next_action"],
        "generated": result["generated"],
    }
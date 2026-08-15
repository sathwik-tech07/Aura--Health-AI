from app.services.triage_service import analyze_symptoms

def generate_summary(user_message: str, agent: str, language: str = "en") -> str:
    """
    Generates a structured clinical triage report ONLY if actual symptoms are detected.
    Does not append generic boilerplate to FAQ or booking queries.
    """
    result = analyze_symptoms(user_message)

    # If no actual clinical symptoms were detected in the query, do not append a report
    if not result.get("matched"):
        return ""

    symptoms = ", ".join(result["matched"])

    summary = f"""
---
🚨 AURAHEALTH AI CLINICAL TRIAGE REPORT

🚦 Priority: {result["priority"]}
📊 Estimated Risk: {result["risk_score"]}%
🏥 Recommended Department: {result["department"]}
👨‍⚕️ Assigned Specialist: {result["doctor"]}
💰 Consultation Fee: {result["fee"]}
🩺 Symptoms Evaluated: {symptoms}
📋 Action Plan: {result["next_action"]}
🕒 Assessment Timestamp: {result["generated"]}

⚠️ Disclaimer: This assessment is AI-assisted triage guidance and is not a definitive medical diagnosis.
"""
    return summary.strip()
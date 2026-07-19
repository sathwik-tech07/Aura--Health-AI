from app.services.triage_service import analyze_symptoms

def generate_summary(user_message: str, agent: str, language="en"):

    result = analyze_symptoms(user_message)

    symptoms = (
        ", ".join(result["matched"])
        if result["matched"]
        else "General symptoms"
    )

    summary = f"""


🚨 AURAHEALTH AI TRIAGE REPORT



🚦 Priority
{result["priority"]}

📊 Risk Score
{result["risk_score"]}%

🤖 AI Confidence
{result["confidence"]}%

🏥 Department
{result["department"]}

👨‍⚕️ Recommended Doctor
{result["doctor"]}

💰 Consultation Fee
{result["fee"]}

🩺 Symptoms Detected
{symptoms}

📋 Next Best Action
{result["next_action"]}

🕒 Generated
{result["generated"]}

⚠️ Disclaimer

This assessment is AI-assisted and is not a medical diagnosis.
Please consult a qualified healthcare professional.


"""

    return summary 
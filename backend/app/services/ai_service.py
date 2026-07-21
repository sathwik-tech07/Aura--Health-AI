from app.services.summary_service import generate_summary
from google import genai  
from dotenv import load_dotenv
import os

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.router_service import detect_agent
from app.agents.appointment_agent import appointment_agent
from app.services.memory_service import (
    get_history,
    add_message,
)

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY") 

client = genai.Client(api_key=API_KEY)

# Fallback models
MODELS = [
"gemini-2.5-flash"  
    
    
]


def generate_with_fallback(prompt):
    last_error = None

    for model in MODELS:
        try:
            print(f"Trying model: {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            print(f"Using model: {model}")
            return response.text

        except Exception as e:
            print(f"{model} failed: {e}")
            last_error = e

            # Try the next model only for quota/busy errors
            if "429" in str(e) or "503" in str(e):
                continue
            else:
                break

    raise Exception(f"All Gemini models failed.\n{last_error}")

def generate_response(session_id, user_message, language="en"):
    try:
        knowledge = """
Aura Health AI

Clinic Hours:
Monday - Saturday
9:00 AM - 6:00 PM

Services:
- General Consultation
- Symptom Assessment
- Appointment Booking
- Billing Assistance
- Health FAQs

Emergency:
For medical emergencies, immediately contact your nearest hospital or emergency services.

Appointments:
Patients can book, reschedule, or cancel appointments through Aura Health AI.

Contact:
Email: support@aurahealthai.com
Phone: +91-9876543210
"""    
        # Get previous conversation
        history = get_history(session_id)

        history_text = ""

        for item in history:
            history_text += f"{item['role']}: {item['message']}\n"

        # Detect the correct AI agent
        agent_prompt = ""
        agent = detect_agent(user_message)

        if agent == "appointment":
            agent_prompt = appointment_agent()

        elif agent == "symptom":
            from app.agents.symptom_agent import symptom_agent
            agent_prompt = symptom_agent()

        elif agent == "emergency":
            from app.agents.emergency_agent import emergency_agent
            agent_prompt = emergency_agent()

        elif agent == "billing":
            from app.agents.billing_agent import billing_agent
            agent_prompt = billing_agent()

        elif agent == "faq":
            from app.agents.faq_agent import faq_agent
            agent_prompt = faq_agent()

        # Build the prompt
        language_map = {
            "en": "English",
            "hi": "Hindi",
            "te": "Telugu",
        }

        selected_language: str = language_map.get(language, "English") 

        prompt = f"""
    IMPORTANT:

After every recommendation, explain WHY.

Use this format:

Reason:
- Symptom 1
- Symptom 2 
- Symptom 3

Never recommend a department without explaining the reasoning.

Never recommend a doctor without explaining why.

Keep explanations simple and easy to understand.
    {SYSTEM_PROMPT}

    IMPORTANT:

    Reply ONLY in {selected_language}.

    Rules:

    • If the user writes in English, reply in English.

    • If the user writes in Hindi, reply ONLY in Hindi.

    • If the user writes in Telugu, reply ONLY in Telugu.

    Never translate unless the user changes language.

    {agent_prompt}

    Conversation History:
    {history_text}

    Clinic Information:
    {knowledge}

    Customer:
    {user_message}
    """

        # Generate AI response using fallback models
        response_text = generate_with_fallback(prompt)

        # Save conversation history
        add_message(session_id, "User", user_message)
        summary = generate_summary(user_message, agent, language)

        # Translate summary if needed
        if language != "en":
            translate_prompt = f"""
Translate the following hospital patient summary into {selected_language}.

Rules:
- Translate EVERYTHING.
- Keep emojis.
- Keep formatting.
- Keep doctor names unchanged.
- Keep fees unchanged.
- Return ONLY the translated summary.

Summary:

{summary}
"""

            summary = generate_with_fallback(translate_prompt)

        final_response = response_text + "\n\n" + summary

        add_message(session_id, "Assistant", final_response)

        return final_response

    except Exception as e:
        return f"ERROR: {str(e)}" 
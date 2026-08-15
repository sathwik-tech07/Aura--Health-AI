import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from google import genai

from app.database import SessionLocal
from app.crud import create_conversation
from app.schemas import ConversationCreate
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.router_service import detect_intents, detect_agent
from app.services.summary_service import generate_summary
from app.knowledge.clinic_knowledge import get_clinic_knowledge
from app.agents.appointment_agent import appointment_agent
from app.agents.symptom_agent import symptom_agent
from app.agents.emergency_agent import emergency_agent
from app.agents.billing_agent import billing_agent
from app.agents.faq_agent import faq_agent
from app.services.memory_service import (
    get_history,
    add_message,
)

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

# Supported Gemini models in priority order
MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

# 18-Language mapping dictionary
LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh": "Simplified Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "bn": "Bengali",
    "ta": "Tamil",
    "mr": "Marathi",
    "ur": "Urdu",
    "vi": "Vietnamese",
}


def get_genai_client():
    if not API_KEY:
        return None
    try:
        return genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"GenAI Client initialization error: {e}")
        return None


def generate_with_fallback(prompt: str) -> str:
    client = get_genai_client()
    if client is None:
        raise ValueError("GEMINI_API_KEY is not configured on the server.")

    last_error = None

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Model {model} failed: {e}")
            last_error = e
            continue

    raise Exception(f"All Gemini AI models failed: {last_error}")


def get_emergency_fallback(user_message: str, language: str) -> str:
    return (
        f"🚨 **EMERGENCY MEDICAL NOTICE**\n\n"
        f"Based on your inquiry ('{user_message}'), your situation may involve an acute medical emergency. "
        f"Please do NOT wait for AI text responses. Call emergency services (911 in the US / 112 in India/EU) or proceed to the nearest Emergency Department immediately."
    )


def generate_response(session_id: str, user_message: str, language: str = "en") -> str:
    try:
        # Standardize language key (support locale strings like en-US, te-IN, hi-IN)
        base_lang = (language or "en").split("-")[0].lower()
        selected_language = LANGUAGE_MAP.get(base_lang, LANGUAGE_MAP.get(language, "English"))

        # Retrieve verified clinic knowledge base
        knowledge = get_clinic_knowledge()

        # Retrieve recent conversation memory (keep last 8 interactions for efficient context)
        history = get_history(session_id)[-8:]
        history_text = "\n".join(f"{item['role']}: {item['message']}" for item in history)

        # Multi-intent detection: identify ALL relevant user intents
        detected_intents: List[str] = detect_intents(user_message)
        primary_agent = detected_intents[0] if detected_intents else "faq"

        # Build combined agent guidance for each detected intent
        agent_directives = []

        if "emergency" in detected_intents:
            agent_directives.append(f"--- EMERGENCY DIRECTIVE ---\n{emergency_agent()}")
        if "symptom" in detected_intents:
            agent_directives.append(f"--- SYMPTOM TRIAGE DIRECTIVE ---\n{symptom_agent()}")
        if "doctor" in detected_intents:
            agent_directives.append(
                "--- DOCTOR SPECIALIST DIRECTIVE ---\n"
                "Recommend the most relevant clinic specialist and department based on the reported concern. "
                "Always include a structured 'Reason:' block explaining WHY that specialist is recommended."
            )
        if "appointment" in detected_intents:
            agent_directives.append(f"--- APPOINTMENT SCHEDULING DIRECTIVE ---\n{appointment_agent()}")
        if "billing" in detected_intents:
            agent_directives.append(f"--- BILLING & INSURANCE DIRECTIVE ---\n{billing_agent()}")
        if "faq" in detected_intents or not agent_directives:
            agent_directives.append(f"--- CLINIC SERVICES & FAQ DIRECTIVE ---\n{faq_agent()}")

        combined_agent_prompt = "\n\n".join(agent_directives)

        # Multi-topic requirement instruction
        multi_intent_instruction = f"""
CRITICAL MULTI-INTENT REQUIREMENT:
The user has asked a question containing MULTIPLE distinct topics: {', '.join(detected_intents).upper()}.
You MUST address EVERY SINGLE ONE of these topics clearly and completely in your response.
Do NOT ignore any part of the user's question.

Answer Structure Guidelines:
1. If symptoms/emergencies are mentioned: Provide safe symptom assessment or emergency guidance first.
2. If doctors/departments are asked: State the recommended department/physician with a 'Reason:' section.
3. If fees/billing/insurance are asked: Provide exact consultation fees and insurance details from Clinic Information.
4. If appointments/booking are asked: Explain how to schedule or offer booking assistance.
5. If clinic services/hours/location are asked: Summarize the hospital facilities, working hours, and address.
"""

        # Build prompt
        prompt = f"""
{SYSTEM_PROMPT}

{multi_intent_instruction}

SPECIALIZED AGENT DIRECTIVES:
{combined_agent_prompt}

OUTPUT LANGUAGE INSTRUCTION:
Reply fluently, naturally, and completely in {selected_language}.
If the user's message is in {selected_language}, reply in {selected_language}.

CLINIC INFORMATION (Use as sole verified source):
{knowledge}

RECENT CONVERSATION CONTEXT:
{history_text if history_text else "No previous conversation in this session."}

PATIENT INQUIRY:
{user_message}

CRITICAL RULES:
- Address ALL parts of the patient's inquiry in ONE coherent, structured response.
- When recommending a department or doctor, provide a structured 'Reason:' explanation.
- Never diagnose diseases with certainty.
- Answer completely in {selected_language}.
"""

        try:
            response_text = generate_with_fallback(prompt)
        except Exception as ai_err:
            print(f"Gemini generation error: {ai_err}")
            if "emergency" in detected_intents:
                response_text = get_emergency_fallback(user_message, base_lang)
            else:
                response_text = (
                    f"Thank you for contacting AuraHealth AI regarding your inquiry. "
                    f"Our clinical team and doctors across all departments are available 24/7. "
                    f"Please consult a physician or visit our clinic for a full evaluation."
                )

        # Generate structured triage summary if symptom or emergency is present
        summary = ""
        if any(intent in ["symptom", "emergency", "appointment"] for intent in detected_intents):
            summary = generate_summary(user_message, primary_agent, base_lang)

        final_response = response_text
        if summary and ("symptom" in detected_intents or "emergency" in detected_intents):
            final_response = f"{response_text}\n\n{summary}"

        # Update in-memory session cache
        add_message(session_id, "User", user_message)
        add_message(session_id, "Assistant", final_response)

        # Persist conversation to SQLite database
        try:
            db = SessionLocal()
            try:
                create_conversation(
                    db,
                    ConversationCreate(
                        session_id=session_id,
                        user_message=user_message,
                        ai_response=final_response,
                    ),
                )
            finally:
                db.close()
        except Exception as db_err:
            print(f"Database conversation persist error: {db_err}")

        return final_response

    except Exception as e:
        print(f"generate_response top-level error: {e}")
        return (
            "We are currently experiencing high clinical request volume. "
            "If you are experiencing severe symptoms, please contact emergency services immediately or visit your nearest clinic."
        )
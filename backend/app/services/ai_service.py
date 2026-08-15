import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

from app.database import SessionLocal
from app.crud import create_conversation
from app.schemas import ConversationCreate
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.router_service import detect_agent
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
            # Try next model on quota/rate limit/transient failures
            continue

    raise Exception(f"All Gemini AI models failed: {last_error}")


def get_emergency_fallback(user_message: str, language: str) -> str:
    lang_name = LANGUAGE_MAP.get(language, "English")
    return (
        f"🚨 **EMERGENCY MEDICAL NOTICE**\n\n"
        f"Based on your message ('{user_message}'), your symptoms may represent an acute medical emergency. "
        f"Please do NOT wait for AI chat responses. Call emergency services (911 / 112) or proceed to the nearest emergency department immediately."
    )


def generate_response(session_id: str, user_message: str, language: str = "en") -> str:
    try:
        # Standardize language key (support locale strings like en-US, te-IN)
        base_lang = (language or "en").split("-")[0].lower()
        selected_language = LANGUAGE_MAP.get(base_lang, LANGUAGE_MAP.get(language, "English"))

        # Retrieve clinic knowledge base
        knowledge = get_clinic_knowledge()

        # Retrieve recent conversation memory (keep last 8 interactions for efficient context)
        history = get_history(session_id)[-8:]
        history_text = "\n".join(f"{item['role']}: {item['message']}" for item in history)

        # Detect the specialized AI agent
        agent = detect_agent(user_message)

        if agent == "emergency":
            agent_prompt = emergency_agent()
        elif agent == "appointment":
            agent_prompt = appointment_agent()
        elif agent == "symptom":
            agent_prompt = symptom_agent()
        elif agent == "billing":
            agent_prompt = billing_agent()
        else:
            agent_prompt = faq_agent()

        # Build prompt
        prompt = f"""
{SYSTEM_PROMPT}

SPECIALIZED AGENT DIRECTIVE:
{agent_prompt}

OUTPUT LANGUAGE INSTRUCTION:
Reply fluently, naturally, and completely in {selected_language}.
If the user's message is in {selected_language}, reply in {selected_language}.

CLINIC INFORMATION:
{knowledge}

RECENT CONVERSATION CONTEXT:
{history_text if history_text else "No previous conversation in this session."}

PATIENT INQUIRY:
{user_message}

CRITICAL RULES:
- Provide empathetic, concise, and clinically safe guidance.
- When recommending a department or doctor, provide a structured 'Reason:' explanation.
- Never diagnose diseases with certainty.
- Answer in {selected_language}.
"""

        try:
            response_text = generate_with_fallback(prompt)
        except Exception as ai_err:
            print(f"Gemini generation error: {ai_err}")
            if agent == "emergency":
                response_text = get_emergency_fallback(user_message, base_lang)
            else:
                response_text = (
                    f"Thank you for contacting AuraHealth AI. I have registered your message: '{user_message}'. "
                    f"Our clinical team is available 24/7. Please consult a qualified healthcare professional or book an appointment for evaluation."
                )

        # Generate structured triage summary
        summary = generate_summary(user_message, agent, base_lang)

        final_response = response_text
        if summary and agent in ["symptom", "emergency", "appointment"]:
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
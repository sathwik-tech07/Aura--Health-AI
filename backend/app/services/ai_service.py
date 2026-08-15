import os
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
from google import genai

from app.database import SessionLocal
from app.crud import create_conversation
from app.schemas import ConversationCreate
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.router_service import detect_intents, detect_agent
from app.services.summary_service import generate_summary
from app.knowledge.clinic_knowledge import get_clinic_knowledge, CLINIC_HOURS, CLINIC_PHONE, CLINIC_EMAIL
from app.knowledge.language_config import VOICE_LANGUAGE_CONFIG, get_language_info
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


def get_local_knowledge_response(user_message: str, detected_intents: List[str], lang_code: str) -> str:
    """
    Multilingual offline knowledge response generator ensuring accurate answers
    even when network AI endpoints are unavailable.
    """
    base_lang = (lang_code or "en").split("-")[0].lower()
    msg_lower = (user_message or "").lower()

    # 1. Hindi Knowledge Response
    if base_lang == "hi":
        parts = []
        is_timing = any(w in msg_lower for w in ["टाइमिंग", "समय", "खुलता", "timing", "hours", "time"])
        is_services = any(w in msg_lower for w in ["सेवाएं", "सेवा", "सुविधा", "services", "provide"])
        is_booking = "appointment" in detected_intents or any(w in msg_lower for w in ["अपॉइंटमेंट", "बुक", "booking"])
        is_emergency = "emergency" in detected_intents or any(w in msg_lower for w in ["इमरजेंसी", "आपातकाल", "emergency"])
        is_billing = "billing" in detected_intents or any(w in msg_lower for w in ["फीस", "शुल्क", "खर्च", "fee", "cost"])

        if is_timing or ("faq" in detected_intents and not is_services and not is_booking and not is_emergency):
            parts.append("ऑरा हेल्थ के क्लिनिक के समय सोमवार से शनिवार, सुबह 9:00 बजे से शाम 6:00 बजे तक हैं।")
        if is_services:
            parts.append("ऑरा हेल्थ एआई निम्नलिखित सेवाएं प्रदान करता है:\n- सामान्य परामर्श (General Consultation)\n- लक्षण मूल्यांकन व ट्राइएज (Symptom Assessment)\n- डॉक्टर अपॉइंटमेंट बुकिंग (Appointment Booking)\n- बिलिंग व बीमा सहायता (Billing Assistance)\n- डिजिटल स्वास्थ्य सहायता (Health FAQs)")
        if is_booking:
            parts.append("आप ऑरा हेल्थ एआई के माध्यम से डॉक्टर अपॉइंटमेंट आसानी से बुक, पुनर्निर्धारित (reschedule) या रद्द कर सकते हैं। आप वेबसाइट पर 'Book Appointment' बटन पर क्लिक करके या वॉयस असिस्टेंट द्वारा अपना स्लॉट चुन सकते हैं।")
        if is_billing:
            parts.append("सामान्य परामर्श शुल्क ₹500 है। विशेषज्ञ डॉक्टरों की फीस ₹600 से ₹1100 के बीच है। हम सभी प्रमुख बीमा योजनाएं स्वीकार करते हैं।")
        if is_emergency:
            parts.append("चिकित्सा आपातकाल की स्थिति में, कृपया तुरंत 112 या 911 पर कॉल करें या नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।")

        if parts:
            return "\n\n".join(parts)
        return "ऑरा हेल्थ क्लिनिक सोमवार से शनिवार सुबह 9:00 बजे से शाम 6:00 बजे तक खुला है। अधिक जानकारी या अपॉइंटमेंट के लिए +91-9876543210 पर संपर्क करें।"

    # 2. Telugu Knowledge Response
    elif base_lang == "te":
        parts = []
        is_timing = any(w in msg_lower for w in ["టైమింగ్స్", "సమయం", "సమయాలు", "timing", "hours", "time"])
        is_services = any(w in msg_lower for w in ["సేవలు", "services", "provide"])
        is_booking = "appointment" in detected_intents or any(w in msg_lower for w in ["అపాయింట్‌మెంట్", "బుక్", "booking"])
        is_emergency = "emergency" in detected_intents or any(w in msg_lower for w in ["అత్యవసరం", "ఎమర్జెన్సీ", "emergency"])
        is_billing = "billing" in detected_intents or any(w in msg_lower for w in ["ఫీజు", "ఖర్చు", "fee", "cost"])

        if is_timing or ("faq" in detected_intents and not is_services and not is_booking and not is_emergency):
            parts.append("ఆరా హెల్త్ క్లినిక్ పని వేళలు సోమవారం నుండి శనివారం వరకు, ఉదయం 9:00 గంటల నుండి సాయంత్రం 6:00 గంటల వరకు.")
        if is_services:
            parts.append("ఆరా హెల్త్ AI అందించే సేవలు:\n- సాధారణ వైద్య సంప్రదింపులు (General Consultation)\n- లక్షణాల అంచనా (Symptom Assessment)\n- డాక్టర్ అపాయింట్‌మెంట్ బుకింగ్ (Appointment Booking)\n- బిల్లింగ్ మరియు ఇన్సూరెన్స్ సహాయం (Billing Assistance)\n- ఆరోగ్య సమాచారం (Health FAQs)")
        if is_booking:
            parts.append("మీరు ఆరా హెల్త్ AI ద్వారా ఆన్‌లైన్‌లో లేదా వాయిస్ అసిస్టెంట్ ద్వారా డాక్టర్ అపాయింట్‌మెంట్‌ను సులభంగా బుక్ చేయవచ్చు, సమయం మార్చవచ్చు లేదా రద్దు చేయవచ్చు.")
        if is_billing:
            parts.append("సాధారణ కన్సల్టేషన్ ఫీజు ₹500. స్పెషలిస్ట్ వైద్యుల ఫీజు ₹600 నుండి ₹1100 వరకు ఉంటుంది.")
        if is_emergency:
            parts.append("వైద్య అత్యవసర పరిస్థితుల్లో దయచేసి వెంటనే 112 లేదా 911 కు కాల్ చేయండి లేదా సమీపంలోని ఆసుపత్రికి వెళ్లండి.")

        if parts:
            return "\n\n".join(parts)
        return "ఆరా హెల్త్ క్లినిక్ వేళలు సోమవారం నుండి శనివారం వరకు ఉదయం 9:00 నుండి సాయంత్రం 6:00 వరకు. వివరాలకు +91-9876543210 కు కాల్ చేయండి."

    # 3. Default English Knowledge Response
    parts = []
    is_timing = any(w in msg_lower for w in ["timing", "hours", "time", "open", "when"])
    is_services = any(w in msg_lower for w in ["services", "provide", "facilities", "what do you do"])
    is_booking = "appointment" in detected_intents or any(w in msg_lower for w in ["appointment", "book", "schedule", "booking"])
    is_emergency = "emergency" in detected_intents or any(w in msg_lower for w in ["emergency", "911", "112", "urgent"])
    is_billing = "billing" in detected_intents or any(w in msg_lower for w in ["fee", "cost", "price", "insurance", "charge"])

    if is_timing or ("faq" in detected_intents and not is_services and not is_booking and not is_emergency):
        parts.append("Aura Health clinic hours are Monday to Saturday, from 9:00 AM to 6:00 PM.")
    if is_services:
        parts.append("Aura Health AI provides the following clinical services:\n- General Consultation\n- 24/7 AI Clinical Symptom Assessment\n- Doctor Appointment Booking, Rescheduling & Cancellation\n- Billing & Health Insurance Assistance\n- Health FAQs & Hospital Guidance")
    if is_booking:
        parts.append("You can book, reschedule, or cancel doctor appointments directly through Aura Health AI online or through the Voice Assistant. Simply choose your specialist, date, and preferred time slot.")
    if is_billing:
        parts.append("General consultation fee is ₹500 ($25). Specialist consultation fees range from ₹600 to ₹1100. We accept all major health insurance plans.")
    if is_emergency:
        parts.append("For medical emergencies, immediately contact your nearest hospital or call emergency services (911 / 112).")

    if parts:
        return "\n\n".join(parts)

    return f"Aura Health clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM. Contact us at {CLINIC_PHONE} or {CLINIC_EMAIL}."


def generate_response(session_id: str, user_message: str, language: str = "en") -> str:
    try:
        base_lang = (language or "en").split("-")[0].lower()
        lang_info = get_language_info(base_lang)
        selected_language_name = lang_info["name"]
        native_language_name = lang_info["native"]

        safe_msg = user_message.encode('ascii', 'replace').decode('ascii')
        print(f"[AI Service] Processing session={session_id}, language={base_lang} ({selected_language_name}), message='{safe_msg}'")

        # Multi-intent detection
        detected_intents: List[str] = detect_intents(user_message)
        primary_agent = detected_intents[0] if detected_intents else "faq"

        # Retrieve verified clinic knowledge base
        knowledge = get_clinic_knowledge()

        # Retrieve recent conversation memory
        history = get_history(session_id)[-6:]
        history_text = "\n".join(f"{item['role']}: {item['message']}" for item in history)

        # Build combined agent guidance
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

        multi_intent_instruction = f"""
CRITICAL MULTI-INTENT & TOPIC REQUIREMENT:
The user has asked about the following topic(s): {', '.join(detected_intents).upper()}.
You MUST address EVERY SINGLE ONE of these topics clearly and completely in your response using the verified Clinic Information below.

CLINIC INFORMATION:
{knowledge}

Answer Structure Guidelines:
1. If clinic hours/timing are asked: State Monday - Saturday, 9:00 AM - 6:00 PM clearly.
2. If services are asked: List General Consultation, Symptom Assessment, Appointment Booking, Billing Assistance, and Health FAQs.
3. If booking/appointments are asked: Explain that patients can book, reschedule, or cancel appointments through Aura Health AI.
4. If symptoms are reported: Provide safe clinical triage guidance and recommend the appropriate department with a 'Reason:' section.
5. If fees/insurance are asked: Provide consultation fees and accepted insurance from Clinic Information.
6. If emergency is mentioned: Provide immediate emergency advice (Call 112 / 911).
"""

        # Strict language prompt
        prompt = f"""
{SYSTEM_PROMPT}

{multi_intent_instruction}

SPECIALIZED AGENT DIRECTIVES:
{combined_agent_prompt}

CRITICAL LANGUAGE INSTRUCTION:
- You MUST generate your ENTIRE response in {selected_language_name} ({native_language_name}).
- Do NOT reply in English unless the requested language is English.
- Use natural, accurate, and fluent {selected_language_name} vocabulary and phrasing.

RECENT CONVERSATION CONTEXT:
{history_text if history_text else "No previous conversation in this session."}

PATIENT INQUIRY:
{user_message}

Answer the patient's inquiry completely, accurately, and fluently in {selected_language_name}:
"""

        try:
            response_text = generate_with_fallback(prompt)
        except Exception as ai_err:
            print(f"Gemini generation fallback triggered: {ai_err}")
            # Use intelligent multilingual local knowledge fallback
            response_text = get_local_knowledge_response(user_message, detected_intents, base_lang)

        # Generate structured triage summary ONLY if real symptoms are present
        summary = ""
        if "symptom" in detected_intents or "emergency" in detected_intents:
            summary = generate_summary(user_message, primary_agent, base_lang)

        final_response = response_text
        if summary:
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
        return get_local_knowledge_response(user_message, ["faq"], language)
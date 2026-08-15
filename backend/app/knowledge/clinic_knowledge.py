"""
AuraHealth AI - Verified Clinic Knowledge Base
Provides accurate clinical, operational, insurance, department, and doctor information.
"""

CLINIC_NAME = "Aura Health AI"
CLINIC_TAGLINE = "Intelligent AI-Powered Healthcare & Clinical Triage"
CLINIC_ADDRESS = "Plot 42, Healthtech Corridor, Cyber City, Hyderabad, 500081 / Nationwide Telehealth"
CLINIC_PHONE = "+91-9876543210"
CLINIC_EMAIL = "support@aurahealthai.com"
EMERGENCY_HOTLINE = "911 (US) / 112 (India/EU) / +91-9876543210"
CLINIC_HOURS = "Monday - Saturday: 9:00 AM - 6:00 PM | Emergency & 24/7 AI Triage Available"

DEPARTMENTS = [
    {
        "name": "General Medicine",
        "description": "Primary care, viral illnesses, fever, headache, body pain, routine health checkups.",
        "lead": "Dr. Aditya Narang",
        "fee": "₹500 / $25",
    },
    {
        "name": "Cardiology",
        "description": "Heart health, chest pain evaluation, ECG, blood pressure, cholesterol care.",
        "lead": "Dr. Ananya Rao",
        "fee": "₹900 / $45",
    },
    {
        "name": "Orthopedics",
        "description": "Bone fractures, joint pain, back pain, spine, arthritis, and sports injuries.",
        "lead": "Dr. Vikram Sethi",
        "fee": "₹850 / $40",
    },
    {
        "name": "Pediatrics",
        "description": "Child health, infant care, pediatric infections, growth milestones, vaccination.",
        "lead": "Dr. Meera Iyer",
        "fee": "₹700 / $35",
    },
    {
        "name": "Dermatology",
        "description": "Skin conditions, rashes, eczema, allergies, acne, hair and scalp health.",
        "lead": "Dr. Arjun Menon",
        "fee": "₹650 / $30",
    },
    {
        "name": "Gynecology & Obstetrics",
        "description": "Women's healthcare, prenatal and postnatal care, maternity, hormonal health.",
        "lead": "Dr. Nisha Kapoor",
        "fee": "₹800 / $40",
    },
    {
        "name": "Neurology",
        "description": "Severe headaches, migraine, nerve disorders, dizziness, cognitive evaluation.",
        "lead": "Dr. Sameer Kulkarni",
        "fee": "₹1100 / $55",
    },
    {
        "name": "ENT (Otolaryngology)",
        "description": "Ear infections, hearing loss, throat pain, tonsillitis, sinus and nasal issues.",
        "lead": "Dr. Kavita Deshmukh",
        "fee": "₹600 / $30",
    },
    {
        "name": "Gastroenterology",
        "description": "Stomach pain, acidity, digestion issues, nausea, liver and bowel health.",
        "lead": "Dr. Rahul Bansal",
        "fee": "₹950 / $45",
    },
    {
        "name": "Pulmonology",
        "description": "Respiratory care, persistent cough, asthma, bronchitis, lung health.",
        "lead": "Dr. Sneha Pillai",
        "fee": "₹750 / $35",
    },
]

SERVICES = [
    "General Medical Consultation",
    "24/7 AI Clinical Symptom Assessment & Triage",
    "Online Doctor Appointment Booking, Rescheduling & Cancellation",
    "Billing & Health Insurance Assistance",
    "Digital Health FAQs & Clinic Information",
    "Emergency Medical Guidance & Immediate Triage Red-flag Escalation",
]

INSURANCE_ACCEPTED = [
    "Blue Cross Blue Shield",
    "Aetna Health",
    "UnitedHealthcare",
    "Cigna",
    "Star Health Insurance",
    "HDFC ERGO Health",
    "Care Health Insurance",
    "Direct Cash, Credit/Debit Cards, UPI, Net Banking",
]

FACILITIES = [
    "24/7 AI Triage & Teleconsultation",
    "Diagnostic Pathology Laboratory",
    "Advanced Radiology & Digital X-Ray",
    "24/7 In-house Pharmacy",
    "Emergency Trauma Bay",
    "Valet Parking & Wheelchair Accessibility",
]

CLINIC_KNOWLEDGE_TEXT = f"""
Organization / Hospital: {CLINIC_NAME}
Clinic Hours: Monday - Saturday, 9:00 AM - 6:00 PM
Services Provided:
- General Consultation
- Symptom Assessment
- Appointment Booking
- Billing Assistance
- Health FAQs
Emergency Protocol: For medical emergencies, immediately contact your nearest hospital or emergency services (112 / 911).
Appointments: Patients can book, reschedule, or cancel appointments directly through Aura Health AI online or at reception.
Contact Information:
Email: {CLINIC_EMAIL}
Phone: {CLINIC_PHONE}

Department List & Consultation Fees:
- General Medicine: ₹500 (Dr. Aditya Narang, 18 yrs exp)
- Cardiology: ₹900 (Dr. Ananya Rao, 12 yrs exp)
- Orthopedics: ₹850 (Dr. Vikram Sethi, 15 yrs exp)
- Pediatrics: ₹700 (Dr. Meera Iyer, 10 yrs exp)
- Dermatology: ₹650 (Dr. Arjun Menon, 8 yrs exp)
- Gynecology: ₹800 (Dr. Nisha Kapoor, 14 yrs exp)
- Neurology: ₹1100 (Dr. Sameer Kulkarni, 16 yrs exp)
- ENT: ₹600 (Dr. Kavita Deshmukh, 11 yrs exp)
- Gastroenterology: ₹950 (Dr. Rahul Bansal, 13 yrs exp)
- Pulmonology: ₹750 (Dr. Sneha Pillai, 9 yrs exp)

Insurance Accepted:
{chr(10).join(f"- {ins}" for ins in INSURANCE_ACCEPTED)}

Facilities:
{chr(10).join(f"- {fac}" for fac in FACILITIES)}
"""

def get_clinic_knowledge() -> str:
    return CLINIC_KNOWLEDGE_TEXT.strip()

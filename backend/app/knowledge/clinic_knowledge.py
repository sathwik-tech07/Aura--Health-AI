"""
AuraHealth AI - Verified Clinic Knowledge Base
Provides accurate clinical, operational, insurance, department, and doctor information.
"""

CLINIC_NAME = "AuraHealth Medical Center"
CLINIC_TAGLINE = "Intelligent AI-Powered Healthcare & Triage"
CLINIC_ADDRESS = "Plot 42, Healthtech Corridor, Cyber City, Hyderabad, 500081 / Nationwide Telehealth"
CLINIC_PHONE = "+1 (800) 555-AURA / +91 40 5555 2872"
EMERGENCY_HOTLINE = "911 (US) / 112 (India/EU) / +1 (800) 911-AURA"
CLINIC_HOURS = "Monday - Saturday: 8:00 AM - 9:00 PM | Emergency & AI Triage: 24/7 Available"

DEPARTMENTS = [
    {
        "name": "General Medicine",
        "description": "Primary care, acute viral illnesses, health checkups, chronic disease management.",
        "lead": "Dr. Aditya Narang",
        "fee": "₹500 / $25",
    },
    {
        "name": "Cardiology",
        "description": "Heart health, ECG, cardiovascular evaluation, hypertension, cholesterol management.",
        "lead": "Dr. Ananya Rao",
        "fee": "₹900 / $45",
    },
    {
        "name": "Orthopedics",
        "description": "Bone, joint, ligament, sports injuries, arthritis, and spine care.",
        "lead": "Dr. Vikram Sethi",
        "fee": "₹850 / $40",
    },
    {
        "name": "Pediatrics",
        "description": "Child health, infant nutrition, developmental milestones, vaccinations.",
        "lead": "Dr. Meera Iyer",
        "fee": "₹700 / $35",
    },
    {
        "name": "Dermatology",
        "description": "Skin conditions, allergies, rashes, acne, hair and scalp health.",
        "lead": "Dr. Arjun Menon",
        "fee": "₹650 / $30",
    },
    {
        "name": "Gynecology & Obstetrics",
        "description": "Women's health, maternity care, prenatal consultations, wellness exams.",
        "lead": "Dr. Nisha Kapoor",
        "fee": "₹800 / $40",
    },
    {
        "name": "Neurology",
        "description": "Headaches, migraines, nerve disorders, cognitive assessment, seizure management.",
        "lead": "Dr. Sameer Kulkarni",
        "fee": "₹1100 / $55",
    },
    {
        "name": "ENT (Otolaryngology)",
        "description": "Ear infections, hearing issues, sinusitis, throat irritation, allergy care.",
        "lead": "Dr. Kavita Deshmukh",
        "fee": "₹600 / $30",
    },
    {
        "name": "Gastroenterology",
        "description": "Digestive disorders, acid reflux, stomach pain, liver & bowel health.",
        "lead": "Dr. Rahul Bansal",
        "fee": "₹950 / $45",
    },
    {
        "name": "Pulmonology",
        "description": "Respiratory care, asthma, chronic cough, lung health, bronchitis.",
        "lead": "Dr. Sneha Pillai",
        "fee": "₹750 / $35",
    },
]

INSURANCE_ACCEPTED = [
    "Blue Cross Blue Shield",
    "Aetna Health",
    "UnitedHealthcare",
    "Cigna",
    "Star Health Insurance",
    "HDFC ERGO Health",
    "Care Health Insurance",
    "Medicare / Medicaid (select plans)",
    "Direct Cash, Credit/Debit Cards, UPI, Net Banking",
]

FACILITIES = [
    "24/7 Digital AI Triage & VoIP Telehealth",
    "NABL & CAP Certified Diagnostic Pathology Laboratory",
    "Advanced Radiology & Digital X-Ray / Ultrasound",
    "Fully-stocked 24/7 In-house Pharmacy",
    "Dedicated Emergency Trauma Stabilization Bay",
    "Free Patient Valet Parking & Wheelchair Accessibility",
]

CLINIC_KNOWLEDGE_TEXT = f"""
Hospital / Clinic Name: {CLINIC_NAME}
Tagline: {CLINIC_TAGLINE}
Address: {CLINIC_ADDRESS}
Contact Phone: {CLINIC_PHONE}
Emergency Hotline: {EMERGENCY_HOTLINE}
Working Hours: {CLINIC_HOURS}

Departments & Consultation Fees:
- General Medicine: ₹500 (Lead: Dr. Aditya Narang, 18 yrs exp)
- Cardiology: ₹900 (Lead: Dr. Ananya Rao, 12 yrs exp)
- Orthopedics: ₹850 (Lead: Dr. Vikram Sethi, 15 yrs exp)
- Pediatrics: ₹700 (Lead: Dr. Meera Iyer, 10 yrs exp)
- Dermatology: ₹650 (Lead: Dr. Arjun Menon, 8 yrs exp)
- Gynecology: ₹800 (Lead: Dr. Nisha Kapoor, 14 yrs exp)
- Neurology: ₹1100 (Lead: Dr. Sameer Kulkarni, 16 yrs exp)
- ENT: ₹600 (Lead: Dr. Kavita Deshmukh, 11 yrs exp)
- Gastroenterology: ₹950 (Lead: Dr. Rahul Bansal, 13 yrs exp)
- Pulmonology: ₹750 (Lead: Dr. Sneha Pillai, 9 yrs exp)

Accepted Insurance & Payment:
{chr(10).join(f"- {ins}" for ins in INSURANCE_ACCEPTED)}

Facilities:
{chr(10).join(f"- {fac}" for fac in FACILITIES)}

Appointment Policy:
- Appointments can be booked online via website, voice assistant, or hospital reception.
- Free cancellation or rescheduling up to 2 hours before the scheduled slot.
- Walk-ins are accepted for urgent care; booked appointments receive priority.
"""

def get_clinic_knowledge() -> str:
    return CLINIC_KNOWLEDGE_TEXT.strip()

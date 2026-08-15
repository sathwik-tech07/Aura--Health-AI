import os
import sys
import time
import random

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.crud import EMPLOYER_EMAIL, EMPLOYER_PASSWORD

def run_step7_tests():
    print("==================================================")
    print("RUNNING STEP 7: EMPLOYER ACCOUNT & DATA ISOLATION TESTS")
    print("==================================================")

    with TestClient(app) as client:
        # TEST 1: Employer login with valid seeded credentials
        print("\n--- TEST 1: Employer Login with Seeded Credentials ---")
        res_1 = client.post("/login", json={
            "email": EMPLOYER_EMAIL,
            "password": EMPLOYER_PASSWORD,
        })
        assert res_1.status_code == 200, f"Employer login failed: {res_1.text}"
        data_1 = res_1.json()
        assert data_1["user"]["role"] == "employer", f"Expected role employer, got {data_1['user']['role']}"
        emp_token = data_1["token"]
        headers_emp = {"Authorization": f"Bearer {emp_token}"}
        print(f"TEST 1 PASSED! Employer authenticated with role: {data_1['user']['role']}")

        # TEST 2: Patient login
        print("\n--- TEST 2: Patient Registration & Login ---")
        email_p1 = f"pat_a_{int(time.time())}@example.com"
        res_reg_p1 = client.post("/register", json={
            "name": "Patient Alpha",
            "email": email_p1,
            "password": "Password123!"
        })
        assert res_reg_p1.status_code == 200
        res_login_p1 = client.post("/login", json={
            "email": email_p1,
            "password": "Password123!"
        })
        assert res_login_p1.status_code == 200
        data_p1 = res_login_p1.json()
        assert data_p1["user"]["role"] == "patient"
        token_p1 = data_p1["token"]
        headers_p1 = {"Authorization": f"Bearer {token_p1}"}
        print(f"TEST 2 PASSED! Patient logged in with role: {data_p1['user']['role']}")

        # Register Patient B
        email_p2 = f"pat_b_{int(time.time())}@example.com"
        res_reg_p2 = client.post("/register", json={
            "name": "Patient Beta",
            "email": email_p2,
            "password": "Password123!"
        })
        assert res_reg_p2.status_code == 200
        res_login_p2 = client.post("/login", json={
            "email": email_p2,
            "password": "Password123!"
        })
        token_p2 = res_login_p2.json()["token"]
        headers_p2 = {"Authorization": f"Bearer {token_p2}"}

        # TEST 3: Patient sees their own appointments
        print("\n--- TEST 3: Patient Accessing Own Appointments (/appointments/my) ---")
        rand_d = random.randint(1, 28)
        rand_h = random.randint(9, 17)
        res_book_1 = client.post("/book-appointment", json={
            "patient_name": "Patient Alpha",
            "phone": "+919876543210",
            "doctor_id": 1,
            "appointment_date": f"2027-11-{rand_d:02d}",
            "appointment_time": f"{rand_h:02d}:00:00",
            "symptoms": "Headache and mild fatigue",
            "status": "booked"
        }, headers=headers_p1)
        assert res_book_1.status_code == 201, f"Booking failed: {res_book_1.text}"
        appt_1_id = res_book_1.json()["id"]

        res_3 = client.get("/appointments/my", headers=headers_p1)
        assert res_3.status_code == 200
        my_appts = res_3.json()
        assert any(a["id"] == appt_1_id for a in my_appts), "Booked appointment not found in patient's appointments"
        print(f"TEST 3 PASSED! Patient retrieved own appointments ({len(my_appts)} records)")

        # TEST 4: Patient attempts to access another patient's appointment
        print(f"\n--- TEST 4: Patient B accessing Patient A's Appointment (#{appt_1_id}) ---")
        res_4 = client.get(f"/appointments/{appt_1_id}", headers=headers_p2)
        assert res_4.status_code == 403, f"Expected 403 Forbidden, got {res_4.status_code}"
        print(f"TEST 4 PASSED! Cross-patient access blocked with status {res_4.status_code} Forbidden")

        # TEST 5: Patient attempts GET /appointments (all clinic records)
        print("\n--- TEST 5: Patient calling GET /appointments ---")
        res_5 = client.get("/appointments", headers=headers_p1)
        assert res_5.status_code == 403, f"Expected 403 Forbidden, got {res_5.status_code}"
        print(f"TEST 5 PASSED! Patient blocked from all clinic records with status {res_5.status_code} Forbidden")

        # TEST 6: Employer requests GET /appointments (all clinic records)
        print("\n--- TEST 6: Employer calling GET /appointments ---")
        res_6 = client.get("/appointments", headers=headers_emp)
        assert res_6.status_code == 200
        all_appts = res_6.json()
        assert any(a["id"] == appt_1_id for a in all_appts), "Patient A's booking should be visible in clinic records"
        print(f"TEST 6 PASSED! Employer retrieved all clinic records ({len(all_appts)} total appointments)")

        # TEST 7: Employer requests GET /employer/stats
        print("\n--- TEST 7: Employer calling GET /employer/stats ---")
        res_7 = client.get("/employer/stats", headers=headers_emp)
        assert res_7.status_code == 200
        stats = res_7.json()
        assert "total_patients" in stats and "total_doctors" in stats
        assert "today_appointments" in stats and "upcoming_appointments" in stats
        print(f"TEST 7 PASSED! Employer stats: total_patients={stats['total_patients']}, upcoming={stats['upcoming_appointments']}, revenue=₹{stats['estimated_revenue']}")

        # TEST 8: Patient requests GET /employer/stats
        print("\n--- TEST 8: Patient calling GET /employer/stats ---")
        res_8 = client.get("/employer/stats", headers=headers_p1)
        assert res_8.status_code == 403, f"Expected 403 Forbidden, got {res_8.status_code}"
        print(f"TEST 8 PASSED! Patient blocked from stats with status {res_8.status_code} Forbidden")

        # TEST 9: Logged-out user requests GET /employer/stats
        print("\n--- TEST 9: Logged-out user calling GET /employer/stats ---")
        res_9 = client.get("/employer/stats")
        assert res_9.status_code == 401, f"Expected 401 Unauthorized, got {res_9.status_code}"
        print(f"TEST 9 PASSED! Logged-out user rejected with status {res_9.status_code} Unauthorized")

        # TEST 10: Patient A books appointment -> Owned by A, hidden from B, visible to Employer
        print(f"\n--- TEST 10: Appointment Ownership Verification for #{appt_1_id} ---")
        # Check Patient A has it
        res_p1_appts = client.get("/appointments/my", headers=headers_p1).json()
        assert any(a["id"] == appt_1_id for a in res_p1_appts)

        # Check Patient B does NOT have it in /appointments/my
        res_p2_appts = client.get("/appointments/my", headers=headers_p2).json()
        assert not any(a["id"] == appt_1_id for a in res_p2_appts)

        # Check Employer has it in /appointments
        res_emp_appts = client.get("/appointments", headers=headers_emp).json()
        assert any(a["id"] == appt_1_id for a in res_emp_appts)
        print("TEST 10 PASSED! Appointment strictly isolated to Patient A, hidden from Patient B, and visible to Employer")

    print("\n==================================================")
    print("ALL 10 STEP 7 TESTS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    run_step7_tests()

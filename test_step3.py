import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app

def run_step3_tests():
    print("==================================================")
    print("RUNNING STEP 3: PATIENT & EMPLOYER ACCESS CONTROL TESTS")
    print("==================================================")

    with TestClient(app) as client:
        # Register Patient A
        email_a = f"patient_a_{int(time.time())}@example.com"
        res_reg_a = client.post("/register", json={"name": "Patient Alpha", "email": email_a, "password": "Password123!"})
        assert res_reg_a.status_code == 200
        res_login_a = client.post("/login", json={"email": email_a, "password": "Password123!"})
        assert res_login_a.status_code == 200
        token_a = res_login_a.json()["token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register Patient B
        email_b = f"patient_b_{int(time.time())}@example.com"
        res_reg_b = client.post("/register", json={"name": "Patient Beta", "email": email_b, "password": "Password123!"})
        assert res_reg_b.status_code == 200
        res_login_b = client.post("/login", json={"email": email_b, "password": "Password123!"})
        assert res_login_b.status_code == 200
        token_b = res_login_b.json()["token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Employer Login
        res_login_emp = client.post("/login", json={"email": "employer@aurahealthai.com", "password": "Employer@Aura2026!"})
        assert res_login_emp.status_code == 200
        token_emp = res_login_emp.json()["token"]
        headers_emp = {"Authorization": f"Bearer {token_emp}"}

        # TEST 1: Logged out user accessing protected patient endpoint -> 401 Unauthorized
        print("\n--- TEST 1: Logged-out User accessing protected patient endpoint ---")
        res_1 = client.get("/appointments/my")
        assert res_1.status_code == 401, f"Expected 401, got {res_1.status_code}"
        print("TEST 1 PASSED! Unauthenticated access rejected with 401 Unauthorized")

        # TEST 2: Patient accessing patient endpoint -> 200 OK
        print("\n--- TEST 2: Patient accessing patient endpoint (/appointments/my) ---")
        res_2 = client.get("/appointments/my", headers=headers_a)
        assert res_2.status_code == 200, f"Expected 200, got {res_2.status_code}"
        print(f"TEST 2 PASSED! Patient access granted: status {res_2.status_code}")

        # TEST 3: Patient accessing employer dashboard API -> 403 Forbidden
        print("\n--- TEST 3: Patient accessing employer API (/employer/stats) ---")
        res_3 = client.get("/employer/stats", headers=headers_a)
        assert res_3.status_code == 403, f"Expected 403, got {res_3.status_code}"
        print(f"TEST 3 PASSED! Patient blocked from employer API with status {res_3.status_code} Forbidden")

        # TEST 4: Employer accessing employer dashboard API -> 200 OK
        print("\n--- TEST 4: Employer accessing employer API (/employer/stats) ---")
        res_4 = client.get("/employer/stats", headers=headers_emp)
        assert res_4.status_code == 200, f"Expected 200, got {res_4.status_code}"
        print(f"TEST 4 PASSED! Employer granted access: {res_4.json()}")

        # TEST 5: Patient directly calling employer API -> 403 Forbidden
        print("\n--- TEST 5: Patient directly calling employer patient directory ---")
        res_5 = client.get("/employer/patients", headers=headers_a)
        assert res_5.status_code == 403, f"Expected 403, got {res_5.status_code}"
        print(f"TEST 5 PASSED! Patient blocked with status {res_5.status_code} Forbidden")

        # TEST 6: Logged-out user calling protected employer API -> 401 Unauthorized
        print("\n--- TEST 6: Logged-out user calling employer API ---")
        res_6 = client.get("/employer/stats")
        assert res_6.status_code == 401, f"Expected 401, got {res_6.status_code}"
        print(f"TEST 6 PASSED! Logged out user rejected with status {res_6.status_code} Unauthorized")

        # Create a unique appointment for Patient A
        import random
        rand_day = random.randint(1, 28)
        rand_hour = random.randint(9, 17)
        rand_min = random.choice([0, 15, 30, 45])
        appt_payload_a = {
            "patient_name": "Patient Alpha",
            "phone": "+919876543210",
            "doctor_id": 1,
            "appointment_date": f"2027-10-{rand_day:02d}",
            "appointment_time": f"{rand_hour:02d}:{rand_min:02d}:00",
            "symptoms": "Mild fever and cough",
            "status": "booked"
        }
        res_create_a = client.post("/book-appointment", json=appt_payload_a, headers=headers_a)
        assert res_create_a.status_code == 201, f"Booking failed: {res_create_a.text}"
        appt_a_id = res_create_a.json()["id"]

        # TEST 7: Patient B requests Patient A's appointment -> 403 Forbidden
        print(f"\n--- TEST 7: Patient B requesting Patient A's Appointment (#{appt_a_id}) ---")
        res_7 = client.get(f"/appointments/{appt_a_id}", headers=headers_b)
        assert res_7.status_code == 403, f"Expected 403 Forbidden for cross-patient access, got {res_7.status_code}"
        print(f"TEST 7 PASSED! Cross-patient access blocked with status {res_7.status_code} Forbidden")

        # TEST 8: Patient A requests their own appointment -> 200 OK
        print(f"\n--- TEST 8: Patient A requesting their own Appointment (#{appt_a_id}) ---")
        res_8 = client.get(f"/appointments/{appt_a_id}", headers=headers_a)
        assert res_8.status_code == 200, f"Expected 200 OK, got {res_8.status_code}"
        assert res_8.json()["id"] == appt_a_id
        print(f"TEST 8 PASSED! Patient successfully accessed own appointment: ID {res_8.json()['id']}")

        # TEST 9: Patient logs out (client discards token) -> Protected pages inaccessible
        print("\n--- TEST 9: Patient Logout Verification ---")
        # Simulating client discarding token: request with no token
        res_9 = client.get("/appointments/my")
        assert res_9.status_code == 401
        print("TEST 9 PASSED! Discarded token cannot access protected patient resources")

        # TEST 10: Employer logs out (client discards token) -> Employer portal inaccessible
        print("\n--- TEST 10: Employer Logout Verification ---")
        res_10 = client.get("/employer/stats")
        assert res_10.status_code == 401
        print("TEST 10 PASSED! Discarded token cannot access employer portal")

    print("\n==================================================")
    print("ALL 10 STEP 3 ACCESS CONTROL TESTS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    run_step3_tests()

import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.security import decode_access_token

def run_step2_tests():
    print("==================================================")
    print("RUNNING STEP 2: ROLE-BASED AUTHENTICATION TESTS")
    print("==================================================")

    with TestClient(app) as client:
        # TEST 1: Create a new normal account -> Expected: role = patient
        print("\n--- TEST 1: Normal Account Registration ---")
        email_1 = f"patient_t1_{int(time.time())}@example.com"
        res_1 = client.post("/register", json={
            "name": "John Doe",
            "email": email_1,
            "password": "Password123!"
        })
        assert res_1.status_code == 200, f"Registration failed: {res_1.text}"
        data_1 = res_1.json()
        assert data_1["user"]["role"] == "patient", f"Expected role 'patient', got {data_1['user']['role']}"
        print(f"TEST 1 PASSED! User created with role: {data_1['user']['role']}")

        # TEST 2: Login as patient -> Expected: JWT contains role = patient
        print("\n--- TEST 2: Login as Patient & JWT Role Verification ---")
        res_2 = client.post("/login", json={
            "email": email_1,
            "password": "Password123!"
        })
        assert res_2.status_code == 200, f"Login failed: {res_2.text}"
        data_2 = res_2.json()
        token_2 = data_2["token"]
        assert data_2["user"]["role"] == "patient", "User object role is not patient"

        # Decode JWT payload directly
        jwt_payload = decode_access_token(token_2)
        assert jwt_payload is not None, "Failed to decode JWT"
        assert jwt_payload.get("role") == "patient", f"Expected JWT role 'patient', got {jwt_payload.get('role')}"
        print(f"TEST 2 PASSED! JWT payload contains: role={jwt_payload.get('role')}, sub={jwt_payload.get('sub')}")

        # TEST 3: Attempt to register while sending role = employer -> Expected: Still created as patient
        print("\n--- TEST 3: Attempted Escalation during Registration ---")
        email_3 = f"hacker_{int(time.time())}@example.com"
        res_3 = client.post("/register", json={
            "name": "Attacker",
            "email": email_3,
            "password": "Password123!",
            "role": "employer"
        })
        assert res_3.status_code == 200, f"Registration failed: {res_3.text}"
        data_3 = res_3.json()
        assert data_3["user"]["role"] == "patient", f"Escalation not prevented! User was created with role {data_3['user']['role']}"
        print(f"TEST 3 PASSED! Role override to 'patient' enforced: user.role = {data_3['user']['role']}")

        # TEST 4: Login with an existing user -> Expected: Existing authentication works with patient role
        print("\n--- TEST 4: Existing User Login Compatibility ---")
        res_4 = client.post("/login", json={
            "email": email_1,
            "password": "Password123!"
        })
        assert res_4.status_code == 200, "Existing user login failed"
        assert res_4.json()["user"]["role"] == "patient"
        print("TEST 4 PASSED! Existing user logged in with role 'patient'")

        # TEST 5: Invalid / Expired JWT -> Expected: 401 Unauthorized
        print("\n--- TEST 5: Invalid / Expired JWT Token ---")
        res_5 = client.get("/me", headers={"Authorization": "Bearer invalid_or_expired_jwt_token_12345"})
        assert res_5.status_code == 401, f"Expected 401, got {res_5.status_code}"
        print(f"TEST 5 PASSED! Invalid JWT rejected with status {res_5.status_code} Unauthorized")

        # TEST 6: Patient accessing an employer-protected endpoint -> Expected: 403 Forbidden
        print("\n--- TEST 6: Patient Accessing Employer Endpoint ---")
        headers_patient = {"Authorization": f"Bearer {token_2}"}
        res_6 = client.get("/employer-test", headers=headers_patient)
        assert res_6.status_code == 403, f"Expected 403 Forbidden for patient on employer endpoint, got {res_6.status_code}"
        print(f"TEST 6 PASSED! Patient blocked from employer endpoint with status {res_6.status_code} Forbidden")

        # BONUS: Employer Accessing Employer Endpoint -> Expected: 200 OK
        print("\n--- BONUS: Employer User Authorization ---")
        res_emp_login = client.post("/login", json={
            "email": "employer@aurahealthai.com",
            "password": "Employer@Aura2026!"
        })
        assert res_emp_login.status_code == 200, f"Employer login failed: {res_emp_login.text}"
        emp_token = res_emp_login.json()["token"]
        headers_emp = {"Authorization": f"Bearer {emp_token}"}
        res_emp_test = client.get("/employer-test", headers=headers_emp)
        assert res_emp_test.status_code == 200, f"Employer test failed: {res_emp_test.text}"
        print(f"BONUS PASSED! Employer authorized with 200 OK: {res_emp_test.json()}")

    print("\n==================================================")
    print("ALL 6 STEP 2 TESTS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    run_step2_tests()

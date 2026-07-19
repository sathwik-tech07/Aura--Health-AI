from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pathlib import Path
import json

DB_PATH = Path(__file__).parent / 'data.db'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5177", "http://127.0.0.1:5177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT,
            available INTEGER DEFAULT 1
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            phone TEXT,
            doctor_id INTEGER,
            appointment_date TEXT,
            appointment_time TEXT,
            symptoms TEXT,
            status TEXT DEFAULT 'booked',
            session_id TEXT
        )
        """
    )
    # seed doctors if empty
    cur.execute("SELECT COUNT(1) as c FROM doctors")
    if cur.fetchone()[0] == 0:
        doctors = [
            (1, 'Dr. Priya Sharma', 'General', 1),
            (2, 'Dr. Rahul Kumar', 'Cardiology', 1),
            (3, 'Dr. Ananya Rao', 'Pediatrics', 0),
        ]
        cur.executemany("INSERT INTO doctors(id,name,department,available) VALUES (?,?,?,?)", doctors)
    # seed a demo user
    cur.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT)")
    cur.execute("SELECT COUNT(1) as c FROM users")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users(id,username,password) VALUES (?,?,?)", (1, 'demo', 'demo'))
    conn.commit()
    conn.close()


init_db()


class Doctor(BaseModel):
    id: int
    name: str
    department: Optional[str] = None
    available: Optional[bool] = True


class AppointmentCreate(BaseModel):
    patient_name: str
    phone: str
    doctor_id: int
    appointment_date: str
    appointment_time: str
    symptoms: Optional[str] = ""
    session_id: Optional[str] = None


class Appointment(BaseModel):
    id: int
    patient_name: str
    phone: str
    doctor_id: int
    appointment_date: str
    appointment_time: str
    symptoms: Optional[str] = ""
    status: str = "booked"
    session_id: Optional[str] = None


@app.get("/doctors", response_model=List[Doctor])
def get_doctors():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id,name,department,available FROM doctors")
    rows = cur.fetchall()
    conn.close()
    res = []
    for r in rows:
        res.append(Doctor(id=r['id'], name=r['name'], department=r['department'], available=bool(r['available'])))
    return res


@app.post("/book-appointment", response_model=Appointment)
def book_appointment(payload: AppointmentCreate, request: Request):
    conn = get_conn()
    cur = conn.cursor()
    auth_ok = check_token(request.headers.get('authorization'))
    if not auth_ok:
        raise HTTPException(status_code=401, detail='Unauthorized')
    # simple auth check via Authorization header
    from fastapi import Request
    # Note: request not directly available here; endpoint protection should be done in real app via dependencies
    cur.execute(
        "INSERT INTO appointments(patient_name,phone,doctor_id,appointment_date,appointment_time,symptoms,session_id) VALUES (?,?,?,?,?,?,?)",
        (payload.patient_name, payload.phone, payload.doctor_id, payload.appointment_date, payload.appointment_time, payload.symptoms, payload.session_id),
    )
    appt_id = cur.lastrowid
    conn.commit()
    # fetch back with doctor info
    cur.execute("SELECT a.*, d.name as dname, d.department as ddept, d.available as davail FROM appointments a LEFT JOIN doctors d ON a.doctor_id = d.id WHERE a.id = ?", (appt_id,))
    row = cur.fetchone()
    conn.close()
    doctor = { 'id': row['doctor_id'], 'name': row['dname'], 'department': row['ddept'], 'available': bool(row['davail']) }
    return Appointment(id=row['id'], patient_name=row['patient_name'], phone=row['phone'], doctor_id=row['doctor_id'], appointment_date=row['appointment_date'], appointment_time=row['appointment_time'], symptoms=row['symptoms'], status=row['status'], session_id=row['session_id'])


@app.get("/appointments", response_model=List[Appointment])
def list_appointments(request: Request):
    auth_ok = check_token(request.headers.get('authorization'))
    if not auth_ok:
        raise HTTPException(status_code=401, detail='Unauthorized')
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM appointments ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    res = []
    for r in rows:
        res.append(Appointment(id=r['id'], patient_name=r['patient_name'], phone=r['phone'], doctor_id=r['doctor_id'], appointment_date=r['appointment_date'], appointment_time=r['appointment_time'], symptoms=r['symptoms'], status=r['status'], session_id=r['session_id']))
    return res


@app.patch("/appointments/{appt_id}", response_model=Appointment)
def update_appointment(appt_id: int, payload: AppointmentCreate, request: Request):
    auth_ok = check_token(request.headers.get('authorization'))
    if not auth_ok:
        raise HTTPException(status_code=401, detail='Unauthorized')
    conn = get_conn()
    cur = conn.cursor()
    # update fields provided (for simplicity, replace all from payload)
    cur.execute(
        "UPDATE appointments SET patient_name=?, phone=?, doctor_id=?, appointment_date=?, appointment_time=?, symptoms=?, session_id=? WHERE id=?",
        (payload.patient_name, payload.phone, payload.doctor_id, payload.appointment_date, payload.appointment_time, payload.symptoms, payload.session_id, appt_id),
    )
    conn.commit()
    cur.execute("SELECT * FROM appointments WHERE id = ?", (appt_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return Appointment(id=row['id'], patient_name=row['patient_name'], phone=row['phone'], doctor_id=row['doctor_id'], appointment_date=row['appointment_date'], appointment_time=row['appointment_time'], symptoms=row['symptoms'], status=row['status'], session_id=row['session_id'])


@app.get("/history/{session_id}", response_model=List[Appointment])
def history(session_id: str, request: Request):
    auth_ok = check_token(request.headers.get('authorization'))
    if not auth_ok:
        raise HTTPException(status_code=401, detail='Unauthorized')
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM appointments WHERE session_id = ? ORDER BY id DESC", (session_id,))
    rows = cur.fetchall()
    conn.close()
    res = []
    for r in rows:
        res.append(Appointment(id=r['id'], patient_name=r['patient_name'], phone=r['phone'], doctor_id=r['doctor_id'], appointment_date=r['appointment_date'], appointment_time=r['appointment_time'], symptoms=r['symptoms'], status=r['status'], session_id=r['session_id']))
    return res


@app.post("/chat")
def chat(payload: dict):
    # Very small demo chat responder: echo back message and language
    msg = payload.get('message') or payload.get('text') or 'Hello'
    lang = payload.get('language') or payload.get('lang') or 'en'
    session = payload.get('session_id') or payload.get('sessionId')
    resp = {
        'response': f"Echo ({lang}) [{session or 'no-session'}]: {msg}",
        'language': lang,
        'session_id': session,
    }
    return resp


@app.post('/login')
def login(credentials: dict):
    username = credentials.get('username')
    password = credentials.get('password')
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT id,password FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    if not row or row['password'] != password:
        return { 'error': 'invalid_credentials' }
    import uuid, datetime
    token = str(uuid.uuid4())
    cur.execute('INSERT INTO tokens(token,user_id,created_at) VALUES (?,?,?)', (token, row['id'], datetime.datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return { 'token': token }


def check_token(auth_header: Optional[str]):
    if not auth_header: return False
    parts = auth_header.split()
    if len(parts) != 2: return False
    token = parts[1]
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT token FROM tokens WHERE token = ?', (token,))
    row = cur.fetchone()
    conn.close()
    return bool(row)

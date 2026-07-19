This folder contains a minimal demo FastAPI server to exercise the frontend flows.

Run locally (recommended from project root):

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r server/requirements.txt
uvicorn server.main:app --reload --host 127.0.0.1 --port 8000
```

Endpoints provided:
- `GET /doctors` — list of demo doctors
- `POST /book-appointment` — create appointment (accepts `session_id`)
- `GET /appointments` — list all appointments
- `PATCH /appointments/{id}` — update appointment (demo)
- `GET /history/{session_id}` — appointments for session

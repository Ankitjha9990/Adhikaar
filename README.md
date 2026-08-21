# Adhikaar AI — AI for Civic and Legal Empowerment

Adhikaar AI is a hackathon prototype designed to bridge the gap between Indian legal/civic rights and citizens' ability to exercise them. Grounded strictly in pre-indexed legal source documents via Retrieval-Augmented Generation (RAG), Adhikaar AI features:

1. **RTI Drafting Agent**: Converts plain-language grievances into submission-ready, formally formatted RTI applications addressed to the correct public authority, complete with section citations and downloadable PDFs.
2. **Rights Navigator**: Analyzes plain-language tenant, consumer, or workplace dispute descriptions, auto-classifies the domain, retrieves grounded law, and provides plain-language explanations, actionable next steps, and citations.

---

## Technical Architecture

- **Frontend**: React + Vite (`client/`)
- **Backend API**: Node.js + Express (`server/`)
- **Database**: MongoDB Atlas (accessed via Mongoose)
- **AI Microservice**: Python FastAPI (`ai_service/`), connected via internal REST API (`X-Internal-Key` header)
- **LLM & Embeddings**: Google Gemini API (`gemini-2.0-flash` for generation, `text-embedding-004` for vector embeddings via `google-genai` SDK)
- **Vector Store**: In-memory FAISS (`faiss-cpu`), initialized at startup from flat source documents
- **PDF Generation**: ReportLab (Python)

---

## Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas cluster connection string
- Google Gemini API Key (`GEMINI_API_KEY`)

---

### 1. Python AI Service Setup (`ai_service/`)

```bash
cd ai_service

# Install dependencies
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env
```

Configure `ai_service/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
INTERNAL_SECRET=adhikaar_internal_secret_key_2026
```

Start the Python service:
```bash
uvicorn main:app --port 8000 --reload
```

For Render, configure the Python service as a web service with:
```text
Root Directory: ai_service
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

---

### 2. Express Backend Setup (`server/`)

```bash
cd server

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env
```

Configure `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/adhikaar?retryWrites=true&w=majority
PYTHON_SERVICE_URL=http://localhost:8000
INTERNAL_SECRET=adhikaar_internal_secret_key_2026
```

In production, set `PYTHON_SERVICE_URL` to the deployed Python service URL, for example
`https://adhikaar-hcqe.onrender.com` (without a trailing slash). The `INTERNAL_SECRET`
value must be identical in both the Express and Python services.

Seed MongoDB with Department Lookup Data (run once):
```bash
node seed/seedDepartments.js
```

Start the Express backend server:
```bash
npm run dev
```

---

### 3. React Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or port configured in Vite) and proxy API requests to `http://localhost:5000/api`.

For a deployed frontend, set `VITE_API_URL` to the deployed Express backend URL (not the
Python AI service URL), for example `https://your-express-service.onrender.com`.

---

## Known Limitations

- **Dataset Scope**: Department lookup is pre-seeded with 8 representative categories (road repair, ration card, water supply, electricity, birth certificate, pension, school admission, property tax).
- **Statute Coverage**: Grounded retrieval covers key provisions of RTI Act (2005), Model Tenancy Act (2021), Consumer Protection Act (2019), and Payment of Wages Act (1936).
- **No User Accounts / PII Persistence**: User applicant details (name, address, contact) are strictly used transiently to generate the document/PDF for the request cycle and are never stored in the database.
- **Legal Disclaimer**: Adhikaar AI outputs are automated drafting aids and educational tools, not legal advice.

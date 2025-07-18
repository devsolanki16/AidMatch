from fastapi import FastAPI, Query, BackgroundTasks, UploadFile, File, Request, Body
from fastapi.responses import FileResponse
from gtts import gTTS
import os
import uuid
import requests
import time
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime
import google.genai as genai
import json
from fastapi import FastAPI, Request
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import FileResponse
from fpdf import FPDF
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")# Replace with your real API key

@app.get("/text-to-speech")
async def text_to_speech(background_tasks: BackgroundTasks, text: str = Query(...), lang: str = Query("en")):
    filename = f"tts_{uuid.uuid4().hex}.mp3"
    tts = gTTS(text, lang=lang)
    tts.save(filename)
    background_tasks.add_task(os.remove, filename)
    return FileResponse(filename, media_type="audio/mpeg", background=background_tasks)

@app.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    # Upload audio file to AssemblyAI
    audio_bytes = await audio.read()
    upload_response = requests.post(
        "https://api.assemblyai.com/v2/upload",
        headers={"authorization": ASSEMBLYAI_API_KEY},
        data=audio_bytes
    )
    audio_url = upload_response.json()["upload_url"]

    # Start transcription
    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        json={"audio_url": audio_url},
        headers={"authorization": ASSEMBLYAI_API_KEY}
    )
    transcript_id = transcript_response.json()["id"]

    # Poll for completion
    while True:
        poll_response = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers={"authorization": ASSEMBLYAI_API_KEY}
        )
        result = poll_response.json()
        if result["status"] == "completed":
            return {"transcript": result["text"]}
        elif result["status"] == "failed":
            return {"error": "Transcription failed"}
        time.sleep(3)

@app.post("/save-profile")
async def save_profile(request: Request):
    data = await request.json()
    # Save each submission with a unique filename (e.g., using a timestamp)
    filename = f"profile_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    save_dir = "saved_profiles"
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, filename)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    return {"status": "success", "filename": filename}

# Set your Gemini API key here
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


@app.post("/ai-match-schemes")
async def ai_match_schemes(request: Request):
    user_data = await request.json()
    with open("../data/schemes.json") as f:
        schemes = json.load(f)
    prompt = (
        "You are an expert government scheme recommender.\n\n"
        f"Given this user profile:\n{json.dumps(user_data, indent=2)}\n\n"
        f"And this list of government schemes (with their criteria and descriptions):\n{json.dumps(schemes, indent=2)}\n\n"
        "From the list, select all schemes the user is eligible for. For each matching scheme, output:\n"
        "- The scheme's name\n"
        "- A short reason why the user matches\n\n"
        "Format your response as a JSON array of objects, each with \"name\" and \"reason\" fields."
    )
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[prompt],
       )
    # Try to parse the JSON from the model's response
    import re
    import ast
    import logging
    candidate = response.candidates[0] if response.candidates else None
    content = getattr(candidate, "content", None)
    parts = getattr(content, "parts", None)
    if parts and hasattr(parts[0], "text"):
        text = parts[0].text.strip()
    else:
        text = ""
    # Extract JSON array from the response
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        try:
            matches = json.loads(match.group(0))
        except Exception:
            try:
                matches = ast.literal_eval(match.group(0))
            except Exception:
                matches = []
    else:
        matches = []
        logging.warning("Could not parse JSON from Gemini response: %s", text)
    return {"matches": matches}

@app.post("/apply-scheme")
async def apply_scheme(scheme: dict = Body(...), user: dict = Body(...)):
    # Simulate application logic
    # In a real app, you would automate form filling or submission here
    # For demo, just return a success message
    return {
        "status": "success",
        "message": f"Application for '{scheme['name']}' has been (simulated) submitted for user {user.get('fullName', 'Unknown')}."
    }

# List of all fields in the general form
GENERAL_FORM_FIELDS = [
    "fullName", "dob", "gender", "mobileNumber", "email",
    "presentAddress", "permanentAddress", "residencyProof", "residenceDuration",
    "casteStatus", "disabilityStatus", "nativity",
    "annualIncome", "occupation", "landholdingProof",
    "bankAccountNumber", "ifscCode", "cancelledCheque",
    "idProof", "birthProof", "socialCertificates", "specialSchemeDocs",
    "landRecords", "employmentRegistration", "academicDetails",
    "aadhaarLinkedMobile"
]

def map_profile_to_form(profile_json):
    filled_form = {}
    for field in GENERAL_FORM_FIELDS:
        filled_form[field] = profile_json.get(field, "")
    return filled_form

from fastapi import Query

@app.get("/get-filled-form")
async def get_filled_form(filename: str = Query(...)):
    filepath = os.path.join("saved_profiles", filename)
    with open(filepath, "r") as f:
        profile_json = json.load(f)
    # Construct prompt for Gemini
    prompt = (
        "You are an expert assistant. Given the following user profile data:\n"
        f"{json.dumps(profile_json, indent=2)}\n\n"
        f"And the following form fields:\n{json.dumps(GENERAL_FORM_FIELDS)}\n\n"
        "Return a JSON object mapping each form field to the best value from the profile, inferring or transforming as needed. If a value is missing, return an empty string for that field."
    )
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[prompt],
        )
        import re, ast
        candidate = response.candidates[0] if response.candidates else None
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None)
        if parts and hasattr(parts[0], "text"):
            text = parts[0].text.strip()
        else:
            text = ""
        # Extract JSON object from the response
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                filled_form = json.loads(match.group(0))
            except Exception:
                try:
                    filled_form = ast.literal_eval(match.group(0))
                except Exception:
                    filled_form = map_profile_to_form(profile_json)
        else:
            filled_form = map_profile_to_form(profile_json)
    except Exception as e:
        filled_form = map_profile_to_form(profile_json)
    return filled_form

@app.post("/generate-application-pdf")
async def generate_application_pdf(user: dict = Body(...), scheme: dict = Body(None)):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, "Application Form", ln=True, align="C")
    if scheme:
        pdf.cell(200, 10, f"Scheme: {scheme.get('name', '')}", ln=True)
    for key, value in user.items():
        pdf.cell(200, 10, f"{key}: {value}", ln=True)
    filename = f"application_{uuid.uuid4().hex}.pdf"
    pdf.output(filename)
    return FileResponse(filename, media_type="application/pdf", filename="application.pdf")

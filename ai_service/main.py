import os
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq
import rag
import prompts
import pdf_generator

load_dotenv()

INTERNAL_SECRET = os.environ.get("INTERNAL_SECRET", "adhikaar_internal_secret_key_2026")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RAG vector store at startup...")
    rag.init_rag()
    yield
    logger.info("Shutting down AI service.")

app = FastAPI(title="Adhikaar AI Microservice", lifespan=lifespan)

class ApplicantInfo(BaseModel):
    name: str
    address: str
    contact: str

class RTIGenerateRequest(BaseModel):
    query: str
    applicant: ApplicantInfo
    region: str | None = "generic"
    departments: list[dict] | None = None

class RightsAnalyzeRequest(BaseModel):
    query: str
    category: str | None = None

def verify_internal_key(x_internal_key: str | None):
    if not x_internal_key or x_internal_key != INTERNAL_SECRET:
        logger.warning(f"Unauthorized access attempt with X-Internal-Key: {x_internal_key}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Internal-Key header"
        )

def parse_llm_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return json.loads(cleaned)

def call_gemini_with_json_retry(prompt: str) -> dict:
    client = rag.get_client()
    candidate_models = ["gemini-3.5-flash"]
    
    last_err = None
    
    for model_name in candidate_models:
        try:
            # Try with response_mime_type configuration first
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
            except Exception:
                res = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                
            res_text = res.text
            try:
                return parse_llm_json(res_text)
            except Exception as parse_err:
                logger.warning(f"Initial JSON parse failed for model {model_name}: {parse_err}. Retrying once with strict JSON instruction...")
                retry_prompt = prompt + "\n\nCRITICAL: Your previous response failed JSON parsing. Return ONLY valid, raw JSON matching the schema."
                res_retry = client.models.generate_content(
                    model=model_name,
                    contents=retry_prompt
                )
                return parse_llm_json(res_retry.text)
        except Exception as err:
            last_err = err
            continue

    logger.error(f"All generation models failed: {last_err}")
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Failed to generate structured JSON response from AI model: {str(last_err)}"
    )

def call_groq_with_json_retry(prompt: str, api_key_env_var: str = "GROQ_API_KEY") -> dict:
    api_key = os.environ.get(api_key_env_var) or os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.error(f"{api_key_env_var} environment variable is missing")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{api_key_env_var} environment variable is missing"
        )
    
    client = Groq(api_key=api_key)
    model_name = "openai/gpt-oss-120b"
    
    try:
        try:
            res = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model_name,
                response_format={"type": "json_object"}
            )
        except Exception as json_err:
            logger.warning(f"Groq generation with response_format=json failed: {json_err}. Trying standard generation...")
            res = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model_name
            )
        
        res_text = res.choices[0].message.content
        try:
            return parse_llm_json(res_text)
        except Exception as parse_err:
            logger.warning(f"Initial Groq JSON parse failed: {parse_err}. Retrying once with strict JSON instruction...")
            retry_prompt = prompt + "\n\nCRITICAL: Your previous response failed JSON parsing. Return ONLY valid, raw JSON matching the schema."
            res_retry = client.chat.completions.create(
                messages=[{"role": "user", "content": retry_prompt}],
                model=model_name,
                response_format={"type": "json_object"}
            )
            return parse_llm_json(res_retry.choices[0].message.content)
    except Exception as err:
        logger.error(f"All Groq generation attempts failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate structured JSON response from Groq: {str(err)}"
        )

def classify_dispute_category(query: str) -> str:
    q_lower = query.lower()
    tenant_keywords = ["landlord", "deposit", "rent", "tenant", "lease", "evict", "flat", "premises"]
    workplace_keywords = ["employer", "salary", "wages", "pay", "job", "workplace", "boss", "factory", "deduction"]
    consumer_keywords = ["refund", "product", "seller", "consumer", "defect", "service", "warranty", "purchase", "item"]
    harassment_keywords = ["harass", "threat", "stalk", "abuse", "police", "girlfriend", "boyfriend", "husband", "wife", "neighbor", "cyber", "intimidat", "blackmail", "crime", "fir", "complaint"]
    
    for kw in tenant_keywords:
        if kw in q_lower:
            return "tenant"
    for kw in workplace_keywords:
        if kw in q_lower:
            return "workplace"
    for kw in consumer_keywords:
        if kw in q_lower:
            return "consumer"
    for kw in harassment_keywords:
        if kw in q_lower:
            return "harassment"
            
    return "general"

@app.post("/internal/rti/generate")
async def generate_rti(
    req: RTIGenerateRequest,
    x_internal_key: str | None = Header(None)
):
    verify_internal_key(x_internal_key)
    logger.info(f"RTI Request received for query: '{req.query}'")
    
    dept_name = "Public Information Officer"
    if req.departments:
        q_lower = req.query.lower()
        matched_dept = None
        for dept in req.departments:
            keywords = [k.lower() for k in dept.get("subject_keywords", [])]
            if any(k in q_lower for k in keywords):
                matched_dept = dept.get("department_name")
                break
        if matched_dept:
            dept_name = matched_dept
        # No fallback to first department when no keywords match.
        # This keeps the default "Public Information Officer" and lets the LLM
        # determine the correct public authority.
            
    retrieved_pairs = rag.retrieve(req.query, k=6, category_filter="rti")
    context_blocks = []
    chunk_meta_log = []
    for chunk_text, meta in retrieved_pairs:
        context_blocks.append(chunk_text)
        chunk_meta_log.append(f"{meta.get('act_name')} ({meta.get('section_label')})")
        
    logger.info(f"Retrieved RTI chunks: {chunk_meta_log}")
    context_str = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant legal context found."
    
    formatted_prompt = prompts.RTI_SYSTEM_PROMPT.format(
        context=context_str,
        query=req.query,
        applicant_name=req.applicant.name,
        applicant_address=req.applicant.address,
        applicant_contact=req.applicant.contact,
        department_name=dept_name,
        region=req.region or "generic"
    )
    
    data = call_groq_with_json_retry(formatted_prompt, api_key_env_var="GROQ_API_KEY_RTI")
    
    application_text = data.get("application_text", "")
    citations = data.get("citations", [])
    returned_dept = data.get("department", dept_name)
    
    pdf_b64 = pdf_generator.generate_rti_pdf(application_text)
    
    logger.info(f"RTI generation succeeded. Dept: {returned_dept}, Citations: {citations}")
    
    return {
        "department": returned_dept,
        "application_text": application_text,
        "citations": citations,
        "pdf_base64": pdf_b64
    }

@app.post("/internal/rights/analyze")
async def analyze_rights(
    req: RightsAnalyzeRequest,
    x_internal_key: str | None = Header(None)
):
    verify_internal_key(x_internal_key)
    logger.info(f"Rights Analyze Request received: '{req.query}', requested category: {req.category}")
    
    category = req.category
    if not category or category.strip().lower() not in ["tenant", "consumer", "workplace", "harassment", "general"]:
        category = classify_dispute_category(req.query)
        logger.info(f"Auto-classified category to: '{category}'")
    else:
        category = category.strip().lower()
        
    category_filter_arg = category if category in ["tenant", "consumer", "workplace", "harassment"] else None
    retrieved_pairs = rag.retrieve(req.query, k=6, category_filter=category_filter_arg)
    context_blocks = []
    chunk_meta_log = []
    for chunk_text, meta in retrieved_pairs:
        context_blocks.append(chunk_text)
        chunk_meta_log.append(f"{meta.get('act_name')} ({meta.get('section_label')})")
        
    logger.info(f"Retrieved Rights chunks for [{category}]: {chunk_meta_log}")
    context_str = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant legal context found."
    
    formatted_prompt = prompts.RIGHTS_SYSTEM_PROMPT.format(
        context=context_str,
        query=req.query,
        category=category
    )
    
    data = call_groq_with_json_retry(formatted_prompt, api_key_env_var="GROQ_API_KEY_RIGHTS")
    
    explanation = data.get("explanation", "")
    steps = data.get("steps", [])
    citations = data.get("citations", [])
    res_category = data.get("category", category)
    
    logger.info(f"Rights analysis succeeded. Category: {res_category}, Citations: {citations}")
    
    return {
        "category": res_category,
        "explanation": explanation,
        "steps": steps,
        "citations": citations
    }

@app.get("/internal/debug/rag-status")
async def get_rag_status(x_internal_key: str | None = Header(None)):
    verify_internal_key(x_internal_key)
    distinct_categories = list(set(meta.get("category") for meta in rag._metadatas if meta.get("category")))
    return {
        "chunk_count": len(rag._chunks),
        "categories": distinct_categories
    }



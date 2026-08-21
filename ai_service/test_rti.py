import os
import json
from dotenv import load_dotenv
import rag
import prompts
import pdf_generator
from main import call_groq_with_json_retry

load_dotenv()

def test_rti_drafting():
    print("=" * 60, flush=True)
    print("TESTING RTI DRAFTING WITH GROQ (openai/gpt-oss-120b)", flush=True)
    print("=" * 60, flush=True)

    print("[1] Initializing RAG vector store...", flush=True)
    rag.init_rag()

    query = "Seeking status and progress report of my pending PMAY housing scheme application"
    applicant_name = "Rajesh Sharma"
    applicant_address = "Flat 402, Block B, Green Park Apartments, New Delhi 110016"
    applicant_contact = "+91-9876543210"

    print(f"\n[2] Query: '{query}'", flush=True)
    print(f"    Applicant: {applicant_name}", flush=True)

    retrieved_pairs = rag.retrieve(query, k=6, category_filter="rti")
    context_blocks = []
    chunk_meta_log = []
    for chunk_text, meta in retrieved_pairs:
        context_blocks.append(chunk_text)
        chunk_meta_log.append(f"{meta.get('act_name')} ({meta.get('section_label')})")

    print(f"    Retrieved RTI Context Chunks: {chunk_meta_log}", flush=True)
    context_str = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant legal context found."

    formatted_prompt = prompts.RTI_SYSTEM_PROMPT.format(
        context=context_str,
        query=query,
        applicant_name=applicant_name,
        applicant_address=applicant_address,
        applicant_contact=applicant_contact,
        department_name="Public Information Officer",
        region="generic"
    )

    print("\n[3] Calling Groq API (openai/gpt-oss-120b)...", flush=True)
    try:
        data = call_groq_with_json_retry(formatted_prompt, api_key_env_var="GROQ_API_KEY_RTI")
        print("\n--- GROQ RTI GENERATION SUCCESSFUL ---", flush=True)
        print(f"Department: {data.get('department')}", flush=True)
        print(f"Citations: {data.get('citations')}", flush=True)
        
        application_text = data.get("application_text", "")
        print(f"\nApplication Text Snippet:\n{application_text[:300]}...", flush=True)

        pdf_b64 = pdf_generator.generate_rti_pdf(application_text)
        print(f"\nGenerated PDF Base64 Length: {len(pdf_b64)} chars", flush=True)
        print("\nALL VERIFICATIONS PASSED!", flush=True)
        return True
    except Exception as e:
        print(f"\nERROR during RTI generation: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_rti_drafting()

import os
import json
from dotenv import load_dotenv
import rag
import prompts
from main import call_groq_with_json_retry, classify_dispute_category

load_dotenv()

def test_query(query: str, category: str = None):
    print(f"\n==========================================", flush=True)
    print(f"QUERY: '{query}'", flush=True)
    
    if not category:
        category = classify_dispute_category(query)
    print(f"CATEGORY: {category}", flush=True)
    print(f"==========================================", flush=True)
    
    cat_filter = category if category in ["tenant", "consumer", "workplace", "harassment"] else None
    retrieved_pairs = rag.retrieve(query, k=6, category_filter=cat_filter)
    
    context_blocks = []
    chunk_meta_log = []
    for chunk_text, meta in retrieved_pairs:
        context_blocks.append(chunk_text)
        chunk_meta_log.append(f"{meta.get('act_name')} ({meta.get('section_label')})")
        
    print(f"Retrieved Chunks ({len(chunk_meta_log)}): {chunk_meta_log}", flush=True)
    context_str = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant legal context found."
    
    formatted_prompt = prompts.RIGHTS_SYSTEM_PROMPT.format(
        context=context_str,
        query=query,
        category=category
    )
    
    try:
        result = call_groq_with_json_retry(formatted_prompt, api_key_env_var="GROQ_API_KEY_RIGHTS")
        print("\n--- GROQ GENERATED RESULT ---", flush=True)
        print(json.dumps(result, indent=2), flush=True)
        print(f"\nStep Count: {len(result.get('steps', []))}", flush=True)
        print(f"Citations: {result.get('citations', [])}", flush=True)
        return result
    except Exception as e:
        print(f"ERROR: {e}", flush=True)
        return None

if __name__ == "__main__":
    print("[TEST] Initializing RAG...", flush=True)
    rag.init_rag()
    
    # User's exact query
    test_query("my girlfriend is harassing me for last 2 days")

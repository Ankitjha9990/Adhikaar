import os
import glob
import numpy as np
import faiss
from google import genai
from dotenv import load_dotenv

load_dotenv()

_chunks = []      # list of str (chunk text)
_metadatas = []   # list of dict (metadata)
_embeddings = None # numpy array of shape (N, dim)
_faiss_index = None # faiss IndexFlatL2
_client = None

def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing")
        _client = genai.Client(api_key=api_key)
    return _client

def parse_source_file(file_path: str) -> tuple[str, dict]:
    """Parse flat source text file with full legal validity metadata header."""
    metadata = {
        "source_file": os.path.basename(file_path),
        "act_name": "Unknown",
        "section_label": "Unknown",
        "summary": "",
        "category": "generic",
        "status": "Current",
        "effective_from": "",
        "effective_until": "",
        "replaced_by": "",
        "current_equivalent": ""
    }
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    body_lines = []
    in_header = True
    header_keys = [
        "act:", "section:", "summary:", "category:", 
        "status:", "effective from:", "effective until:", 
        "replaced by:", "current equivalent:"
    ]
    
    for line in content.splitlines():
        if in_header:
            line_lower = line.strip().lower()
            if ":" in line and any(line_lower.startswith(k) for k in header_keys):
                key, val = line.split(":", 1)
                key_norm = key.strip().lower().replace(" ", "_")
                val_str = val.strip()
                if key_norm in metadata:
                    metadata[key_norm] = val_str
                elif key_norm == "act":
                    metadata["act_name"] = val_str
                elif key_norm == "section":
                    metadata["section_label"] = val_str
            elif not line.strip():
                in_header = False
            else:
                body_lines.append(line)
        else:
            body_lines.append(line)
            
    body_text = "\n".join(body_lines).strip()
    if not body_text:
        body_text = content.strip()
        
    status_label = metadata.get("status", "Current").capitalize()
    validity_header = f"LEGAL VALIDITY STATUS: [{status_label.upper()}]"
    if status_label.lower() == "repealed":
        if metadata.get("replaced_by"):
            validity_header += f" (Repealed - Replaced by: {metadata['replaced_by']}"
            if metadata.get("current_equivalent"):
                validity_header += f", Equivalent: {metadata['current_equivalent']}"
            validity_header += ")"
    elif metadata.get("effective_from"):
        validity_header += f" (In Force since: {metadata['effective_from']})"
        
    full_chunk_text = (
        f"Act: {metadata['act_name']}\n"
        f"Section: {metadata['section_label']}\n"
        f"{validity_header}\n"
        f"Summary: {metadata['summary']}\n"
        f"Category: {metadata['category']}\n\n"
        f"Statutory Text & Details:\n{body_text}"
    )
    
    return full_chunk_text, metadata

def embed_text(text: str) -> list[float]:
    """Embed single text using Gemini API via google-genai SDK."""
    client = get_client()
    
    models_to_try = ["gemini-embedding-001", "text-embedding-004", "models/gemini-embedding-001"]
    
    last_err = None
    for model_name in models_to_try:
        try:
            res = client.models.embed_content(
                model=model_name,
                contents=text
            )
            if hasattr(res, 'embedding') and hasattr(res.embedding, 'values') and res.embedding.values:
                return res.embedding.values
            if hasattr(res, 'embeddings') and res.embeddings and hasattr(res.embeddings[0], 'values'):
                return res.embeddings[0].values
            if isinstance(res, dict):
                if 'embedding' in res and 'values' in res['embedding']:
                    return res['embedding']['values']
                if 'embeddings' in res and res['embeddings'] and 'values' in res['embeddings'][0]:
                    return res['embeddings'][0]['values']
        except Exception as e:
            last_err = e
            continue
            
    raise RuntimeError(f"Failed to generate embedding for text using available models. Error: {last_err}")

def init_rag(sources_dir: str | None = None):
    """Load sources, embed chunks using Gemini embedding model, and build FAISS index."""
    global _chunks, _metadatas, _embeddings, _faiss_index
    
    if sources_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sources_dir = os.path.join(base_dir, "data", "sources")
        
    source_files = glob.glob(os.path.join(sources_dir, "*.txt"))
    if not source_files:
        print(f"[RAG] Warning: No source text files found in {sources_dir}")
        return
        
    _chunks = []
    _metadatas = []
    embeddings_list = []
    
    for fpath in source_files:
        chunk_text, metadata = parse_source_file(fpath)
        status_tag = metadata.get('status', 'Current')
        print(f"[RAG] Indexing {metadata['source_file']} (Act: {metadata['act_name']}, Section: {metadata['section_label']}, Status: {status_tag})")
        emb = embed_text(chunk_text)
        _chunks.append(chunk_text)
        _metadatas.append(metadata)
        embeddings_list.append(emb)
        
    if embeddings_list:
        raw_emb = np.array(embeddings_list, dtype=np.float32)
        norms = np.linalg.norm(raw_emb, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        _embeddings = raw_emb / norms
        dim = _embeddings.shape[1]
        _faiss_index = faiss.IndexFlatL2(dim)
        _faiss_index.add(_embeddings)
        print(f"[RAG] Vector store initialized with {len(_chunks)} chunks, embedding dimension: {dim}")

def retrieve(query: str, k: int = 6, category_filter: str | None = None) -> list[tuple[str, dict]]:
    """Retrieve top-k (chunk_text, metadata) pairs with semantic similarity ranking, legal validity prioritization, candidate deduplication, and metadata preservation."""
    global _chunks, _metadatas, _embeddings, _faiss_index
    
    if not _chunks or _embeddings is None:
        print("[RAG] Vector store not initialized or empty. Auto-initializing RAG index now...")
        init_rag()
        if not _chunks or _embeddings is None:
            print("[RAG] Warning: Vector store initialization yielded no chunks. Returning empty context.")
            return []
        
    raw_query_emb = embed_text(query)
    query_arr = np.array(raw_query_emb, dtype=np.float32)
    norm = np.linalg.norm(query_arr)
    if norm > 0:
        query_arr = query_arr / norm
    query_vec = np.array([query_arr], dtype=np.float32)
    
    # 1. Determine candidate indices based on category filter
    valid_indices = []
    if category_filter:
        category_clean = category_filter.strip().lower()
        for idx, meta in enumerate(_metadatas):
            if meta.get("category", "").strip().lower() == category_clean:
                valid_indices.append(idx)
                
    # Fallback to all chunks if category filter yielded no candidates or fewer than required
    if not valid_indices or len(valid_indices) < min(2, len(_chunks)):
        if category_filter:
            print(f"[RAG] Category filter '{category_filter}' returned too few candidates ({len(valid_indices)}), searching all corpus chunks.")
        valid_indices = list(range(len(_chunks)))
        
    # 2. Compute L2 distance on normalized embeddings (equivalent to Cosine Distance)
    sub_embeddings = _embeddings[valid_indices]
    sub_norms = np.linalg.norm(sub_embeddings, axis=1, keepdims=True)
    sub_norms[sub_norms == 0] = 1.0
    norm_sub_embeddings = sub_embeddings / sub_norms
    
    dists = np.sum((norm_sub_embeddings - query_vec) ** 2, axis=1)
    sorted_order = np.argsort(dists)
    
    # 3. Collect candidates with deduplication and Legal Status prioritization
    current_results = []
    repealed_results = []
    seen_provisions = set()
    
    for rank in sorted_order:
        original_idx = valid_indices[rank]
        chunk_text = _chunks[original_idx]
        metadata = _metadatas[original_idx]
        
        prov_key = (metadata.get("act_name", "").strip(), metadata.get("section_label", "").strip())
        if prov_key not in seen_provisions or prov_key == ("Unknown", "Unknown"):
            seen_provisions.add(prov_key)
            is_repealed = metadata.get("status", "Current").strip().lower() == "repealed"
            if is_repealed:
                repealed_results.append((chunk_text, metadata))
            else:
                current_results.append((chunk_text, metadata))
                
        if len(current_results) >= k:
            break
            
    # Combine: prioritize Current active law, then include Repealed (if room) as historical reference only
    results = current_results[:k]
    if len(results) < k and repealed_results:
        results.extend(repealed_results[:(k - len(results))])
        
    print(f"[RAG] Retrieved {len(results)} legal chunks ({len(current_results)} Current, {len(repealed_results)} Repealed) for query (k={k}, category_filter={category_filter})")
    return results


import os
import traceback
from groq import Groq

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not set")
client = Groq(api_key=api_key)

try:
    models = client.models.list()
    for m in models.data:
        print(f"ID: {m.id} - Owned by: {m.owned_by}", flush=True)
except Exception as e:
    print(f"FAILED to list models: {e}", flush=True)
    traceback.print_exc()

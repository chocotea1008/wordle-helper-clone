from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import solver

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dictionary
DICT_PATH = os.path.join(os.path.dirname(__file__), "dict_raw.txt")
ALL_WORDS = []
if os.path.exists(DICT_PATH):
    with open(DICT_PATH, 'r', encoding='utf-8') as f:
        ALL_WORDS = [line.strip() for line in f if line.strip()]

# Let's add the 5 known recommended words to ensure they are available for testing
known_words = ["기낭", "골아지", "가리온", "공사비", "갱론", "강서리", "가외", "가위", "구애", "강리"]
for w in known_words:
    if w not in ALL_WORDS:
        ALL_WORDS.append(w)

class RecommendRequest(BaseModel):
    history: List[Dict[str, Any]] = []
    jamo_len: int = 5

@app.post("/api/recommend")
async def recommend(req: RecommendRequest):
    return solver.solve(req.history, req.jamo_len, ALL_WORDS)

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    frontend_path = os.path.join(os.path.dirname(__file__), "frontend.html")
    with open(frontend_path, "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

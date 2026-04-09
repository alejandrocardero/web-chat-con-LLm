"""
Nexus Chat SLM API Server
FastAPI endpoint for small language model inference.

Usage:
    uvicorn server:app --host 0.0.0.0 --port 8000
"""

import os
import time
import torch
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from model_loader import model_manager, SUPPORTED_MODELS


# ── Lifespan: load model on startup ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the default model on startup, cleanup on shutdown."""
    device = os.getenv("DEVICE", "auto")
    default_model = os.getenv("DEFAULT_MODEL", "smollm3-3b")
    
    print(f"🚀 Starting Nexus Chat SLM API...")
    print(f"   Device: {device}")
    print(f"   Default model: {default_model}")
    
    try:
        model_manager.load_model(default_model, device=device)
        print(f"✅ Model '{default_model}' loaded successfully.")
    except Exception as e:
        print(f"⚠️  Warning: Could not load default model: {e}")
        print("   You can load a model later via POST /models/load")
    
    yield
    
    # Cleanup on shutdown
    print("🛑 Shutting down SLM API...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    print("✅ Cleanup complete.")


# ── App Setup ────────────────────────────────────────────────────────────

app = FastAPI(
    title="Nexus Chat SLM API",
    description="API for small language model inference. Supports multiple SLMs with 4-bit quantization.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow requests from your Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ──────────────────────────────────────────────────────

class Message(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    model: Optional[str] = Field(None, description="Model ID to use (e.g., 'smollm3-3b'). Uses loaded model if None.")
    messages: List[Message] = Field(..., description="Conversation history")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Creativity (0.0-2.0)")
    max_tokens: int = Field(2048, ge=1, le=8192, description="Max response tokens")
    top_p: float = Field(0.9, ge=0.0, le=1.0, description="Nucleus sampling")


class ChatChoice(BaseModel):
    index: int
    message: Message
    finish_reason: str


class ChatResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: dict


class LoadModelRequest(BaseModel):
    model: str = Field(..., description="Model ID to load (e.g., 'smollm3-3b')")
    device: Optional[str] = Field("auto", description="Device: 'cuda', 'cpu', or 'auto'")


class ModelInfo(BaseModel):
    id: str
    name: str
    loaded: bool


# ── Endpoints ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Nexus Chat SLM API",
        "gpu_available": torch.cuda.is_available(),
        "gpu_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "current_model": model_manager.get_current_model(),
    }


@app.get("/health")
async def health():
    """Simple health check."""
    return {"status": "healthy"}


@app.get("/models", response_model=List[ModelInfo])
async def list_models():
    """List all supported models and which one is loaded."""
    current = model_manager.get_current_model()
    return [
        ModelInfo(id=model_id, name=model_name, loaded=(model_id == current))
        for model_id, model_name in SUPPORTED_MODELS.items()
    ]


@app.post("/models/load")
async def load_model(req: LoadModelRequest):
    """Load a specific model into memory."""
    try:
        model_manager.load_model(req.model, device=req.device)
        return {
            "status": "ok",
            "model": req.model,
            "device": req.device,
            "message": f"Model '{req.model}' loaded successfully.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")


@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completions(req: ChatRequest):
    """
    OpenAI-compatible chat completions endpoint.
    
    This is the main endpoint your frontend will call.
    Compatible with the OpenAI API format for easy integration.
    """
    # Determine which model to use
    model_id = req.model or model_manager.get_current_model()
    
    if model_id is None:
        raise HTTPException(
            status_code=400,
            detail="No model loaded. Load one first via POST /models/load or specify 'model' in request."
        )
    
    # Load model if different from current
    if model_id != model_manager.get_current_model():
        try:
            device = os.getenv("DEVICE", "auto")
            model_manager.load_model(model_id, device=device)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")
    
    # Convert Message objects to dicts
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    
    # Generate response
    try:
        start_time = time.time()
        response_text = model_manager.generate(
            messages=messages,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
            top_p=req.top_p,
        )
        elapsed = time.time() - start_time
        
        return ChatResponse(
            id=f"nexus-{int(time.time())}",
            object="chat.completion",
            created=int(time.time()),
            model=model_id,
            choices=[
                ChatChoice(
                    index=0,
                    message=Message(role="assistant", content=response_text),
                    finish_reason="stop",
                )
            ],
            usage={
                "prompt_tokens": sum(len(m["content"].split()) for m in messages),
                "completion_tokens": len(response_text.split()),
                "total_tokens": sum(len(m["content"].split()) for m in messages) + len(response_text.split()),
                "generation_time_seconds": round(elapsed, 2),
            }
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# ── Run ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

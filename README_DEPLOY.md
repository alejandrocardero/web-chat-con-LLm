# 🚀 Nexus Chat SLM API - Deploy Guide

Deploy your own SLM (Small Language Model) API service for Nexus Chat.

---

## 📁 Project Structure

```
nexus-chat/
├── api/                          # Python SLM API Server
│   ├── server.py                 # FastAPI server (OpenAI-compatible)
│   ├── model_loader.py           # Model loading & inference
│   └── requirements.txt          # Python dependencies
│
├── deploy/                       # Deployment scripts
│   ├── run_local.bat             # Run locally (Windows)
│   ├── run_local.sh              # Run locally (Linux/Mac)
│   ├── deploy_lightning.py       # Lightning AI deployment guide
│   └── test_api.py               # Test suite
│
└── src/components/chat/
    └── LLMSettingsModal.jsx      # Frontend config (now supports "Custom")
```

---

## 🎯 Architecture

```
┌─────────────────┐     HTTP      ┌──────────────────────┐
│  Nexus Chat     │  ─────────►   │  SLM API Server       │
│  (React/Vite)   │               │  (FastAPI + PyTorch)  │
│                 │  ◄─────────   │                       │
│  Provider:      │   JSON resp   │  ┌──────────────┐     │
│  "Custom"       │               │  │ SLM Model    │     │
└─────────────────┘               │  │ (3B-8B)      │     │
                                  └──────────────────────┘
```

---

## 💻 Option 1: Run Locally (Your PC)

**Best for**: Testing, personal use on your WiFi network

### Prerequisites
- Python 3.10+
- GPU recommended (CUDA), CPU works but slower
- 8GB+ RAM for 3B models, 16GB+ for 7B+

### Quick Start (Windows)
```bash
# From project root
deploy\run_local.bat
```

### Quick Start (Linux/Mac)
```bash
chmod +x deploy/run_local.sh
./deploy/run_local.sh
```

### Manual Start
```bash
cd api
pip install -r requirements.txt

# Run server (loads default model: smollm3-3b)
python -m uvicorn server:app --host 0.0.0.0 --port 8000

# Or specify a different model
set DEFAULT_MODEL=qwen-3b
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

### Access from Mobile
1. Find your PC's IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
2. On phone browser: `http://YOUR_IP:8000`
3. Configure Nexus Chat:
   - Open LLM Settings
   - Select **"Custom"**
   - URL: `http://YOUR_IP:8000`
   - Model: `smollm3-3b`
   - Save

### Test the API
```bash
python deploy/test_api.py
```

---

## ☁️ Option 2: Deploy to Lightning AI

**Best for**: Public access, no GPU on your PC, shared with multiple users

### Step 1: Create Account
1. Go to [lightning.ai](https://lightning.ai/)
2. Sign up (free tier: 30 GPU min/day)

### Step 2: Create Studio
1. Click **"New Studio"**
2. Choose **"Python"** template
3. Select **T4 GPU** (free tier)

### Step 3: Upload Files
In Lightning AI Studio terminal:

```bash
# Option A: Clone your repo
git clone <your-repo-url>
cd "nexus chat/api"

# Option B: Upload files manually
# Upload via Studio UI: server.py, model_loader.py, requirements.txt
```

### Step 4: Install & Run
```bash
cd api
pip install -r requirements.txt

# Run server (auto-downloads model on startup)
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

### Step 5: Get Public URL
1. In Lightning AI Studio, click **"Share"** → **"Public URL"**
2. Your URL: `https://<username>-<project>.lightning.ai`
3. **Full endpoint**: `https://<username>-<project>.lightning.ai/v1/chat/completions`

### Step 6: Configure Nexus Chat
1. Open LLM Settings
2. Select **"Custom"**
3. URL: `https://<username>-<project>.lightning.ai`
4. Model: `smollm3-3b`
5. Save

---

## 🤖 Available Models

| ID | Name | Params | GPU Required | Best For |
|---|---|---|---|---|
| `llama-1b` | Llama 3.2 1B | 1B | Minimal | Ultra-fast responses |
| `smollm2-1.7b` | SmolLM2 1.7B | 1.7B | Minimal | HF official SLM |
| `qwen-1.5b` | Qwen 2.5 1.5B | 1.5B | Minimal | Compact, good performance |
| **`smollm3-3b`** | **SmolLM3 3B** | **3B** | **4GB+** | **⭐ Best balance (default)** |
| `phi-3.5-mini` | Phi-3.5 Mini | 3.8B | 4GB+ | Microsoft, excellent reasoning |
| `qwen-3b` | Qwen 2.5 3B | 3B | 4GB+ | Multilingual, good at code |
| `qwen-7b` | Qwen 2.5 7B | 7B | 8GB+ | Complex tasks |
| `llama-8b` | Llama 3.1 8B | 8B | 8GB+ | High quality |

**Recommendation**: Start with `smollm3-3b` - best balance of speed and quality.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DEFAULT_MODEL` | `smollm3-3b` | Model to load on startup |
| `DEVICE` | `auto` | `cuda`, `cpu`, or `auto` |

### Examples
```bash
# Run with Qwen 3B on GPU
set DEFAULT_MODEL=qwen-3b
set DEVICE=cuda
python -m uvicorn server:app --host 0.0.0.0 --port 8000

# Run on CPU (slower but works)
set DEVICE=cpu
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## 🔌 API Endpoints

### Health Check
```
GET /health
→ {"status": "healthy"}
```

### List Models
```
GET /models
→ [{"id": "smollm3-3b", "name": "HuggingFaceTB/SmolLM3-3B", "loaded": true}, ...]
```

### Load Model
```
POST /models/load
{"model": "qwen-3b", "device": "auto"}
→ {"status": "ok", "model": "qwen-3b"}
```

### Chat Completions (OpenAI-compatible)
```
POST /v1/chat/completions
{
  "model": "smollm3-3b",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
→ {
  "choices": [{"message": {"role": "assistant", "content": "Hi there!"}}],
  "usage": {"prompt_tokens": 2, "completion_tokens": 3, ...}
}
```

---

## 🧪 Testing

### Test Local Server
```bash
# Start server first
deploy\run_local.bat  # Windows
# or
./deploy/run_local.sh  # Linux/Mac

# Then in another terminal
python deploy/test_api.py
```

### Test from Browser
1. Open: `http://localhost:8000`
2. Should see: `{"status": "ok", "service": "Nexus Chat SLM API", ...}`

### Test from Nexus Chat
1. Open your Nexus Chat app
2. Go to LLM Settings
3. Select **"Custom"**
4. URL: `http://localhost:8000` (local) or `http://YOUR_IP:8000` (network)
5. Model: `smollm3-3b`
6. Click **"Test Connection"**
7. Save and send a message!

---

## ⚠️ Troubleshooting

### "Out of memory"
- Use a smaller model: `llama-1b` or `smollm3-3b`
- Lightning AI: Switch to T4 or A10G GPU
- Local: Close other GPU applications

### "Model not loading"
- First run downloads the model (2-5 min)
- Check internet connection
- Verify Hugging Face access (some models require accepting terms)

### "CORS error"
- Server already allows all origins (`*`)
- Check URL is correct (no trailing slash)
- Make sure server is running: `http://YOUR_URL:8000/health`

### "Slow responses"
- First request loads the model (2-5 min)
- Subsequent requests: 1-3 seconds
- Use GPU for faster inference
- Try smaller model for faster generation

### "Connection refused" (mobile)
- Phone and PC must be on **same WiFi**
- Use PC's local IP, not `localhost`
- Windows Firewall may block port 8000 - allow it

---

## 💰 Cost Estimates

### Lightning AI Free Tier
- **30 GPU minutes/day** = enough for testing
- Models load in ~2-3 minutes
- After loaded, responses are fast (~1-2 sec)

### Lightning AI Paid
- **T4 GPU**: ~$0.50/hour
- **A10G GPU**: ~$1.50/hour
- Good for production use

### Local PC
- **Free** (your hardware)
- Needs GPU for good performance
- Accessible only on your WiFi

---

## 📝 Model License Notes

- **Llama 3.x**: Meta license - free for commercial use
- **Qwen 2.5**: Apache 2.0 - open source
- **SmolLM**: Apache 2.0 - open source
- **Phi-3.5**: Microsoft Research License

Check individual model licenses before commercial use.

---

*Deploy guide v1.0 - Nexus Chat SLM API*

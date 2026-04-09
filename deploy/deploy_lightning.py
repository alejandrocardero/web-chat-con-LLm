# ═══════════════════════════════════════════════════════════
#  Nexus Chat - Deploy to Lightning AI Studio
#  This script prepares and deploys the SLM API to Lightning AI
# ═══════════════════════════════════════════════════════════

"""
LIGHTNING AI DEPLOYMENT GUIDE
==============================

Lightning AI (https://lightning.ai/) provides free GPU instances 
where you can deploy this SLM API.

QUICK START:
------------

1. CREATE A LIGHTNING AI ACCOUNT:
   - Go to: https://lightning.ai/
   - Sign up (free tier includes 30 GPU minutes/day)

2. CREATE A NEW STUDIO:
   - Click "New Studio"
   - Choose "Python" template
   - Select GPU instance (T4 is free, A10G costs credits)

3. UPLOAD FILES:
   In the Lightning AI Studio terminal, run:
   
   ```bash
   # Clone your repo or upload files
   # Option A: Git clone
   git clone <your-repo-url>
   cd "nexus chat/api"
   
   # Option B: Upload via Studio UI
   # Upload: server.py, model_loader.py, requirements.txt
   
4. INSTALL DEPENDENCIES:
   ```bash
   cd api
   pip install -r requirements.txt
   ```

5. RUN THE SERVER:
   ```bash
   # Default: loads smollm3-3b model
   python -m uvicorn server:app --host 0.0.0.0 --port 8000
   
   # Or specify a different model:
   DEFAULT_MODEL=qwen-3b python -m uvicorn server:app --host 0.0.0.0 --port 8000
   ```

6. GET YOUR PUBLIC URL:
   - Lightning AI will show: "Running on http://127.0.0.1:8000"
   - Click "Share" or "Public URL" in the Studio UI
   - Your URL will look like:
     https://<username>-<project>.lightning.ai/v1/chat/completions

7. CONFIGURE YOUR FRONTEND:
   - In Nexus Chat, open LLM Settings
   - Select "Custom API"
   - Enter your Lightning AI URL
   - Save and start chatting!

ENVIRONMENT VARIABLES:
---------------------
  DEFAULT_MODEL  - Model to load on startup (default: smollm3-3b)
  DEVICE         - Device to use: 'cuda', 'cpu', or 'auto' (default: auto)

AVAILABLE MODELS:
----------------
  llama-1b         - Ultra light, fast response
  smollm2-1.7b     - HF official SLM
  qwen-1.5b        - Compact, good performance
  smollm3-3b       - ⭐ Best balance (default)
  phi-3.5-mini     - Microsoft, excellent reasoning
  qwen-3b          - Multilingual, good at code
  qwen-7b          - Complex tasks (needs more GPU)
  llama-8b         - High quality (needs more GPU)

TROUBLESHOOTING:
---------------
  - Out of memory: Use a smaller model (llama-1b, smollm3-3b)
  - Slow responses: Switch to T4 or A10G GPU in Lightning AI
  - Model not loading: Check internet connection (downloads from HF)
  - CORS errors: The server already allows all origins (*)

COST ESTIMATES:
--------------
  Free tier (T4 GPU):
  - 30 GPU minutes/day = enough for testing
  - Models load in ~2-3 minutes
  - After that, responses are fast (~1-2 sec)
  
  Paid tier:
  - ~$0.50/hour for T4
  - ~$1.50/hour for A10G
"""

# This file is for documentation purposes.
# Follow the steps above to deploy manually in Lightning AI.

print(__doc__)

#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Nexus Chat - Local Development Server
#  Run this on your PC to test the SLM API locally
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Nexus Chat SLM API (local dev)..."
echo ""

# Check if Python is installed
if ! command -v python &>/dev/null; then
    echo "❌ Python not found. Install Python 3.10+ first."
    exit 1
fi

# Check if in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Not in a virtual environment."
    echo "   Creating one in api/venv..."
    python -m venv api/venv
    
    # Activate it
    if [ -f "api/venv/Scripts/activate" ]; then
        # Windows
        source api/venv/Scripts/activate
    else
        # Linux/Mac
        source api/venv/bin/activate
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r api/requirements.txt -q

# Set environment variables
export DEFAULT_MODEL="${DEFAULT_MODEL:-smollm3-3b}"
export DEVICE="${DEVICE:-auto}"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Nexus Chat SLM API Server                  ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Model:  $DEFAULT_MODEL                     "
echo "║  Device: $DEVICE                             "
echo "║  URL:    http://localhost:8000               "
echo "╠══════════════════════════════════════════════╣"
echo "║  Endpoints:                                 ║"
echo "║  GET  /              → Health check          ║"
echo "║  GET  /models        → List models           ║"
echo "║  POST /models/load    → Load model            ║"
echo "║  POST /v1/chat/completions → Chat (OpenAI)   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

# Start the server
cd api
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

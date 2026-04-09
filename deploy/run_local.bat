@echo off
REM ═══════════════════════════════════════════════════════════
REM  Nexus Chat - Local Development Server (Windows)
REM  Run this on your PC to test the SLM API locally
REM ═══════════════════════════════════════════════════════════

echo.
echo 🚀 Starting Nexus Chat SLM API (local dev)...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Install Python 3.10+ first.
    pause
    exit /b 1
)

REM Check if in virtual environment
if not defined VIRTUAL_ENV (
    echo ⚠️  Not in a virtual environment.
    echo    Creating one in api\venv...
    python -m venv api\venv
    
    REM Activate it
    call api\venv\Scripts\activate.bat
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r api\requirements.txt -q

REM Set environment variables
if not defined DEFAULT_MODEL set DEFAULT_MODEL=smollm3-3b
if not defined DEVICE set DEVICE=auto

echo.
echo ═══════════════════════════════════════════════
echo   Nexus Chat SLM API Server
echo ═══════════════════════════════════════════════
echo   Model:  %DEFAULT_MODEL%
echo   Device: %DEVICE%
echo   URL:    http://localhost:8000
echo ═══════════════════════════════════════════════
echo   Endpoints:
echo   GET  /               - Health check
echo   GET  /models         - List models
echo   POST /models/load    - Load model
echo   POST /v1/chat/completions - Chat (OpenAI)
echo ═══════════════════════════════════════════════
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the server
cd api
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

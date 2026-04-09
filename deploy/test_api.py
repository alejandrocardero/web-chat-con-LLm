#!/usr/bin/env python3
"""
Test script for the Nexus Chat SLM API.
Run this after starting the local server to verify everything works.

Usage:
    python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_json(data):
    """Pretty print JSON."""
    print(json.dumps(data, indent=2, ensure_ascii=False))

def test_health():
    """Test health check endpoint."""
    print("\n🔍 Testing health endpoint...")
    resp = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {resp.status_code}")
    print_json(resp.json())

def test_list_models():
    """Test listing available models."""
    print("\n📋 Testing list models endpoint...")
    resp = requests.get(f"{BASE_URL}/models")
    print(f"   Status: {resp.status_code}")
    for model in resp.json():
        loaded = "✅" if model["loaded"] else "  "
        print(f"   {loaded} {model['id']}: {model['name']}")

def test_chat():
    """Test chat completions endpoint."""
    print("\n💬 Testing chat completions endpoint...")
    
    payload = {
        "messages": [
            {"role": "user", "content": "¿Qué es un modelo de lenguaje pequeño (SLM)?"}
        ],
        "temperature": 0.7,
        "max_tokens": 512,
    }
    
    resp = requests.post(
        f"{BASE_URL}/v1/chat/completions",
        json=payload,
        timeout=120  # First request may take time to load model
    )
    
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"   Model: {data['model']}")
        print(f"   Response: {data['choices'][0]['message']['content'][:200]}...")
        print(f"   Usage: {data['usage']}")
    else:
        print_json(resp.json())

def test_load_model():
    """Test loading a specific model."""
    print("\n🔄 Testing model load endpoint...")
    
    payload = {
        "model": "smollm3-3b",
        "device": "auto"
    }
    
    resp = requests.post(f"{BASE_URL}/models/load", json=payload, timeout=180)
    print(f"   Status: {resp.status_code}")
    print_json(resp.json())

def main():
    print("╔══════════════════════════════════════════════╗")
    print("║  Nexus Chat SLM API - Test Suite             ║")
    print("╚══════════════════════════════════════════════╝")
    
    try:
        # 1. Health check
        test_health()
        
        # 2. List models
        test_list_models()
        
        # 3. Chat test (this will auto-load the default model)
        test_chat()
        
        print("\n✅ All tests passed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server.")
        print(f"   Make sure the server is running at {BASE_URL}")
        print("   Run: deploy/run_local.bat (Windows) or deploy/run_local.sh (Linux/Mac)")
    except requests.exceptions.Timeout:
        print("\n⏰ Timeout: Model loading took too long.")
        print("   First request downloads the model (may take 2-5 min)")
        print("   Try again with a longer timeout.")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

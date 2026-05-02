# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-30

### Added
- 💬 Chat interface for local LLM models via Ollama or Hugging Face
- 📄 Document extraction support (TXT, MD, DOCX, JSON, CSV files)
- 📚 RAG (Retrieval-Augmented Generation) page for document-based Q&A
- ⚙️ LLM settings modal for URL and model configuration
- 📱 Responsive design for mobile and desktop
- 🎨 Modern UI with Tailwind CSS
- ✨ Conversation management (create, rename, delete)
- 🔄 Real-time streaming responses

### Technical
- React 18.2 with functional components and hooks
- Vite 5.1 for fast development and building
- Tailwind CSS 3.4 for styling
- localStorage for data persistence
- Mammoth.js for DOCX extraction
- @base44/sdk for local backend
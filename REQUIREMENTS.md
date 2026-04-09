# Nexus Chat — Requisitos y Especificaciones

## 📋 Descripción
Aplicación web de chat con inteligencia artificial (chatbot) que permite a los usuarios comunicarse con modelos de lenguaje pequeños (SLMs) a través de múltiples proveedores: **Hugging Face**, **Ollama/OpenAI**, y **API Custom propia** (desplegada en Lightning AI o servidor local). Incluye un sistema RAG para indexación y búsqueda semántica de documentos, y un sistema de transcripción de voz a texto (STT).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite |
| **Backend SLM** | FastAPI + PyTorch + Transformers (Python) |
| **Estilos** | Tailwind CSS + shadcn/ui (New York) |
| **Estado** | TanStack React Query v5 |
| **Rutas** | React Router DOM v7 |
| **UI** | Radix UI + Lucide Icons |
| **Markdown** | React Markdown |
| **Archivos .docx** | Mammoth |
| **STT** | Servicio externo (Whisper) |
| **Auth** | Local (localStorage, hash) |
| **Data** | Mock Base44 client (localStorage) |
| **Deploy SLM** | Lightning AI / Local server |

---

## 📁 Estructura del Proyecto

```
nexus-chat/
├── api/                          # ← NUEVO: SLM API Server (Python)
│   ├── server.py                 # FastAPI endpoint (OpenAI-compatible)
│   ├── model_loader.py           # Carga de modelos con cuantización 4-bit
│   └── requirements.txt          # Dependencias Python
├── deploy/                       # ← NUEVO: Scripts de deploy
│   ├── run_local.bat             # Ejecutar local (Windows)
│   ├── run_local.sh              # Ejecutar local (Linux/Mac)
│   ├── deploy_lightning.py       # Guía Lightning AI
│   └── test_api.py               # Suite de pruebas
├── src/
│   ├── api/
│   │   └── base44Client.js       # Mock client para desarrollo
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.jsx     # Input con STT integrado
│   │   │   ├── ConversationSidebar.jsx
│   │   │   ├── LLMSettingsModal.jsx # Catálogo de SLMs (3 providers)
│   │   │   └── MessageBubble.jsx
│   │   └── ui/                   # Componentes shadcn/ui
│   ├── hooks/
│   ├── lib/
│   │   ├── authService.js        # Servicio de autenticación local
│   │   ├── AuthContext.jsx       # Contexto de auth
│   │   ├── app-params.js
│   │   ├── PageNotFound.jsx
│   │   ├── query-client.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── chat.jsx              # Página principal de chat
│   │   ├── RAG.jsx               # Sistema RAG (indexación + búsqueda)
│   │   ├── Login.jsx             # Página de inicio de sesión
│   │   └── Register.jsx          # Página de registro
│   ├── app.jsx                   # Router + guards
│   ├── main.jsx
│   └── index.css                 # Tema oscuro + variables CSS
├── entidades/
│   ├── conversation.js           # Schema de conversación
│   ├── Message.js                # Schema de mensaje
│   └── LLMConfig.js              # Schema de configuración LLM
├── vite.config.js                # Proxies: /hf-api, /hf-embed, /stt-api
├── tailwind.config.js
├── package.json
└── README_DEPLOY.md              # ← NUEVO: Guía de deploy SLM API
```

---

## 🔐 Autenticación

### Flujo
1. Usuario no autenticado → redirigido a `/login`
2. Usuario autenticado intenta ir a `/login` o `/register` → redirigido a `/`
3. Registro automático login tras crear cuenta

### Datos almacenados (localStorage)
| Key | Contenido |
|---|---|
| `nexus_chat_users` | Array de usuarios registrados |
| `nexus_chat_session` | Sesión activa (userId + token) |

### Seguridad
- Contraseñas hasheadas con SHA-256 + salt
- Tokens UUID aleatorios por sesión

### Rutas protegidas
| Ruta | Acceso |
|---|---|
| `/login` | Solo guests |
| `/register` | Solo guests |
| `/` | Solo autenticados |
| `/rag` | Solo autenticados |

---

## 🤖 Catálogo de Modelos SLM (Hugging Face)

### Ultra ligeros (< 2B)
| Modelo | Parámetros | Uso |
|---|---|---|
| `meta-llama/Llama-3.2-1B-Instruct` | 1B | Ultra ligero, respuesta rápida |
| `HuggingFaceTB/SmolLM2-1.7B-Instruct` | 1.7B | SLM oficial de HF |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1.5B | Compacto, buen rendimiento |

### Ligeros (3B–4B)
| Modelo | Parámetros | Uso |
|---|---|---|
| `meta-llama/Llama-3.2-3B-Instruct` | 3B | Equilibrio calidad/velocidad |
| `microsoft/Phi-3.5-mini-instruct` | 3.8B | Excelente razonamiento |
| `HuggingFaceTB/SmolLM3-3B` | 3B | Nueva generación SmolLM (default) |
| `Qwen/Qwen2.5-3B-Instruct` | 3B | Multilingüe, buen código |
| `Qwen/Qwen2.5-Coder-3B-Instruct` | 3B | Especializado en código |
| `google/gemma-2-2b-it` | 2B | Google, eficiente |

### Calidad media (7B–9B)
| Modelo | Parámetros | Uso |
|---|---|---|
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | Buena calidad general |
| `Qwen/Qwen2.5-7B-Instruct` | 7B | Excelente en tareas complejas |
| `google/gemma-2-9b-it` | 9B | Google, alto rendimiento |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | Popular y versátil |

### Razonamiento
| Modelo | Parámetros | Uso |
|---|---|---|
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1.5B | Razonamiento paso a paso |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` | 8B | Razonamiento avanzado |

---

## 🎙️ Transcripción de Voz a Texto (STT)

### Servicio externo
| Propiedad | Valor |
|---|---|
| **URL** | `https://8001-01kms9d0rn13706v4vr53qr2vq.cloudspaces.litng.ai/transcribe` |
| **Método** | `POST` |
| **Formato** | `multipart/form-data` con campo `file` |
| **Respuesta** | JSON `{ "text": "..." }` |

### Flujo
1. Usuario presiona 🎤 → graba audio (MediaRecorder, WebM)
2. Usuario presiona 🎤 de nuevo → detiene grabación
3. Se envía blob al servicio STT
4. Se recibe texto transcrito
5. Se envía automáticamente como mensaje del usuario al LLM
6. LLM genera respuesta

### Indicadores visuales
| Estado | Indicador |
|---|---|
| Grabando | Micrófono rojo con pulso |
| Transcribiendo | Spinner amarillo + texto "Transcribiendo audio a texto..." |
| Error | Mensaje `[Error al transcribir el audio]` |

### Proxy Vite (desarrollo)
- `/stt-api/*` → `https://8001-01kms9d0rn13706v4vr53qr2vq.cloudspaces.litng.ai/*`

---

## 📄 Sistema RAG

### Funcionalidades
- Subir archivos `.txt`, `.md`, `.docx`
- Extracción de texto (mammoth para .docx)
- Chunking (500 palabras, 50 de solapamiento)
- Embeddings via Hugging Face (`sentence-transformers/all-MiniLM-L6-v2`)
- Búsqueda por similitud coseno
- Top 5 resultados con score

### Configuración
- Token HF almacenado en `localStorage` (`hf_token`)
- API: `https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction`

---

## 🌐 APIs y Proxies (Vite)

| Prefix | Target | Uso |
|---|---|---|
| `/hf-api` | `https://router.huggingface.co/v1` | Chat completions |
| `/hf-embed` | `https://router.huggingface.co` | Embeddings RAG |
| `/stt-api` | `https://8001-01kms9d0rn13706v4vr53qr2vq.cloudspaces.litng.ai` | STT |

---

## 🤖 API SLM Custom (Despliegue Propio)

### Arquitectura
Servicio propio en Python (FastAPI) que corre modelos SLM localmente o en Lightning AI. Compatible con el formato OpenAI.

```
Frontend (React) ──HTTP──► SLM API (FastAPI + PyTorch)
                                │
                                ▼
                          Modelo SLM (3B-8B)
                          cuantizado 4-bit
```

### Endpoints del API

| Endpoint | Método | Uso |
|---|---|---|
| `/` | GET | Health check |
| `/health` | GET | Simple health check |
| `/models` | GET | Listar modelos disponibles |
| `/models/load` | POST | Cargar un modelo específico |
| `/v1/chat/completions` | POST | Chat (OpenAI-compatible) |

### Modelos Soportados

| ID | Modelo | Params | GPU Mínima | Uso |
|---|---|---|---|---|
| `llama-1b` | Llama 3.2 1B | 1B | 2GB | Ultra rápido |
| `smollm2-1.7b` | SmolLM2 1.7B | 1.7B | 2GB | HF oficial |
| `qwen-1.5b` | Qwen 2.5 1.5B | 1.5B | 2GB | Compacto |
| `smollm3-3b` | SmolLM3 3B | 3B | 4GB | ⭐ Default |
| `phi-3.5-mini` | Phi-3.5 Mini | 3.8B | 4GB | Razonamiento |
| `qwen-3b` | Qwen 2.5 3B | 3B | 4GB | Multilingüe |
| `qwen-7b` | Qwen 2.5 7B | 7B | 8GB | Complejo |
| `llama-8b` | Llama 3.1 8B | 8B | 8GB | Alta calidad |

### Deploy Options

| Opción | Ventaja | Desventaja |
|---|---|---|
| **Local** (tu PC) | Gratis, sin límites | Solo WiFi, necesita GPU |
| **Lightning AI** | Público, con GPU gratis | 30 min/día gratis, luego pago |

### Scripts Disponibles

| Script | Plataforma | Uso |
|---|---|---|
| `deploy/run_local.bat` | Windows | Un clic para correr local |
| `deploy/run_local.sh` | Linux/Mac | Un clic para correr local |
| `deploy/test_api.py` | Todas | Verificar que funciona |
| `deploy/deploy_lightning.py` | Todas | Guía paso a paso |

### Configuración en Frontend
1. Abrir LLM Settings (⚙️)
2. Seleccionar **"Custom"**
3. URL: `http://TU_IP:8000` (local) o URL de Lightning AI
4. Modelo: `smollm3-3b` (u otro ID)
5. Guardar

---

## 🎨 Diseño

- **Tema**: Oscuro (dark mode por defecto)
- **Fuente**: Inter (Google Fonts)
- **Colores**: Basados en HSL con variables CSS
- **Componentes**: shadcn/ui New York
- **Scrollbar**: Minimalista (4px)

---

## 🚀 Scripts

```bash
npm run dev       # Servidor de desarrollo (http://localhost:5173)
npm run build     # Build de producción
npm run preview   # Preview del build
```

---

## 📌 Notas

- Los datos (conversaciones, mensajes, configs, usuarios) se almacenan en **localStorage** (desarrollo)
- Para producción, reemplazar `base44Client.js` con el SDK real
- El servicio STT es externo; si cambia la URL, actualizar `vite.config.js` y `ChatInput.jsx`
- **3 proveedores LLM soportados**: Hugging Face, Ollama/OpenAI, Custom API
- Custom API permite **desplegar tu propio servicio SLM** (ver `README_DEPLOY.md`)
- Ver `GUIA_USUARIO.md` para instrucciones de uso desde móvil

# Arquitectura del Sistema Nexus Chat

## 1. Visión General

Nexus Chat es una aplicación web de chat con Modelos de Lenguaje Pequeños (SLMs) que permite a los usuarios comunicarse con inteligencia artificial a través de múltiples proveedores.

## 2. Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Chat    │  │ RAG     │  │ Login  │  │Register│  │
│  │ Page   │  │ Page   │  │ Page   │  │ Page   │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────┤
│              TanStack Query + Context (Estado)                │
├─────────────────────────────────────────────────────────────┤
│         Componentes UI (shadcn/ui + Radix + Tailwind)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP
┌─────────────────────────────────────────────────────────────┐
│                   PROXIES (Vite Dev Server)                │
├─────────────────────────────────────────────────────────────┤
│  /hf-api    → https://router.huggingface.co/v1               │
│  /hf-embed  → https://router.huggingface.co                 │
│  /stt-api   → Servicio STT externo                         │
│  /tts-api   → Servicio TTS externo                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP
┌─────────────────────────────────────────────────────────────┐
│              BACKEND Externo (Proveedores LLM)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐  │
│  │ Hugging Face   │  │ Ollama/OpenAI   │  │ Custom    │  │
│  │ Inference API │  │ Compatible API │  │ SLM API  │  │
│  └─────────────────┘  └───────��─────────┘  └───────────┘  │
│         │                    │                   │           │
│         ▼                    ▼                   ▼         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Modelos SLM (1B - 8B parámetros)         │    │
│  │  Llama 3.2, SmolLM3, Qwen 2.5, Phi-3.5, etc.  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 3. Componentes del Frontend

### Páginas (`src/pages/`)
| Componente | Ruta | Descripción |
|-----------|------|------------|
| `Chat.jsx` | `/` | Página principal de chat |
| `RAG.jsx` | `/rag` | Sistema RAG |
| `Login.jsx` | `/login` | Inicio de sesión |
| `Register.jsx` | `/register` | Registro de usuario |

### Componentes de Chat (`src/components/chat/`)
| Componente | Descripción |
|-----------|------------|
| `ChatInput.jsx` | Input de texto con transcripción de voz (STT) |
| `ConversationSidebar.jsx` | Lista de conversaciones |
| `MessageBubble.jsx` | Visualización de mensajes con síntesis de voz (TTS) |
| `LLMSettingsModal.jsx` | Configuración de modelos |

### Componentes UI (`src/components/ui/`)
- Button, Input, Label, Dialog
- Toast, Toaster (notificaciones)

## 4. Servicios y Estado

### Gestión de Estado
- **React Query**: Cacheo de datos, mutations
- **AuthContext**: Estado de autenticación
- **localStorage**: Persistencia de datos

### Servicios (`src/lib/`)
| Servicio | Función |
|----------|--------|
| `authService.js` | Autenticación (hash SHA-256) |
| `query-client.js` | Configuración TanStack Query |
| `utils.js` | Utilidades helper |

## 5. Flujo de Datos del Chat

```
1. Usuario escribe mensaje
        │
        ▼
2. ChatInput → onSend({ text, attachment? })
        │
        ▼
3. chat.jsx: sendMessage()
   - Guarda mensaje en localStorage (Message)
        │
        ▼
4. Selecciona proveedor (HF/Ollama/Custom)
        │
        ├──► HuggingFace: POST /hf-api/chat/completions
        │         Token: hf_...
        │         Body: { model, messages, temperature, max_tokens }
        │
        ├──► Ollama/OpenAI: POST {base_url}/chat/completions
        │
        └──► Custom API: POST {base_url}/v1/chat/completions
                           │
                           ▼
        5. Respuesta del LLM
           - Texto generado
           - Guardar en localStorage (Message)
```

## 6. Flujo de Autenticación

```
1. Usuario → /register
        │
        ▼
2. authService.register(username, password)
   - Hash SHA-256 + salt
   - Guardar en localStorage (nexus_chat_users)
        │
        ▼
3. Login automático
   - Generar token UUID
   - Guardar session en localStorage
        │
        ▼
4. AuthGuard: Verificar sesión
   - Redirigir a / si autenticado
   - Redirigir a /login si no
```

## 7. Proxies de Desarrollo (Vite)

```javascript
// vite.config.js
{
  '/hf-api': {
    target: 'https://router.huggingface.co/v1',
    changeOrigin: true,
  },
  '/hf-embed': {
    target: 'https://router.huggingface.co',
    changeOrigin: true,
  },
  '/stt-api': {
    target: 'https://...cloudspaces.litng.ai',
    changeOrigin: true,
  },
  '/tts-api': {
    target: 'https://...cloudspaces.litng.ai',
    changeOrigin: true,
  }
}
```

## 8. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite 6 |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| Estado | TanStack React Query v5 |
| Routing | React Router DOM v7 |
| UI | Radix UI + Lucide Icons |
| Markdown | React Markdown |
| Backend | FastAPI (Python) |
| ML | PyTorch + Transformers |
| Modelos | SLMs 1B-8B (quantizados 4-bit) |

## 9. Modelo de Datos (localStorage)

### Entidades
| Entidad | Campos |
|---------|--------|
| User | id, username, password_hash, salt |
| Session | userId, token |
| Conversation | id, title, model, preview, created_date, updated_date |
| Message | id, conversation_id, role, content, type, file_url, file_name |
| LLMConfig | provider, base_url, model, api_key, temperature, max_tokens |

## 10. Despliegue

### Frontend
- **Desarrollo**: `npm run dev` (Vite --host)
- **Producción**: `npm run build` + `npm run preview`

### Backend (Custom SLM API)
- **Local**: `python -m uvicorn server:app --host 0.0.0.0 --port 8000`
- **Lightning AI**: Despliegue de API Python con GPU

---

*Documento de Arquitectura v1.0 - Nexus Chat*
# 🧠 Nexus Chat - LLM Chat Application

Aplicación web moderna para chatear con modelos de lenguaje local (LLM) utilizando **Ollama** y **Hugging Face**. Interfaz intuitiva con soporte para conversaciones, análisis de documentos y configuración flexible.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-blue?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.1-yellow?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🌟 Características

- 💬 **Chat con LLM** - Conversaciones en tiempo real con modelos locales
- 📄 **Análisis de Documentos** - Soporte para TXT, MD, DOCX, JSON, CSV
- 🔊 **Texto a Voz (TTS)** - Reproducción auditiva de respuestas
- 🔒 **Privacidad Local** - Todos los datos se almacenan en localStorage
- 🎨 **Interfaz Moderna** - Diseño responsivo con Tailwind CSS
- ⚡ **Tiempo Real** - Streaming de respuestas del modelo

## 🚀 Requisitos

| Requisito | Versión Mínima |
|-----------|---------------|
| Node.js   | 18+           |
| npm       | 9+            |

### Instalar Ollama (Opcional)

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Descargar desde https://ollama.com/download/windows
```

### Modelos Soportados

- **Ollama**: glm-4.6, llama3.2, qwen2.5, mistral
- **Hugging Face**: meta-llama/Llama-3.2-1B-Instruct, Qwen/Qwen2.5-Coder-3B-Instruct

## 📦 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alejandrocardero/web-chat-con-LLm.git
cd web-chat-con-LLm

# 2. Instalar dependencias
npm install

# 3. Iniciar la aplicación
npm run dev
```

La aplicación estará disponible en **[http://localhost:5173](http://localhost:5173)**

## ⚙️ Configuración

###Configurar LLM

1. Haz clic en **"Configurar Ollama"** en el sidebar
2. Selecciona el proveedor (Hugging Face, Ollama, o Custom)
3. Ajusta la **URL** y selecciona el **modelo**
4. Click en **"Probar conexión"**
5. Click en **"Guardar"**

### Variables de Entorno (Opcional)

```bash
VITE_OLLAMA_URL=http://localhost:11434/v1
VITE_DEFAULT_MODEL=glm-4.6:cloud
```

## 💡 Uso

| Acción | Atajo |
|--------|-------|
| Nueva conversación | Botón `+` |
| Enviar mensaje | `ENTER` |
| Salto de línea | `SHIFT + ENTER` |
| Renombrar chat | Click en ✏️ |
| Eliminar chat | Click en 🗑️ |
| Adjuntar documento | Click en 📎 |

### Analizar Documentos

1. Click en el clip 📎
2. Selecciona un archivo **(TXT, MD, DOCX, JSON, CSV)**
3. Escribe tu pregunta sobre el documento
4. La IA analizará el contenido automáticamente

## 🛠️ Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de producción
npm run lint     # Verificar código
npm run lint:fix  # Corregir errores de código
```

## 🏗️ Estructura

```
web-chat-con-LLm/
├── scr/
│   ├── api/           # Cliente de conexión
│   ├── components/    # Componentes React
│   │   └── chat/    # Componentes del chat
│   ├── hooks/        # Custom hooks
│   ├── lib/         # Utilidades y contexto
│   └── pages/       # Páginas de la app
├── package.json    # Dependencias
├── vite.config.js  # Configuración Vite
└── tailwind.config.js # Config Tailwind
```

## 🔧 Tecnologías

- **React 18.2** - Framework UI
- **Vite 5.1** - Build tool
- **Tailwind CSS 3.4** - Estilos
- **Radix UI** - Componentes accesibles
- **React Markdown** - Renderizado Markdown
- **Mammoth.js** - Extracción de documentos DOCX
- **@base44/sdk** - Backend local

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

**¡Enjoy chatting with AI! 🤖**
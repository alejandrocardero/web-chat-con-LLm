# 💬 Chat LLM

Aplicación web local para chatear con modelos de lenguaje (LLM) usando **Ollama**.

---

## 🚀 Requisitos

### 1. Node.js y npm
- **Node.js** versión 18 o superior
- **npm** (incluido con Node.js)

Descargar: https://nodejs.org/

### 2. Ollama
- **Ollama** instalado
- Al menos un modelo descargado

Descargar: https://ollama.com/

```bash
# Descargar un modelo
ollama pull glm-4.6:cloud

# Ver modelos instalados
ollama list
```

---

## 📦 Instalación

```bash
# 1. Navega a la carpeta del proyecto
cd "C:\Users\PC\nexus chat"

# 2. Instala dependencias
npm install

# 3. Inicia la aplicación
npm run dev
```

La aplicación se abrirá en: **http://localhost:5173**

---

## ⚙️ Configuración Inicial

La app viene preconfigurada con:
- **URL:** `http://localhost:11434/v1`
- **Modelo:** `glm-4.6:cloud`

Para cambiar la configuración:
1. Haz clic en **"Configurar Ollama"** en el sidebar
2. Ajusta URL y modelo
3. Click en **"Probar conexión"**
4. Click en **"Guardar"**

---

## 💡 Cómo Usar

| Acción | Instrucción |
|--------|-------------|
| **Nueva conversación** | Click en botón `+` |
| **Enviar mensaje** | Escribe y presiona `ENTER` |
| **Salto de línea** | `SHIFT + ENTER` |
| **Renombrar chat** | Click en el lápiz ✏️ |
| **Eliminar chat** | Click en basura 🗑️ |
| **Adjuntar audio** | Click en micrófono 🎤 |
| **Adjuntar documento** | Click en clip 📎 (TXT, MD, DOCX, JSON, CSV) |

### 📄 Analizar Documentos

El chat puede **leer y analizar documentos** de texto:

1. Click en el clip 📎
2. Selecciona un archivo **.txt, .md, .docx, .json o .csv**
3. El contenido se extraerá automáticamente
4. Escribe tu pregunta sobre el documento
5. La IA analizará el contenido y responderá

**Formatos soportados:**
- `.txt` - Texto plano
- `.md` - Markdown
- `.docx` - Word (solo texto, sin imágenes)
- `.json` - JSON formateado
- `.csv` - Datos tabulares

**Ejemplos de uso:**
- "Resume este documento"
- "¿Cuáles son los puntos principales?"
- "Extrae todas las fechas mencionadas"
- "Traduce este texto a inglés"

---

## 🛠️ Comandos NPM

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa
npm run lint     # Verificar código
npm run lint:fix # Corregir código
```

---

## 🔧 Solución de Problemas

### ❌ No recibo respuesta de la IA
```bash
# 1. Verifica que Ollama esté corriendo
ollama list

# 2. Si no hay modelos, descarga uno
ollama pull glm-4.6:cloud

# 3. Abre consola del navegador (F12) y revisa errores
```

### ❌ Error de conexión
```bash
# Inicia Ollama
ollama serve

# Verifica la conexión
curl http://localhost:11434/api/tags
```

### ❌ Modelo no disponible
```bash
# Lista modelos instalados
ollama list

# Descarga el modelo necesario
ollama pull <nombre-modelo>
```

---

## 📁 Estructura

```
nexus chat/
├── scr/
│   ├── api/           # Cliente de conexión
│   ├── components/    # Componentes React
│   ├── lib/           # Utilidades
│   └── pages/         # Páginas
├── package.json       # Dependencias
├── vite.config.js     # Config Vite
└── tailwind.config.js # Config Tailwind
```

---

## 🔒 Privacidad

- ✅ Todos los datos se guardan **localmente** (localStorage)
- ✅ No se envía información a servidores externos
- ✅ Las conversaciones se procesan localmente con Ollama

---

## 🛠️ Tecnologías

- **React 18.2** - Framework UI
- **Vite 5.1** - Build tool
- **Tailwind CSS 3.4** - Estilos
- **Radix UI** - Componentes
- **React Markdown** - Renderizado Markdown

---

## 📄 Licencia

Uso personal y educativo.

---

**¡Disfruta Chat LLM! 💬**

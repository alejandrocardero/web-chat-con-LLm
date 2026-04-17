# 📘 Guía Completa de Nexus Chat

> Tu asistente de inteligencia artificial con SLMs, voz a texto (STT), texto a voz (TTS) y búsqueda en documentos.

---

## 📑 Tabla de Contenidos

1. [Primeros Pasos — Registro e Inicio de Sesión](#1-primeros-pasos--registro-e-inicio-de-sesión)
2. [La Interfaz Principal](#2-la-interfaz-principal)
3. [Crear y Gestionar Conversaciones](#3-crear-y-gestionar-conversaciones)
4. [Enviar Mensajes de Texto](#4-enviar-mensajes-de-texto)
5. [Enviar Mensajes por Voz (Speech-to-Text)](#5-enviar-mensajes-por-voz-speech-to-text)
6. [Escuchar Respuestas (Text-to-Speech)](#6-escuchar-respuestas-text-to-speech)
7. [Adjuntar Archivos](#7-adjuntar-archivos)
7. [Configurar el Modelo de IA](#7-configurar-el-modelo-de-ia)
8. [Catálogo de Modelos Disponibles](#8-catálogo-de-modelos-disponibles)
9. [Sistema RAG — Indexar y Buscar en Documentos](#9-sistema-rag--indexar-y-buscar-en-documentos)
10. [Catálogo de Modelos Disponibles](#10-catálogo-de-modelos-disponibles)
11. [Sistema RAG — Indexar y Buscar en Documentos](#11-sistema-rag--indexar-y-buscar-en-documentos)
12. [Cerrar Sesión](#12-cerrar-sesión)
13. [Solución de Problemas](#13-solución-de-problemas)

---

## 1. Primeros Pasos — Registro e Inicio de Sesión

### Abrir la aplicación

Al abrir la app en tu navegador (`http://localhost:5173`), serás redirigido automáticamente a la pantalla de **Inicio de Sesión**.

---

### Crear una cuenta nueva

1. En la pantalla de login, haz clic en **"Crear una cuenta"**.
2. Completa el formulario de registro:

| Campo | Qué poner | Ejemplo |
|---|---|---|
| **Nombre** | Tu nombre o alias | `María` |
| **Email** | Tu correo electrónico | `maria@email.com` |
| **Contraseña** | Mínimo 6 caracteres | `MiClave123!` |
| **Confirmar contraseña** | Debe ser idéntica a la anterior | `MiClave123!` |

3. **Medidor de seguridad de contraseña**: mientras escribes, verás una barra de colores:

| Barra | Nivel | Qué necesita |
|---|---|---|
| 🔴 **Débil** | Solo 1 criterio | Agrega mayúsculas, números o símbolos |
| 🟡 **Regular** | 2 criterios | Agrega más variedad |
| 🔵 **Buena** | 3 criterios | Ya es aceptable |
| 🟢 **Fuerte** | 4 criterios | Máxima seguridad |

Los 4 criterios son:
- ✅ 6 o más caracteres
- ✅ Al menos un número (`0-9`)
- ✅ Al menos una mayúscula (`A-Z`)
- ✅ Al menos un símbolo especial (`!@#$%^&*...`)

4. Cuando las contraseñas coincidan, verás un ✓ verde.
5. Haz clic en **"Crear cuenta"**.
6. Serás redirigido automáticamente al chat principal.

> 💡 **Si el email ya está registrado**, aparecerá un mensaje de error. Usa otro email o inicia sesión.

---

### Iniciar sesión

1. Ingresa tu **email** y **contraseña**.
2. Haz clic en el ícono 👁️ para mostrar/ocultar la contraseña.
3. Haz clic en **"Iniciar sesión"**.
4. Si los datos son correctos, entrarás al chat.

> ⚠️ **Si ves "Email o contraseña incorrectos"**, revisa mayúsculas y asegúrate de estar registrado.

---

## 2. La Interfaz Principal

Una vez dentro, verás tres zonas:

```
┌─────────────────┬──────────────────────────────────────┐
│   BARRA LATERAL │         ÁREA DE CHAT                 │
│                 │                                      │
│  📋 Lista de    │   ┌───────────────────────────┐      │
│  conversaciones │   │  Nombre del chat + modelo  │      │
│                 │   └───────────────────────────┘      │
│  [+] Nuevo chat │                                      │
│  ⚙️ LLM         │   💬 Burbujas de mensajes            │
│  👤 Tu perfil   │   🤖 Respuestas del asistente        │
│  🚪 Salir       │                                      │
│                 │   ┌───────────────────────────┐      │
│                 │   │ 📎 🎤 [ Escribe aquí... ] 📤│      │
│                 │   └───────────────────────────┘      │
└─────────────────┴──────────────────────────────────────┘
```

### Barra lateral izquierda

| Elemento | Función |
|---|---|
| **LLM Chat** (título) | Identifica la app |
| **🤖** (ícono Bot) | Abre el sistema RAG |
| **➕** (más) | Crea una nueva conversación |
| **Lista de chats** | Tus conversaciones guardadas |
| **⚙️ LLM** | Abre configuración del modelo de IA |
| **Tu perfil** | Muestra tu nombre y email |
| **🚪 Salir** | Cierra sesión |

### Área de chat

| Elemento | Función |
|---|---|
| **Header** | Nombre del chat activo y modelo configurado |
| **Burbujas** | Mensajes tuyos (azul, derecha) y del asistente (gris, izquierda) |
| **Input** | Donde escribes, adjuntas archivos o grabas voz |

---

## 3. Crear y Gestionar Conversaciones

### Crear una conversación nueva

- Clic en el botón **➕** en la barra lateral.
- Se crea un chat llamado `Chat 1`, `Chat 2`, etc.
- El chat nuevo queda seleccionado y listo para usar.

### Seleccionar una conversación

- Haz clic en cualquier chat de la lista lateral.
- Se cargan todos los mensajes de esa conversación.

### Renombrar una conversación

1. Pasa el mouse sobre el chat en la lista lateral.
2. Aparece un ícono de **✏️ lápiz**.
3. Haz clic en el lápiz.
4. Escribe el nuevo nombre y presiona **Enter** o haz clic en **✓**.
5. Para cancelar, haz clic en **✕**.

### Eliminar una conversación

1. Pasa el mouse sobre el chat en la lista lateral.
2. Haz clic en el ícono **🗑️ papelera**.
3. La conversación se elimina permanentemente.

---

## 4. Enviar Mensajes de Texto

1. Selecciona o crea una conversación.
2. Haz clic en el campo de texto que dice *"Escribe un mensaje o usa el micrófono..."*.
3. Escribe tu pregunta o mensaje.
4. Presiona **Enter** o haz clic en el botón **📤 enviar**.

### Atajos

| Acción | Cómo hacerlo |
|---|---|
| Enviar | `Enter` |
| Nueva línea | `Shift + Enter` |

### Respuesta del asistente

- Aparece un indicador de carga con **tres puntos animados** (⏳).
- Cuando el modelo responde, el mensaje aparece como burbuja gris.
- El asistente responde con **formato Markdown**: negritas, listas, bloques de código, etc.
- El scroll baja automáticamente al último mensaje.

---

## 5. Enviar Mensajes por Voz (Speech-to-Text)

### Grabar y enviar

1. Haz clic en el ícono **🎤 micrófono** (a la derecha del input).
2. El micrófono se pone **rojo con pulso** — está grabando.
3. Habla claramente en español.
4. Haz clic de nuevo en el micrófono para **detener**.
5. Automáticamente:
   - El audio se envía al servicio de transcripción.
   - Aparece **"Transcribiendo audio a texto..."** con spinner amarillo.
   - El texto transcrito se envía como mensaje al asistente.
   - El asistente responde normalmente.

### Indicadores visuales

| Estado | Qué ves |
|---|---|
| 🟢 Normal | Micrófono gris — listo para grabar |
| 🔴 Grabando | Micrófono rojo con pulso |
| 🟡 Transcribiendo | Spinner amarillo + texto "Transcribiendo..." |
| ✅ Enviado | El texto transcrito aparece como mensaje |
| ❌ Error | Mensaje `[Error al transcribir el audio]` |

> **Consejos para mejor reconocimiento:**
> - Habla claro y pausado
> - Evita ruidos de fondo
> - Grabaciones cortas (< 30 segundos) funcionan mejor

---

## 6. Escuchar Respuestas (Text-to-Speech)

### Reproducir respuesta con voz

Después de que el asistenteenvíe una respuesta de texto, puedes escucharla en voz alta:

1. Busca el ícono de **altavoz** (🔊) debajo del mensaje del asistente.
2. Haz clic para **iniciar la reproducción**.
3. El ícono cambia a un **spinner** mientras carga el audio.
4. Cuando comienza a reproducir, el ícono muestra una **onda de sonido animada**.
5. Haz clic de nuevo para **detener** la reproducción.

### Indicadores visuales

| Estado | Qué ves |
|---|---|
| 🔊 Normal | Altavoz gris — listo para reproducir |
| ⏳ Cargando | Spinner amarillo "TTS iniciando..." |
| 🔊 Reproduciendo | Altavoz con onda animada |
| ✅ Completado | Reproducción terminada, listo para otra |
| ⚠️ Error | Mensaje amarillo de error |

> **Nota:** El TTS depende de un servicio externo. La primera vez puede tomar 1-2 minutos en inicializar.

---

## 8. Adjuntar Archivos

### Adjuntar un documento

1. Haz clic en el ícono **📎 clip** (izquierda del input).
2. Se abre el selector de archivos.
3. Selecciona un archivo. Formatos aceptados:
   - `.pdf` — Documentos PDF
   - `.txt` — Texto plano
   - `.doc`, `.docx` — Documentos Word
   - `.csv` — Hojas de cálculo
   - `.json` — Datos estructurados
4. El archivo aparece como una etiqueta sobre el input.
5. Escribe un mensaje (opcional) y presiona **Enviar**.

### Quitar un archivo adjunto

- Haz clic en la **✕** de la etiqueta del archivo.

---

## 9. Configurar el Modelo de IA

### Abrir la configuración

- Clic en **⚙️ LLM** en la barra lateral inferior.

### Seleccionar proveedor

Hay **tres** opciones:

| Proveedor | Para qué sirve |
|---|---|
| **HF** | Usar modelos SLM de Hugging Face (necesitas token) |
| **Ollama** | Servidor Ollama local en tu red (tu PC) |
| **Custom** | Tu propia API SLM desplegada (Lightning AI o servidor local) |

### Configurar Hugging Face

1. Selecciona **"HF"**.
2. Elige un modelo del desplegable (ver catálogo abajo).
3. Ingresa tu **API Token** de Hugging Face:
   - Consíguelo gratis en [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - El token empieza con `hf_`
4. Ajusta los parámetros:

| Parámetro | Qué hace | Valor recomendado |
|---|---|---|
| **Temperatura** | Creatividad vs precisión | `0.7` (equilibrio) |
| **Máx. tokens** | Longitud máxima de respuesta | `2048` |

5. Haz clic en **"Probar conexión"** para verificar que el token y modelo funcionan.
6. Haz clic en **"Guardar"**.

### Configurar Ollama (local)

1. Selecciona **"Ollama"**.
2. Ingresa la **Base URL**:
   - Para Ollama en tu PC: `http://IP_DE_TU_PC:11434/v1`
   - Para OpenAI: `https://api.openai.com/v1`
3. Ingresa el **nombre del modelo**: `llama3`, `phi3`, `mistral`, etc.
4. Ingresa tu **API Key** (opcional para Ollama, obligatorio para OpenAI).
5. Ajusta temperatura y tokens.
6. Haz clic en **"Guardar"**.

> ⚠️ **Para Ollama en tu PC**: Debes ejecutar Ollama escuchando en la red:
> ```bash
> set OLLAMA_HOST=0.0.0.0 && ollama serve  # Windows
> ```

### Configurar API Custom (tu propio servicio SLM)

1. Selecciona **"Custom"**.
2. Ingresa la **URL de tu API SLM**:
   - Local: `http://192.168.43.171:8000` (IP de tu PC)
   - Lightning AI: `https://tu-usuario-proyecto.lightning.ai`
3. Ingresa el **ID del modelo**:
   - `smollm3-3b` (⭐ recomendado), `llama-1b`, `qwen-3b`, `phi-3.5-mini`, etc.
4. **API Key**: Opcional (solo si tu API lo requiere).
5. Ajusta temperatura y tokens.
6. Haz clic en **"Probar conexión"**.
7. Haz clic en **"Guardar"**.

> 📖 **Ver `README_DEPLOY.md`** para instrucciones completas de deploy.

---

## 10. Catálogo de Modelos Disponibles

### ⚡ Ultra ligeros (< 2B) — Rápidos, ideales para pruebas

| Modelo | Parámetros | Característica |
|---|---|---|
| **Llama 3.2 1B** | 1B | Ultra ligero, respuesta muy rápida |
| **SmolLM2 1.7B** | 1.7B | SLM oficial de Hugging Face |
| **Qwen 2.5 1.5B** | 1.5B | Compacto con buen rendimiento |

### 🚀 Ligeros (3B–4B) — Mejor calidad sin mucho costo

| Modelo | Parámetros | Característica |
|---|---|---|
| **Llama 3.2 3B** | 3B | Equilibrio calidad/velocidad |
| **Phi-3.5 Mini 3.8B** | 3.8B | Microsoft, excelente razonamiento |
| **SmolLM3 3B** | 3B | Nueva generación SmolLM ⭐ (por defecto) |
| **Qwen 2.5 3B** | 3B | Multilingüe, bueno en código |
| **Qwen 2.5 Coder 3B** | 3B | Especializado en generar código |
| **Gemma 2 2B** | 2B | Google, eficiente |

### 🧠 Calidad media (7B–9B) — Mejor razonamiento y contexto

| Modelo | Parámetros | Característica |
|---|---|---|
| **Llama 3.1 8B** | 8B | Buena calidad general |
| **Qwen 2.5 7B** | 7B | Excelente en tareas complejas |
| **Gemma 2 9B** | 9B | Google, alto rendimiento |
| **Mistral 7B v0.3** | 7B | Popular y versátil |

### 💡 Modelos de razonamiento

| Modelo | Parámetros | Característica |
|---|---|---|
| **DeepSeek R1 1.5B** | 1.5B | Razonamiento paso a paso |
| **DeepSeek R1 8B** | 8B | Razonamiento avanzado |

### ¿Cuál elegir?

| Tu necesidad | Modelo recomendado |
|---|---|
| Respuestas ultra rápidas | Llama 3.2 1B |
| Uso general equilibrado | **SmolLM3 3B** (default) |
| Generar código | Qwen 2.5 Coder 3B |
| Tareas complejas | Qwen 2.5 7B o Llama 3.1 8B |
| Razonamiento lógico | DeepSeek R1 8B |

---

## 11. Sistema RAG — Indexar y Buscar en Documentos

### ¿Qué es RAG?

**RAG** (Retrieval-Augmented Generation) te permite:
1. Subir un documento (`.txt`, `.md`, `.docx`)
2. El sistema lo divide en fragmentos y los convierte en vectores matemáticos (embeddings)
3. Puedes hacer preguntas y el sistema encuentra los fragmentos más relevantes por similitud

### Acceder al RAG

- Desde el chat, haz clic en el ícono **🤖 Bot** en la barra lateral superior.
- Se abre la página **Motor RAG: Indexación y Consulta**.

---

### Paso 1: Configurar el Token de Hugging Face

1. En la sección **"Configuración de API Token"**, haz clic en el campo de texto.
2. Ingresa tu token de Hugging Face (empieza con `hf_`).
3. Haz clic en **"Guardar"**.
4. Verás un mensaje verde: `✅ Token configurado`.

> 💡 Consigue tu token gratis en [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

### Paso 2: Indexar un Documento

1. En la sección **"Indexar Documento"**, haz clic en el botón de selección de archivo.
2. Elige un archivo `.txt`, `.md` o `.docx`.
3. Verás el nombre y tamaño del archivo.
4. Haz clic en **"Indexar Archivo"**.
5. El sistema:
   - Extrae el texto del archivo
   - Lo divide en fragmentos de 500 palabras
   - Genera un vector (embedding) por cada fragmento
6. Una **barra de progreso** muestra el avance.
7. Al finalizar verás: `✅ Indexación completa. Se indexaron X fragmentos`.

> 💡 Para archivos `.docx`, se usa Mammoth para extraer el texto automáticamente.

---

### Paso 3: Consultar los Fragmentos

1. En la sección **"Consultar Fragmentos"**, escribe tu pregunta en el campo de texto.
   - Ejemplo: `¿Cuál es la política de devoluciones?`
2. Haz clic en **"Buscar"**.
3. El sistema:
   - Convierte tu pregunta en un vector (embedding)
   - Compara con todos los fragmentos indexados
   - Calcula la **similitud coseno** entre tu pregunta y cada fragmento
   - Ordena los resultados de mayor a menor similitud
4. Se muestran los **Top 5 resultados** con:
   - **Score**: Porcentaje de similitud (más alto = más relevante)
   - **Texto**: El fragmento encontrado

### Entender los resultados

| Score | Qué significa |
|---|---|
| **80–100%** | Muy relevante — el fragmento habla exactamente de tu pregunta |
| **50–80%** | Relevante — hay relación con tu pregunta |
| **30–50%** | Poco relevante — conexión parcial |
| **0–30%** | No relevante — busca con otra consulta |

---

## 12. Cerrar Sesión

1. En la barra lateral, mira la parte inferior donde está tu **perfil**.
2. Verás tu nombre, email, y dos botones.
3. Haz clic en **🚪 Salir**.
4. Serás redirigido a la pantalla de **Inicio de Sesión**.

> ⚠️ Tus conversaciones y configuraciones se guardan. Al volver a iniciar sesión, todo estará ahí.

---

## 13. Solución de Problemas

### "No hay conversaciones aún"

- Haz clic en **➕** para crear tu primera conversación.

### El asistente no responde

1. Abre **⚙️ LLM** y verifica que un modelo esté seleccionado.
2. Verifica que el **API Token** esté ingresado correctamente.
3. Haz clic en **"Probar conexión"** para diagnosticar.
4. Si el token es inválido, renuévalo en [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

### Error del modelo (401, 403, 429)

| Código | Causa | Solución |
|---|---|---|
| **401** | Token inválido o expirado | Renueva el token |
| **403** | No tienes acceso a ese modelo | Prueba con otro modelo |
| **429** | Demasiadas peticiones (rate limit) | Espera unos minutos y reintenta |
| **503** | Modelo no disponible en ese momento | Cambia de modelo o espera |

### El micrófono no funciona

1. El navegador te pedirá **permiso de micrófono** la primera vez — haz clic en **"Permitir"**.
2. Si lo bloqueaste antes, haz clic en el ícono 🔒 junto a la URL y permite el micrófono.
3. Verifica que tu dispositivo tiene micrófono configurado.

### La transcripción falla

- Verifica que tengas conexión a internet (el servicio STT es externo).
- Intenta grabaciones más cortas.
- Si persiste el error, escribe el mensaje manualmente.

### No puedo iniciar sesión

- Asegúrate de estar registrado con ese email.
- Verifica mayúsculas y espacios en la contraseña.
- Si olvidaste la contraseña, crea una cuenta nueva (no hay recuperación en esta versión).

---

## ⌨️ Resumen de Atajos y Botones

| Acción | Cómo |
|---|---|
| Nueva conversación | `➕` en barra lateral |
| Renombrar chat | `✏️` al pasar el mouse sobre el chat |
| Eliminar chat | `🗑️` al pasar el mouse sobre el chat |
| Abrir configuración LLM | `⚙️ LLM` o `⚙️` en barra lateral |
| Ir al RAG | `🤖` en barra lateral superior |
| Grabar voz (STT) | `🎤` en el input |
| Escuchar respuesta (TTS) | `🔊` bajo mensaje del asistente |
| Adjuntar archivo | `📎` en el input |
| Enviar mensaje | `Enter` o `📤` |
| Nueva línea en mensaje | `Shift + Enter` |
| Cerrar sesión | `🚪 Salir` en barra lateral |

---

## 🔗 Enlaces Útiles

| Recurso | URL |
|---|---|
| Obtener token HF | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| Modelos disponibles | [huggingface.co/models](https://huggingface.co/models?pipeline_tag=text-generation) |
| Ollama (modelos locales) | [ollama.com](https://ollama.com) |

---

*Guía de Nexus Chat — Versión 1.0*

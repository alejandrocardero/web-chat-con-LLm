# Casos de Uso - Nexus Chat

## 1. UC-01: Registrarse

**Actor**: Usuario nuevo

**Descripción**: El usuario crea una cuenta en la aplicación

**Flujo Principal**:
1. Usuario accede a `/register`
2. Sistema muestra formulario de registro
3. Usuario ingresa username y password
4. Usuario presiona "Registrarse"
5. Sistema:
   - Valida que username no esté en uso
   - Hashea password con SHA-256 + salt
   - Guarda usuario en localStorage
   - Crea sesión automáticamente
6. Sistema redirige a `/`

**Flujo Alternativo**:
- Si username existe: mostrar error "El usuario ya existe"
- Si password muy corta: mostrar error "La contraseña debe tener al menos 6 caracteres"

**Postcondición**: Usuario autenticado, datos guardados en localStorage

---

## 2. UC-02: Iniciar Sesión

**Actor**: Usuario registrado

**Descripción**: El usuario accede a su cuenta

**Flujo Principal**:
1. Usuario accede a `/login`
2. Sistema muestra formulario de login
3. Usuario ingresa username y password
4. Usuario presiona "Entrar"
5. Sistema:
   - Busca usuario en localStorage
   - Verifica hash de password
   - Genera token UUID
   - Guarda sesión
6. Sistema redirige a `/`

**Flujo Alternativo**:
- Credenciales incorrectas: mostrar error "Usuario o contraseña incorrectos"
- Ya autenticado: redirigir directamente a `/`

**Postcondición**: Sesión activa, redirigido a página principal

---

## 3. UC-03: Crear Conversación

**Actor**: Usuario autenticado

**Descripción**: El usuario inicia una nueva conversación

**Flujo Principal**:
1. Usuario está en página de chat (`/`)
2. Usuario presiona "+" en la barra lateral
3. Sistema:
   - Crea nueva conversación con título "Chat N"
   - Guarda en localStorage
   - Añade a lista de conversaciones
4. Sistema selecciona la nueva conversación
5. Mensajes vacíos, listo para chatear

**Postcondición**: Nueva conversación activa y vacía

---

## 4. UC-04: Enviar Mensaje

**Actor**: Usuario autenticado

**Descripción**: El usuario envía un mensaje y recibe respuesta del LLM

**Flujo Principal**:
1. Usuario tiene conversación activa
2. Usuario escribe mensaje en ChatInput
3. Usuario presiona Enter o botón de enviar
4. Sistema:
   - Guarda mensaje del usuario (role: user)
   - Muestra mensaje en UI
   - Construye historial de conversación
5. Sistema llama al proveedor configurado:
   - **HuggingFace**: POST /hf-api/chat/completions
   - **Ollama/OpenAI**: POST {base_url}/chat/completions
   - **Custom**: POST {base_url}/v1/chat/completions
6. LLM genera respuesta
7. Sistema:
   - Guarda mensaje del asistente (role: assistant)
   - Muestra en UI
   - Actualiza preview de conversación
8. Sistema scroll al último mensaje

**Flujo Alternativo**:
- Sin LLM configurado: mostrar prompt para configurar
- Error de API: mostrar mensaje de error del modelo
- Timeout (3 min): mostrar error de timeout

**Postcondición**: Mensajes visibles en UI, guardados en localStorage

---

## 5. UC-05: Configurar Modelo LLM

**Actor**: Usuario autenticado

**Descripción**: El usuario configura el proveedor y modelo de IA

**Flujo Principal**:
1. Usuario presiona botón de configuración (⚙️)
2. Sistema abre LLMSettingsModal
3. Usuario selecciona proveedor:
   - **HuggingFace**: Modelos predefinidos (Llama, SmolLM, Qwen, etc.)
   - **Ollama**: URL base, nombre del modelo
   - **Custom**: URL de API, modelo
4. Usuario ajusta parámetros:
   - Temperatura (0-2)
   - Máx. tokens (256-8192)
5. Usuario presiona "Probar conexión"
6. Sistema muestra resultado (éxito/error)
7. Usuario presiona "Guardar"
8. Sistema guarda configuración en localStorage

**Postcondición**: Configuración guardada, usada en próximos mensajes

---

## 6. UC-06: Usar Sistema RAG

**Actor**: Usuario autenticado

**Descripción**: Indexar documentos y buscar información

**Flujo Principal**:
1. Usuario accede a `/rag`
2. **Subir Documento**:
   - Usuario arrastra archivo (.txt, .md, .docx)
   - Sistema extrae texto (Mammoth para .docx)
   - Sistema divide en chunks (500 palabras, 50 overlap)
   - Sistema genera embeddings (HF sentence-transformers)
   - Sistema guarda en localStorage
3. **Búsqueda**:
   - Usuario escribe consulta
   - Sistema genera embedding de consulta
   - Sistema busca similitud coseno (top 5)
   - Sistema muestra resultados con scores

**Postcondición**: Documentos indexados o resultados de búsqueda

---

## 7. UC-07: Transcripción de Voz (STT)

**Actor**: Usuario autenticado

**Descripción**: Convertir audio a texto

**Flujo Principal**:
1. Usuario está en ChatInput
2. Usuario presiona botón de micrófono 🎤
3. Sistema:
   - Activa MediaRecorder (formato WebM)
   - Muestra indicador de grabación (micrófono rojo)
4. Usuario presiona 🎤 nuevamente
5. Sistema:
   - Detiene grabación
   - Envía audio al servicio STT
   - Muestra "Transcribiendo audio..."
6. Servicio devuelve texto
7. Sistema:
   - Inserta texto en ChatInput
   - Permite editar antes de enviar
8. Usuario envía mensaje (UC-04)

**Flujo Alternativo**:
- Error de transcripción: mostrar "[Error al transcribir]"
- Permisos de麦克风denegados: mostrar error de permisos

**Postcondición**: Texto en input, listo para enviar

---

## 8. UC-08: Eliminar Conversación

**Actor**: Usuario autenticado

**Descripción**: Borrar una conversación

**Flujo Principal**:
1. Usuario está en lista de conversaciones
2. Usuario presiona opción de eliminar (🗑️)
3. Sistema muestra confirmación
4. Usuario confirma
5. Sistema:
   - Elimina conversación de localStorage
   - Elimina todos sus mensajes
   - Selecciona otra conversación (si existe)

**Postcondición**: Conversación eliminada, UI actualizada

---

## 9. UC-09: Renombrar Conversación

**Actor**: Usuario autenticado

**Descripción**: Cambiar el título de una conversación

**Flujo Principal**:
1. Usuario está en lista de conversaciones
2. Usuario presiona opción de editar (✏️)
3. Sistema permite editar título
4. Usuario ingresa nuevo título
5. Sistema guarda en localStorage

**Postcondición**: Título actualizado

---

## Resumen de Casos de Uso

| ID | Caso de Uso | Actor | Prioridad |
|----|-----------|-------|---------|
| UC-01 | Registrarse | Usuario nuevo | Alta |
| UC-02 | Iniciar Sesión | Usuario | Alta |
| UC-03 | Crear Conversación | Usuario autenticado | Alta |
| UC-04 | Enviar Mensaje | Usuario autenticado | Alta |
| UC-05 | Configurar LLM | Usuario autenticado | Alta |
| UC-06 | Usar RAG | Usuario autenticado | Media |
| UC-07 | STT | Usuario autenticado | Media |
| UC-08 | Eliminar Conversación | Usuario autenticado | Baja |
| UC-09 | Renombrar Conversación | Usuario autenticado | Baja |

---

*Documento de Casos de Uso v1.0 - Nexus Chat*
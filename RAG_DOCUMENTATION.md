# Documentación del Módulo RAG (Retrieval-Augmented Generation)

## 1. Visión General

El proyecto "Chat LLM" integra un sistema de **Retrieval-Augmented Generation (RAG)** que permite al modelo de lenguaje (LLM) acceder a información de documentos proporcionados por el usuario en tiempo real. Esta funcionalidad enriquece la conversación, permitiendo al LLM responder preguntas y realizar tareas basadas en el contenido de archivos específicos.

La implementación es un enfoque de RAG directo y eficaz, centrado en el análisis de un único documento por mensaje.

## 2. Funcionalidad (Cara al Usuario)

- **Activación**: El usuario adjunta un documento a su mensaje a través del icono del clip (📎).
- **Formatos Soportados**: El sistema puede extraer texto de los siguientes tipos de archivo:
  - `.txt` (Texto plano)
  - `.md` (Markdown)
  - `.docx` (Microsoft Word)
  - `.json` (JSON)
  - `.csv` (Valores Separados por Comas)
- **Interacción**: Una vez adjuntado el documento, el usuario puede enviar un mensaje.
  - **Si el usuario escribe un mensaje**: La IA recibe tanto el mensaje como el contenido del documento.
  - **Si el usuario no escribe un mensaje**: Se envía una instrucción por defecto a la IA para que analice el documento.
- **Resultado**: La respuesta de la IA se basa en la información contenida en el documento adjunto.

## 3. Detalles de Implementación (Flujo de Código)

El proceso RAG se desarrolla a través de tres componentes principales:

### Paso 1: Extracción del Documento (`ChatInput.jsx` y `documentExtractor.js`)

1.  **Disparador**: El usuario selecciona un archivo a través del `<input type="file">` en `ChatInput.jsx`.
2.  **Manejo de Archivo**: La función `handleFile` en `ChatInput.jsx` se activa.
3.  **Extracción de Texto**:
    - Se invoca la función `extractTextFromFile` de `scr/lib/documentExtractor.js`.
    - Esta función detecta el tipo de archivo y utiliza el método de extracción adecuado:
        - `extractTextFromTxt` para archivos de texto plano (`.txt`, `.md`, `.csv`).
        - `extractTextFromDocx` para documentos de Word, utilizando la librería `mammoth`.
        - `extractTextFromJson` para archivos JSON, que son parseados y luego formateados como un string legible.
4.  **Truncamiento**:
    - El texto extraído es pasado a la función `truncateText` del mismo módulo.
    - **Crítico**: El contenido del documento se trunca a un **máximo de 8000 caracteres**. Esto es para evitar exceder el límite de contexto del LLM.
5.  **Almacenamiento en Estado**: El texto truncado se guarda en el estado del componente `ChatInput` dentro de un objeto `attachment`.

### Paso 2: Aumento del Prompt (`chat.jsx`)

1.  **Envío**: El componente `ChatInput` llama a la función `sendMessage` (proporcionada por su padre, `chat.jsx`), pasándole el texto del mensaje y el objeto `attachment`.
2.  **Construcción del Contenido**: Dentro de `sendMessage` en `scr/pages/chat.jsx`:
    - Se detecta la presencia de `attachment.content`.
    - El contenido del prompt final se construye dinámicamente. Por ejemplo:
      ```javascript
      // Si el usuario también escribe un texto
      content = `${text}

[Documento adjunto: ${attachment.name}]

${documentContent}`;
      
      // Si el usuario no escribe nada
      content = `Analiza este documento y responde mis preguntas sobre él.

[Documento: ${attachment.name}]

${documentContent}`;
      ```
    - Este formato claro indica al LLM que debe prestar especial atención al texto del documento proporcionado.

### Paso 3: Generación de Respuesta (`chat.jsx`)

1.  **Historial de Conversación**: El nuevo mensaje del usuario (con el contenido del documento aumentado) se añade al historial de la conversación.
2.  **Llamada a la API**: El historial completo, incluyendo el prompt aumentado, se envía al endpoint de Ollama (`/api/chat/completions`).
3.  **Respuesta del LLM**: El LLM procesa la solicitud, utilizando el contexto del documento para formular su respuesta, que se recibe y muestra en la interfaz en tiempo real (streaming).

## 4. Componentes Clave

-   `scr/lib/documentExtractor.js`:
    - **Responsabilidad**: Módulo encargado de la lógica de extracción de texto de diferentes formatos de archivo y su posterior truncamiento. Es el corazón de la fase de "Recuperación".
-   `scr/components/chat/ChatInput.jsx`:
    - **Responsabilidad**: Gestiona la interfaz de usuario para la subida de archivos y orquesta la extracción de texto. Prepara los datos para la fase de "Aumento".
-   `scr/pages/chat.jsx`:
    - **Responsabilidad**: Orquesta todo el flujo de la conversación. Realiza la fase de "Aumento" al construir el prompt final y la fase de "Generación" al comunicarse con la API del LLM.

## 5. Limitaciones Actuales

-   **Límite de Contexto**: El contenido del documento está limitado a los primeros 8000 caracteres. La información que se encuentre más allá de este límite no será vista por el LLM.
-   **Análisis de un solo documento**: El sistema está diseñado para analizar un único documento por turno de conversación. No puede comparar o cruzar información entre varios documentos adjuntados en mensajes diferentes.
-   **Sin persistencia de vectores**: No se utiliza una base de datos vectorial. Cada vez que se hace una pregunta sobre un documento, su contenido debe ser reenviado en el prompt, lo que consume tokens en cada turno.

## 6. Potenciales Mejoras

-   **Chunking y Embeddings**: Para superar el límite de caracteres, los documentos grandes podrían dividirse en fragmentos (chunks). Estos chunks podrían convertirse en vectores (embeddings) y almacenarse.
-   **Búsqueda por Similitud**: Implementar una base de datos vectorial (ej. ChromaDB, Pinecone) para almacenar los embeddings. Al hacer una pregunta, se buscarían los chunks más relevantes por similitud semántica y solo estos se inyectarían en el prompt del LLM, optimizando el uso del contexto.
-   **Soporte para más formatos**: Añadir extractores para otros tipos de archivo como PDF (usando `pdf-lib` o similar).
-   **Gestión de múltiples documentos**: Permitir la creación de una "base de conocimiento" a partir de varios documentos para poder realizar preguntas sobre un conjunto de datos más amplio.

{
  "name": "Message",
  "type": "object",
  "properties": {
    "conversation_id": {
      "type": "string",
      "title": "ID de conversaci\u00f3n"
    },
    "role": {
      "type": "string",
      "enum": [
        "user",
        "assistant"
      ],
      "title": "Rol"
    },
    "content": {
      "type": "string",
      "title": "Contenido"
    },
    "type": {
      "type": "string",
      "enum": [
        "text",
        "audio",
        "document"
      ],
      "title": "Tipo",
      "default": "text"
    },
    "file_url": {
      "type": "string",
      "title": "URL del archivo"
    },
    "file_name": {
      "type": "string",
      "title": "Nombre del archivo"
    }
  },
  "required": [
    "conversation_id",
    "role",
    "content",
    "type"
  ]
}
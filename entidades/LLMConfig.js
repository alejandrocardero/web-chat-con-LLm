{
  "name": "LLMConfig",
  "type": "object",
  "properties": {
    "provider": {
      "type": "string",
      "enum": ["huggingface", "openai"],
      "title": "Proveedor",
      "default": "huggingface"
    },
    "base_url": {
      "type": "string",
      "title": "Base URL del servidor LLM"
    },
    "model": {
      "type": "string",
      "title": "Nombre del modelo"
    },
    "api_key": {
      "type": "string",
      "title": "API Key"
    },
    "temperature": {
      "type": "number",
      "title": "Temperatura",
      "default": 0.7
    },
    "max_tokens": {
      "type": "integer",
      "title": "Máximo de tokens",
      "default": 2048
    }
  }
}
# Informe Técnico - Nexus Chat

## Resumen Ejecutivo

**Nexus Chat** es una aplicación web de chat con Modelos de Lenguaje Pequeños (SLMs) que permite a usuarios comunicarse con inteligencia artificial senza necesidad de crear cuentas en proveedores externos. La aplicación incluye soporte para múltiples proveedores (Hugging Face, Ollama, API personalizada), sistema RAG para indexación de documentos, y transcripción de voz a texto.

---

## 1. Introducción

### 1.1 Contexto

Los Modelos de Lenguaje Grandes (LLMs) como GPT-4 y Claude son puissants pero requieren cuentas paid y API cara. Los SLMs (1B-8B parámetros) ofrecen una alternativa viable para muchas tareas, siendo más rápidos y económicos, pudiendo ejecutarse en hardware modesto.

### 1.2 Problema

- Los usuarios deben crear cuentas en múltiples servicios
- Configuración compleja para usuarios no técnicos
- Sin acceso a modelos locales o customizados

### 1.3 Solución

Nexus Chat proporciona una interfaz unificada que:
- Pre-configura el token de Hugging Face
- Permite selección de modelos con un clic
- Soporta despliegue propio (local o Lightning AI)

---

## 2. Objetivos

### 2.1 Objetivo General

Desarrollar una aplicación web que permita a usuarios comunicarse con SLMs de forma sencilla, sin configuración compleja.

### 2.2 Objetivos Específicos

1. Interfaz de chat intuitiva
2. Múltiples proveedores (HF, Ollama, Custom)
3. Sistema de autenticación local
4. Persistencia de conversaciones
5. Sistema RAG para documentos
6. Transcripción de voz a texto (STT)
7. Síntesis de voz (TTS)
8. Guía de despliegue

---

## 3. Metodología

### 3.1 Enfoque

Metodología ágil iterativa con ciclos cortos de desarrollo y prueba.

### 3.2 Fases

| Fase | Descripción |
|------|------------|
| 1. Requisitos | Definición de funcionalidades |
| 2. Diseño | Arquitectura y componentes |
| 3. Desarrollo | Implementación incremental |
| 4. Pruebas | Testing manual y automático |
| 5. Despliegue | Producción |

### 3.3 Tecnologías Elegidas

- **Frontend**: React + Vite (rápido desarrollo)
- **Estilos**: Tailwind CSS (prototipado rápido)
- **Estado**: TanStack Query (cacheo eficiente)
- **Backend ML**: FastAPI + Transformers

---

## 4. Desarrollo

### 4.1 Estructura del Proyecto

```
nexus-chat/
├── src/                    # Frontend React
│   ├── components/         # Componentes UI
│   ├── pages/            # Páginas
│   ├── hooks/            # Hooks custom
│   ├── lib/             # Servicios
│   └── api/             # Clientes API
├── api/                   # Backend Python (SLM API)
├── deploy/                # Scripts de despliegue
└── docs/                # Documentación
```

### 4.2 Módulos Principales

| Módulo | Función |
|--------|--------|
| Chat Page | Interfaz de chat principal |
| RAG Page | Indexación y búsqueda |
| Auth | Sistema de login/register |
| LLM Settings | Configuración de modelos |
| STT | Transcripción de voz a texto |
| TTS | Síntesis de texto a voz |

### 4.3 Decisiones Técnicas

1. **localStorage** para persistencia (desarrollo)
2. **TanStack Query** para cacheo y mutations
3. **Proxies Vite** para evitar CORS
4. **Quantización 4-bit** para reducir VRAM

---

## 5. Resultados

### 5.1 Modelos Evaluados

| Modelo | Parámetros | Velocidad | Calidad | VRAM |
|--------|------------|----------|---------|------|
| Llama 3.2 1B | 1B | ★★★★★ | ★★☆☆☆ | 1GB |
| SmolLM2 1.7B | 1.7B | ★★★★☆ | ★★☆☆☆ | 2GB |
| Qwen 2.5 1.5B | 1.5B | ★★★★☆ | ★★★☆☆ | 2GB |
| SmolLM3 3B | 3B | ★★★☆☆ | ★★★★☆ | 4GB |
| Llama 3.2 3B | 3B | ★★★☆☆ | ★★★★☆ | 4GB |
| Phi-3.5 Mini | 3.8B | ★★★☆☆ | ★★★★★ | 4GB |
| Qwen 2.5 3B | 3B | ★★★☆☆ | ★★★★☆ | 4GB |
| Qwen 2.5 7B | 7B | ★★☆☆☆ | ★★★★★ | 8GB |
| Llama 3.1 8B | 8B | ★☆☆☆☆ | ★★★★★ | 8GB |

### 5.2 Modelos Recomendados

| Uso | Modelo Recomendado |
|-----|------------------|
| Rápido/Básico | Llama 3.2 1B |
| Equilibrio | SmolLM3 3B |
| Calidad | Phi-3.5 Mini |
| Código | Qwen 2.5 Coder 3B |

### 5.3 Funcionalidades Implementadas

| Funcionalidad | Estado |
|-------------|--------|
| Chat con SLMs | ✓ Completo |
| Múltiples proveedores | ✓ Completo |
| Autenticación | ✓ Completo |
| Persistencia | ✓ Completo |
| Sistema RAG | ✓ Completo |
| STT (voz a texto) | ✓ Completo |
| TTS (texto a voz) | ✓ Completo |
| Deploy local | ✓ Completo |
| Deploy Lightning AI | ✓ Completo |

---

## 6. Comparativa

### 6.1 Nexus Chat vs. Alternativas

| Característica | Nexus Chat | ChatGPT | Ollama |
|--------------|----------|--------|-------|
| Sin cuenta | ✓ | ✗ | ✓ |
| Modelos pre-configurados | ✓ | ✗ | ✗ |
| RAG integrado | ✓ | ✗ | ✗ |
| STT | ✓ | ✓ | ✗ |
| TTS | ✓ | ✓ | ✗ |
| Interfaz web | ✓ | ✓ | CLI |
| Deploy propio | ✓ | ✗ | ✓ |

### 6.2 Ventajas de Nexus Chat

1. **Plug & Play**: Token pre-configurado, sin注册
2. **Multi-proveedor**: HF, Ollama, Custom
3. **RAG integrado**: Indexación local
4. **STT**: Voz a texto
5. **TTS**: Texto a voz
6. **Código abierto**: Personalizable

---

## 7. Limitaciones

### 7.1 Técnicas

- **localStorage**: Limitado a ~5MB
- **Sin backend real**: Datos en navegador
- **STT externo**: Dependencia de servicio externo
- **TTS externo**: Dependencia de servicio externo

### 7.2 de Modelos

- **Calocidad**: Inferior a LLMs grandes
- **Contexto**: Máximo 8K tokens
- **Multimedia**: Solo texto (sin imágenes)

### 7.3 de Despliegue

- **Lightning AI**: 30 min GPU/día (gratis)
- **Local**: Requiere GPU

---

## 8. Trabajo Futuro

### 8.1 Mejoras Inmediatas

- [ ] Base de datos real (PostgreSQL/MongoDB)
- [ ] WebSockets para streaming
- [ ] Más modelos RAG
- [ ] Historial de conversaciones

### 8.2 Mejoras a Largo Plazo

- [ ] Múltiples idiomas
- [x] Voz (TTS) ✓ Completo
- [ ] Imágenes (vision)
- [ ] Agentes tool-use

---

## 9. Conclusiones

### 9.1 Logros

1. ✅ Aplicación funcional de chat con SLMs
2. ✅ Interfaz intuitiva sin configuraciones complejas
3. ✅ Sistema RAG para documentos
4. ✅ STT para voz a texto
5. ✅ TTS para síntesis de voz
6. ✅ Guías de despliegue

### 9.2 Aprendizajes

- Los SLMs son viables para tareas simples
- La cuantización permite ejecutar modelos grandes en hardware modesto
- Los proxies son esenciales para desarrollo local

### 9.3 Recomendaciones

1. Para usuarios nuevos: comenzar con **SmolLM3-3B**
2. Para usuariosadvanced: desplegar API propia en Lightning AI
3. Para producción: migrar a backend real

---

## 10. Anexos

### A. Instalación

```bash
# Frontend
npm install
npm run dev

# Backend (opcional)
cd api
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

### B. Configuración

1. Registrarse en `/register`
2. Ir a Configuración (⚙️)
3. Seleccionar modelo
4. Guardar

### C. Acceso Móvil

1. Conectar a misma WiFi
2. Obtener IP local: `ipconfig`
3. Acceder desde móvil: `http://192.168.x.x:5173`

---

## Referencias

- [Hugging Face Inference API](https://huggingface.co/inference)
- [SmolLM3](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Phi-3.5](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
- [Lightning AI](https://lightning.ai/)
- [Qwen](https://huggingface.co/Qwen)

---

*Informe Técnico v1.0 - Nexus Chat*
*Proyecto Investigativo - SLMs en Aplicaciones Web*
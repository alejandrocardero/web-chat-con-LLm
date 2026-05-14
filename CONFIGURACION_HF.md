# Configuración del Token de Hugging Face

## ⚠️ IMPORTANTE - NO SUBIR TOKEN A GITHUB

El token de Hugging Face está incluido en el código temporalmente para pruebas locales. **NO debes subir este archivo a GitHub** ya que:
- Los tokens de HF se invalidan automáticamente al subirlos a repositorios públicos
- Cualquier persona podría usar tu cuenta de HF facturándote

---

## Cómo obtener tu propio token

1. Ve a: https://huggingface.co/settings/tokens
2. Crea un nuevo token (selecciona "Read" como permiso)
3. Copia el token (comienza con `hf_`)

---

## Cómo configurar el token (Elige una opción)

### Opción 1: Variable de entorno (RECOMENDADO)

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Reinicia el servidor de desarrollo:
```bash
npm run dev
```

---

### Opción 2: Ingresar manualmente en la app

1. Inicia sesión en la aplicación
2. Abre el configurador de LLM (icono de engranaje en el sidebar)
3. En el campo "Hugging Face API Token", ingresa tu token manualmente
4. Click en "Guardar"

El token se guardará en localStorage de tu navegador.

---

## Solución de problemas

### Error: "Token de Hugging Face no configurado"
- Asegúrate de haber configurado el token mediante una de las opciones anteriores

### Error 401 (Unauthorized)
- Tu token puede haber expirado o ser inválido
- Obtén un nuevo token en https://huggingface.co/settings/tokens

### Error 403 (Forbidden)
- Tu token no tiene permisos suficientes
- Asegúrate de que el token tenga permisos de "Read"

---

## Notas adicionales

- **Cada usuario** debe configurar su propio token
- El token se guarda por usuario en localStorage
- Si usas la opción 1 (.env), el token se usará como valor por defecto
- Los usuarios pueden cambiar su token en cualquier momento desde la configuración
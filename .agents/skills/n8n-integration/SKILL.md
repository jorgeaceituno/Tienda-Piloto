---
name: n8n Integration & Automations
description: Guidelines for creating and managing n8n workflows (JSON) and APIs.
---

# n8n Integration

Al trabajar con flujos de trabajo de n8n o sus archivos JSON:

1. **Estructura Esperada:** Asegúrate de mapear correctamente los campos desde el frontend (ej. `name`, `email`, `phone`, `cartTotal`) hacia los nodos (Webhooks).
2. **Validación de Webhooks:** Antes de enviar datos mediante un `fetch()`, valida los datos en el frontend para evitar llamadas incompletas.
3. **Manejo de Respuestas:** Considera siempre retornar una respuesta HTTP en los Webhooks de n8n para no dejar el frontend esperando (timeout) y muestra estados de carga.
4. **Modularidad:** Si se agregan nodos nuevos al flujo (JSON), deben ser escalables y no quebrar las rutas previas.

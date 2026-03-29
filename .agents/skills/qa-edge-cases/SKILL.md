---
name: QA & Edge Cases
description: Guidelines for identifying and preventing edge case bugs and testing robustness.
---

# QA & Casos Borde

Al revisar o programar, asegura siempre evitar inconsistencias de "casos limite":

1. **Entradas Vacías o Negativas:** Maneja inputs de cantidades previendo números negativos, cero o strings (uso del atributo `min="1"` u operaciones seguras).
2. **Imágenes Rotas:** Contempla el atributo `onerror` en imagenes (`onerror="this.src='/fallback.png'"`) para evitar iconos rotos nativos del browser.
3. **Estados Vacíos (Empty States):** Diseña una interfaz limpia de "Carrito vacío" evitando que el usuario intente botones de compra con pedidos nulos.
4. **Errores de Red:** Controla de manera amigable (con mensajes UI, no solo consola) si ocurre un fallo al conectarse con fetch() hacia APIs/n8n.

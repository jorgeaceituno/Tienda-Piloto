---
name: Cart Management and State
description: Guidelines for managing strict state, localStorage, and application data flow in Vanilla JS.
---

# Cart Management & State

Para manejar aplicaciones con estado (como carritos de compras) en Vanilla JS:

1. **Persistencia:** Siempre guarda el estado completo del carrito en `localStorage` cada vez que cambie (añadir, quitar, modificar cantidad).
2. **Carga Inicial:** Al iniciar la app, recupera y valida el contenido desde `localStorage` antes de renderizar.
3. **Inmutabilidad:** Evita modificar directamente los objetos de estado. Usa métodos como `map`, `filter` cuando actualices el estado del carrito.
4. **Separación de Lógica:** Mantén funciones puramente para actualizar el estado (ej. `addToCartState()`) y otras exclusivas para la vista (ej. `renderCartUI()`).

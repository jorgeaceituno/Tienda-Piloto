---
name: SEO and Accessibility
description: Best practices to ensure web pages are accessible and rank well in search engines.
---

# SEO y Accesibilidad (a11y)

1. **Meta Etiquetas (Meta Tags):** Incluye siempre `<title>`, `<meta name="description">` y, en tiendas importantes, Open Graph (`og:title`, `og:image`) para redes.
2. **Imágenes:** Todo elemento `<img>` debe tener un atributo `alt` descriptivo. Para íconos decorativos, usa `alt=""` o `aria-hidden="true"`.
3. **Estructura de Títulos:** Debe haber solo un `<h1>` por página. Los subtítulos deben seguir un orden semántico (`<h2>`, `<h3>`).
4. **Navegación por Teclado:** Asegúrate de que interactivos importantes usen botones (`<button>`) y no `<div>` con roles faltantes, soportando acceso con botón `Enter`.

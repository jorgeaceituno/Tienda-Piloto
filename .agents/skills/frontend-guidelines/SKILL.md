---
name: Web Development Guidelines
description: Best practices for HTML, CSS, and Vanilla JavaScript.
---

# Web Development Guidelines

Estas son las reglas principales que debo seguir al desarrollar para tus proyectos:

## 1. Diseño y Estilos (Vanilla CSS)
- **Cero frameworks externos:** No uses Tailwind ni Bootstrap a menos que se solicite explícitamente.
- **Modernidad:** Usa Flexbox o CSS Grid para layouts.
- **Colores y Temas:** Usa paletas modernas y vibrantes. Incluye animaciones suaves en interacciones (`hover`, `focus`).
- **Nomenclatura:** Mantén las clases en minúsculas y usa guiones (kebab-case). Ej: `.btn-primary`.

## 2. Estructura HTML
- **HTML Semántico:** Usa `<header>`, `<main>`, `<section>`, `<footer>`, `<article>`, `<nav>` para mejor accesibilidad y SEO.
- **IDs Únicos:** Asegúrate de que los elementos interactivos tengan IDs descriptivos para poder referenciarlos en JS.

## 3. Lógica JavaScript (Vanilla JS)
- **Variables:** Usa `const` y `let` (nunca `var`).
- **Funciones:** Prefiere *arrow functions* y mantén el código modular.
- **Cadenas:** Usa *template literals* en lugar de concatenar con `+`.
- **Eventos:** Usa `addEventListener` y evita atributos en línea en el HTML (ej. `onclick=""`).

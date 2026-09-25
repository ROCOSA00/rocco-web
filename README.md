# DJ Rocco · web oficial

Web de una sola página para **DJ Rocco** ([@djroccolive](https://www.instagram.com/djroccolive/)), DJ urbano del Maresme.

Es HTML, CSS y JavaScript sin dependencias ni paso de compilación: se puede publicar tal cual en Vercel, Netlify o GitHub Pages.

## Estructura

```
index.html                  Contenido de la web (textos, salas, eventos)
css/styles.css              Estilos (colores y tipografías arriba del todo, en :root)
js/config.js                Conexión del formulario con Supabase
js/main.js                  Menú móvil, cabecera y formulario de booking
assets/logo.svg             Logo (recortado al contenido)
assets/img/                 Fotos optimizadas en WebP (2 tamaños cada una)
assets/og-image.jpg         Imagen al compartir el enlace (WhatsApp, Instagram…)
assets/favicon-32.png       Icono de pestaña (los destellos del logo)
supabase/booking_requests.sql  Tabla para guardar solicitudes de booking
```

## Secciones

1. **Inicio**: foto en cabina, logo, estilos y botones de Booking e Instagram.
2. **Cinta de estilos**: reggaetón, urbano, hits comerciales, afro, house y pachanga.
3. **Bio**
4. **Experiencia**: salas (Cocoa, Titus, Classic, Sala Duvet, Malalts de Festa, Particular, Sakova, Sala Privat) y eventos (El Jaleo, Attic, Hotel W, Zeta Dance Club).
5. **Banda de foto** (Classic Mataró).
6. **Booking**: formulario + email, teléfono, WhatsApp, Instagram y Linktree.

## Verla en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicarla

**Opción A: Vercel (recomendada).** En [vercel.com](https://vercel.com), *Add New → Project*, importa `ROCOSA00/rocco-web`, deja *Framework Preset* en **Other** y pulsa *Deploy*. Cada cambio en `main` se publica solo. Desde *Settings → Domains* puedes conectar un dominio propio.

**Opción B: GitHub Pages.** En el repo, *Settings → Pages → Build and deployment*: *Deploy from a branch*, rama `main`, carpeta `/ (root)`. Quedará en `https://rocosa00.github.io/rocco-web/`.

Cuando tengas el dominio definitivo, cambia en `index.html` la etiqueta `og:image` por la URL completa (por ejemplo `https://tudominio.com/assets/og-image.jpg`) para que la vista previa al compartir funcione en todas las apps.

## Formulario de booking (Supabase)

El formulario guarda cada solicitud en la tabla `booking_requests` de Supabase. Para activarlo, **una sola vez**:

1. Entra en el proyecto de Supabase → **SQL Editor** → *New query*.
2. Pega el contenido de `supabase/booking_requests.sql` y pulsa **Run**.
3. Las solicitudes aparecerán en **Table Editor → booking_requests**.

La web solo puede **insertar** solicitudes (no leerlas ni borrarlas). Eso lo garantizan las políticas RLS del SQL. Por eso la *publishable key* puede estar en `js/config.js`. **No pongas nunca en el repo la contraseña de la base de datos ni la *secret key*.**

Si Supabase no responde, el formulario muestra un mensaje con el email y el Instagram para que nadie se quede sin poder contactar.

## Cambios habituales

| Quiero… | Dónde |
| --- | --- |
| Cambiar email, teléfono o WhatsApp | `index.html` → lista `<ul class="contact-links">` y pie (`footer-links`) |
| Añadir o quitar una sala | `index.html` → lista `<ul class="venues">` |
| Añadir un evento | `index.html` → lista `<ul class="event-list">` |
| Cambiar la bio | `index.html` → sección `id="bio"` |
| Cambiar el color de acento | `css/styles.css` → `--amber` |
| Cambiar una foto | Sustituye el `.webp` en `assets/img/` con el mismo nombre |

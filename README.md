# DJ Rocco · web oficial

Web de una sola página para **DJ Rocco** ([@djroccolive](https://www.instagram.com/djroccolive/)), DJ urbano del Maresme.

Es HTML, CSS y JavaScript sin dependencias ni paso de compilación: se puede publicar tal cual en Vercel, Netlify o GitHub Pages.

## Estructura

```
index.html                  Contenido de la web (textos, salas, eventos)
css/styles.css              Estilos (colores y tipografías arriba del todo, en :root)
js/config.js                Conexión del formulario con Supabase
js/main.js                  Pantalla de carga, menú móvil, cabecera y formulario
assets/logo.svg             Logo (recortado al contenido)
assets/img/                 Fotos optimizadas en WebP (2 tamaños cada una)
assets/video/               Vídeo de portada (horizontal y vertical) y su primer fotograma
assets/og-image.jpg         Imagen al compartir el enlace (WhatsApp, Instagram…)
assets/rocco-presskit.pdf   Press kit que se descarga desde Booking y el pie
presskit/                   Maqueta del press kit (HTML + fotos) para regenerar el PDF
assets/favicon-32.png       Icono de pestaña (los destellos del logo)
supabase/booking_requests.sql  Tabla para guardar solicitudes de booking
supabase/booking_notifications.sql  Aviso por email de cada solicitud nueva
supabase/gigs.sql           Tabla de próximas fechas
```

## Secciones

0. **Pantalla de carga**: el logo late a 124 BPM sobre una barra de progreso; al terminar, el fondo se desvanece y el logo vuela a su sitio en la portada.
1. **Inicio**: vídeo en bucle de fondo (sin sonido, con botón para pausarlo), logo, estilos y botones de Booking e Instagram.
2. **Cinta de estilos**: reggaetón, urbano, hits comerciales, afro, house y pachanga.
3. **Bio**
4. **Próximas fechas**: tus bolos, leídos de Supabase. Las fechas pasadas desaparecen solas; si no hay ninguna, sale un aviso con enlace a Instagram y a Booking.
5. **Experiencia**: salas (Cocoa, Titus, Classic, Malalts de Festa, Particular, Sakova, Sala Privat) que se despliegan al pulsarlas con una descripción, tipo de local, ubicación, Instagram de la sala y "Cómo llegar"; y eventos (El Jaleo, Attic, Hotel W, Zeta Dance Club).
6. **Banda de foto** (Classic Mataró).
7. **Música**: reproductor de SoundCloud con la pista destacada (*Se Nota (Rocco Original Mix)*) y enlaces a SoundCloud, YouTube y TikTok.
8. **Booking**: formulario + email, Instagram, Linktree y botón para descargar el press kit.

## Verla en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicarla

**Opción A: Vercel (recomendada).** En [vercel.com](https://vercel.com), *Add New → Project*, importa `ROCOSA00/rocco-web`, deja *Framework Preset* en **Other** y pulsa *Deploy*. Cada cambio en `main` se publica solo. Desde *Settings → Domains* puedes conectar un dominio propio.

**Opción B: GitHub Pages.** En el repo, *Settings → Pages → Build and deployment*: *Deploy from a branch*, rama `main`, carpeta `/ (root)`. Quedará en `https://rocosa00.github.io/rocco-web/`.

La web está publicada en **https://rocco-web-five.vercel.app**. Si conectas un dominio propio, cambia esa dirección en `index.html` (etiquetas `canonical`, `og:url`, `og:image` y `twitter:image`) para que la vista previa al compartir apunte al dominio nuevo.

## Formulario de booking (Supabase)

El formulario guarda cada solicitud en la tabla `booking_requests` de Supabase. Para activarlo, **una sola vez**:

1. Entra en el proyecto de Supabase → **SQL Editor** → *New query*.
2. Pega el contenido de `supabase/booking_requests.sql` y pulsa **Run**.
3. Las solicitudes aparecerán en **Table Editor → booking_requests**.

La web solo puede **insertar** solicitudes (no leerlas ni borrarlas). Eso lo garantizan las políticas RLS del SQL. Por eso la *publishable key* puede estar en `js/config.js`. **No pongas nunca en el repo la contraseña de la base de datos ni la *secret key*.**

Si Supabase no responde, el formulario muestra un mensaje con el email y el Instagram para que nadie se quede sin poder contactar.

### Aviso por email

Cada solicitud nueva llega también por email a djroccolive@gmail.com. Lo envía Supabase a través de [Resend](https://resend.com) (gratis hasta 100 emails al día). Si el cliente dejó un email, basta con darle a *Responder*; si dejó un teléfono, el email trae botones para llamar y para WhatsApp.

Para activarlo, **una sola vez**:

1. Crea una cuenta en [resend.com](https://resend.com) con **djroccolive@gmail.com**. Sin dominio propio, Resend solo deja enviar al email de la cuenta.
2. En Resend → **API Keys** → *Create API Key* (permiso *Sending access*) y copia la clave (empieza por `re_`).
3. En Supabase → **SQL Editor** → *New query*, pega el contenido de `supabase/booking_notifications.sql`.
4. Sustituye `PEGA_AQUI_TU_API_KEY_DE_RESEND` por tu clave y pulsa **Run**.

La clave queda cifrada en Supabase Vault. No la subas nunca a GitHub. Para cambiarla, repite los pasos 3 y 4 con la clave nueva. Si un email falla, la solicitud se guarda igualmente en la tabla.

## Próximas fechas (Supabase)

Para activarlas, **una sola vez**: Supabase → **SQL Editor** → *New query* → pega `supabase/gigs.sql` → **Run**.

Para añadir un bolo: **Table Editor → gigs → Insert row** y rellena `date` (el día en que empieza la noche), `venue` y `city`. `event` (nombre de la fiesta) y `tickets_url` (enlace a entradas, con `https://`) son opcionales. Para ocultar un bolo sin borrarlo, desmarca `published`. La web muestra hasta 12 fechas, de la más próxima a la más lejana.

## Press kit

El PDF es `assets/rocco-presskit.pdf`. Para cambiarlo, edita `presskit/presskit.html` (textos, rider, fotos en `presskit/img/`), ábrelo en Chrome desde la web local (`python3 -m http.server` y `http://localhost:8000/presskit/presskit.html`) → **Imprimir → Guardar como PDF**, tamaño A4, márgenes *Ninguno* y *Gráficos de fondo* activado, y guárdalo encima de `assets/rocco-presskit.pdf`.

## Cambios habituales

| Quiero… | Dónde |
| --- | --- |
| Cambiar el email o las redes | `index.html` → listas `<ul class="contact-links">` (Música y Booking) y pie (`footer-links`) |
| Cambiar la pista destacada | `index.html` → sección `id="musica"`: el título en `player-title` y la URL de la pista en el `src` del `<iframe>` y en `player-link` |
| Añadir o quitar una sala, o cambiar su descripción | `index.html` → lista `<ul class="venues">`: cada sala es un `<details>` con su nombre, ciudad, descripción, tipo, ubicación y enlaces |
| Añadir un bolo | Supabase → Table Editor → `gigs` → Insert row |
| Añadir un evento | `index.html` → lista `<ul class="event-list">` |
| Cambiar la bio | `index.html` → sección `id="bio"` |
| Cambiar el color de acento | `css/styles.css` → `--amber` |
| Cambiar una foto | Sustituye el `.webp` en `assets/img/` con el mismo nombre |
| Alargar o acortar la pantalla de carga | `js/main.js` → `MIN_TIME` (milisegundos) |
| Cambiar el vídeo de portada | Sustituye `assets/video/hero-landscape.mp4` (1280×720) y `hero-portrait.mp4` (720×1000, para móvil) por clips MP4 H.264 sin audio de unos 12 s y menos de 4 MB, y sus `.webp` por el primer fotograma de cada uno |

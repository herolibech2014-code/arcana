# Guía de despliegue — Arcana

## 1. Publicar el sitio con el backend de pagos (Vercel)

Este proyecto ahora tiene una carpeta `/api` con 2 funciones (`create-order.js` y `capture-order.js`)
que verifican los pagos de PayPal del lado del servidor. Para que funcionen, el sitio no puede estar
en un hosting 100% estático (como GitHub Pages solo); necesita un servicio que soporte "funciones
serverless". El más simple y gratuito para este caso es **Vercel**.

**Pasos:**
1. Subí este proyecto completo (con la carpeta `api/` incluida) a un repositorio de GitHub.
2. Entrá a [vercel.com](https://vercel.com) y creá una cuenta gratuita (podés entrar con tu cuenta de GitHub).
3. Click en **"Add New" → "Project"**, elegí tu repositorio de Arcana.
4. Vercel detecta solo la carpeta `api/` y la convierte en funciones — no hace falta configurar nada más
   en el paso de build. Click en **Deploy**.
5. Una vez desplegado, andá a **Settings → Environment Variables** del proyecto en Vercel y agregá:
   - `PAYPAL_CLIENT_ID` → tu Client ID de PayPal (ver paso 2 abajo)
   - `PAYPAL_SECRET` → tu Secret de PayPal (¡nunca lo pongas en el HTML, solo acá!)
   - `PAYPAL_ENV` → `sandbox` mientras probás, `live` cuando quieras cobrar de verdad
6. Volvé a desplegar (Vercel → pestaña Deployments → los tres puntos → Redeploy) para que tome las
   variables nuevas.

## 2. Obtener tus credenciales de PayPal

1. Entrá a [developer.paypal.com](https://developer.paypal.com/) con tu cuenta de PayPal.
2. Andá a **Apps & Credentials**.
3. Arriba vas a ver un switch **Sandbox / Live** — dejalo en **Sandbox** primero para probar con dinero
   ficticio, sin arriesgar plata real.
4. Click en **Create App**, ponele un nombre (ej: "Arcana").
5. Te va a dar dos datos:
   - **Client ID** (público — va en el HTML, no pasa nada si se ve)
   - **Secret** (privado — va SOLO en las variables de entorno de Vercel, nunca en el código)
6. Copiá el **Client ID** y reemplazalo en `index.html`, donde dice:
   `TU-CLIENT-ID-PUBLICO-PAYPAL` (buscalo con Ctrl+F, aparece una vez, en el script de PayPal SDK).
7. Cuando ya probaste todo en Sandbox y funciona, creá una app igual pero con el switch en **Live**,
   y actualizá el Client ID en el HTML + el Secret y `PAYPAL_ENV=live` en Vercel.

## 3. Google AdSense — dónde entrar y qué pegar

Esta parte respondía tu pregunta de "dónde entro para agregar algo de AdSense":

1. Entrá a [adsense.google.com](https://adsense.google.com) y creá una cuenta (si no tenés), usando el
   dominio donde vas a publicar el sitio (necesitás tenerlo ya funcionando online, aunque sea de prueba).
2. Google revisa el sitio — puede tardar unos días. Mientras no te aprueben, no se ve ningún anuncio real
   (los espacios quedan vacíos), aunque el código ya esté puesto.
3. Una vez aprobado, andá a **Cuenta → Información de la cuenta**, ahí vas a ver tu **ID de editor**, con
   este formato: `ca-pub-1234567890123456`.
4. En `index.html`, buscá (Ctrl+F) todas las apariciones de `ca-pub-XXXXXXXXXXXXXXXX` (hay 4: una en el
   `<head>` que carga la librería, y una en cada uno de los 3 espacios de anuncios) y reemplazalas TODAS
   por tu ID real.
5. Para cada espacio de anuncio, en AdSense andá a **Anuncios → Por unidad de anuncio → Anuncio display**,
   creá una unidad nueva, y te va a dar un `data-ad-slot="1234567890"` — reemplazá el `XXXXXXXXXX` de cada
   `<ins class="adsbygoogle">` por el slot correspondiente a esa unidad (podés usar la misma unidad en
   los 3 espacios, o crear una distinta para cada uno).
6. Guardá, subí los cambios, y en unos minutos/horas deberían empezar a aparecer los anuncios reales.

**Dónde están los 3 espacios ya puestos en el código** (buscá estos comentarios en `index.html`):
- `<!-- ADSENSE: Bottom of main menu -->` → en el menú principal
- `<!-- ADSENSE: después de la lectura, antes de "Nueva Consulta" -->` (aparece 2 veces) → en el resultado
  del Tarot y en el resultado de Astrología

Si querés agregar más espacios (por ejemplo en Numerología u Oráculo), copiá el mismo bloque:
```html
<div class="ads-box">
    <ins class="adsbygoogle" style="display:block" data-ad-client="TU-ID-AQUI" data-ad-slot="TU-SLOT-AQUI" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

## 4. Dominio propio

En SEO dejé varios `TU-DOMINIO-AQUI.com` de placeholder (canonical, Open Graph, sitemap.xml, robots.txt).
Cuando tengas tu dominio final, buscalos con Ctrl+F en `index.html`, `robots.txt` y `sitemap.xml`, y
reemplazalos por tu dominio real — sin eso, Google no puede indexar correctamente esas referencias.

# Cómo subir tu libreta a Vercel — Paso a paso

Esta guía es para alguien que nunca programó. Vas a tardar unos 15-20 minutos la primera vez. Después de hacerlo, vas a tener una página web tuya con un link que podés compartir.

**Lo que vas a hacer**, en resumen:
1. Crear una cuenta gratis en GitHub (donde vive el código)
2. Subir esta carpeta a GitHub
3. Crear una cuenta gratis en Vercel
4. Conectar Vercel con GitHub
5. Vercel arma la página automáticamente y te da un link

Todo es gratis. No necesitás tarjeta de crédito.

---

## Antes de empezar

Asegurate de tener la carpeta `mi-presupuesto` descargada y descomprimida en tu computadora. Si la tenés como `.zip`, descomprimila primero (botón derecho → "Extraer").

**Importante**: NO subas la carpeta `node_modules` si la ves dentro. Es enorme y no hace falta. Vercel la genera sola. Si está, borrala (botón derecho → eliminar).

---

## Paso 1 · Crear cuenta en GitHub

GitHub es donde se guarda el código de tu app. Es gratis.

1. Entrá a **https://github.com/signup**
2. Poné tu email, una contraseña y un nombre de usuario (el que quieras, ej: `juana123`)
3. Verificá tu email cuando te llegue el mail de GitHub
4. Listo, ya tenés cuenta

---

## Paso 2 · Crear un "repositorio" en GitHub

Un repositorio es como una carpeta en internet donde vive tu código.

1. Ya logueado en GitHub, clickeá el botón **"+"** arriba a la derecha → **"New repository"**
2. En **"Repository name"** escribí: `mi-presupuesto`
3. Dejá **"Public"** marcado (eso permite que Vercel lo lea gratis)
4. **No marques** ninguna de las opciones de abajo ("Add a README", etc.) — la carpeta ya tiene todo lo que necesita
5. Clickeá **"Create repository"**

Te va a aparecer una pantalla con instrucciones de código. **Ignoralas todas**, no las necesitás. Mirá la sección que dice "uploading an existing file" o el link que dice **"upload an existing file"**.

---

## Paso 3 · Subir los archivos a GitHub

1. En esa misma pantalla, buscá el link **"uploading an existing file"** (suele estar en una línea que dice algo como: *"or push an existing repository... or **upload an existing file**"*). Clickealo.
2. Vas a ver una zona grande que dice **"Drag files here to add them to your repository"**.
3. Abrí la carpeta `mi-presupuesto` en tu computadora.
4. Seleccioná **TODO el contenido de adentro de la carpeta** (los archivos `package.json`, `index.html`, `vite.config.js`, la carpeta `src`, la carpeta `public`, el archivo `.gitignore`, etc.) — pero NO arrastres la carpeta `mi-presupuesto` en sí, sino su contenido.
   - En Windows: abrí la carpeta, apretá `Ctrl + A` para seleccionar todo, después arrastrá al navegador.
   - En Mac: abrí la carpeta, apretá `Cmd + A`, después arrastrá al navegador.
5. **De nuevo: si ves una carpeta llamada `node_modules`, NO la subas.** Si aparece en la lista, sacala.
6. Esperá a que termine de subir todo (puede tardar 1-2 minutos).
7. Bajá hasta el fondo de la página, donde dice **"Commit changes"**. Clickealo.

Listo, tu código ya está en GitHub.

---

## Paso 4 · Crear cuenta en Vercel

Vercel es lo que va a convertir tu código en una página web real con su link.

1. Entrá a **https://vercel.com/signup**
2. Clickeá **"Continue with GitHub"** (el botón con el logo del gatito de GitHub).
3. Vercel te va a pedir permiso para leer tu cuenta de GitHub. Clickeá **"Authorize Vercel"**.
4. Te va a hacer un par de preguntas tipo "¿para qué la vas a usar?" — respondé "Personal" / "Hobby" en lo que te pregunte. Si te pide un nombre de equipo, poné tu nombre.

---

## Paso 5 · Subir tu app a Vercel

1. Ya dentro de Vercel, vas a ver un dashboard. Clickeá **"Add New..."** arriba a la derecha → **"Project"**.
2. Te va a aparecer una lista de tus repositorios de GitHub. Vas a ver `mi-presupuesto`.
3. Clickeá el botón **"Import"** al lado de `mi-presupuesto`.
4. Te va a mostrar una pantalla de configuración. **No toques nada** — Vercel ya detecta que es un proyecto Vite y se configura solo.
5. Clickeá **"Deploy"** abajo.
6. Esperá 1-2 minutos. Vas a ver una pantalla con confetti cuando termine.

---

## Paso 6 · Conseguir tu link

1. Cuando termine, vas a ver una vista previa de tu app y un botón que dice **"Continue to Dashboard"** o **"Visit"**.
2. Arriba vas a ver una URL tipo `mi-presupuesto-xxxxx.vercel.app`. **Ese es tu link**.
3. Copialo y mandáselo a quien quieras. Esa persona entra y ya puede usar la libreta — sus datos quedan guardados en su navegador.

### Si querés un link más lindo

Por defecto el link es algo como `mi-presupuesto-a8b3.vercel.app`. Podés cambiarlo:

1. En el dashboard de Vercel, entrá a tu proyecto.
2. Clickeá la pestaña **"Settings"** arriba.
3. Bajá hasta **"Domains"**.
4. Cambialo por algo más corto si está libre (ej: `libreta-juana.vercel.app`).

---

## Si querés hacerle cambios después

Cualquier cambio que hagas a los archivos en GitHub, Vercel lo actualiza solo en unos segundos. No hace falta tocar Vercel nunca más.

Si querés modificar algo y no sabés cómo, podés volver a hablar conmigo y te explico qué cambiar.

---

## Si algo falla

**El build falla en Vercel**: probablemente subiste la carpeta `node_modules` por error. En GitHub, entrá al repositorio, abrí la carpeta `node_modules` si está, y borrala. Vercel va a reintentar solo.

**No veo mi repositorio en Vercel**: en el dashboard de Vercel, en la pantalla de importar proyecto, clickeá "Adjust GitHub App Permissions" y dale acceso a tus repositorios.

**La app se ve rara o no carga**: probá abrir el link en otro navegador o en modo incógnito. Si sigue, mandame el mensaje de error y te ayudo.

---

¡Listo! Ya tenés tu app en internet, gratis, para siempre. 🎉

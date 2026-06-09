# Mi libreta — App de presupuesto personal

Una libreta web para llevar el día a día de tu plata. Hecha en React.

## ¿Cómo guarda los datos?

Cada persona que abre la app tiene su propia libreta guardada en el almacenamiento de su navegador (localStorage). No hay servidor, no hay base de datos compartida, no hay registro de usuarios. Si compartís el link con otra persona, esa persona va a ver una libreta vacía y la va a llenar con sus propios datos — los tuyos no se cruzan con los suyos.

**Importante**: como los datos viven en el navegador, si la persona borra los datos del navegador o cambia de dispositivo, pierde la información. Para una herramienta gratis y privada, es el balance correcto.

## Para subirla a Vercel

Mirá el archivo `COMO-SUBIR-A-VERCEL.md` — tiene el paso a paso para alguien que no programa.

## Para correrla en tu computadora (opcional, solo si tenés Node.js instalado)

```bash
npm install
npm run dev
```

Y se abre en `http://localhost:5173`.

## Tecnología

- React 19 + Vite
- Recharts (gráficos)
- Lucide (iconos)
- localStorage (persistencia)

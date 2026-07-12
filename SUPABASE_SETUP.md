# Configurar Supabase para ReActiva

1. Crea un proyecto en Supabase (https://app.supabase.com) y consigue:
   - `Project URL` → copia como `VITE_SUPABASE_URL`
   - `Anon public` key → copia como `VITE_SUPABASE_ANON_KEY`

2. Localmente, copia `.env.local.example` a `.env.local` y pega tus valores:

   - En macOS / Linux:

     cp .env.local.example .env.local

   - Luego edita `.env.local` y reemplaza las variables.

3. Ejecutá la app en desarrollo:

   npm install
   npm run dev

4. En producción (Netlify u otro hosting): configurá las variables de entorno con los mismos nombres (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

5. Debug rápido: si faltan las vars, verás en la consola del navegador la advertencia:
   `Supabase no está configurado. Establecé VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar funciones remotas.`

6. Seguridad: nunca pongas claves de servicio o role keys en variables accesibles al frontend.

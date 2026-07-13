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

## Troubleshooting — permisos (permission denied)

Si al probar la app ves errores del tipo `permission denied for table ...` significa que el rol público (`anon`) no tiene permisos para consultar ciertas tablas o ejecutar funciones. Para corregirlo, abrí el **SQL Editor** de tu proyecto Supabase y ejecutá las siguientes sentencias (ajustá nombres si tu esquema difiere):

```sql
-- Permitir SELECT en tablas usadas por la app
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Permitir ejecutar todas las funciones públicas (RPCs)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Opcional: dar permisos sobre secuencias si las consultas las requieren
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

Notas:
- Si usás Row Level Security (RLS), además debés crear políticas (`Policies`) que permitan el acceso a `anon` según corresponda.
- Es más seguro otorgar permisos de forma concreta (por tabla/función) en vez de conceder todo el schema, pero las reglas anteriores ayudan a poner la demo en marcha rápidamente.

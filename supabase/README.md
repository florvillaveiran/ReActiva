# Supabase

## Integracion completa de la plataforma

La migracion `migrations/20260713170000_platform_content_integration.sql` conecta con Supabase:

- ReActiva Tips y Academia ReActiva.
- Categorias editables y eliminables.
- Publicacion y vista previa de videos.
- Biblioteca multimedia y bucket `reactiva-media`.
- Programacion y desbloqueo de microentrenamientos.
- Progreso de videos por usuario.
- Actualizaciones en tiempo real entre los paneles de administracion y usuario.

La migracion es idempotente y no elimina empresas, perfiles, pausas ni contenidos existentes. Tambien instala la funcion segura para eliminar empleados. Para instalarla sin Supabase CLI, copia su contenido completo en **Supabase → SQL Editor** y ejecutalo una vez con un usuario propietario del proyecto.

El frontend usa Supabase como fuente principal cuando las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estan configuradas. El almacenamiento local queda como cache y como respaldo exclusivo del modo local sin Supabase.

Para habilitar la eliminación de usuarios desde el panel de administrador, ejecutá una vez el contenido de `delete-platform-user.sql` en **Supabase → SQL Editor**. El mismo cambio también está versionado como migración en `migrations/20260713143000_delete_platform_user.sql`.

La función valida que quien hace la solicitud tenga rol `admin`, elimina el perfil, sus respuestas de onboarding y la cuenta de autenticación. También elimina invitaciones que todavía no fueron activadas.

Al finalizar, el script solicita a PostgREST que recargue la caché del esquema. Esto evita el error `Could not find the function ... in the schema cache` al intentar borrar un empleado inmediatamente después de instalar la función.

-- Corrige la ambiguedad de PostgREST al guardar contenido.
-- La base tenia dos overloads de save_content_item: uno con item_kind text y
-- otro con el enum public.content_kind. La aplicacion envia JSON y PostgREST no
-- puede decidir cual ejecutar, por eso el guardado quedaba detenido.

do $$
declare
  legacy_function record;
begin
  for legacy_function in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'save_content_item'
      and coalesce(p.proargtypes[1], 0::oid) <> 'text'::regtype
  loop
    execute format('drop function if exists %s', legacy_function.signature);
  end loop;
end $$;

-- La tabla puede provenir de una version anterior donde kind era un enum.
-- La RPC vigente recibe item_kind como text, por lo que ambos deben coincidir.
alter table public.content_items
  alter column kind drop default;
alter table public.content_items
  alter column kind type text using kind::text;

notify pgrst, 'reload schema';

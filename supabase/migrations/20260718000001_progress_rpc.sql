-- update progress rpc
create or replace function public.save_video_progress(
  p_content_key text,
  p_last_position_seconds integer,
  p_progress_percent integer,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Inicia sesion para guardar el progreso.';
  end if;
  if nullif(trim(p_content_key), '') is null then
    raise exception 'El contenido no puede estar vacio.';
  end if;

  insert into public.user_content_progress (
    profile_id, 
    content_key, 
    viewed_at, 
    last_position_seconds, 
    progress_percent, 
    status
  )
  values (
    auth.uid(), 
    trim(p_content_key), 
    now(), 
    coalesce(p_last_position_seconds, 0), 
    coalesce(p_progress_percent, 0), 
    coalesce(p_status, 'in_progress')
  )
  on conflict (profile_id, content_key) do update 
  set 
    viewed_at = now(),
    last_position_seconds = excluded.last_position_seconds,
    progress_percent = case
      when excluded.progress_percent > public.user_content_progress.progress_percent then excluded.progress_percent
      else public.user_content_progress.progress_percent
    end,
    status = case 
      when public.user_content_progress.status = 'completed' then 'completed' 
      else excluded.status 
    end;
end;
$$;

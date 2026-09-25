-- Solicitudes de booking que llegan desde el formulario de la web.
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Las solicitudes se ven en Table Editor → booking_requests.

create table if not exists public.booking_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 120),
  contact     text not null check (char_length(contact) between 5 and 160),
  event_type  text check (char_length(event_type) <= 60),
  event_date  date,
  location    text check (char_length(location) <= 160),
  message     text check (char_length(message) <= 2000),
  status      text not null default 'nuevo'
                check (status in ('nuevo', 'contactado', 'cerrado', 'descartado'))
);

comment on table public.booking_requests is 'Solicitudes de booking enviadas desde la web';

alter table public.booking_requests enable row level security;

-- La web (rol anon, con la publishable key) solo puede INSERTAR,
-- y solo en las columnas del formulario. No puede leer ni modificar nada.
revoke all on public.booking_requests from anon, authenticated;
grant insert (name, contact, event_type, event_date, location, message)
  on public.booking_requests to anon;

drop policy if exists "La web puede enviar solicitudes" on public.booking_requests;
create policy "La web puede enviar solicitudes"
  on public.booking_requests
  for insert
  to anon
  with check (status = 'nuevo');

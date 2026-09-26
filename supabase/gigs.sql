-- Próximas fechas que aparecen en la web (sección "Próximas fechas").
--
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Después, para añadir un bolo: Table Editor → gigs → Insert row.
--   date         Fecha del bolo (obligatoria). Si acaba de madrugada, pon el día en que empieza.
--   venue        Sala (obligatoria), p. ej. Classic
--   city         Ciudad, p. ej. Mataró
--   event        Nombre de la fiesta, p. ej. Classic x Jaleo (opcional)
--   tickets_url  Enlace a entradas, empezando por https:// (opcional)
--   published    Desmárcalo para ocultar un bolo sin borrarlo
-- Las fechas pasadas dejan de verse solas en la web.

create table if not exists public.gigs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date        date not null,
  venue       text not null check (char_length(venue) between 1 and 80),
  city        text check (char_length(city) <= 60),
  event       text check (char_length(event) <= 80),
  tickets_url text check (tickets_url is null or tickets_url ~* '^https?://'),
  published   boolean not null default true
);

comment on table public.gigs is 'Próximas fechas que muestra la web';

create index if not exists gigs_date_idx on public.gigs (date);

alter table public.gigs enable row level security;

-- La web (rol anon, con la publishable key) solo puede LEER las fechas publicadas.
-- Tú las creas y editas desde el panel de Supabase, que no pasa por estas reglas.
revoke all on public.gigs from anon, authenticated;
grant select on public.gigs to anon;

drop policy if exists "La web ve las fechas publicadas" on public.gigs;
create policy "La web ve las fechas publicadas"
  on public.gigs
  for select
  to anon
  using (published);

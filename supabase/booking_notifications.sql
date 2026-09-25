-- Aviso por email de cada solicitud de booking nueva.
--
-- Cuando la web guarda una solicitud en booking_requests, Supabase manda un
-- email a djroccolive@gmail.com a través de Resend. Si el email falla, la
-- solicitud se guarda igualmente.
--
-- Antes de ejecutarlo:
--   1. Crea una cuenta gratis en https://resend.com con djroccolive@gmail.com.
--      Sin dominio propio, Resend solo deja enviar al email de la cuenta.
--   2. En Resend → API Keys → Create API Key (permiso "Sending access") y cópiala.
--   3. Pega la clave más abajo, en lugar de PEGA_AQUI_TU_API_KEY_DE_RESEND.
--      Pégala solo en el SQL Editor de Supabase; nunca la subas a GitHub.
--
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede volver a ejecutar sin problema (por ejemplo, para cambiar la clave).

-- 1. Guardar la API key de Resend cifrada en Supabase Vault
do $$
declare
  api_key text := 'PEGA_AQUI_TU_API_KEY_DE_RESEND';
  secret_id uuid;
begin
  if api_key like 'PEGA_AQUI%' then
    raise exception 'Falta pegar la API key de Resend en lugar de PEGA_AQUI_TU_API_KEY_DE_RESEND';
  end if;

  select id into secret_id from vault.secrets where name = 'resend_api_key';
  if secret_id is null then
    perform vault.create_secret(api_key, 'resend_api_key', 'API key de Resend para los avisos de booking');
  else
    perform vault.update_secret(secret_id, api_key);
  end if;
end
$$;

-- 2. Extensión para hacer peticiones HTTP desde la base de datos
create extension if not exists pg_net with schema extensions;

-- 3. Funciones internas. El esquema private no se expone en la API de la web.
create schema if not exists private;

create or replace function private.html_escape(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select replace(replace(replace(replace(coalesce(value, ''),
    '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
$$;

create or replace function private.booking_row(label text, value_html text)
returns text
language sql
immutable
set search_path = ''
as $$
  select '<tr><td style="padding:10px 16px 10px 0;color:#6b6470;font-size:13px;white-space:nowrap;vertical-align:top;">'
    || label
    || '</td><td style="padding:10px 0;font-size:15px;color:#111111;">'
    || coalesce(nullif(value_html, ''), '—')
    || '</td></tr>';
$$;

create or replace function private.notify_booking_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notify_to constant text := 'djroccolive@gmail.com';
  api_key text;
  digits text;
  reply_to text;
  contact_html text;
  subject text;
  html text;
begin
  select decrypted_secret into api_key
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;

  if api_key is null then
    return new;
  end if;

  -- Enlaces para responder directamente, según haya dejado email o teléfono
  contact_html := private.html_escape(new.contact);
  if new.contact ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then
    reply_to := new.contact;
    contact_html := '<a href="mailto:' || private.html_escape(new.contact) || '">' || contact_html || '</a>';
  else
    digits := regexp_replace(regexp_replace(new.contact, '\D', '', 'g'), '^00', '');
    if length(digits) = 9 then
      digits := '34' || digits;  -- número español sin prefijo
    end if;
    if length(digits) between 10 and 15 then
      contact_html := contact_html
        || ' &nbsp;·&nbsp; <a href="tel:+' || digits || '">Llamar</a>'
        || ' &nbsp;·&nbsp; <a href="https://wa.me/' || digits || '">WhatsApp</a>';
    end if;
  end if;

  subject := left(
    'Booking: ' || new.name || coalesce(' · ' || to_char(new.event_date, 'DD/MM/YYYY'), ''),
    150
  );

  html := concat(
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;">',
    '<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c27400;">Web DJ Rocco</p>',
    '<h1 style="margin:0 0 20px;font-size:22px;color:#111111;">Nueva solicitud de booking</h1>',
    '<table style="border-collapse:collapse;width:100%;">',
    private.booking_row('Nombre', '<strong>' || private.html_escape(new.name) || '</strong>'),
    private.booking_row('Contacto', contact_html),
    private.booking_row('Tipo de evento', private.html_escape(new.event_type)),
    private.booking_row('Fecha', to_char(new.event_date, 'DD/MM/YYYY')),
    private.booking_row('Lugar', private.html_escape(new.location)),
    private.booking_row('Mensaje', replace(private.html_escape(new.message), E'\n', '<br>')),
    '</table>',
    '<p style="margin:24px 0 0;font-size:13px;color:#6b6470;">Recibida el ',
    to_char(new.created_at at time zone 'Europe/Madrid', 'DD/MM/YYYY "a las" HH24:MI'),
    '. Todas las solicitudes están en ',
    '<a href="https://supabase.com/dashboard/project/rrnatexjlwsdocmkkqoz/editor">Supabase → booking_requests</a>.</p>',
    '</div>'
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_strip_nulls(jsonb_build_object(
      'from', 'Web DJ Rocco <onboarding@resend.dev>',
      'to', jsonb_build_array(notify_to),
      'reply_to', reply_to,
      'subject', subject,
      'html', html
    ))
  );

  return new;
exception when others then
  -- Un fallo del aviso nunca debe impedir que se guarde la solicitud
  raise warning 'Aviso de booking no enviado: %', sqlerrm;
  return new;
end;
$$;

-- 4. Disparar el aviso con cada solicitud nueva
drop trigger if exists booking_request_email on public.booking_requests;
create trigger booking_request_email
  after insert on public.booking_requests
  for each row execute function private.notify_booking_request();

-- Programa la función «enviar-avisos» cada 15 minutos. Se ejecuta una vez en
-- el SQL Editor, DESPUÉS de desplegar la función y de poner sus secretos.
-- Sustituye <CRON_SECRET> por la misma cadena que pusiste como secreto.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'euskaraz-avisos',
  '*/15 * * * *',
  $$
    select net.http_post(
      url := 'https://jdijrqkzhohpzdwlsyvg.supabase.co/functions/v1/enviar-avisos',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
      body := '{}'::jsonb
    );
  $$
);

-- Para quitarlo: select cron.unschedule('euskaraz-avisos');

-- Recordatorio con Web Push: las dos tablas. Se pega y se ejecuta una vez
-- en el SQL Editor del proyecto de Supabase de euskaraz.
--
-- euskaraz_avisos:       las preferencias de cada persona (días y hora).
-- euskaraz_dispositivos: un navegador/móvil suscrito a los avisos.
--                        Una persona puede tener varios.
-- Las dos llevan la misma regla que euskaraz_progreso: cada cuenta solo ve
-- y toca lo suyo. La función que envía los avisos entra con la clave
-- secreta del proyecto y se salta esa regla.

create table if not exists public.euskaraz_avisos (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activo boolean not null default false,
  dias smallint[] not null default '{0,1,2,3,4,5,6}',  -- 0 = lunes … 6 = domingo, como la fila de la racha
  hora text not null default '20:00' check (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  zona text not null default 'Europe/Madrid',            -- zona horaria de la persona
  ultimo_aviso date,                                     -- para no repetir el aviso el mismo día
  updated_at timestamptz not null default now()
);

create table if not exists public.euskaraz_dispositivos (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  suscripcion jsonb not null,
  creado timestamptz not null default now()
);

alter table public.euskaraz_avisos enable row level security;
alter table public.euskaraz_dispositivos enable row level security;

create policy "solo sus avisos" on public.euskaraz_avisos
  for all to public
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "solo sus dispositivos" on public.euskaraz_dispositivos
  for all to public
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

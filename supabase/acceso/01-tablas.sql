-- Solicitudes de acceso: quien recibe la URL no puede crearse cuenta, solo
-- pedirla. Las dos funciones de esta carpeta son las únicas que tocan la
-- tabla (con la clave de servicio); la app no tiene ningún permiso sobre ella.
create table if not exists public.solicitudes_acceso (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  creada timestamptz not null default now(),
  resuelta timestamptz
);
create index if not exists solicitudes_acceso_email_idx on public.solicitudes_acceso (email, creada desc);
alter table public.solicitudes_acceso enable row level security;
revoke all on public.solicitudes_acceso from anon, authenticated;
-- Sin políticas a propósito: con RLS activo y sin políticas, nadie con las
-- claves públicas puede leer ni escribir.

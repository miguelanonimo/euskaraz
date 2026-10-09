// Crea la cuenta de un invitado, ya confirmada y con la contraseña inicial.
// Uso:  node scripts/invitar.mjs correo@ejemplo.com [otro@correo.com ...]
//
// La clave de administración y la contraseña inicial NO viven en el repo:
// se leen de ~/.config/euskaraz/supabase.env (SUPABASE_SECRET y CLAVE_INICIAL).
// La cuenta se marca con `debe_cambiar_clave`: al entrar por primera vez, la
// app le pide elegir su propia contraseña (ver arrancarApp en js/app.js).
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const URL_BASE = 'https://jdijrqkzhohpzdwlsyvg.supabase.co';
const ENV = path.join(os.homedir(), '.config', 'euskaraz', 'supabase.env');

const env = Object.fromEntries((await readFile(ENV, 'utf8')).split('\n')
  .filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
if (!env.SUPABASE_SECRET || !env.CLAVE_INICIAL) { console.error('Faltan SUPABASE_SECRET o CLAVE_INICIAL en ' + ENV); process.exit(1); }

const correos = process.argv.slice(2).map((c) => c.trim().toLowerCase()).filter(Boolean);
if (!correos.length) { console.error('Uso: node scripts/invitar.mjs correo@ejemplo.com [...]'); process.exit(1); }

for (const email of correos) {
  const r = await fetch(URL_BASE + '/auth/v1/admin/users', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.SUPABASE_SECRET, apikey: env.SUPABASE_SECRET, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: env.CLAVE_INICIAL, email_confirm: true, user_metadata: { debe_cambiar_clave: true } }),
  });
  const d = await r.json().catch(() => ({}));
  if (r.ok) console.log('OK        ' + email);
  else if (/already|registered|exists/i.test(JSON.stringify(d))) console.log('YA EXISTE ' + email);
  else console.log('FALLO     ' + email + ' → ' + (d.msg || d.message || r.status));
}

# Euskaraz (adaptación personal)

App personal para aprender euskera batua (registro bizkaino/bilbaíno
incluido activamente), partiendo del código de un amigo (vanilla JS, sin
build, sin dependencias). Contexto completo y roadmap por fases en
`docs/brief.md` — léelo antes de la primera tarea de cada fase nueva, no
hace falta releerlo entero en cada sesión si ya estás dentro de una fase en
curso.

## Decisiones ya cerradas (no las vuelvas a plantear)

- **Motor:** vanilla JS/HTML/CSS del original, sin migrar a React. El
  algoritmo de repetición espaciada en `js/app.js` ya funciona — no
  reescribirlo, solo portar su persistencia.
- **Persistencia:** Supabase. Mismo shape de datos que ya usa
  `localStorage` (`cargarProgreso`/`guardarProgreso`/`anotar` en
  `js/app.js`), guardado como una columna JSONB. `user_id` desde el
  principio aunque hoy solo haya un usuario.
- **Auth:** Supabase Auth con email + contraseña (usuario propio, "recordar
  sesión" con `persistSession` por defecto del SDK). Cambiado desde magic
  link el 20/08/2026 a petición de Miguel — la sesión persiste sola en el
  mismo dominio, pero un correo nuevo cada vez resultaba incómodo, sobre
  todo al probar en dominios de preview de Vercel. Pantalla de cuenta
  (`screenCuenta`) para poner/cambiar contraseña y cerrar sesión.
- **Audio:** Google Cloud TTS (`eu-ES`), generado una sola vez por
  palabra/frase en tiempo de autoría, cacheado como mp3 en Supabase
  Storage. Nunca generar en vivo en cada reproducción.
- **Contenido:** mismo esqueleto de 12 unidades del original
  (`data/unidades/*.json`). Registro batua + vocabulario bizkaino/bilbaíno
  incluido explícitamente (ver esquema de `variantes` en `docs/brief.md`
  sección 5.1) — NO eliminar formas bizkainas, son el objetivo, no un
  sesgo a corregir.

## Fase actual

**Fase 3 — Contenido, en curso (piloto Unidad 1 hecho).**

- **Fase 1 (fontanería): cerrada y validada.** Progreso en Supabase
  (`euskaraz_progreso`, proyecto Ippo compartido), login con magic link,
  sincroniza entre dispositivos.
- **Fase 2 (audio): cerrada.** Pipeline de Cloud TTS en
  `scripts/generar-audio/` (ADC, sin claves que gestionar). Las 12
  unidades tienen mp3 generado y subido a `euskaraz-audio` en Supabase
  Storage; botón de altavoz en Vocabulario y Diccionario.
- **Fase 3 (contenido): piloto de la Unidad 1 hecho**, ver
  `docs/notas-contenido-u1.md` para el detalle de qué se cambió y por
  qué. Esquema `registro`/`variantes` aplicado a las dos parejas
  batua/bizkaiera verificadas (kaixo↔aupa, zer moduz↔zelan zagoz).
  Pendiente: que Miguel valide el piloto antes de replicar la
  metodología a las 11 unidades restantes.

## Al terminar cada fase

Actualiza este archivo (sección "Fase actual") y anota en `docs/brief.md`
cualquier decisión nueva tomada durante la sesión, para que la próxima
sesión no tenga que reconstruir el contexto.

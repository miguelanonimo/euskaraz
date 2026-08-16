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
- **Auth:** Supabase Auth con magic link, sin contraseña.
- **Audio:** Google Cloud TTS (`eu-ES`), generado una sola vez por
  palabra/frase en tiempo de autoría, cacheado como mp3 en Supabase
  Storage. Nunca generar en vivo en cada reproducción.
- **Contenido:** mismo esqueleto de 12 unidades del original
  (`data/unidades/*.json`). Registro batua + vocabulario bizkaino/bilbaíno
  incluido explícitamente (ver esquema de `variantes` en `docs/brief.md`
  sección 5.1) — NO eliminar formas bizkainas, son el objetivo, no un
  sesgo a corregir.

## Fase actual

**Fase 1 — Fontanería, sin tocar contenido.** Portar
`cargarProgreso`/`guardarProgreso` a Supabase manteniendo exactamente el
mismo objeto de datos. Validar con el contenido original tal cual (sin
reescribir todavía) que sincroniza entre dispositivos. No avanzar a Fase 2
(audio) ni Fase 3 (contenido) hasta que esto esté validado.

## Al terminar cada fase

Actualiza este archivo (sección "Fase actual") y anota en `docs/brief.md`
cualquier decisión nueva tomada durante la sesión, para que la próxima
sesión no tenga que reconstruir el contexto.

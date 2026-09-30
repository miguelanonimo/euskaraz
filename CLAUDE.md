# Euskaraz (adaptación personal)

App personal para aprender euskera batua (registro bizkaino/bilbaíno
incluido activamente), partiendo del código de un amigo (vanilla JS, sin
build, sin dependencias). Contexto completo y roadmap por fases en
`docs/brief.md` — léelo antes de la primera tarea de cada fase nueva, no
hace falta releerlo entero en cada sesión si ya estás dentro de una fase en
curso.

## Decisiones ya cerradas (no las vuelvas a plantear)

- **El orden del vocabulario no se vigila; el de la gramática sí.** Medido el
  30/09/2026: un barrido que exige que ninguna palabra aparezca antes del tema
  que la cataloga da 148 casos, y prácticamente todos son buen diseño. El 2.2
  enseña los posesivos con «nire etxe handia», y `etxea` está catalogado en el
  5.2 porque la unidad 5 es la casa — pero es imposible enseñar posesivos sin
  nombres, y el enunciado español ya los traduce. La unidad 3 enseña las
  palabras de pregunta con «Nola duzu izena?» y «Nora zoaz?», donde el verbo es
  andamio. `verificar.py` ya los saca como avisos (hay 334) y se convive con
  ellos a propósito. **No los "arregles" moviendo grupos: estropearías un curso
  bien hecho para contentar a un script.** Lo que sí es un fallo de verdad es
  una **construcción gramatical** prematura —una conjugación que no se puede
  deducir y que es justo la lección—, y de eso se encarga
  `scripts/probar_adelantos.js`. Si mueves temas de sitio, repasa sus `desde`:
  al partir la unidad 10 en tres se quedaron viejos dos y el test se volvió más
  permisivo sin que nadie se enterara.

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
- **Contenido:** reestructurado el 26/08/2026 a **10 unidades con
  subniveles** (`data/curso-v2.json` → `data/unidades-v2/*.json`),
  trabajo de Ric documentado en `docs/propuesta-10-unidades.md` — es
  el curso en producción, ya no una prueba con `?v2`. El antiguo
  esqueleto de 12 unidades (`data/curso.json` → `data/unidades/*.json`)
  se deja en el repo sin usar por si hiciera falta volver atrás; no
  editarlo pensando que afecta a la app. Registro batua + vocabulario
  bizkaino/bilbaíno incluido explícitamente (ver esquema de
  `variantes`) — NO eliminar formas bizkainas, son el objetivo, no un
  sesgo a corregir. La variante gernikés (`data/unidades-gernikes/`) se
  borró el 26/08/2026, decisión de Ric — recuperable en el historial
  de git si hiciera falta.
- **Verificación de contenido:** `verificar.py` en la raíz (recuperado
  del proyecto original de Ric) — `python3 verificar.py` valida el
  curso en producción, `python3 verificar.py v2` es un alias del
  mismo. `scripts/probar-todo.sh` corre eso más la sintaxis de
  `js/app.js` y los tests de `scripts/probar_*.js` de una vez.
- **Publicación automática de la rama de Ric (30/08/2026):** cuando Ric
  empuja `ric/trabajo` a `ric/publicar` (`git push origin
  ric/trabajo:ric/publicar --force`), el GitHub Action
  `.github/workflows/publicar-ric.yml` fusiona sola esa rama en `main`,
  corre `scripts/probar-todo.sh` y solo si pasa empuja a `main` — Vercel
  despliega desde ahí. Si hay conflicto o algún test falla, el Action se
  para y `main` no se toca. `ric/trabajo` sigue sin disparar nada (es su
  cuaderno de trabajo); solo `ric/publicar` fusiona. Detalle para Ric en
  `docs/ideas-ric.md`. Esto no sustituye una fusión a mano cuando el
  cambio es estructural o grande (como la reestructuración a v2) — para
  eso sigue haciendo falta una sesión que lo revise, tal como hasta
  ahora.

## Fase actual

**Fase 3 — Contenido, cerrada la reestructuración a 10 unidades.**

- **Fase 1 (fontanería): cerrada y validada.** Progreso en Supabase
  (`euskaraz_progreso`, proyecto Ippo compartido), login con email +
  contraseña, sincroniza entre dispositivos.
- **Fase 2 (audio): cerrada para el curso de 12 unidades.** Pipeline de
  Cloud TTS en `scripts/generar-audio/` (ADC, sin claves que
  gestionar). **Pendiente para el curso nuevo de 10 unidades**: las
  sub-unidades y el vocabulario añadido en la reestructuración se
  escribieron sin audio a propósito (la app no pinta el botón si
  falta) — lista consolidada en `docs/audios-pendientes.md`, con el
  lote ejecutable `scripts/generar-audio/lote-ric-3.mjs` listo para
  correr cuando se decida generarlos.
- **Fase 3 (contenido): reestructuración a 10 unidades con subniveles
  fusionada a `main` el 26/08/2026** (desde `ric/trabajo`, con Claude
  Fable) — ver `docs/propuesta-10-unidades.md` y `docs/ideas-ric.md`
  para el detalle de qué cambió y por qué. Pendiente de diseño: la app
  se está replanteando como PWA de 4 pestañas (Hoy/Lecciones/
  Diccionario/Ajustes) en `docs/propuesta-4-paginas.md`, en manos de
  Claude Design — no tocar la estructura de navegación hasta que vuelva
  esa propuesta.

## Al terminar cada fase

Actualiza este archivo (sección "Fase actual") y anota en `docs/brief.md`
cualquier decisión nueva tomada durante la sesión, para que la próxima
sesión no tenga que reconstruir el contexto.

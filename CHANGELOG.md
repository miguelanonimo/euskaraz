# Euskaraz · Registro de cambios mayores

Solo cambios de fondo (fases, funciones nuevas, fusiones de contenido).
Los ajustes menores de estilo/espaciado no se listan aquí — están en el
historial de git si hace falta el detalle.

---

## 2026-08-16 — Arranque del proyecto

Motor heredado del código original (vanilla JS/HTML/CSS, sin build).
Tipografía compartida con Ippo (Lastik en títulos, PP Neue Montreal en
el resto). Repo privado en GitHub, proyecto en Vercel con auto-deploy
por push a `main`.

## 2026-08-17 — Fase 1: progreso en Supabase

`cargarProgreso`/`guardarProgreso` migrados de `localStorage` a una
tabla (`euskaraz_progreso`) en el proyecto Supabase compartido con
Ippo, aislada por RLS (`auth.uid() = user_id`). Login con magic link,
sin contraseña. El progreso ya sincroniza entre dispositivos y entre
usuarios distintos que compartan el link de la app.

## 2026-08-17 — Fase 2: audio de pronunciación

Pipeline de autoría (`scripts/generar-audio/`) con Google Cloud
Text-to-Speech, voz `eu-ES`. Las 12 unidades quedan con mp3 de
vocabulario, variantes dialectales y frases de ejemplo de gramática,
subidos a un bucket público de Supabase Storage. Más tarde el mismo
día se cambió la voz al modelo `gemini-2.5-flash-tts` ("Kore", ritmo
natural) y se regeneraron los 556 mp3.

## 2026-08-17 — Fase 3: revisión de contenido y reorientación dialectal

Las 12 unidades revisadas con fuentes externas (Euskaltzaindia,
diccionarios, foros especializados) en vez de darlas por buenas. La
sección de dialecto de cada unidad pasa de "Cómo suena esto en
Gernika" a "Cómo suena esto en Bizkaia", con Bilbao como referencia en
vez de Busturialdea — corregidas dos afirmaciones dialectales que no
estaban verificadas para Bilbao (Unidades 4 y 6). Esquema
`registro`/`variantes` (batua/bizkaiera) aplicado donde hay parejas de
vocabulario reales y confirmadas (kaixo/aupa, zer moduz/zelan zagoz).

## 2026-08-18 — Fusión con el proyecto de Ric + toggle Bizkaiera/Gernikés

Revisado `ric/euskaraz/CAMBIOS-2026-08-15_18.md`, el registro de
cambios del compañero que hizo la base de esta app. Comparación campo
a campo de las 12 unidades: sus 9 correcciones lingüísticas (horas con
`eta erdiak`, `noren`/`zeren`, `edonor` es batua no bizkaiera,
`anaia`/`neba` según quien *tiene* el hermano, etc.) ya estaban
presentes en nuestro contenido — no hizo falta portar nada de eso.

Añadido un botón en la cabecera ("Bizkaiera / Gernikés", por defecto
Bizkaiera) que cambia entre dos datasets completos e independientes:
el nuestro (revisado, Bilbao, con audio) y el original de Ric
(`data/unidades-gernikes/`, Busturialdea/Gernika, sin audio todavía).
El progreso no se toca al cambiar — los `id` de unidad son los mismos
en los dos datasets. La preferencia se guarda en `localStorage` (es
ajuste de aparato, no de cuenta).

Incorporado también el color verde de acierto (`--bien` #0caa39 /
`--bien-txt` #09852d) que traía el proyecto de Ric, para dejar de usar
el mismo rojo para acierto y para fallo.

## Pendiente de esta misma fusión

- Motor de repaso de vocabulario nuevo de Ric (cola que no se vacía
  hasta acertar dos veces, 3 formatos — opción/ortografía/teclear—,
  erratas generadas por reglas fonéticas, diff letra a letra al
  fallar). Es la pieza más grande, sin portar todavía.
- Diccionario: filtro por letra y por tipo de palabra (verbo/
  sustantivo/adjetivo). Ninguno de los dos datasets tiene categoría
  gramatical por palabra — hay que clasificar las ~360 entradas.

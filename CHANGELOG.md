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

## 2026-08-18 — Motor de repaso de vocabulario nuevo (de Ric)

Portado el motor completo de la tercera tarjeta de la portada. Antes
eran veinte preguntas de opción múltiple, una pasada, una oportunidad
por palabra; ahora son catorce palabras en una cola que no se vacía
hasta que cada una se acierta dos veces (la segunda, a distancia —seis
u ocho ejercicios después—, porque acertar treinta segundos después de
ver la solución no prueba nada). Un fallo la devuelve dos o tres
ejercicios más tarde, en un formato más fácil; hay un tope de piedad
de seis fallos.

Tres formatos desde el primer día — opción múltiple, ortografía (la
misma palabra escrita de tres maneras, una buena) y teclear (escribirla
en euskera) —, con el calendario de repaso espaciado inclinando la
balanza hacia el formato más exigente según lo asentada que esté cada
palabra, no eligiéndolo de forma rígida.

Las erratas de ortografía se generan con reglas de los tropiezos reales
de quien escribe euskera desde el castellano (la hache muda, tx/tz/ts,
z/s/x, sonoras/sordas entre vocales, interferencias del castellano...),
cambiando una sola letra por vez, y siempre contrastadas contra el
diccionario completo para no ofrecer nunca una palabra real como
errata. Verificado con una prueba aislada de 200 tiradas: 0 coincidencias
con palabras reales, 0 erratas iguales a la original.

Al fallar, ya no se ve solo la solución: se alinean la respuesta dada y
la correcta y se marca letra a letra (o palabra a palabra en frases)
qué sobra y qué falta — mismo mecanismo aplicado también a los
ejercicios de "traducir" de las unidades, no solo al repaso de
vocabulario.

El marcador de resultado cambia de sentido en el repaso de vocabulario:
ya no cuenta aciertos/fallos brutos (todas las palabras acaban puestas,
así que ese número no diría nada), sino cuántas salieron a la primera,
cuántas necesitaron vuelta, y el total de respuestas dadas.

**Alcance:** el motor se aplica al fondo de vocabulario ya existente
(`fondoVocabulario`, solo palabras de nivel superior). Las variantes
bizkainas (aupa, zelan zagoz...) no entran todavía en este repaso —
sigue siendo un hueco conocido, ya anotado antes de esta fusión.

## 2026-08-18 — Diccionario: filtro por letra y por tipo de palabra

Clasificadas a mano (con heurísticas por prefijo de la glosa castellana
— "el/la…" → sustantivo, "(yo)/(tú)…" → verbo conjugado, listas
cerradas de excepciones para posesivos de parentesco y sufijos
gramaticales) las 345 palabras únicas del vocabulario en `verbo` /
`sustantivo` / `adjetivo` / `otros`. Campo `categoria` añadido a las
729 entradas de vocabulario (palabra + variantes) de los dos datasets,
`data/unidades/*.json` y `data/unidades-gernikes/*.json`, casando por
la forma en euskera normalizada — sin ninguna sin clasificar.

En el diccionario, debajo del buscador: fila de letras, que ahora ocupa
las líneas que haga falta en vez de recortarse (solo se activan las que
tienen alguna palabra con el filtro de tipo ya aplicado), y un
desplegable de tipo de palabra en su propia línea, con "Todos" como
opción por defecto — cambiar el desplegable basta para volver a ver
todo, sin necesitar un botón de borrar aparte. Los dos filtros se
combinan entre sí y con el texto de búsqueda. Contador de resultados
oculto, no aportaba nada.

Fusionado a `main` y desplegado a producción.

## 2026-08-18 — Audio del gernikés, reutilizando los mp3 del bizkaiera

Las 364 entradas de vocabulario del dataset de Ric (`data/unidades-gernikes/`)
seguían sin audio propio desde la fusión. Comprobado que las 364
comparten exactamente la misma forma en euskera con una palabra ya
narrada del dataset bizkaiera (ninguna necesitaba locución nueva), así
que se les asignó la misma ruta de mp3 ya subida a `euskaraz-audio` en
vez de generar audio nuevo con Cloud TTS.

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

## 2026-08-18 — Kaixo/aupa en gernikés, con el mismo esquema batua/variante

El dataset de Ric tenía «kaixo» y «aupa» como dos entradas de
vocabulario sueltas, así que en el diccionario se veían como dos
palabras normales, sin la indentación ni la etiqueta BATUA/BIZKAIERA
que sí tiene el par en bizkaiera. Anidado «aupa» como `variantes` de
«kaixo» también en `unidades-gernikes/01-agurrak.json`, igual que en
bizkaiera. Comprobados los dos datasets enteros por si había más
desdoblamientos batua/bizkaiera sin anidar: solo aparece uno más,
«zer moduz?»/«zelan zagoz?», que en gernikés no tenía ni entrada de
vocabulario propia (solo se mencionaba dentro de una nota) — añadida
como variante de «zer moduz?» ahí también, con su mismo audio. Con
esto los dos pares (kaixo/aupa, zer moduz/zelan zagoz) quedan
representados igual en los dos modos de diccionario.

## 2026-08-18 — Audio al acertar en los ejercicios de opción

Al elegir la opción correcta en un ejercicio de tipo «opción» (incluido
«¿cuál está bien escrita?» del repaso de vocabulario), suena la
pronunciación de la palabra en el momento de tocarla, no hace falta
esperar a comprobar. Busca el audio por el texto exacto de la opción
contra todo el vocabulario del curso (`audioDePalabra`), así que
funciona igual para las frases de los ejercicios de unidad que para las
palabras del repaso — si el texto no tiene audio narrado (por ejemplo,
una opción en castellano), simplemente no suena nada.

Extendido también a «toca las parejas»: al tocar una palabra de la
columna en euskera suena su pronunciación, antes incluso de saber si
el emparejamiento saldrá bien — aquí no hay «opción incorrecta» posible
en ese primer toque, así que suena siempre que la palabra tenga audio.

## 2026-08-18 — Fonemas que faltaban en el bloque de pronunciación (U1)

El bloque «Pronunciación: lo que necesitas hoy» cubría z, s, x, tx, ts/tz,
j, h y ñ/ll, pero se dejaba la «g»: en castellano «ge/gi» suena a jota y
hace falta «gue/gui» con u muda para el sonido fuerte; en euskera «ge/gi»
suena siempre fuerte, sin esa complicación. Añadida esa línea al bloque,
más un párrafo sobre las letras que no son propias del alfabeto vasco
(c, qu, v, w, y — no hay distinción b/v, el sonido /k/ siempre es «k») y
la ausencia de tildes escritas. Nuevo ejemplo «gela» (reutilizando el
audio ya subido de la Unidad 6) y una pregunta más en el quiz de refuerzo
de la unidad. Aplicado igual en los dos datasets, bizkaiera y gernikés.

## 2026-08-18 — Tipografía en la pantalla de resultado

Los números grandes del marcador final del repaso (`.scorebox__num`) se
quedaban con la tipografía de texto en vez de Lastik, por una regla CSS
a la que le faltaba el `font-family` que sí tienen el resto de números
grandes de la app (`.stat__num`). Añadido.

## 2026-08-18 — Regenerados 4 audios de la Unidad 1

Revisión de oído sobre el audio ya subido detectó varios fallos de la
síntesis (`gemini-2.5-flash-tts`, voz Kore):

- **jaso** — la «j» sonaba a jota castellana en vez de «y», contradiciendo
  la regla de pronunciación que la propia app enseña. Arreglado enviando
  el texto respelado («yaso») al sintetizador en vez del texto original.
- **zelan zagoz?** — la «g» de «zagoz» sonaba gutural, casi como jota, en
  vez de una g suave. Regenerado con instrucción explícita de
  pronunciación en el prompt.
- **oso ondo** — sonaba «ontro» (r espuria entre n y d). Dos intentos:
  el primero corrigió la r pero se comía la palabra «oso» por completo;
  el segundo (definitivo) pide expresamente las dos palabras completas,
  sin pausa larga entre ellas.
- **barkatu** — sonaba «barkastu» (s espuria antes de la t). Regenerado
  con instrucción explícita de no insertar esa s.

De paso, confirmado con `ffprobe`/`silencedetect` que todos los mp3
generados llevan ~300ms de silencio real al principio del archivo (no es
delay de red ni de llamada): los 4 regenerados se subieron ya recortados
(`ffmpeg -af silenceremove`). El resto de la librería (~550 mp3) sigue
con ese silencio de fábrica — recortarla entera queda pendiente, es un
cambio mecánico (descargar, recortar, resubir) que no necesita TTS nuevo.

Cada candidata se subió primero a una ruta `test/` temporal (bucket
abierto a escritura con una política RLS creada y borrada al momento
para cada tanda) para escuchar antes de publicar — los 4 aprobados
sustituyeron el mp3 real en su misma ruta (`unidades/u1/*.mp3`), sin
tocar los JSON de contenido.

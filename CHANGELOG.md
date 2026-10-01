# Euskaraz · Registro de cambios mayores

Solo cambios de fondo (fases, funciones nuevas, fusiones de contenido).
Los ajustes menores de estilo/espaciado no se listan aquí — están en el
historial de git si hace falta el detalle.

---

## 2026-10-01 — Fuera «senidea»

Ric, con hablantes nativos delante (su pareja y gente de allí): «eso se usa más
para pariente, y no es común su uso, tal vez hace que sea más confuso».

Coincide con la duda que ya quedó anotada al meterlo: el diccionario de
Euskaltzaindia recoge la acepción «pariente» sin marcarla como dialectal, pero
el de Elhuyar sí la marca. Entre una fuente que duda y el uso real que reportan
los nativos, gana el uso real.

Quitado de los tres sitios: el bloque de la ficha 4.6 «Hermano y hermana
dependen de quién los tiene» con su ejemplo (*Hiru senide gara*), la entrada de
vocabulario (530 → 529 palabras) y tres variantes de `u4-g49`, que ahora
practican el sistema que el tema sí enseña: «Una chica habla de su hermano»
→ `neba`, «Mikelek arreba bat du» y, en el emparejar, `ahizpa` en su lugar.

No deja hueco: la ficha de al lado ya enseña **`anai-arrebak`** —los hermanos,
los dos sexos juntos—, que es la forma corriente de decir lo que `senidea`
intentaba cubrir (*Hiru anai-arreba gara*). Y no deja audio huérfano en el
bucket: la palabra nunca llegó a tener.

---

## 2026-10-01 — Tipografía de los ejercicios, más legible

Ric: «sin gafas me cuesta leer las palabras de los ejercicios. ¿Esa tipo tiene
el kerning cerrado?». Sí, y además había algo peor que el kerning.

Medido, no opinado:

- Los botones de opción (`.opt`) no declaran tipografía: heredan PP Neue
  Montreal 400 a 20px y, sobre todo, el `letter-spacing: -0.011em` del `body`
  — que `button{ letter-spacing: inherit }` se encarga de propagar. El
  enunciado iba a -0.035em, y las fichas de «Ordena las palabras» (`.chip`) a
  **-0.018em y solo 17px**, el texto más cerrado de todo el ejercicio.
- El gris `--tinta-45` (#8e8b84 sobre #f2f0ec) daba **2,99:1**, por debajo del
  4,5:1 de la WCAG AA. Lo usan la instrucción (11px y en mayúsculas), la pista
  y las letras A/B/C/D. El texto principal, en cambio, está en 16:1.

Aplicado: `--tinta-45` a **#706d67** (mismo matiz, **4,53:1**) y
`letter-spacing: 0` en `.opt`, `.chip`, `.pair` y `.slot`, con el enunciado de
-0.035em a -0.015em. Comprobado antes de oscurecer que ninguno de los 42 usos
del gris cae sobre fondo oscuro.

Dos cosas vistas y **no** tocadas, a decisión de Ric: `-webkit-font-smoothing:
antialiased` en el `body`, que adelgaza los trazos en Mac, y la instrucción a
11px en mayúsculas, que es el texto menos legible de la pantalla. Y un cabo
suelto inofensivo: la hoja pide `font-feature-settings: ... "cv05" 1`, pero
PP Neue Montreal solo declara `ss01` y `ss02` (comprobado en el binario), así
que ese trozo no hace nada.

Miguel está rehaciendo la interfaz: esto hay que trasladarlo o se pierde.

---

## 2026-10-01 — El 12.3 deja de aprobarse con una sola pregunta

Ric: «Ese tema lo he superado con un solo ejercicio. Y esto no puede ser,
cada test de final de tema debe tener al menos 3 ejercicios para pasarlo».

La sesión de un tema son exactamente sus grupos, una variante de cada uno
(`delSubnivel(u.ejercicios, sub)` + `elegirVariante`), y se supera con
`ratio >= 0.7`. Con un grupo, acertar una pregunta daba el tema por hecho.
Medido en todo el curso: el 12.3 era **el único** tema por debajo de 3.

- La ficha del 12.3 se cortaba en seco: presentaba `denak` y `bakarrik` sin
  una sola frase de ejemplo. Ampliada con el uso de las dos, verificado en
  Elhuyar: `bakarrik` va **detrás** del elemento al que afecta, igual que
  `ere` (*hauxe bakarrik esan nahi dizut*), y sin nada delante pasa a ser «a
  solas» (*bakarrik gelditu da etxean*). Y `denak` es absolutivo plural, pero
  con un verbo que lleva objeto el sujeto va en ergativo, **`denek`**
  (*denek ez dute bat egiten*) — la -k que el curso enseña en el 4.4. Esa
  trampa va también en la nota de la palabra, que es donde se repasa.
- Dos grupos nuevos que usan ya lo anterior: `u12-g14` (elegir entre denak /
  denek / bakarrik / ezer) y `u12-g15` (ordenar, con `denek` de distractor
  frente a `denak`).

Con exactamente 3 grupos hay que acertar 3 de 3, porque 2/3 = 66,7% y el
umbral es 0,7. Son 7 temas (10.2, 10.3, 11.2, 11.4, 12.1, 12.2, 12.3) y son los
únicos del curso que no perdonan ningún fallo. **Ric lo deja así a propósito**
(01/10/2026): son también los temas de menos materia.

---

## 2026-09-30 — Los ejercicios se colocan en el tema que de verdad les toca

Ric, usando la app: en el 10.1 («el pasado de izan») le salió *Ordena las
palabras — La semana pasada estaba en casa* → «Joan den astean etxean
nengoen», que necesita **egon** (10.3) y un marcador de 10.5.

Causa: al partir la unidad 10 en tres (26/09) se repartieron con cuidado las
**fichas**, pero los **ejercicios** se quedaron donde cayeron. Estaban
escritos para una unidad donde los tres auxiliares se enseñaban de golpe, así
que de los 5 grupos del 10.1 solo 1 pertenecía al 10.1.

Mover un grupo de tema no cambia su firma, así que no le borra marcas a Ric;
reescribir una frase sí. De ahí que casi todo se arregle moviendo:

- `u11-g50` → 10.4 (es su ficha: gogoratu / ahaztu / berriro)
- `u11-g12` → 10.5 (marcador de tiempo + forma verbal: es «Cuándo pasó»)
- `u11-g03`, `u11-g05` → test de unidad (mezclan los tres auxiliares)
- `u12-g03` → unidad 12, test (emparejaba conectores e indefinidos, que son
  vocabulario de la 12, estando en la 11)
- Los adverbios de una palabra (`lehen`, `orduan`, `herenegun`, `iaz`,
  `txikitan`, `aspaldi`, `jaio`) pasan al 10.1: la unidad se llama «Atzo» y
  tenerlos todos en el 10.5 dejaba a los cuatro primeros temas sin más
  marcador que «atzo». Las construcciones de varias palabras (`joan den
  astean`, `duela bi urte`, `garai hartan`) se quedan en el 10.5, que es la
  ficha que las sistematiza.
- `altua`, `azkar`, `poliki` pasan al 11.3, que es donde se usan; `zaila`,
  `erraza` y `garrantzitsua` se quedan en el 11.4, que sí los explica.

Reescrito solo lo imprescindible (2 variantes, las únicas que pierden marca):

- `u11-g08` v5: «hace dos años» → «el año pasado» (`duela bi urte` es del 10.5).
- `u12-g07` v3: **era incorrecto**, no solo prematuro. El hueco estaba en
  «Euskara zaila da, baina ____ da polita», y su propia explicación dice que
  «ere» va *detrás* del elemento. Ahora: «Bilbo handia da, baina Gernika ____
  polita da», con el patrón `X ere` que el curso ya usa en «Ni ere ikaslea naiz».

El 10.1 se quedaba con un solo grupo, así que tres nuevos de `izan` puro,
con vocabulario de las unidades 1-9: `u10-g44` (ordenar), `u10-g45`
(traducir), `u10-g46` (elegir la forma, usando los marcadores adelantados).

**`probar_adelantos.js` también se había roto en silencio con la partición**,
y era lo que debía haber cazado esto:

- la regla «pasado» era una sola, *desde 10.1*, así que `nuen` y `nengoen` en
  el 10.1 le parecían bien. Partida en tres, una por auxiliar y por tema.
- `partícula «al»` decía *desde 10.5* y `al` se enseña ahora en el 12.1;
  `comparativo` decía *desde 10.4* y son el 11.3. Las dos dejaban pasar cosas.
  Si se vuelven a mover temas, hay que repasarlas.
- `textos()` miraba también las opciones falsas y los distractores, y se
  quejaba de ejercicios bien hechos: el 10.1 ofrece «naiz / nintzen / nengoen
  / nuen» a propósito. Ahora solo mira la opción correcta.

Comprobado reintroduciendo la frase de Ric: el test falla; con el arreglo, pasa.

**Queda sin tocar**: el mismo barrido encuentra 207 casos más en las unidades
8 y 9 (grupos de emparejar colocados antes de que se enseñen sus palabras).
Son anteriores a la partición y no se han tocado — decisión de Ric y Miguel.

---

## 2026-09-28 — Aplicadas las correcciones de audio del bloque 1 (14 de 16)

Con la elección de Ric entre las 3 versiones regeneradas, dos tipos de
aplicación (el análisis de Ric en `docs/audio-bloque1-elecciones.md`
distinguió bien las dos, evitó duplicar trabajo):

- **9 sin campo `audio` todavía** (existían solo en el bucket de pruebas,
  la app salía muda): subido el mp3 ganador a producción y añadido el
  campo en `data/unidades-v2/` — incluye una variante dialectal anidada,
  «horreek», que un primer pase pasó por alto al no mirar dentro de
  `variantes`.
- **5 con audio ya en producción, y era el malo** (`nola-duzu-izena` en
  dos sitios del curso con dos ficheros distintos, `ni-ere-euskalduna-naiz`,
  `gu-ere-lagunak-gara`, `zuek-ikasleak-zarie`, `hemeretzi`): sustituido el
  fichero en el bucket manteniendo la misma ruta — la CLI de Supabase no
  sobrescribe directo (`cp` da "Duplicate"), y `rm` no borra en esta
  versión (2.115.0, sin log de llamada DELETE); rodeado con `mv` a
  `test/_descartes/` para liberar la ruta y luego `cp` del bueno. Los
  viejos quedan ahí por si hay que volver atrás, no se han borrado.

**Pendientes, sin resolver todavía:** `gipuzkoa` y `gela` — Ric marcó
"ninguna" en las 3 versiones nuevas para ambas. Propuesta de Ric/Claude
Opus para la siguiente ronda: en vez de solo la instrucción, cambiar el
TEXTO que se le manda al modelo («Gipuskoa», «guela» en vez de la forma
real, dejando la grafía correcta en la app) — y si tampoco basta, cambiar
de voz (todo el lote usa `Kore`). Decisión de Miguel, no se hace sola.

## 2026-09-19 — 3 versiones de cada audio que Ric marcó mal (bloque 1)

Ric revisó el bloque 1 y marcó 16 palabras/frases como "mal", con nota de
qué falla en cada una. Traducidas esas notas a instrucciones fonéticas en
inglés (mismo mecanismo que `lote-ric-3.mjs`), se generaron 3 versiones
nuevas de cada una (`scripts/generar-audio/regenerar-fallos-bloque1.mjs`,
48 audios en `scripts/generar-audio/out/_regenerar/`).

Página nueva `revision-audio/elegir-mejor-bloque1.html` para comparar: el
original + las 3 versiones nuevas de cada palabra, con la nota de Ric a la
vista, y un informe copiable con la elección de cada una — para aplicar
después la ganadora a `data/unidades-v2/`.

## 2026-09-09 — Generado el audio nuevo de las 10 unidades + herramienta de revisión

Generados con `generar.mjs` los mp3 de las 389 palabras/frases que
faltaban en `data/unidades-v2/` (unidades 1-10 completas). Todavía no
están en producción — el campo `audio` de los JSON no se ha tocado —
falta el paso de escucha/aprobación.

Para ese paso, herramienta nueva en `revision-audio/`: páginas HTML
autocontenidas (el audio va incrustado en base64 dentro del propio
archivo, para poder publicarse como Artifact sin depender de red ni de
compartir cuenta/organización) repartidas en 8 bloques por unidad, con
botones Bien/Mal, campo de nota por palabra fallida, y un botón
"Copiar informe" que exporta un JSON con lo marcado. Generador
reutilizable en `scripts/generar-audio/construir-revision.mjs`.
Instrucciones para Ric en `docs/ideas-ric.md`.

## 2026-09-07 — Pronunciación g/gu + doc de flujo de lecciones

En la Unidad 1 (v2), el bloque "Pronunciación: lo que necesitas hoy"
cubría z/s/x/tx/ts-tz/j/h/ñ-ll pero no la interferencia real de **g**
antes de e/i (en castellano "ge/gi" suena a jota, en euskera suena
siempre fuerte) ni las letras que no existen en euskera (c/qu/v/w/y) ni
la ausencia de tildes. Se añade ese contenido, un ejemplo nuevo
("gela", reutilizando el audio ya subido de u6) y se sustituye la
pregunta de quiz sobre "tz" (redundante con la de "ts") por una sobre
g/gu, manteniendo el grupo en 5 variantes como exige `verificar.py`.

También se crea `docs/flujo-lecciones-ejercicios.md`, documento de
referencia para Claude Design con toda la estructura interna de una
lección: unidad → tema, los 7 tipos de ejercicio, los 4 contextos que
generan preguntas (practicar/test/repaso mezclado/repaso de
vocabulario) y la pantalla de resultado.

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

## 2026-08-18 — Recortado el silencio inicial de toda la librería de audio

Los 567 mp3 del bucket `euskaraz-audio` (12 unidades) llevaban de
fábrica ~300ms de silencio al principio del archivo — la causa real del
retraso al pulsar reproducir que se reportó antes. Descargados,
recortados con `ffmpeg -af silenceremove` y resubidos a su misma ruta
uno por uno, sin tocar ningún JSON de contenido. 567/567 sin fallos.

Primer intento fallido: la URL de subida del script de lote no incluía
el nombre del bucket, así que las 567 subidas fallaban en silencio con
«Bucket not found» — corregido antes de relanzar en segundo plano.

## 2026-08-18 — Dos audios más corregidos: «ni» y «hura»

**ni** sonaba «nik» (k espuria al final) y **hura** sonaba «hiura» (i
espuria de más). Regenerados con instrucción explícita contra cada
sonido de más, mismo flujo de revisión que el resto de audios de esta
sesión (candidata en `test/`, escuchada y aprobada, luego publicada en
su ruta real).

## 2026-08-19 — Incorporado el trabajo de Ric (rama `ric/trabajo`)

Revisada su rama, que llevaba desde el 18/08 sin fusionar. Traído lo
objetivo y sin ambigüedad:

- **Corrección lingüística real**: «-tik no pierde la k en bizkaiera»
  (Unidad 9) era una regla falsa — Ric la comprobó, la quitó del bloque
  dialectal y corrigió la pregunta de quiz que la daba por cierta.
  Formateada también la conjugación de «ibili» en líneas, igual que
  «joan» y «etorri» (los dos datasets).
- **Dos bugs de contenido en ejercicios**: Unidad 2, un ejercicio de
  ordenar pedía colocar «polita» (bonito/a) sin que la palabra apareciera
  en el enunciado en castellano — añadida. Unidad 4, la pista de «Me
  llamo Ane» daba las dos respuestas completas en vez de orientar —
  reescrita para no resolver el ejercicio.
- Añadido `docs/ideas-ric.md`, su cuaderno de revisión: una lista mucho
  más larga de audios mal pronunciados que los que ya arreglamos por
  nuestra cuenta (sin solape con jaso/zelan-zagoz/oso-ondo/barkatu/ni/
  hura), una investigación de por qué falla el TTS (el euskera está en
  fase Preview dentro de Gemini TTS, de ahí lo errático), y varias
  propuestas de producto pendientes de decidir con Miguel — ver el
  documento para el detalle completo.

No traído (pendiente de decisión, no de ejecución automática): a quién
dar acceso al proyecto de Google Cloud para que Ric pueda probar
regeneración de audio por su cuenta; la propuesta de Ric de quitar el
audio automático al acertar/tocar en ejercicios (revisa un cambio de
esta misma sesión); el resto de propuestas de producto del cuaderno
(vocabulario general, colorear porcentaje en la home, filtro también en
repasos).

## 2026-08-19 — Decisiones sobre el cuaderno de Ric: audio, home y filtro

- **Audio automático quitado de práctica y repaso**, tal como propuso
  Ric. Única excepción acordada: en "toca las parejas", cada palabra en
  euskera lleva ahora un icono de altavoz explícito en el lado derecho
  de su caja (un tercio del ancho; los otros dos tercios siguen siendo
  para seleccionar la palabra) — sigue pudiéndose escuchar, pero ya no
  sin pedirlo.
- **Home: porcentaje de la unidad coloreado por tramos.** Por debajo del
  50% no se enseña número (se queda como "Empezada"); del 50 al 69% se
  enseña en ámbar ("Mejor intento · 62%"); del 70% para arriba sigue
  igual que hoy, en verde ("Completada · XX%"). El rojo no se usa en la
  home, queda solo para marcar fallos.
- **Filtro por categoría también en el repaso de vocabulario**,
  reutilizando el campo `categoria` y el patrón visual del filtro del
  Diccionario. Selector "Repasar solo:" junto a la tarjeta de repaso;
  filtra `fondoVocabulario()` antes de montar la sesión.

## 2026-08-20 — Regeneradas las 45 palabras del inventario de Ric

Las 45 palabras que Ric fue anotando de oído en `docs/ideas-ric.md`
(rr floja, r/l/n confundidas, h que suena o que no debería, g/b
intercambiadas, z como zeta española en vez de s sibilante, la "-tua"
con r añadida de `katua`/`merkatua`, la j como catalana de `jan`/`joan`,
entre otras) — regeneradas con una nota de pronunciación específica por
palabra en el prompt de síntesis (`scripts/generar-audio/lote-ric.mjs`,
nuevo, sumado al repo), recortado el silencio inicial igual que el resto
de la librería, y publicadas en su misma ruta. 45/45 sin fallos.

Un aviso de la propia lista de Ric que sigue siendo cierto: la misma
palabra puede sonar bien en un sitio y mal en otro según la frase que la
contenga (p. ej. `joan` solo fallaba, no `joan den astean`) — el criterio
sigue siendo revisar de oído, no dar por generalizable un patrón.

## 2026-08-20 — Login: de magic link a usuario y contraseña

Motivo: probando el ejercicio de listening en un dominio de preview de
Vercel, tocaba pedir un magic link nuevo por ser un origen distinto al
de producción — molesto, aunque la sesión ya se recuerda sola en el
mismo dominio (comportamiento por defecto del SDK de Supabase, sin
tocar). Se sustituye el acceso por correo + contraseña:

- Pantalla de acceso con los dos campos y un botón para alternar entre
  "Entrar" (`signInWithPassword`) y "Crear cuenta" (`signUp`) — un solo
  formulario, sin duplicar HTML.
- Pantalla nueva "Tu cuenta" (icono en la cabecera, solo en inicio):
  cambiar la contraseña (`updateUser`) y cerrar sesión (`signOut`).
- Sin cambios en Supabase: mismas tablas, mismo `user_id`, mismo
  usuario existente de Miguel — solo hace falta que le ponga contraseña
  la primera vez desde "Tu cuenta" (su sesión de magic link seguía
  activa en producción).

## 2026-08-20 — Filtro por categoría en el Vocabulario de cada unidad

Distinto del "Repasar solo" de la home (que filtra el fondo del repaso
espaciado): este filtra la lista de vocabulario de UNA unidad, la
pantalla a la que se llega desde "Estudiar el vocabulario" en cada
lección — mismo patrón visual que el del diccionario. No toca progreso
ni calendario, solo qué se ve en la lista.

## 2026-08-20 — Corta el recorte al principio del audio la primera vez

`reproducir()` cambiaba `.src` y forzaba `currentTime = 0` en el mismo
tick, pero el navegador todavía no tenía la metadata del archivo nuevo
(readyState 0) — el seek a 0 quedaba pendiente y se aplicaba de golpe
justo cuando arrancaba a sonar, recortando el principio. Solo la
primera vez: a partir de ahí el archivo ya está en caché del navegador
y el fallo no se nota, lo que despistaba. Arreglado rebobinando solo
cuando se repite la MISMA pista (para que tocar dos veces la misma
palabra la reinicie); con una pista nueva no hace falta, ya empieza en
0 sola.

De paso, `pantallaUnidad()` ahora precarga en segundo plano (sin
esperar ni bloquear nada) todo el audio de esa unidad —vocabulario,
variantes y ejemplos de gramática— en cuanto se abre, para que la
primera reproducción real ya la tenga la caché del navegador templada.

## 2026-08-20 — Corregido «hi»: la H, muda del todo

Tres intentos hasta dar con ello: sonaba «yi» (H como Y), luego «gui»
(H como G) al pedir una H aspirada suave, luego un suspiro suelto sin
palabra reconocible al insistir en el soplo de aire. La solución no era
pulir la aspiración, sino quitarla del todo — la H es muda en la
inmensa mayoría de dialectos, tal como ya dice el propio bloque de
pronunciación de la Unidad 1. Pedido explícitamente cero aspiración: el
resultado suena igual que la vocal «i» sola.

De paso, primera vez que se resuelve un audio con el CLI de Supabase en
vez del conector MCP (que llevaba toda la sesión cayéndose): `supabase
login --token` con un token de acceso personal de Miguel, proyecto
enlazado, y `supabase db query --linked` para abrir/cerrar la política
RLS temporal — mismo patrón de siempre, vía más estable.

## 2026-08-20 — Introducción al artículo -a antes de los posesivos (U2)

El bloque de posesivos («Los posesivos: nire, zure, gure…») decía "Y el
sustantivo mantiene su artículo -a" sin haber explicado antes en ningún
sitio del curso que ese -a ES el artículo — primera vez que aparece el
concepto, y sonaba a que diera algo por sabido que no lo era. Añadida
una frase que lo presenta: en euskera «el/la» no es una palabra suelta,
es esa terminación -a que ya se veía pegada al sustantivo (etxea,
laguna, herria…) desde el vocabulario, y que no desaparece al añadir un
posesivo aunque en castellano no lleve artículo ("mi casa", no "mi la
casa"). Aplicado igual en los dos datasets.

## 2026-08-20 — Auditoría extensiva: contenido, metodología, usabilidad y funciones

Cuatro revisiones independientes en paralelo (contenido lingüístico,
diseño pedagógico, usabilidad/accesibilidad, robustez técnica), sin que
se vieran entre sí, compiladas en un informe único. De ahí salen los
siguientes cambios de esta misma tanda:

**Contenido — 4 ejercicios irresolubles corregidos.** Resto del cambio
de Gernika a Bilbao de la Fase 3: el enunciado en castellano pedía
Bilbao pero la respuesta en euskera solo aceptaba Gernika (u4-g10,
u6-g08, u9-g08, u11-g08). En vez de fijar otra ciudad concreta, se
generalizó a «Euskal Herria» (el País Vasco) — más neutro que forzar
siempre la misma ciudad. Los ejercicios donde Bilbao ya estaba bien
(pregunta y respuesta coincidían) se dejan como están: practicar con un
nombre real es útil, no era un bug.

**Contenido — corregida la etimología de «gabon» (U7).** Afirmaba que
«gabon» viene de «gaba» (la noche en bizkaiera), contradiciendo a la U1,
que ya explica «gabon» = gau + on, común a cualquier registro.
Verificado con Euskaltzaindia y Wiktionary: «gabon» viene de «gau», no
de «gaba» — es un error de etimología popular. Corregido el bloque de
gramática y la pregunta de quiz que repetía el mismo error.

**Funciones — condición de carrera entre pestañas/dispositivos.**
`guardarProgresoAhora()` pisaba la fila entera de progreso sin ningún
control de versión. Ahora la escritura es optimista: solo se aplica si
`updated_at` sigue siendo el que se leyó por última vez; si otro
aparato guardó primero, se descarta la escritura y se adopta esa
versión más reciente en vez de pisarla. También se refresca el
progreso desde el servidor al volver a una pestaña que llevaba un rato
en segundo plano, antes de que pueda llegar a guardar con datos viejos.

**Funciones — recuperación de contraseña.** Añadido «¿Olvidaste tu
contraseña?» en la pantalla de acceso (`resetPasswordForEmail`). Al
volver del enlace del correo, la app detecta el evento
`PASSWORD_RECOVERY` y lleva directo a poner la contraseña nueva, en
vez de a la home.

**Funciones — aviso correcto al crear cuenta con un correo ya
registrado.** Antes decía siempre "revisa tu correo", incluso si la
cuenta ya existía. Ahora se distingue mirando `user.identities` en la
respuesta de `signUp` (vacío si el correo ya tenía cuenta confirmada) y
avisa de que inicie sesión en vez de esperar un email que no llegará.

**Usabilidad — espaciado del filtro en Vocabulario de unidad**,
alineado con el que ya usa el Diccionario. **Quitado el filtro de
categoría de la tarjeta de repaso de la home** (redundante ahora que el
Vocabulario de cada unidad tiene el suyo propio).

**Para decidir con Ric** (anotado en `docs/ideas-ric.md`, no aplicado
todavía): tope de 80/20 antiguo/nuevo en el repaso cuando hay mucho
backlog acumulado; si hacen falta ejercicios de flexión gramatical
dedicados en las unidades con casos nuevos (u5/u6/u10); y el enlace de
prueba del ejercicio de escucha, pendiente de fusionar.

De paso, sincronizado `docs/brief.md`: la comparación letra a letra
(9.1) y los ejercicios de escritura libre (9.2) ya están implementados,
no son funcionalidad futura; y la fila de autenticación ya no dice
magic link.

## 2026-08-22 — Quita una valoración interna que se había colado en el contenido

El bloque del hika (U2) traía una coletilla de cuando se fusionó el
trabajo de Ric — "no tenemos una fuente que precise con qué frecuencia
exacta, así que tómalo como orientación, no como dato cerrado" — que
es una nota de trabajo nuestra, no algo que deba hacer dudar a quien
está aprendiendo. Quitada; el resto de la frase se queda tal cual,
afirmando el hecho sin matizarlo de puertas afuera.

## 2026-08-22 — "Un aviso sobre los dialectos" solo en la Unidad 1

El mismo bloque, palabra por palabra, se repetía en las unidades 1 a 6
de los dos datasets — un aviso general que no necesita repetirse cada
vez. Se queda solo en la Unidad 1; quitado de la 2 a la 6.

## 2026-08-22 — Más audios corregidos y un hueco de "toca las parejas" cerrado

- **geu** sonaba «deu» (la g no se oía) — regenerado.
- **zu · zuk · zuri · zurekin** decía «zuk zuk zurekin» (saltaba y repetía
  palabras) y, ya corregido el orden, seguía sonando la z como en
  castellano en vez de s sibilante. Resuelto respelando el texto que se
  manda a sintetizar («su, suk, suri, surekin» en vez de «zu, zuk, zuri,
  zurekin») — el resultado es el correcto, sin tocar lo que se ve en la
  app.
- **nirekin y zurekin** no tenían ficha de vocabulario propia — solo
  aparecían sueltos dentro de un ejercicio de "toca las parejas" (U2),
  así que el botón de audio no encontraba nada que reproducir. Añadidas
  como vocabulario con su propio mp3, en los dos datasets.

**Contenido — pregunta sin respuesta defendible corregida (U1).** "En
Bilbao, ¿qué despedida oirás con más frecuencia?" daba «gero arte» por
correcta frente a «bihar arte» sin ninguna fuente que respalde que una
suena más que la otra — las dos son despedidas válidas y habituales.
Reformulada a algo verificable: "¿Cuál de estas NO es una despedida?",
con «Barkatu» (perdón) como intrusa. Aplicado en los dos datasets.

## 2026-08-22 — Atajo de teclado en los ejercicios de opción

En ordenador, pulsar la letra (A, B, C…) selecciona esa opción, igual
que tocarla — sigue haciendo falta el botón para comprobar. Un único
listener global en vez de uno por pregunta, porque `#opts` se recrea
en cada pregunta nueva.

## 2026-08-24 — Cierra 40 huecos de audio en "toca las parejas"

Barrido sistemático de las 12 unidades: 40 parejas en ejercicios de
"toca las parejas" cuyo botón de audio no reproducía nada.

- **6 de las 40 ya tenían mp3 grabado** (como ejemplo de un bloque de
  gramática), pero `audioDePalabra()` solo buscaba en el vocabulario,
  nunca en los ejemplos de gramática — arreglado ahí, sin generar nada
  nuevo (`js/app.js`).
- **Las 33 restantes no tenían audio en ningún sitio** — generadas y
  añadidas como vocabulario propio (con su categoría y traducción) en
  las unidades 1, 2, 4, 5, 6, 9 y 10: posesivos reforzados (neure,
  zeure, geure, zeuek), frases posesivo+sustantivo (nire etxea, zure
  herri txikia...), las 4 frases de "izan" en presente (Ni ikaslea
  naiz...), ergativos (nik, zuk, hark, guk, dugu, dute), dativo de
  "gustatzen" (zait, zaizu, zaio, zaie), y sueltas (eta, handik, gela
  txikia, herri polita). 33/33 generados y subidos sin fallos.

## 2026-08-24 — Seis correcciones más de la rama de Ric (`ric/trabajo`)

- **Iconos y `site.webmanifest`**: nunca llegaron a añadirse al repo
  aunque `index.html` ya los enlazaba — de ahí los 404 de favicon/
  manifest en consola. Añadidos.
- **`preguntaOpcion` ya no delata la respuesta por la forma**: si la
  correcta es una pregunta y las otras tres opciones son frases o
  palabras sueltas, se acertaba por la silueta sin saber euskera. Ahora
  los distractores se agrupan primero por forma (pregunta/frase/
  palabra) y solo después por unidad.
- **Restos de la regla falsa "-tik pierde la k"** en el bloque de
  gramática y un ejercicio de U9, y en el repaso de dialecto de U12 —
  quedaban sueltos en ambos datasets pese a que la regla general ya se
  había corregido antes.
- **"diot" corregido a "dio" en U10**: esa forma (yo→él/ella) nunca se
  enseñó en la gramática de la unidad (solo están las de tercera
  persona: dit/dizu/dio/digu/dizue/die), así que se colaba en
  ejercicios sin que hubiera forma de saberla. 2 audios nuevos
  (`aneri-esan-dio.mp3`, `lagunari-lagundu-dio.mp3`).
- **"Gernikés" → "Gernikera"** en el selector de dialecto — Gernikés no
  es palabra real en español ni en euskera; Gernikera sigue el mismo
  patrón que Bizkaiera/Gipuzkera (el habla de un sitio).
- **Ambigüedad en "a la izquierda/derecha" (U9, los dos datasets)**: el
  enunciado aceptaba solo la forma de movimiento (eskuinera/ezkerrera)
  como correcta, pero la de ubicación (eskuinean/ezkerrean) se traduce
  igual al castellano — reformulado el enunciado como "gira a la
  derecha/izquierda" para que quede claro qué se pide.

No se trajo de esa rama la corrección de los 4 ejercicios Gernika/
Bilbao: ya están arreglados en `main` con "Euskal Herria" en vez de
Bilbao, por petición explícita de que fuera más neutro.

## 2026-08-24 — Ejercicio de listening, en producción

Fusionada `experimento/ejercicio-listening` a `main`: los dos formatos
de escucha (escuchar y elegir qué significa / escuchar y escribir la
traducción) ya se mezclan con opción/ortografía/teclear en el repaso de
vocabulario, con el mismo peso moderado con el que se probaron en la
rama. Quitados los comentarios que la marcaban como experimental — ya
es parte normal del motor.

## 2026-08-24 — Listening también en prácticas y repaso mezclado, y bug de fondo arreglado

Al revisar cómo llevar el listening a las otras dos pantallas apareció
un bug real: `fondoVocabulario()` nunca copiaba el campo `audio`, así
que en el repaso de vocabulario `preguntaEscucharOpcion`/
`preguntaEscucharTeclear` devolvían `null` siempre y el sorteo caía en
silencio a opción múltiple — el listening llevaba viviendo en el
código desde que se fusionó sin que llegara a aparecer nunca. Arreglado
copiando también `audio` al fondo.

Con eso corregido, se añadió `mezclarEscuchar()`: cuela unas pocas
preguntas de escucha (2 en la práctica de una unidad, 3 en el repaso
mezclado) tirando del vocabulario con audio de la unidad o de todo lo
abierto, reusando tal cual `preguntaEscucharOpcion`/`Teclear` — mismos
requisitos, mismos distractores. Práctica, repaso mezclado y repaso de
vocabulario entrenan ya el oído los tres.

De paso, botón de audio también en las listas de vocabulario nuevo que
se escriben a mano en la prosa de gramática (`<b>palabra</b> — significado`,
como el bloque de pronombres de U2): se detecta cada `<b>` cuyo texto
coincide con una palabra narrada y se le cuelga el mismo botón que ya
usan Vocabulario y Diccionario, sin tocar los 12 JSON a mano.

## 2026-08-24 — La selección de escuchar pasa por el calendario, y suma frases

Revisado con el propio Miguel cómo se elegían las palabras de escuchar
en práctica y repaso mezclado (ver `candidatosEscuchar()`): antes era
azar puro sobre el fondo disponible, distinto de cómo el resto del
curso decide qué toca. Ahora tira del mismo `elegirSesion()` que usa
todo lo demás, así que prioriza lo vencido y lo nunca visto, igual que
sortearFormato() ya prioriza por nivel en el repaso de vocabulario.

Se probó primero unificar del todo — escuchar y gramática compitiendo
por los mismos huecos de la sesión — pero una simulación con datos
reales mostró que eso rompía la cobertura completa de práctica: al
repetir una unidad ya practicada, alguna pregunta de escuchar (siempre
"nueva") le ganaba el hueco a un grupo de gramática que aún no tocaba.
Se descartó: en práctica, escuchar sigue añadiéndose aparte, sin
competir nunca por los grupos de la unidad. En repaso mezclado no hay
ese riesgo (ya truncaba por calendario antes de este cambio).

También se amplió el fondo de escuchar en práctica y repaso mezclado
para que incluya, además del vocabulario suelto, las frases de ejemplo
de gramática que llevan audio propio (`ejemplosConAudio()`/
`fondoEjemplos()`) — "nire etxe handia" o una frase completa de un
bloque de gramática entran en juego igual que una palabra suelta.

## 2026-08-24 — Rediseño del botón "Escuchar"

El botón que reproduce el audio de las preguntas de escuchar era un
cuadrado 96×96 solo con icono, sin texto. Revisado con mockups locales
(`mockups/`, sin trackear) contra el CSS real de la app antes de tocar
producción. Primer intento —pastilla redondeada— se descartó por no
encajar con el resto del sistema, que usa `border-radius: 0` en todas
partes a propósito. Versión final: mismo tamaño y forma que el botón
de Comprobar (ancho completo, 56px de alto, esquinas rectas), relleno
oscuro con el texto "Escuchar" + icono en color papel (crema).

## 2026-08-24 — Audio al acertar (con precarga) y Modo silencioso

Cuando aciertas un ejercicio cuya respuesta correcta está en euskera
(opción, ortografía, ordenar, traducir, teclear-en-euskera), su audio
suena a la vez que aparece "Oso ondo!" — `audioDeRespuesta()` busca si
el texto de la respuesta correcta tiene locución narrada, sin
necesidad de distinguir por tipo de ejercicio a mano; si no la tiene,
no suena nada, como hasta ahora. Se precarga con `precargarAudio()` en
cuanto se pinta la pregunta (antes de responder), para que al sonar
—una sola vez, al acertar— ya esté en caché y no arrastre el retraso
de red de una carga en frío.

Añadido también un checkbox "Modo silencioso" en Tu cuenta, guardado
en `localStorage` de este aparato (no viaja con la cuenta a otros
dispositivos). Corta `reproducir()`, el único punto por el que pasa
todo el audio de la app, así que silencia de una vez botones de
Vocabulario/Diccionario/Gramática, toca las parejas, el prompt de
escuchar y el audio al acertar nuevo. Los ejercicios de listening se
excluyen de la selección (`sortearFormato()`/`candidatosEscuchar()`) en
vez de aparecer mudos, y los iconos de play desaparecen en toda la app
por CSS (clase `silencioso` en `<body>`).

## 2026-08-24 — Botones de escuchar más descriptivos, diff por palabras, e "Incluir variantes dialectales"

El botón de escuchar decía siempre "Escuchar", sin distinguir si tocaba
elegir el significado o traducirlo escribiendo — bastaba para
confundir el impulso (escribir en euskera lo que se oye en vez de
traducirlo). Ahora dice "Escucha y elige" o "Escucha y tradúcelo"
según el formato (`__labelEscuchar`). De paso, `corregirTeclear()`
comparaba siempre letra a letra, incluso para una solución de varias
palabras en castellano (el "objetivo: es" de escuchar+teclear) — daba
un diff sin sentido tipo "tu" + "pr" + "opio" resaltados sueltos. Ahora
compara por palabras cuando la solución tiene más de una, igual que ya
hace `corregirTraducir()`.

Nuevo switch "¿Incluir variantes dialectales?" en la cabecera de
Repasar (localStorage, por aparato, igual que Modo silencioso): apagado
por defecto, el repaso solo prueba la forma batua de cada palabra;
activado, las variantes (aupa, zelan zagoz…) entran también como
preguntas propias, con su misma traducción castellana heredada del
padre (`formasDe()`). Cuando la palabra en juego es una variante, la
pregunta lleva una etiqueta "BIZKAIERA" (reusa el estilo de
`.vitem__registro` de Vocabulario/Diccionario) para no confundirla con
un error de tecleo si se responde rápido. Hoy solo afecta a las dos
parejas del piloto de la Unidad 1 (kaixo/aupa, zer moduz/zelan zagoz) —
el resto de unidades aún no tiene `variantes` cargadas, ver
`docs/notas-contenido-u1.md`.

Arreglado también un bug previo (no de esta sesión): el botón de la
cuenta pasaba el propio evento de click a `pantallaCuenta()`, que lo
mostraba tal cual como mensaje — se veía "[object PointerEvent]" en la
pantalla de Tu cuenta.

## 2026-08-24 — "Qué toca hoy" en la Home

Nuevo bloque arriba de Unidades: acceso directo a la lección de turno
(la primera unidad sin `completada`, la que tienes abierta o la
siguiente por hacer), repaso de vocabulario y repaso mezclado, con un
contador "pendientes/total" a la derecha del título que baja según se
van completando. Cada tarjeta pasa a "¡Completado!" en cuanto no queda
nada por hacer hoy en ese frente — la lección cuenta como hecha si se
terminó una sesión de práctica hoy (`marcarLeccionHoy()`, en
`localStorage`, independiente de la nota); los repasos cuentan como
hechos cuando no hay nada vencido (`recuento().vencidos === 0`, sin
necesitar seguimiento propio por día). Al completar la unidad de turno,
la tarjeta apunta sola a la siguiente. La lista completa de Unidades se
queda debajo, sin tocar; Diccionario pasa a su propia sección al final.

De paso, "Sigue por donde lo dejaste" se pinta en ámbar (mismo tono que
"casi lo tienes" en la lista de Unidades) para distinguirlo del gris
neutro de "Empieza la lección" (antes decía "Unidad nueva").

## 2026-08-24 — Rediseño del selector de dialecto: dos controles separados

Hasta ahora un solo botón de la topbar hacía dos cosas a la vez:
elegir qué dataset cargar (Bizkaiera/Gernikera, el fork paralelo de
Ric) Y decidir si los ejercicios preguntaban también por la variante.
Se separan:

- **Ajustes → "Tu variante dialectal"**: nuevo desplegable
  (Bizkaiera/Gernikera) que decide qué contenido de gramática y
  vocabulario carga todo el curso — la misma `cambiarDialecto()` de
  siempre, movida de un click en la topbar a un `<select>` en Tu
  cuenta.
- **Botón de la topbar**: ya no cambia de dataset — ahora es el switch
  "Batua / [tu variante elegida en Ajustes]" que decide si esos
  ejercicios entran también en el repaso (lo que antes era el checkbox
  "Incluir variantes dialectales", ahora con el nombre real de la
  variante en vez de una etiqueta genérica). El nombre se actualiza
  solo si cambias de variante en Ajustes.

También se movió "Reiniciar mi progreso" de la Home a Tu cuenta, junto
al resto de ajustes de la cuenta.

## 2026-08-25 — Espacio simétrico antes de Cerrar sesión

`.home-foot` no tenía margen debajo — la nota de "reiniciar progreso"
quedaba pegada al botón de Cerrar sesión. Mismo espacio ahora arriba y
abajo del bloque (el que ya había antes del divider).

## 2026-08-25 — Desambigua "tarde" en el vocabulario de U7/U8

`berandu` (adverbio, "llegar tarde") y `arratsaldea` (sustantivo, "el
rato de la tarde") traducían las dos como «tarde» a secas — en el
repaso de vocabulario, sin más contexto que esa palabra suelta, no
había forma de saber cuál de las dos se pedía. `berandu` ya llevaba una
`nota` que lo aclaraba, pero la nota no siempre está a la vista (solo
al fallar). Corregido en el propio campo `es`, que se ve siempre:
"tarde (llegar tarde)" / "la tarde (el momento del día)", en los dos
datasets (`data/unidades/07-ordua.json`, `08-egiten.json` y sus
equivalentes en `unidades-gernikes/`).

## 2026-08-25 — Un tercer nivel de acierto: "casi correcto"

En los ejercicios de escribir (`traducir`/`teclear`), antes solo había
bien o mal. Ahora un fallo pequeño —falta un sufijo, una letra cambiada
en una palabra larga, una palabra suelta distinta en una frase— se
trata como acierto (cuenta para el calendario y el marcador, "se da por
resuelto") pero avisa distinto: título "Casi correcto" en vez de "Oso
ondo!", color ámbar en vez de verde (mismo tono que "sigue por donde lo
dejaste" en la Home), sin mostrar el diff de fallo.

`esCasiCorrecto()` reutiliza el mismo alineado que ya monta el diff
visual (`alinear()`), sin necesitar una distancia de edición aparte:
cuenta cuántas letras (o palabras, en una frase) no coinciden entre lo
escrito y la respuesta correcta más parecida de las válidas
(`respuestaMasCercana()`, por si hay sinónimos). Se admite como mucho 1
de diferencia — y con un límite a propósito: palabras de tres letras o
menos no dan margen (en euskera ahí una letra puede ser otra palabra
entera, "ni"/"hi"), así que no hay "casi" que valga. Verificado con una
tabla de casos: `etxe`/`etxea` y `kaiso`/`kaixo` sí perdonan,
`ni`/`hi` y `zu`/`ni` no.

## 2026-08-25 — Respuestas flexibles en castellano (portado de `ric/trabajo`)

Detectado por Ric: el campo `es` está escrito para leerse, no para
compararse — «pequeño/a», «coger, tomar», «(yo) soy». Comparando la
cadena entera, teclear «pequeño» (correcto) se marcaba como fallo.
Afectaba a un tercio del vocabulario del curso: 43 entradas con barra,
~20 con coma, ~70 con paréntesis.

`variantesRespuesta()` expande una respuesta en todas sus formas
aceptables (alternativas por barra o coma, contracción de género
pequeño/a → pequeño + pequeña, paréntesis con y sin la aclaración, con
o sin artículo delante) y `aciertaTecleado()`/`todasLasVariantes()` lo
usan al corregir, no al construir la pregunta — vale para
`traducir`/`teclear` tal cual, sin tocar los datos. Integrado con el
"casi correcto" de ayer: la búsqueda de la respuesta más parecida
(`respuestaMasCercana()`) ahora compara contra todas las variantes
aceptadas, no solo la primera. Al acertar una palabra de doble género
se avisa de que el adjetivo en euskera no tiene género — idea de Ric.
Inocuo sobre respuestas en euskera (ningún campo `eu` del curso lleva
barra, coma ni paréntesis).

## 2026-08-26 — Media docena de arreglos más de `ric/trabajo`, sin la reestructuración

Portados de `ric/trabajo` (con Claude Fable), dejando aparte la
reestructuración de 10 unidades con subniveles (`data/unidades-v2/`,
sigue sin tocar):

- **Tildes y espacios de barra ya no cuentan como fallo** al teclear
  ("el/ella" acepta "él / ella") — `claveRespuesta()` aplana las dos
  cosas para comparar, sin tocar lo que se ve en pantalla. La ñ se
  deja intacta a propósito. `corregirTraducir`/`corregirTeclear` pasan
  ahora los dos por `aciertaTecleado()`.
- **Campo `esAlt`** en vocabulario: formas castellanas alternativas que
  no se pueden deducir del texto ("gracias" vale para "muchas
  gracias" en escuchar+teclear).
- **Mensaje de fallo más claro al traducir AL castellano**: "dijiste"/
  "significa" en vez de "escribiste"/"se escribe" (no has fallado la
  grafía, el significado), y ya no se enseña la nota en euskera de la
  palabra (solo despistaba, hablando de un fallo en castellano).
- **Dos frases con "barkatu" mal usado** sustituidas (U1): "barkatu"
  pegado a un saludo o un agradecimiento no tiene situación real.
- **Dos pistas más que daban la solución hecha**, reescritas (U5,
  "tengo un perro"/"tenemos una casa") — la pista da la regla, no las
  palabras.
- **Demostrativos bizkainos nuevos** (U2): "hura"→"ha", "haiek"→
  "hareek", verificados contra bizkaieraren ataria, con el mismo
  esquema `registro`/`variantes` de siempre.
- **Progreso en `localStorage` al probar sin cuenta en local**
  (`MODO_LOCAL`, gated por `location.hostname`) — antes se perdía en
  cada recarga. No cambia nada en producción.

## 2026-08-26 — Reestructuración a 10 unidades con subniveles, en producción

Fusionada `ric/trabajo` entera (`git merge`, limpio, sin conflictos) y
activado el cambio de estructura que llevaba días detrás de un flag de
pruebas: **el curso pasa de 12 unidades a 10 con subniveles**
(`data/curso-v2.json` → `data/unidades-v2/*.json` — 10 unidades, 327
ejercicios, 1635 variantes, 514 palabras de vocabulario).
`cargarCurso()` ya no mira `MODO_LOCAL && ?v2`, es directamente el
curso. El antiguo `data/curso.json`/`data/unidades/*.json` se queda en
el repo sin usar, por si hiciera falta volver atrás — hay además una
copia de seguridad completa fuera del repo y una etiqueta de git
(`respaldo-2026-08-26`) sobre el commit anterior a este cambio.

Se borra también la variante en gernikés (`data/unidades-gernikes/`,
`data/curso-gernikes.json` y el cableado que le quedaba en topbar/
Ajustes) — decisión de Ric, recuperable en el historial de git. El
selector de "Tu variante dialectal" en Ajustes se queda con una sola
opción (Bizkaiera); el switch "Batua / Bizkaiera" de la topbar sigue
igual.

De paso llegan media docena de piezas más: `verificar.py` en la raíz
(control de calidad del contenido, recuperado del proyecto original),
`scripts/probar-todo.sh` (verifica contenido + sintaxis + una batería
de tests de Node de una sola vez — los cuatro `scripts/probar_*.js`
tenían una ruta absoluta al `~/Proyectos/euskaraz` de Ric, corregida a
relativa para que corran en cualquier máquina), y los generadores de
contenido de la reestructuración (`scripts/gen_*.py`,
`scripts/reestructurar.py`) por si hace falta retocar el curso nuevo
más adelante.

Verificado antes de subir: `verificar.py` sin errores en las dos
versiones del curso (la nueva y la vieja, que se queda de referencia),
sintaxis de `js/app.js` correcta, y los cuatro tests de Node en verde
— incluido `probar_casi.js`, que cubre el "casi correcto" de ayer.

Pendiente, anotado en `docs/ideas-ric.md`: generar los audios nuevos
del vocabulario añadido (lista en `docs/audios-pendientes.md`, lote
listo en `scripts/generar-audio/lote-ric-3.mjs`) — no se ha corrido
en esta sesión.

## 2026-08-26 — Trece correcciones más sobre las 10 unidades

Segunda tanda de `ric/trabajo` (`git merge`, limpio) sobre el curso
que ya está en producción, sin tocar estructura ni v1:

- **Repaso de vocabulario aditivo por tema, no por unidad entera.**
  `progSub()` distingue "visitado" (abrir la portada del tema) de
  "desbloqueado" (entrar a su gramática o vocabulario) — antes abrir
  el Vocabulario de una unidad metía sus 50-74 palabras al repaso de
  golpe, temas sin tocar incluidos.
- **El test de unidad pasa de 7 a 12 preguntas**, completando con
  grupos de los temas repartidos por turnos, para ajustarse a lo que
  dice ser: "todo lo anterior mezclado".
- **Los ejercicios de ordenar ya no se resolvían a ojo**: la mayúscula
  y los signos de puntuación delataban el orden en 136 de 144
  ejercicios. Fichas ya despojadas de mayúscula/signos; el "?" es una
  ficha suelta.
- Una decena de correcciones de contenido verificadas por Ric:
  ambigüedad "el domingo" (igandea/igandean), la -n de tiempo
  preguntada antes de explicarse, números compuestos de verdad en los
  ejercicios (42/76/91), "batzuk"/"komuna"/"azkena" explicadas por fin,
  los animales trasladados a la unidad 5 como "El caserío", una
  etimología falsa de "ortzegun" retirada, listas largas una por
  línea.

Tres scripts de test nuevos (`probar_bolsa.js`, `probar_ordenar.js`,
`probar_test.js`) con la misma ruta absoluta al Mac de Ric corregida a
relativa. Verificado con `probar-todo.sh` entero en verde antes de
subir.

## 2026-08-27 — Ficha duplicada de las estaciones (6.4)

Merge de `ric/trabajo`. Al escribir la reestructuración, la ficha
nueva de las estaciones del año en el tema 6.4 solapaba entera a una
que ya existía — detectado por el propio Ric. Borrada la vieja,
rescatados antes los dos matices que solo estaban ahí (el de
"udaberria" como "el verano nuevo" y los cuatro nombres sueltos como
ejemplos). Ningún ejercicio ni audio se pierde. Barrido el resto del
curso por si había más duplicados de la misma clase: no hay.

## 2026-08-27 — Negación fuera de sitio, ogia/ogirik, ropa mal colocada

Merge de `ric/trabajo`:

- **La negación se practicaba en 7.1 antes de explicarse en 7.2.** Diez
  variantes movidas, cuatro reescritas en afirmativo, uno nuevo para
  que 7.1 no se quedara corto. De paso, distractores de construcciones
  aún no vistas (gehiago/gutxiago, "ezin dut") sustituidos en cuatro
  temas.
- **"No como pan" tenía dos traducciones distintas contando lo mismo**:
  «Nik ez dut ogia jaten» (no como *el* pan) y «Ez dut ogirik jaten»
  (no como pan, ninguno) estaban traducidas igual — verificado en la
  Euskararen Gramatika (15.5). Corregido en los tres ejercicios
  afectados, con dos escenas nuevas para verlo claro.
- **La ropa vivía en el tema de "comer y beber"** (12 palabras, 2
  ejercicios, 4 preguntas del test) mientras 9.5 "Arropa eta opariak"
  tenía 3. Todo movido a 9.5.
- **8 referencias entre fichas apuntaban a la unidad equivocada**,
  resto de la reordenación a diez unidades.
- Y lo pequeño: burbuja de bizkaiera del 6.5 reescrita (la de San
  Sebastián se entendía al revés), 7.5 ya presenta su vocabulario,
  "lursagarra" fuera (nadie la reconoce), añadida "arana" (ciruela).

**Herramientas nuevas**: `scripts/probar_adelantos.js` avisa si un
ejercicio usa una construcción (negación, partitivo, "ari", pasado,
comparativos...) antes de que el tema la explique — con las frases
hechas que se enseñan enteras exentas. `verificar.py` tenía un regex
que nunca casaba con "unidad 9" en singular (exigía la "e" de
"unidades"), corregido, y acepta `--filtro texto` para no perderse
entre 249 avisos. `probar-todo.sh` falla ahora si algún
`scripts/probar_*.js` trae una ruta absoluta en vez de relativa —
para que no haga falta corregirlo a mano una tercera vez.

Verificado con `probar-todo.sh` entero en verde (8 pruebas) antes de
subir.

**Pendiente, sin decidir**: el generador de audio
(`scripts/generar-audio/generar.mjs`) lee `data/unidades/` (v1), pero
lo publicado es `data/unidades-v2/` — mientras el vocabulario de v2
venía heredado de v1 esto daba igual, pero las 54 palabras añadidas
solo en v2 nunca se generan. Detalle completo y las dos salidas
propuestas en `docs/audios-pendientes.md`, apartado C — decisión
pendiente, no aplicada en este commit.

## 2026-08-27 — `generar.mjs` apunta a v2, y el test de unidad decía 5 en vez de 12

**El agujero del audio, arreglado de fondo (opción 1).** `generar.mjs`
lee ahora `data/unidades-v2/` en `buscarPorId()`. Comprobado antes de
tocar el script que los ids de unidad y las rutas de audio siguen
coincidiendo aunque el contenido se haya movido de unidad al
reestructurar (los animales, trasladados a la 5, ya llevan
`unidades/u5/...`), así que no hizo falta ningún mapeo especial. De
paso, nuevo flag `--subnivel <id>` para generar solo el vocabulario y
los ejemplos de un tema, en vez de la unidad entera — las 54 palabras
que faltan se reparten en 16 subniveles. Pendiente: correr el script
de verdad (necesita credenciales de Google Cloud), no se ha ejecutado
en este commit.

**Bug encontrado al revisar el test de unidad**: la ficha decía "5
ejercicios" pero la sesión real tiene 12 — el ajuste de ayer (7→12
preguntas) cambió cuántas entran de verdad, pero la ficha seguía
enseñando el crudo de `test.length` (los grupos marcados `test` en el
JSON, casi siempre 5) en vez de `LARGO_TEST`, la constante que de
verdad gobierna el tamaño de la sesión.

## 2026-08-27 — Barrido de la misma familia de bug: dos sitios más

Pedido explícito tras el bug del test: revisados todos los sitios que
enseñan un número de ejercicios antes de empezar una sesión,
comparando cada uno contra cómo se construye la sesión de verdad en
`empezarPractica()`. Aparecieron dos más con el mismo defecto —
`ESCUCHAR_PRACTICA` (2 preguntas de escuchar) se cuela en **cualquier**
práctica, no solo en el test, y ninguno de los dos sitios lo contaba:

- La tarjeta "Practicar" dentro de un tema.
- El resumen de cada tema en la lista de la portada de la unidad
  (`pintarListaSubniveles()`).

Los demás contadores revisados (fichas de gramática, palabras de
vocabulario, temas restantes de la unidad, pendientes de repaso en la
Home) no tienen este problema: cuentan algo que no cambia al empezar
la sesión, o ya salen de la misma fuente en vivo que la sesión usa.

## 2026-08-28 — Unidades 8, 9 y 10 reequilibradas, y ejercicios repartidos por carga

Merge de `ric/trabajo`, solo contenido (`data/unidades-v2/`), sin
tocar `js/app.js`:

- **Unidad 8 reestructurada en 5 temas.** El 8.1 se llevaba el 48% del
  vocabulario y el 8.4 no tenía explicación ninguna para 10 palabras y
  5 ejercicios. Cuatro verbos (sartu, irten, iritsi, mugitu) se
  usaban en seis ejercicios sin explicarse en ningún sitio — uno de
  ellos aparecía por primera vez dentro de la burbuja de bizkaiera.
- **Unidad 9: "me gusta" recupera el ocio.** Se explicaba con el
  cuerpo (hablar del cuerpo de otra persona resultaba extraño) cuando
  su terreno natural —el ocio, 9.4— no tenía ni una ficha.
- **Unidad 10: de 34 palabras sin presentar a ninguna.** El 10.5 era
  un cajón de sastre con 22 palabras de cuatro temas distintos; los
  comparativos (baino, -ago, -ena) estaban catalogados ahí aunque se
  enseñan en el 10.4 — movidos.
- **Vocabulario huérfano cubierto: del 96% al 100%.** 16 palabras no
  aparecían en ningún ejercicio del curso, varias la que da nombre a
  su propio tema (gorputza en 9.3, egutegia en 6.2, baserria en 5.5).
  El reparto de ejercicios era plano (30 de 50 temas con exactamente 5,
  tuvieran 1 palabra o 28) — ahora se reparte por carga real.
- Barrido de fichas nuevas sin traducir alguna palabra (asko, pixka
  bat, batere ez y otras 5) y de vocabulario sin presentar en su
  propia ficha — ahora es un aviso permanente en `verificar.py`.
- Guardado `docs/revision-temas-unidades.md`, el informe de análisis
  de coherencia temática de la sesión — sin cambios de contenido, se
  conserva por las doce palabras que se adelantan una y otra vez y las
  decisiones abiertas sobre qué hacer con ellas.

Verificado con `probar-todo.sh` en verde antes de subir.

## 2026-08-30 — Nuevo formato "escribir", ergativo como sufijo de riesgo, 4 tandas de revisión

Merge grande de `ric/trabajo` (20 commits, del 28 al 30 de agosto):

- **Nuevo tipo de ejercicio: "escribir".** Como "ordenar" pero tecleando
  cada palabra en su hueco en vez de pinchar fichas — producir en vez
  de reconocer, que según la nota de investigación de Ric rinde mucho
  más para fijar vocabulario. Dos intentos por hueco (al segundo fallo
  se cierra en rojo y el ejercicio cuenta como fallado, para que no se
  pueda tantear hasta acertar); pesa el triple que "ordenar" al
  sortear formato, y el quíntuple en el test de fin de unidad. Extendido
  a los 40 ejercicios de ordenar del curso.
- **El ergativo (-k) y el -a/-ak tratados como los sufijos de riesgo que
  son**: consonante final átona, redundante con lo que ya dice el
  auxiliar, y sin equivalente en castellano — la predicción es que no
  se adquieren solo con exposición. Fichas reescritas con la regla y
  ejercicios de producción, no solo metalingüísticos.
- **Cuatro tandas de revisión de Ric** (50 + 8 + 17 + 21 correcciones):
  vocabulario sin presentar cerrado a 0 en las diez unidades (526
  palabras, ninguna huérfana), varias fichas con palabras sin traducir
  arregladas, opciones de longitud desigual igualadas para que no se
  acierte por forma en vez de por significado, y más.
- `docs/evidencia-motor.md` nuevo: los huecos que no se arreglan con
  contenido, con su dato y su coste.

**De paso, arreglada una inconsistencia en `docs/audios-pendientes.md`**:
la rama de Ric no tenía todavía el arreglo del 27/08 que apunta
`generar.mjs` a v2, así que su commit de esos días seguía describiendo
el generador como roto. Corregida la sección para reflejar que ya está
arreglado — falta ejecutarlo, no decidir nada.

Verificado con `probar-todo.sh` en verde antes de subir.

## 2026-08-30 — Publicación automática: `ric/publicar` + GitHub Action

Hasta ahora cada tanda de `ric/trabajo` había que fusionarla a mano en
`main`. Nuevo GitHub Action
(`.github/workflows/publicar-ric.yml`, dispara con `push` a
`ric/publicar`): fusiona esa rama en `main`, corre
`scripts/probar-todo.sh` como comprobación final, y solo si pasa
empuja a `main` — Vercel despliega desde ahí, sin nadie mirando. Si
hay conflicto de fusión o algún test falla, el Action se para ahí:
`main` no se toca, queda para revisar a mano como hasta ahora.

`ric/trabajo` sigue sin disparar nada — es el cuaderno de trabajo
normal. `ric/publicar` es solo la señal explícita de "esto ya está
listo": `git push origin ric/trabajo:ric/publicar --force` cuando Ric
decida que una tanda debe salir. Instrucciones para él en
`docs/ideas-ric.md`; no hace falta tocar su rama para que le llegue el
workflow, entra solo la próxima vez que fusione `main`.

Esto es para lo rutinario — un cambio estructural grande (como la
reestructuración a v2) sigue necesitando revisión a mano antes de
subir, igual que hasta ahora.

## 2026-09-02 — Quinta tanda de revisión de Ric (unidad 7)

Primera tanda publicada por la vía automática (`ric/publicar`), sin
fusión a mano de Miguel. Veinte arreglos sobre el informe de Ric, que
lleva revisadas 1222 de las 1819 variantes del curso.

- **Ejercicios que se acertaban sin entender la frase.** Las cinco
  variantes de `u8-g02` preguntan por el auxiliar (`dut` frente a
  `naiz`) y al responder explicaban la regla pero no traducían la
  frase. Ahora la traducción va delante de la regla; igual en
  `u7-g36` v0.
- **Distractores que se descartaban sin saber la palabra**, por ser de
  otra categoría gramatical («estoy (haciendo algo)» compitiendo con
  nombres de comida), y uno que la propia explicación daba por bueno
  («los deberes del cole» para *etxeko lanak*). Cinco cambiados.
- **Parejas que se resolvían por la forma**: en tres ejercicios la
  única entrada de varias palabras (*etxeko lanak*, *jaten ari naiz*)
  se emparejaba sola con la única traducción larga. Una de ellas
  además desvelaba la respuesta de otra pareja del mismo ejercicio.
- **Dos preguntas retiradas.** «*Ari naiz* sin verbo delante significa
  "estoy en ello"» contradecía la ficha de su propio tema, que dice
  que *ari* nunca va solo, y los hablantes nativos a los que preguntó
  Ric no lo reconocen. «*Ez dakit* es la negación de…» se contestaba
  sin leer. Sustituidas por el auxiliar de *ari* (izan, aunque haya
  objeto) y por la distinción *ogia*/*ogirik*.
- **El truco de la ficha de la sal** («la sal es la corta») no se
  sostenía en el ejercicio que lo citaba, porque tenía *gazta* entre
  las opciones, igual de corta. Enunciado nuevo, y la ficha avisa
  ahora de la confusión: mismas letras con la t y la z al revés.
- «Tomo café» acepta también `kafea edaten dut`. Elhuyar documenta
  *kafea hartu* (acepción 6 de *hartu*: tomar, beber, comer) y la
  unidad enseña *kafea edaten* en cuatro sitios: las dos son
  respuesta buena.

Los cambios se aplicaron con asserts sobre el valor anterior —dos
`.replace()` silenciosos en tandas pasadas dieron por hecho un cambio
que no se guardó— y el juego de avisos de `verificar.py` queda
idéntico al de antes (322, ninguno nuevo). `probar-todo.sh` en verde.

## 2026-09-02 — El calendario de repaso, y una ruta en la cabecera

Ric: «no puede ser que si he hecho todo al día, me diga al día siguiente
que tengo 177 ejercicios por hacer hoy». Era verdad y no era un fallo
suelto: con 881 fichas (355 grupos + 526 palabras) y la escala
`1,2,4,8,16,32,64,120`, un alumno al día tiene ~50 repasos diarios y
picos de 170. Simulado antes de tocar nada, el modelo reproduce sus 177.

- **La escala se abre** a `1,3,7,16,35,75,150,300`. Mismos ocho
  peldaños, más separados: la carga media baja un 25% y las dos
  primeras repeticiones, que son las que sujetan, no se tocan. Las
  fechas ya guardadas no se recalculan; cada ficha coge el intervalo
  nuevo la próxima vez que sale.
- **Lo atrasado se reparte en cola** (`repartirAtrasos`). Cuando lo
  vencido pasa de 45, se escalona por los días siguientes, 45 por día y
  por orden de urgencia; nada se adelanta y nada se perdona. Sirve para
  el atasco que dejó la escala vieja —cambiarla no lo quita, porque las
  fechas ya estaban guardadas— y para volver de dos semanas fuera sin
  encontrarse 400 pendientes.
- **La portada dice el trabajo del día, no la deuda**: «23 ejercicios
  para hoy». Y es verdad, no un recorte al pintar: el reparto ya ha
  dejado lo vencido por debajo del tope, así que al terminar el día
  pone «¡Completado!» de verdad.
- **La sesión se compone a propósito**, 40% de lo fallado hace poco y
  40% de lo aprobado hace mucho. Con la urgencia a secas, un atraso de
  170 hacía que nunca llegaras a lo que vencía hoy: se quedaba siempre
  detrás de la deuda vieja, que es media gracia del repaso perdida.
- **Cupo de novedades** (20 al día) en lo que estrenan los repasos. Lo
  que estrenas practicando una unidad no cuenta: eso lo decides tú.

Y la cabecera pasa a ser navegable: los dos trozos del título (unidad y
tema) abren un panel con pestañas —las diez unidades con su progreso,
los temas de la que tengas abierta, y la portada— para saltar sin tener
que salir hasta el inicio. Pedido de Ric.

Banco de pruebas nuevo, `scripts/probar_calendario.js`, dentro de
`probar-todo.sh`: comprueba el reparto, la mezcla de la sesión, el cupo
y que la cifra de la portada sea la de verdad. Verificado además a mano
en local, sembrando 200 fichas vencidas: quedaron 45/45/45/45/20.

Dos detalles más de la misma tanda:

- **El lauburu, en la cabecera y siempre presente** (`icons/lauburu.svg`,
  original de Ric), delante del nombre y como atajo al inicio desde
  cualquier pantalla. Dentro de una práctica pregunta antes de salir,
  igual que el botón de atrás: está siempre en pantalla y un toque sin
  querer no puede tirar la sesión. Toma el rojo por `currentColor`, no
  el del archivo, para no quedarse fuera de la paleta.
- **El número de la unidad ya no desaparece al completarla.** El ✓ lo
  sustituía, y con él se perdía la referencia de por dónde ibas: ahora
  van los dos, el número y el ✓ detrás.

## 2026-09-03 — El reparto de atrasos no se ejecutaba casi nunca

Ric, probando lo publicado: «tenía 45 en repaso y 45 en vocabulario. He
trabajado en vocabulario hasta estar al día, pero al hacer el repaso me
mantiene el 45, y he hecho más de tres rondas».

Los dos 45 eran los dos topes de pintura tapando un atraso sin repartir
—879 fichas vencidas detrás—, así que el número no bajaba por mucho que
jugara: quitabas 15 de 879 y seguía enseñando el tope.

La causa: `repartirAtrasos()` estaba enganchado solo al arranque, y hay
otras tres rutas que sustituyen el progreso entero sin pasar por él —el
conflicto al guardar (dos pestañas o dos aparatos), la vuelta a una
pestaña que estaba en segundo plano, y el cambio de sesión—. Bastaba
con que cualquiera de ellas trajera una copia sin repartir para
quedarse clavado el resto de la sesión. Encima el reparto llevaba un
candado de «una vez al día» que impedía recuperarse.

- Todo progreso que entra en la app pasa ahora por `adoptarProgreso()`,
  que asigna y reparte. Las cuatro rutas usan esa.
- El candado de día desaparece. No hacía falta: la condición de
  «¿hay más vencido que el tope?» ya es autolimitante — en cuanto
  reparte, lo vencido baja del tope y la siguiente llamada no hace
  nada. Se puede llamar cuantas veces se quiera.
- Y la portada reparte antes de contar, como última red, para que la
  cifra pintada sea siempre un día de trabajo de verdad.

La prueba de regresión reproduce el caso exacto de Ric (355 grupos + 526
palabras vencidos y el candado puesto) y falla contra el código que
estaba publicado: «quedaron 881 vencidos», «tres rondas dejan 821».
Comprobado además en la app: con esas 879 fichas vencidas, la portada
pasa de 45+45 a «24 ejercicios» y «20 palabras».

## 2026-09-06 — «askotan» acepta «muchas veces», y el esAlt que nunca llegaba

Ric, en un ejercicio de escuchar de la unidad 6: «la palabra es askotan
y la respuesta es "a menudo", pero "muchas veces" debería ser correcto,
porque es literalmente eso». Lo es —*asko* es "mucho"— así que se añade
como respuesta buena.

Al ir a añadirla apareció lo de debajo: **`esAlt` no funcionaba en
ninguna parte**. Es el campo que recoge las otras formas castellanas
válidas que no se deducen del texto («gracias» por «muchas gracias»,
«aquel» por «hura»), y lo usa la pregunta de escuchar y traducir. Pero
todo el vocabulario del repaso y de escuchar pasa antes por
`formasDe()`, que copia campo a campo, y ahí se quedaba fuera: nunca
llegaba a la pregunta. Las cinco entradas que lo tenían daban por malas
sus propias alternativas desde que se añadió el campo.

`formasDe()` lo arrastra ahora, en la entrada principal y en sus
variantes dialectales. Prueba nueva, `scripts/probar_esalt.js`, que
recorre el curso de verdad y comprueba que cada `esAlt` llega hasta la
pregunta; falla contra el código publicado con las seis entradas.

## 2026-09-06 — Al repaso mezclado solo entran las unidades superadas

Ric: «¿cuándo entran los ejercicios de una unidad al repaso mezclado? No
deberían entrar hasta que esa unidad está validada al 100%… me da la
sensación de que entran con solo abrir una explicación».

Entraban con menos que eso: `fondoRepaso()` pedía que la unidad estuviera
«visitada», y eso se marca **al abrir la portada de la unidad**, sin leer
nada. Con abrirla, sus 25-48 ejercicios se metían en el calendario de
golpe, la mayoría de cosas todavía sin estudiar. De ahí salía buena parte
del atasco de fichas nuevas.

Ahora se pide `completada`: haber ganado el test final de la unidad.
Mientras no la ganas, sus ejercicios no son repaso, son materia, y se
practican en la unidad, que es su sitio. El calendario de los que salen
**no se pierde**: sus fichas siguen guardadas con su historial y vuelven
en cuanto superas la unidad.

Con eso apareció un cabo suelto que se cierra a la vez: el reparto diario
recorría todas las fichas del calendario, así que las de una unidad
caída ocupaban sitio en el cupo de 45 sin poder salir, y la portada
habría enseñado un puñado en vez del día entero. `repartirAtrasos()` mira
ahora solo lo que puede llegar a salir (`clavesVivas()`).

El vocabulario no cambia: sigue siendo aditivo por tema, que fue una
decisión de Ric del 26/08.

Comprobado en la app con las diez unidades abiertas y solo la primera
superada: el repaso pasa de tener las 355 fichas a las 25 de esa unidad.
La prueba de `probar_calendario.js` falla contra el código publicado.

## 2026-09-09 — «Sin estrenar» decía una cosa y hacía otra

Ric, sobre producción: «el repaso de vocabulario dice "al día · 136 sin
estrenar". ¿Qué quiere decir? Yo hago repasos y ese número no baja».

El número era correcto y la frase engañosa. «Sin estrenar» son las
palabras que la app nunca te ha preguntado: no es deuda, es materia
esperando turno, y entra a un máximo de `CUPO_NUEVOS` (20) al día desde
el 02/09. Gastado el cupo del día y sin nada vencido, no queda nada que
preguntar — pero la tarjeta seguía enseñando los 136 y contándose como
tarea pendiente, así que parecía que repasar no servía de nada.

Peor: entrar entonces al repaso construía una sesión vacía y caía
directo a la pantalla de resultado con un 0 de 0.

- El recuento distingue ahora **lo que hay** (`nuevos`) de **lo que cabe
  hoy** (`estrenables`), que es lo que la portada necesita.
- Las frases: «hoy puedes estrenar 14» mientras quede cupo, y «quedan
  136 por estrenar, mañana más» cuando se acaba. Esa segunda ya no
  cuenta como pendiente en el marcador de arriba.
- Entrar a un repaso sin nada que preguntar avisa y vuelve a la portada,
  en vez de fingir una sesión.

Y el ritmo, decidido con Ric el 09/09: el cupo sube a **25 al día**, y
cada sesión mete al menos **2 sin estrenar** mientras queden, para que
goteen en vez de gastarse de golpe en la primera sesión del día. Antes
las nuevas iban las últimas de la cola, así que con atraso no salían
nunca.

El número de las que faltan **sale de la portada** y pasa a *Tu cuenta*.
Allí informa; en la portada pedía —y pedía algo que no bajaba al ritmo
al que uno repasa. La tarjeta ahora dice «Al día» en verde, como el
repaso de ejercicios.

## 2026-09-12 — «Mirar a la izquierda» también es «ezkerrera»

Ric, sobre `u8-g30` v3 («Si te dicen "ezkerrera" tienes que…»): «¿estás
seguro de que "mirar a la izquierda" y "quedarte a la izquierda" no se
dicen igual?».

De las dos, una sí. Elhuyar da para *begiratu* el caso **-ra** cuando es
dirección en el espacio —*leiho aldera begiratu zuen*, «miró hacia la
ventana»—, así que «mirar a la izquierda» es **ezkerrera begiratu**: la
misma forma que la respuesta buena. Era un distractor que también valía.

«Quedarte a la izquierda» sí es otra cosa: **ezkerrean**, con el -n de
sitio (*nire ezkerrean ama eseriko da*, «a mi izquierda se sentará mi
madre»).

El distractor pasa a «coger el de la izquierda» (**ezkerrekoa**), con lo
que las cuatro opciones piden ahora cuatro finales distintos —-ra, -n,
-tik, -ko—, que es lo que la pregunta quiere probar. Y la corrección los
dice todos, que era justo lo que Ric preguntaba.

## 2026-09-13 — La «a» de «anaia» no es el artículo

Ric, sobre «Zuk bi anaia dituzu»: «¿se debe poner el artículo en anaia?
¿o debería ser anai?». La frase estaba bien, pero la pregunta señala un
hueco de la unidad 4.

Euskaltzaindia lo zanja: *anaia* lleva **a itsatsia**, la «a pegada» que
forma parte de la palabra y no es el artículo. El Euskara Batuaren
Eskuliburua la cita entre sus ejemplos —*uda*, *alaba*, *anaia*— y da la
prueba: la -a no cae ante un cuantificador ni ante un adjetivo
(«*anai zaharra* → *anaiA zaharra*»). En el Hiztegia la entrada es
*anaia*, y *anai* solo aparece como primer miembro de compuesto
(*anai-arrebak*) o como tratamiento religioso.

El hueco: la ficha 4.1 enseña que detrás de un número el nombre va sin
artículo —*hiru lagun*, nunca «hiru lagunak»— y la unidad usa luego
*bi anaia* y *bi alaba* sin explicar por qué no se quedan en «bi anai».
Ficha nueva en 4.6, **«Bi anaia», pero «bi seme»**, con el par que lo
enseña solo: las dos palabras están en la misma lista de familia y se
portan distinto, porque *semea* es *seme* + artículo y *alaba* es
*alaba* entera.

El verificador cazó de paso que el ejemplo que había escrito usaba
*zaharra*, que es de la unidad 5.

## 2026-09-18 — «Esan» deja de ser una palabra de paso

Ric: «No hemos explicado ni conjugado *esan* (decir), pero aparece en
preguntas y repasos. Solo lo dices de paso, ni se conjuga, ni se le da
importancia».

Era así: entraba en 9.2 como una línea de una lista de cinco verbos
(«esan — decir») y a partir de ahí salía en 36 sitios de las unidades 9
y 10 sin explicación. Y **«esan nahi du»** —«significa, quiere decir», la
pregunta que abre cualquier palabra que no conoces— no aparecía ni una
vez en todo el curso.

- Ficha propia en 9.2, detrás de la del dativo: el habitual *esaten*
  con la regla que ya se sabe (*jan* → *jaten*), la diferencia entre
  *esan du* y *esan dio*, y *esan nahi du*. Contrastado con Elhuyar
  (entrada «esan, esan, esaten»; «esan nahi izan» = significar).
- Vocabulario: *esan* gana nota con su habitual, y entra *esan nahi du*.
- Grupo de ejercicios nuevo, `u9-g40`, con las cinco cosas.
- En la ficha del futuro (10.3), *esan → esango*, que además es un
  ejemplo limpio de la regla del -go tras n.

Queda una cosa sin hacer, a propósito: *esan* tiene también forma
sintética (*diot, diozu, dio* — digo, dices, dice), y *dio* coincide con
el auxiliar dativo que se enseña en el mismo tema. Meterlo ahí liaría
más de lo que ayuda en un A1.

## 2026-09-18 — Sexta tanda de revisión de Ric (12 arreglos)

- **Huecos sin frase que traducir** (`u8-g01`, las cinco; `u9-g31` v4).
  Sin la frase en castellano, *jan*, *jaten* y *jango* eran todas
  gramaticales. Ahora llevan la frase delante: «Como pan. → Nik ogia
  ____ dut.»
- **La negación general, con -rik** (`u8-g04` v1 y v4, `u8-g09` v3). «No
  bebo café» es *kaferik*: con *kafea* se hablaba de un café concreto,
  que es justo la distinción que la ficha de 7.2 explica. Y «No compro
  la carne» pasa a «No compro carne», que es lo que se dice.
- **Castellano natural** (`u8-g11` v3 y v4): «Suelo venir tarde» para el
  habitual, y «Como manzanas» sin el artículo — con una nota de que el
  euskera sí lo pone (*sagarrak*).
- **Una pregunta subjetiva** (`u9-g29` v2): «la pregunta clave al
  comprar un regalo» admitía «¿cuánto es?» igual de bien. Pasa a una
  traducción objetiva: «¿Para quién es?» se dice… *Norentzat da?*
- `u8-g30` v3 (*ezkerrera*) ya estaba corregido desde el 12/09.

## 2026-09-24 — Faltaba «bere», que es la mitad de «su»

Ric, comparando con otras apps: «para ella/él me dices *haren*, pero
existe una forma mucho más común que es *bere*. ¿Se nos está pasando
algo? ¿Es batua o solo bizkaiera?».

**«bere» no aparecía ni una vez en todo el curso.** Y es batua de pleno
derecho: es el genitivo reflexivo de *bera*, y la tercera persona de la
serie *neure, zeure, geure* que la unidad 2 ya enseñaba… sin completar.

La regla es la **ley de Linschmann-Aresti**, que recogen la Euskararen
Gramatika de Euskaltzaindia (13.7) y el Euskara Batuaren Eskuliburua:
se usa el genitivo reflexivo cuando el dueño aparece en esa misma
oración como NOR, NORI o NORK. Es decir:

- **Jon bere etxean dago** — Jon está en su casa, en la suya.
- **Jon haren etxean dago** — Jon está en casa de otro.

Lo dialectal no es *bere*, sino la **neutralización**: en los dialectos
occidentales —Bizkaia la primera— *bere* se ha comido a *haren* y sirve
para todo. El Eskuliburua lo describe («mendebaldeko euskalkietan
sumatzen da batez ere *bere*-ren aldeko neutralizazioa») y avisa de la
ambigüedad que trae. Euskaltzaindia no ha dictado un arau numerado
sobre esto.

Revisados **todos** los usos de *haren*/*haien* del curso: ninguno está
mal. Y hay un motivo de fondo — hasta la unidad 5 el único verbo es
«ser», y con «ser» el dueño nunca es argumento de la oración, así que
*haren* era lo que tocaba.

- Unidad 2.2: *bere* entra en la lista de posesivos, con la diferencia
  dicha en dos líneas y el aviso de que se ve entera en la unidad 5.
  *haren* gana nota. Vocabulario nuevo: *bere*.
- Unidad 5.1: ficha **«Bere» o «haren»: dos maneras de decir «su»**, con
  el par mínimo, el plural (*beren* / *haien*) y lo que pasa de verdad al
  hablar. Grupo de ejercicios `u5-g40`.

## 2026-09-24 — «Gurasoak» y «senidea» entran en la familia

Propuesta de Ric. Las dos merecen estar, y la segunda más de lo que
parecía.

**gurasoak** — los padres. El curso tenía *aita* y *ama* pero ninguna
forma de decir «mis padres» sin nombrarlos de uno en uno. Va casi
siempre en plural, porque nombra a los dos; el singular *gurasoa* es
«progenitor» y apenas se usa (Elhuyar lo marca como plural).

**senidea** — hermano o hermana, sin distinguir. Aquí estaba la
sorpresa: no es sobre todo «pariente». El Euskaltzaindiaren Hiztegia lo
define como «cada uno de los otros hijos de tus padres, o de uno de tus
padres» —lo que además cubre a los hermanos de un solo lado— y la
acepción «ahaidea» (pariente) va después y sin marca dialectal; Elhuyar
sí marca esa segunda como bizkaina. Las dos cosas se dicen en la ficha.

Lo que lo hace valioso para el curso: es **la salida neutra del sistema
de cuatro palabras** (anaia/arreba/neba/ahizpa), que es lo más costoso
de ese tema. *Hiru senide gara* se dice sin saber el sexo de nadie.

Van en 4.6: *gurasoak* en el mapa de la familia, *senidea* al final de la
ficha de hermanos, las dos en el vocabulario, y grupo `u4-g49` con cinco
variantes.

## 2026-09-28 — La explicación, sin salir del ejercicio

Idea de Ric: al responder una pregunta —acertando o fallando—, un botón
junto a «Continuar» que abre la ficha del tema, la lees y sigues.

Un botón de icono redondo y oscuro (44 px, el mínimo cómodo para el
dedo) con un libro abierto, a la izquierda de «Continuar» y centrado a su
altura. Al pulsarlo sube una hoja con **la ficha exacta del tema** de ese
ejercicio: la misma que enseña la pantalla de Gramática, con sus botones
de audio. Se cierra con la X, tocando fuera o con Escape, y el ejercicio
sigue donde estaba. Tooltip «Ver explicación» en ratón y teclado.

Para saber de qué tema viene cada pregunta, el `subnivel` viaja ahora con
el ejercicio (`__sub`) desde los tres sitios que los construyen: práctica
de unidad, repaso mezclado y repaso de vocabulario —incluidas las
preguntas de escuchar, que son las que más lejos quedaban del tema—.

Dos decisiones:

- **Abrir la ficha desde aquí no desbloquea nada.** Entrar por la
  pantalla de Gramática mete las palabras de ese tema en el repaso;
  hacerlo desde un ejercicio ampliaría el calendario cada vez que
  consultas una duda.
- **El botón solo sale si ese tema tiene explicación.** En el test de
  unidad los grupos marcados como «test» no son de ningún tema, así que
  ahí no aparece; los de relleno, que sí vienen de uno, lo muestran.

El pintado de fichas se comparte con la pantalla de Gramática
(`pintarFichas`) en vez de duplicarlo.

## 2026-09-28 — Un ejercicio puede decir dónde se explica

Ric, estrenando el botón del libro: «"Haiek etxe bat ___" con opciones
du/dute/dira, y el botón me lleva a la ficha 5.5, "El caserío y sus
animales". Es muy confuso, porque la pregunta habla del verbo tener.
¿Es un error?».

Lo era, y del ejercicio. `u5-g04` prueba entero el auxiliar de «tener»
(dut/du/dugu/duzu/dute) y está archivado en 5.5 porque su vocabulario es
de allí —txakurra, katua, etxea—. La única ficha de 5.5 habla de
*etxea* y *baserria*.

No se re-etiqueta el grupo: su vocabulario sí es de 5.5 y moverlo lo
sacaría de la práctica de ese tema. Se añade un campo opcional en el
grupo, **`explica`**, con el id del tema donde está la explicación —de
cualquier unidad, porque los ids la llevan delante—. El libro lleva ahí
y la cabecera de la hoja dice de qué unidad y tema es. `u5-g04` apunta
ahora a **4.4**, el verbo *ukan*.

Barrido de todo el curso buscando lo mismo —grupos cuyas respuestas no
aparecen en la ficha de su tema—: **9 candidatos reales** de 357 grupos.
Este es el primero; los otros ocho quedan anotados para decidir con Ric:

    u10-g01 (9.5)  zait/zaizu/zaio…      la ficha está en 9.1
    u10-g02 (9.3)  zaizkit/zaizkio…      la ficha está en 9.1
    u9-g27  (9.5)  txapela, txapelduna   la ficha está en 9.4
    u12-g02 (10.5) handiago, handiena    comparativos
    u5-g03  (4.4)  hamaika, hemeretzi    los números son 4.1/4.2
    u9-g04  (8.1)  Hondartzara, Bilbotik los casos son 8.3
    u4-g08  (2.3)  Madrilgoa naiz        el -ko/-go es 2.4
    u6-g12  (5.4)  -ra, zaude            es material de 5.1
    u1-g25  (1.4)  sobre la lengua       parece de 1.3

`scripts/probar_ficha.js` cubre la resolución (tema propio, `explica` a
otra unidad, unidad abierta, vocabulario por número, y que los `explica`
del curso apunten a temas que existen).

## 2026-09-28 — Los ocho grupos restantes apuntan ya a su ficha

Criterio de Ric: «cuando te enfrentes a la pregunta y dudes o falles,
puedas leer de dónde viene». Con eso, el libro tiene que llevar a lo que
explica **la respuesta**, esté donde esté.

Siete eran evidentes —las cinco variantes del grupo prueban una sola
cosa— y uno es mixto pero tiene destino claro:

| grupo | vivía en | `explica` | qué prueba |
|---|---|---|---|
| `u10-g01` | 9.5 | **9.1** | zait / zaizu / zaio / zaigu / zaie |
| `u10-g02` | 9.3 | **9.1** | zait frente a zaizkit |
| `u9-g27` | 9.5 | **9.4** | txapela, txapeldun, el sufijo -dun |
| `u12-g02` | 10.5 | **10.4** | handiago, handiena, baino, bezain |
| `u5-g03` | 4.4 | **4.1** | los números del once al diecinueve |
| `u9-g04` | 8.1 | **8.3** | -ra, -tik y -n, también en plural |
| `u4-g08` | 2.3 | **2.4** | el sufijo -ko / -go |
| `u6-g12` | 5.4 | **5.1** | preguntas de lugar y bizkaiera |

Ninguno cambia de tema: siguen practicándose donde están, solo dicen
dónde se explican.

Dos matices, anotados para no olvidarlos:

- `u5-g03` v4 pregunta «berrogeita hamabi» (52), que es de **4.2**, no de
  4.1. Cuatro de las cinco son del once al diecinueve, así que apunta
  ahí; esa quinta manda a una ficha que no la cubre del todo.
- `u1-g25` (1.4) **se queda como está**. Es un repaso de fin de unidad y
  va de tres sitios a la vez: la lengua aislada (1.1), que el batua vale
  en todas partes (1.3) y la s/z y «Epa!» (1.4). Su propio tema cubre dos
  de las cinco, que es más de lo que cubriría cualquier otro.

## 2026-09-28 — `explica` también por variante

Ric, sobre el «berrogeita hamabi» que quedaba huérfano en un grupo de
números del once al diecinueve: «se deduce perfectamente con la
explicación del 4.2, que señale allí sin duda».

Una variante puede llevar ahora su propio `explica`, y manda sobre el
del grupo. Con eso:

- `u5-g03` v4 (el 52) → **4.2**, contar de veinte en veinte. Las otras
  cuatro siguen en 4.1.
- `u1-g25`, el repaso de fin de unidad que se había dejado como estaba
  por tocar tres temas, queda afinado del todo: v0 (la lengua aislada) →
  **1.1**, v2 (el batua vale en todas partes) y v3 (batua / euskalkia /
  bizkaiera) → **1.3**. La s/z y «Epa!» se quedan en su propio 1.4.

Trece apuntes en total en el curso, todos comprobados por
`probar_ficha.js` contra los temas que existen.

## 2026-09-30 — La unidad 10, partida en tres: el curso pasa a 12 unidades

Ric: «es demasiado para una sola unidad de cierre». Medido, el problema
no era el tamaño —la 10 estaba en la media, la 4 es la mayor— sino que
**10.1 rompía el criterio del propio proyecto**, «un subnivel = una
idea»: tenía cinco fichas y cinco ideas, mientras que en presente cada
uno de esos tres verbos había tenido un tema entero para él solo.

- **10 · Atzo** — un tema por verbo en pasado (izan, ukan, egon), otro
  para comí/he comido/comía y otro para cuándo pasó.
- **11 · Bihar** — el futuro, los tres tiempos, comparar y los
  adjetivos que más se comparan.
- **12 · Dena batera** — la partícula al, los conectores, los
  indefinidos y el cierre del nivel.

**Tabla de los tres tiempos al final de cada verbo en pasado**
(presente · pasado · futuro, con el pasado en negrita), que es lo que
pedía Ric para consolidar. En la de *ukan* se cuenta que el futuro de
«tener» es *izango dut*: no existe *ukango*.

**Nadie pierde progreso**: los 45 grupos conservan su id, así que ni el
calendario de repaso ni las marcas de revisión se enteran. Solo cambian
de `subnivel` y de fichero. La app no necesitó cambios.

Nueve grupos nuevos (45 variantes) para los temas que quedaron flacos y
para los tests de la 10 y la 11, que no existían. `probar_test.js` cazó
que 12.3 (indefinidos) se había quedado con cero ejercicios.

Detalle y lo que queda pendiente en `docs/reestructuracion-12-unidades.md`.

## 2026-09-30 — El futuro sale de las fichas del pasado

Ric, viendo las fichas nuevas: «no pongas el futuro cuando explicas el
pasado, es mejor ir paso a paso… verlo al explicar el pasado, de la
nada, es extraño y añade ruido al proceso de aprendizaje». Y pide más
frases construidas, que es donde se ve la lógica.

Tiene razón en las dos cosas, así que la tabla se parte en dos sitios:

- En 10.1, 10.2 y 10.3 la tabla es ahora **presente · pasado**, sin
  tercera columna. Cada una con **cinco frases de ejemplo**, y la
  primera de cada grupo lleva los dos tiempos dentro de la misma frase
  —«Ni ikaslea nintzen, eta orain irakaslea naiz»— que es donde se ve
  que lo único que cambia es el auxiliar.
- La tabla de los tres tiempos pasa a **11.2**, al final del futuro, que
  es cuando ya has visto todo y reunirlo tiene sentido. Allí van los
  tres auxiliares enteros y la sorpresa del futuro de «tener»:
  *izango dut*, con el participio de *izan*.

Las frases aprovechan para colar de refilón cosas ya vistas: el
partitivo en negativa (*Guk ez genuen dirurik*), el objeto plural
(*Haiek bi seme zituzten*) y el inesivo (*etxean*, *lanean*).

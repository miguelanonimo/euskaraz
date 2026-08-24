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

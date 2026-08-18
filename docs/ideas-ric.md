# Ideas de Ric

Notas de revisión de la app (euskaraz.vercel.app), escritas mientras la uso.
Cada idea se comenta con Miguel antes de darla por decidida. Cuando una idea
se implemente o se descarte, se anota aquí para que quede el rastro.

Formato de cada entrada: fecha · qué he visto · qué propongo.

---

## Pendientes de comentar con Miguel

### Audios con pronunciación mal generada (para re-generarlos en tanda)

- **2026-08-18 · `hondartza` (unidad 9, "playa").** En el Diccionario, el
  audio la pronuncia "hondErtza", con E. Revisar también los otros dos
  audios de la unidad 9 que contienen la palabra, por si arrastran el
  mismo error: `unidades/u9/hondartzara-noa.mp3` («Hondartzara noa») y
  `unidades/u9/non-dago-hondartza.mp3` («Non dago hondartza?»).
  El archivo afectado principal es `unidades/u9/hondartza.mp3` (bucket
  `euskaraz-audio` de Supabase Storage); el generador está en
  `scripts/generar-audio/generar.mjs`.

- **2026-08-18 · `ahaztu` (unidad 11, "olvidar").** El audio la lee
  "aJaztu", con la H como jota castellana; la H es muda y debería sonar
  aproximadamente "aastu". Archivo: `unidades/u11/ahaztu.mp3` (compartido
  por las variantes batua y gernikés).

- **Posible patrón: la H entre vocales leída como jota.** Si la voz falla
  en `ahaztu`, conviene escuchar de una pasada todas las palabras del curso
  con H entre vocales antes de re-generar, y arreglarlas juntas. Candidatas
  encontradas en los datos: `ahizpa`, `astelehena`, `bihar`, `gehiago`,
  `hamahiru`, `lehen`, `leihoa`, `mahaia`, `nahi`, `ohea`, `zaharra` — y
  las frases narradas que las contienen (p. ej. «Anek ahizpa bat du»,
  «Bihar Bilbora joango naiz», «Kafea nahi al duzu?»).

### Audio en ejercicios: altavoz explícito en vez de auto-reproducir

- **2026-08-18 · Propuesta de Ric.** Que las palabras de los ejercicios NO
  reproduzcan audio automáticamente al tocarlas; en su lugar, que cada
  palabra lleve un iconito de altavoz para escucharla cuando uno quiera.
  **Ojo: esto revisa el último cambio de Miguel** (commit `39e5531`, «Audio
  también al tocar una palabra en "toca las parejas"») — comentarlo con él
  antes de tocarlo.
  - Dónde salta el audio solo hoy: `js/app.js` ~línea 1239 (al acertar en
    ejercicios de opción suena la respuesta) y ~línea 1330 (al tocar una
    carta en "toca las parejas").
  - El botón de altavoz que propone Ric ya existe como patrón en
    Vocabulario/Diccionario (`vitem__play`, `js/app.js` ~línea 216):
    se trataría de reutilizarlo en los ejercicios.

### Vocabulario general más rico que el de las unidades

- **2026-08-18 · Propuesta de Ric.** Que el Vocabulario no se limite a las
  palabras que aparecen en las unidades: al estudiar y repasar, ir
  descubriendo palabras nuevas. Cuestiones a decidir con Miguel:
  - **Dónde viven esas palabras extra.** Hoy todo el vocabulario sale de
    `data/unidades/*.json`; haría falta una fuente aparte (p. ej. un
    `data/vocabulario-extra.json` por temas o niveles) que el motor mezcle
    en el repaso y el diccionario.
  - **Cómo entran al repaso.** ¿Aparecen solas poco a poco (el sistema de
    repaso ya sabe dosificar lo nuevo), o hay que "desbloquearlas" por
    unidad/tema para no soltar palabras sin contexto?
  - **Nivel y criterio.** Mantener el criterio A1/HABE del brief y el
    esquema batua+bizkaiera (`registro`/`variantes`); cada palabra nueva
    necesita también su mp3 (el pipeline de TTS ya existe, así que es
    asumible).

### Home: colorear el porcentaje de cada unidad por tramos

- **2026-08-18 · Propuesta de Ric.** En las tarjetas de la home, colorear
  el texto de progreso («Completada · XX%») según la mejor puntuación:
  **rojo** hasta el 30%, **naranja** del 31% al 75%, **verde** del 76% al
  100%. Así se ve de un vistazo qué unidades van flojas.
  - **Matiz que destapa la idea:** hoy ese texto solo aparece cuando la
    unidad está completada (≥70% de aciertos, `js/app.js` ~líneas
    489-494 y 1593-1594); por debajo no se muestra porcentaje. Para que
    existan los tramos rojo/naranja habría que mostrar la mejor puntuación
    también en unidades intentadas pero no superadas (p. ej. «Mejor
    intento · 40%»), manteniendo «Completada» solo desde el umbral del 70%.
  - **Nota de diseño para Miguel:** la paleta actual es deliberadamente
    mínima (papel/tinta/rojo/verde, ver PROYECTO.md del original); el
    naranja sería color nuevo — aunque el badge de las tarjetas ya usa un
    ámbar para "empezada", que quizá sirva sin inventar otro tono.
  - Ojo con el tramo verde: la propuesta (76-100) no coincide con el
    umbral de completada (70). Decidir si se alinean (70) o se dejan
    distintos a propósito.

## Acordadas y en marcha

## Implementadas

## Descartadas (y por qué)

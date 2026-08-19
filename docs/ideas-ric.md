# Ideas de Ric

Notas de revisión de la app (euskaraz.vercel.app), escritas mientras la uso.
Cada idea se comenta con Miguel antes de darla por decidida. Cuando una idea
se implemente o se descarte, se anota aquí para que quede el rastro.

Formato de cada entrada: fecha · qué he visto · qué propongo.

---

## Pendientes de comentar con Miguel

### Audios con pronunciación mal generada (para re-generarlos en tanda)

Inventario ordenado por unidad. Todos los mp3 viven en el bucket
`euskaraz-audio` de Supabase Storage; el generador está en
`scripts/generar-audio/generar.mjs`. Los archivos son compartidos por las
variantes batua y gernikés. Detectados de oído por Ric el 18/08/2026.

| Unidad | Palabra | Archivo | Qué se oye | Qué debería oírse |
|---|---|---|---|---|
| 8 | `arazoa` ("el problema") | `unidades/u8/arazoa.mp3` | "aratxoa" | la z como s sibilante: "arasoa" |
| 8 | `hartu` ("coger/tomar") | `unidades/u8/hartu.mp3` | "harto", con O final | "hartu", con U |
| 8 | `jan` ("comer") | `unidades/u8/jan.mp3` | "Yan", con Y | J suave, como la H inglesa de "hat" |
| 9 | `hondartza` ("playa") | `unidades/u9/hondartza.mp3` | "hondErtza", con E | "hondartza", con A |
| 11 | `ahaztu` ("olvidar") | `unidades/u11/ahaztu.mp3` | "aJaztu", H como jota | H muda: "aastu" |

Frases narradas a revisar por arrastre (contienen palabras de la tabla):
`unidades/u9/hondartzara-noa.mp3` («Hondartzara noa»),
`unidades/u9/non-dago-hondartza.mp3` («Non dago hondartza?»), y todas las
que llevan `jan/jaten`: `unidades/u8/jaten-dut.mp3`,
`unidades/u8/nik-ogia-jaten-dut.mp3`,
`unidades/u8/zuk-ez-duzu-haragia-jaten.mp3`,
`unidades/u8/ez-ditut-haragia-eta-arraina-jaten.mp3` y
`unidades/u12/jaten-dut-jan-dut-jan-nuen.mp3`.

Nota sobre `jan`/`jaten dut`: la pronunciación de la J varía según la zona
(la "y" no es incorrecta en todos los dialectos), pero el criterio del
curso es el batua tal como se oye en Bilbao: una J suave, aspirada, como
la H inglesa de "hat" — ni la Y que hace la voz ahora, ni la jota fuerte
castellana. Es decisión de registro, no errata: así explicárselo a Miguel
si pregunta. Todas las frases con `jan/jaten` de la lista de arrastre
comparten este error (confirmado de oído en `jaten dut`).

- **Posible patrón: la H entre vocales leída como jota.** Si la voz falla
  en `ahaztu`, conviene escuchar de una pasada todas las palabras del curso
  con H entre vocales antes de re-generar, y arreglarlas juntas. Candidatas
  encontradas en los datos: `ahizpa`, `astelehena`, `bihar`, `gehiago`,
  `hamahiru`, `lehen`, `leihoa`, `mahaia`, `nahi`, `ohea`, `zaharra` — y
  las frases narradas que las contienen (p. ej. «Anek ahizpa bat du»,
  «Bihar Bilbora joango naiz», «Kafea nahi al duzu?»).

- **Posible patrón: la Z leída como "tx" (africada) en vez de s sibilante.**
  Si pasa en `arazoa`, escuchar de una pasada las demás palabras del curso
  con Z entre vocales: `azoka`, `bezain`, `bizikleta`, `duzu`, `erraza`,
  `ezagutu`, `gauza`, `goiza`, `hamazazpi`, `hemezortzi`, `izena`, `zaizu`,
  `zuzen` — y las frases narradas que las contienen.

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

- **2026-08-18 · Propuesta de Ric, refinada en conversación.** En las
  tarjetas de la home, mostrar y colorear la mejor puntuación de cada
  unidad por tramos, con una decisión deliberada: **los porcentajes bajos
  no se enseñan**, para no desanimar (misma filosofía del original: «una
  barra que retrocede desanima», «un cero no se pinta de rojo»).
  - **Por debajo de 50%:** sin número. La tarjeta queda como hoy, con su
    badge ámbar de "empezada". El tanteo inicial no se castiga.
  - **50-69%:** naranja, con número («Mejor intento · 62%»). Aquí el
    número significa "casi lo tienes" y sí motiva. Hoy este tramo no
    muestra nada (el porcentaje solo aparece al completar): habría que
    empezar a mostrarlo (`js/app.js` ~líneas 489-494 y 1593-1594).
  - **Desde 70%:** verde, «Completada · XX%» como hoy. Alineado con el
    umbral de completada existente (70%), sin crear franjas raras.
  - **El rojo no se usa en la home:** queda reservado para su significado
    actual (fallar una respuesta), no para estados permanentes.
  - Para el naranja quizá sirva el ámbar que ya usa el badge de
    "empezada", sin inventar un color nuevo. Decidir tonos con Miguel.

## Acordadas y en marcha

## Implementadas

## Descartadas (y por qué)

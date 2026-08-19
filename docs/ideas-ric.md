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
| 3 | `bihar` ("mañana") | `unidades/u3/bihar.mp3` | "bihan", la R final como N | una R clara |
| 3 | `galdera` ("pregunta") | `unidades/u3/galdera.mp3` | la D rara, casi como una Y | una D clara |
| 8 | `arazoa` ("el problema") | `unidades/u8/arazoa.mp3` | "aratxoa" | la z como s sibilante: "arasoa" |
| 8 | `arraina` ("el pescado") | `unidades/u8/arraina.mp3` | "araña", con R simple | "arraña": la RR fuerte, vibrante (el -in- palatalizado a ñ sí está bien) |
| 8 | `haragia` ("la carne") | `unidades/u8/haragia.mp3` | "arayia", la G como Y | "araguia": la G marcada (como en "agua") |
| 8 | `hartu` ("coger/tomar") | `unidades/u8/hartu.mp3` | "harto", con O final | "hartu", con U |
| 8 | `jan` ("comer") | `unidades/u8/jan.mp3` | "Yan", con Y | J suave, como la H inglesa de "hat" |
| 8 | `liburua` ("el libro") | `unidades/u8/liburua.mp3` | "libulua", la R como L | "liburua": la R suave debe sonar |
| 9 | `denda` ("tienda") | `unidades/u9/denda.mp3` | la segunda D suavizada | las dos D claras |
| 9 | `hondartza` ("playa") | `unidades/u9/hondartza.mp3` | "hondErtza", con E | "hondartza", con A |
| 11 | `ahaztu` ("olvidar") | `unidades/u11/ahaztu.mp3` | "aJaztu", H como jota | H muda: "aastu" |
| 11 | `berriro` ("de nuevo/otra vez") | `unidades/u11/berriro.mp3` | "berriDo", la R final como D | una R clara |
| 11 | `duela bi urte` ("hace dos años") | `unidades/u11/duela-bi-urte.mp3` | la R de `urte` suena rara, como una R inglesa (aproximante), ni castellana ni euskaldun | una R vibrante simple, breve |
| 11 | `zenuen` ("tenías/tuviste") | `unidades/u11/zenuen.mp3` | la Z como en español | la z como s sibilante |

`duela bi urte` arrastra también `unidades/u11/duela-bi-urte-ezagutu-nuen.mp3`
(«Duela bi urte ezagutu nuen»).

Ojo con `bihar`: hay **dos entradas de vocabulario duplicadas** con su
propio audio, una en la unidad 3 (`unidades/u3/bihar.mp3`) y otra en la 7
(`unidades/u7/bihar.mp3`) — comprobar si las dos fallan igual o si hace
falta corregir las dos por separado. Frases narradas afectadas:
`unidades/u1/bihar-arte.mp3` («bihar arte», hasta mañana),
`unidades/u7/bihar-bilbon-nago.mp3` («Bihar Bilbon nago»),
`unidades/u9/bihar-nator.mp3` («Bihar nator») y
`unidades/u12/bihar-bilbora-joango-naiz.mp3` («Bihar Bilbora joango naiz»).

Frases narradas a revisar por arrastre (contienen palabras de la tabla):
`unidades/u9/hondartzara-noa.mp3` («Hondartzara noa»),
`unidades/u9/non-dago-hondartza.mp3` («Non dago hondartza?»), y todas las
que llevan `jan/jaten`: `unidades/u8/jaten-dut.mp3`,
`unidades/u8/nik-ogia-jaten-dut.mp3`,
`unidades/u8/zuk-ez-duzu-haragia-jaten.mp3` (motivos: `jaten` y `haragia`),
`unidades/u8/ez-ditut-haragia-eta-arraina-jaten.mp3` (motivos: `jaten`,
`haragia` y `arraina`), `unidades/u12/jaten-dut-jan-dut-jan-nuen.mp3`, y
las que llevan `liburu`: `unidades/u8/liburua-irakurtzen-dut.mp3`,
`unidades/u8/liburuak-irakurtzen-ditugu.mp3`,
`unidades/u10/liburuak-gustatzen-zaizkit.mp3` y
`unidades/u11/non-zegoen-liburua.mp3`. Escuchar también
`unidades/u9/liburutegia.mp3` («biblioteca», misma raíz).

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
  encontradas en los datos: `ahizpa`, `astelehena`, `gehiago`,
  `hamahiru`, `lehen`, `leihoa`, `mahaia`, `nahi`, `ohea`, `zaharra` — y
  las frases narradas que las contienen (p. ej. «Anek ahizpa bat du»,
  «Bihar Bilbora joango naiz», «Kafea nahi al duzu?»).

- **La Z falla en algunas palabras, no en todas — no es un patrón fijo.**
  Confirmado con dos ejemplos (`arazoa` mal, `zenuen` mal), pero la
  pronunciación de la Z en el resto del curso es inconsistente: hay que
  escuchar palabra por palabra, no dar por mal todo lo que lleve Z.
  Pendientes de comprobar de oído (marcar aquí OK / MAL según se
  verifiquen): `azoka`, `bezain`, `bizikleta`, `duzu`, `erraza`,
  `ezagutu`, `gauza`, `goiza`, `hamazazpi`, `hemezortzi`, `izena`, `zaizu`,
  `zuzen`. La unidad 11 tiene más candidatas por el pasado (`zen-`, p. ej.
  `unidades/u11/zer-egin-zenuen.mp3`), pero también palabra por palabra.

### Errores de contenido en ejercicios (para el próximo lote de cambios)

- **2026-08-18 · Unidad 2, ejercicio de ordenar: falta "bonito/a" en el
  enunciado castellano.** `data/unidades/02-izenordainak.json:917`. El
  enunciado (`es`) dice «su amigo (de ella)», pero la frase en euskera a
  reconstruir (`eu`) es «haren lagun polita» — con `polita` (bonito/a), que
  no aparece por ningún lado en el castellano. Quien hace el ejercicio no
  tiene forma de saber que hay que colocar esa palabra. Comparar con el
  ejercicio hermano dos líneas antes (mismo archivo), que sí está bien:
  «nuestro pueblo bonito» → «gure herri polita». Corrección: el `es` de la
  917 debería decir algo como «su amigo bonito (de ella)» o similar.

- **2026-08-18 · Unidad 4, ejercicio "Me llamo Ane": la pista da la
  respuesta literal.** `data/unidades/04-izan.json:1069` (ejercicio de
  tipo `traducir`, «Me llamo Ane.» → escribirlo en euskera). El campo
  `pista` dice «Vale «Ane dut izena» o simplemente «Ane naiz»» — es decir,
  entrega las dos respuestas completas y correctas tal cual, no una ayuda.
  Contradice el propio criterio del proyecto (PROYECTO.md del original:
  las pistas están para dar una entrada, no la solución) y sobre todo el
  objetivo del ejercicio, que es de producción activa. Corrección: cambiar
  la pista por algo que oriente sin resolver — p. ej. avisar de que hay dos
  formas válidas y en qué se apoya cada una («izena» = sustantivo + "dut";
  o el verbo "izan"), sin escribir la frase entera.

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

### Filtro de vocabulario también en los repasos

- **2026-08-18 · Propuesta de Ric.** Poder filtrar el vocabulario en los
  repasos (como Miguel ya hizo en el Diccionario): elegir una categoría
  («Filtrar por:») y repasar solo esas palabras — p. ej. solo comida, solo
  verbos.
  - Lo que ya existe y se reutilizaría: cada palabra lleva `categoria`, y
    el Diccionario filtra con un desplegable (`js/app.js` ~líneas
    1055-1096, `index.html` ~líneas 210-213). Miguel además tiene una rama
    en curso sobre esto (`desarrollo/diccionario-filtros`) — coordinarse
    para no pisarse.
  - **Pregunta de diseño para Miguel:** el repaso actual no baraja todo el
    vocabulario, sino que pide al calendario de repaso espaciado qué toca
    hoy. ¿Un repaso filtrado respeta el calendario (solo lo vencido de esa
    categoría) o es práctica libre? Y ¿debe puntuar para el calendario o
    ser como los repasos actuales, que entrenan sin marcar unidades?

## Implementadas

## Descartadas (y por qué)

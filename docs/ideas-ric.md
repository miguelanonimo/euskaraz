# Ideas de Ric

Notas de revisión de la app (euskaraz.vercel.app), escritas mientras la uso.
Cada idea se comenta con Miguel antes de darla por decidida. Cuando una idea
se implemente o se descarte, se anota aquí para que quede el rastro.

Formato de cada entrada: fecha · qué he visto · qué propongo.

---

## Pendientes de comentar con Miguel

### Audios nuevos que hay que generar (no son fallos, son frases que cambiaron)

- **2026-08-23 · Unidad 10, dos frases de ejemplo corregidas de `diot` a
  `dio`** (ver más abajo el porqué). Como el nombre del mp3 es el slug de
  la frase, cambian de archivo y hacen falta dos audios nuevos:
  - `unidades/u10/aneri-esan-dio.mp3` — «Aneri esan dio.»
  - `unidades/u10/lagunari-lagundu-dio.mp3` — «Lagunari lagundu dio.»

  Los antiguos (`aneri-esan-diot.mp3`, `lagunari-lagundu-diot.mp3`) quedan
  sin usar y se pueden borrar del bucket. Hasta que se generen, esos dos
  ejemplos se quedan sin audio.

### Segunda ronda: audios regenerados por Miguel que siguen fallando

Miguel regeneró las 45 palabras del inventario original (commit
`eefafb4`, 20/08/2026) más el audio de `hi` por separado. Ric las está
revisando una por una en el Diccionario general de la app y verificando
las fechas de subida contra el bucket. Estas ya se comprobaron regeneradas
pero **siguen sonando mal, con un fallo distinto al original** —
necesitan otra vuelta. Revisado por Ric el 21/08/2026.

| Palabra | Qué se oye ahora | Qué debería oírse |
|---|---|---|
| `ez horregatik` | la RR ya suena bien, pero ahora "Ez horregadit": la T y la K finales no se oyen claras | T y K finales claras |
| `inor ez` | "inon es" | la I y la N se funden en Ñ ("iñor"), y la R clara: "iñor ez" |
| `iruditzen zait` | el `zait` suena como "set" | `zait` claro: "zaid" (za-it) |
| `joan` | sigue sonando "Yoan" (no mejoró) | J suave, como la H inglesa de "hat" — ojo, en «joan den astean» sí está bien pronunciado, es solo la palabra suelta la que falla |
| `logela` | "lojela", como en castellano | G fuerte, marcada (como "logue" en "LoGUEla") |
| `mahaia` | ahora suena "mayayaia" (se pasó al otro extremo) | H muda y dos A seguidas: "maaia" |
| `noren?` | "nolen" | R clara: "noren" |
| `zatoz` | la primera Z aún no es s sibilante clara | s sibilante clara, como "Satós" en castellano |

### Audios con pronunciación mal generada (para re-generarlos en tanda)

Inventario ordenado por unidad. Todos los mp3 viven en el bucket
`euskaraz-audio` de Supabase Storage; el generador está en
`scripts/generar-audio/generar.mjs`. Los archivos son compartidos por las
variantes batua y gernikés. Detectados de oído por Ric el 18/08/2026.

| Unidad | Palabra | Archivo | Qué se oye | Qué debería oírse |
|---|---|---|---|---|
| 1 | `ez horregatik` ("de nada") | `unidades/u1/ez-horregatik.mp3` | la RR no suena rodada/fuerte | RR vibrante múltiple, fuerte |
| 1 | `ikusi arte` ("hasta la vista") | `unidades/u1/ikusi-arte.mp3` | "ikusi alte", la R de `arte` como L | R simple clara |
| 2 | `gure` ("nuestro/a") | `unidades/u2/gure.mp3` | suena fatal, casi "bule" | "gure", con G y R claras |
| 2 | `haren` ("su/de él-ella") | `unidades/u2/haren.mp3` | suena "aen", se pierde la R simple | R clara: "haren" |
| 2 | `hi` ("tú", hitano) | `unidades/u2/hi.mp3` | "yi", la H como Y | H aspirada suave, no Y |
| 2 y 4 | `izena` ("nombre") | `unidades/u2/izena.mp3` y `unidades/u4/izena.mp3` (duplicado, ver nota `bihar`) | la Z rara, no s sibilante | s sibilante clara |
| 3 | `bihar` ("mañana") | `unidades/u3/bihar.mp3` | "bihan", la R final como N | una R clara |
| 3 | `galdera` ("pregunta") | `unidades/u3/galdera.mp3` | la D rara, casi como una Y | una D clara |
| 3 | `noren?` ("¿de quién?") | `unidades/u3/noren.mp3` | "nonen", la R como N | R clara: "noren" |
| 3 | `zergatik?` ("¿por qué?") | `unidades/u3/zergatik.mp3` | mal en general, suena "serbetic" | "zergatik" claro |
| 5 | `hemeretzi` ("diecinueve") | `unidades/u5/hemeretzi.mp3` | "hemeletzi", la R como L | R simple clara |
| 5 | `katua` ("el gato") | `unidades/u5/katua.mp3` | "kaduar", T como D, y una R añadida al final que no existe en la palabra | T clara; termina en "-tua", sin R |
| 5 | `sei` ("seis") | `unidades/u5/sei.mp3` | "xei", con X | S sibilante clara: "sei" |
| 5 | `txakurra` ("el perro") | `unidades/u5/txakurra.mp3` | RR suave, como en inglés | RR rodada, vibrante múltiple |
| 9 | `merkatua` ("el mercado") | `unidades/u9/merkatua.mp3` | por lo demás bien, pero R añadida al final (más suave que en `katua`, mismo fallo) | termina en "-tua", sin R |
| 6 | `han` ("allí") | `unidades/u6/han.mp3` | suena "en", la A no se oye | A clara: "han" |
| 7 | `Zer ordu da?` ("¿qué hora es?") | `unidades/u7/zer-ordu-da.mp3` | "ordo", la U no se oye | U clara: "ordu" |
| 6 | `logela` ("habitación/dormitorio") | `unidades/u6/logela.mp3` | G suave, se pierde | G fuerte, marcada: "loguela" |
| 6 | `mahaia` ("mesa") | `unidades/u6/mahaia.mp3` | la H suena | H muda: "maaia" |
| 8 | `arazoa` ("el problema") | `unidades/u8/arazoa.mp3` | "aratxoa" | la z como s sibilante: "arasoa" |
| 8 | `arraina` ("el pescado") | `unidades/u8/arraina.mp3` | "araña", con R simple | "arraña": la RR fuerte, vibrante (el -in- palatalizado a ñ sí está bien) |
| 8 | `haragia` ("la carne") | `unidades/u8/haragia.mp3` | "arayia", la G como Y | "araguia": la G marcada (como en "agua") |
| 8 | `hartu` ("coger/tomar") | `unidades/u8/hartu.mp3` | "harto", con O final | "hartu", con U |
| 8 | `jan` ("comer") | `unidades/u8/jan.mp3` | "Yan", con Y | J suave, como la H inglesa de "hat" |
| 8 | `liburua` ("el libro") | `unidades/u8/liburua.mp3` | "libulua", la R como L | "liburua": la R suave debe sonar |
| 8 | `saldu` ("vender") | `unidades/u8/saldu.mp3` | "salbo" | terminado claramente en "-du" |
| 9 | `denda` ("tienda") | `unidades/u9/denda.mp3` | la segunda D suavizada | las dos D claras |
| 9 | `ibili` ("andar/caminar") | `unidades/u9/ibili.mp3` | "ibii", la L no se oye | L audible: "ibili" |
| 9 | `zatoz` ("tú vienes") | `unidades/u9/zatoz.mp3` | las dos Z como Z española | ambas s sibilantes |
| 9 | `joan` ("ir") | `unidades/u9/joan.mp3` | "Yoan", como en catalán | J suave, como la H inglesa de "hat" (mismo caso que `jan`) |

**Corrección importante:** la J de `joan` NO falla siempre — la palabra
suelta (`unidades/u9/joan.mp3`) suena mal, pero la frase «joan den astean»
("la semana pasada", vocabulario de la unidad 11,
`unidades/u11/joan-den-astean.mp3`) SÍ suena bien. Mismo caso que la Z:
cada archivo se genera por separado y el resultado varía, aunque sea la
misma palabra — **no generalizar "toda J/Z falla", verificar cada audio
uno por uno.** (Ojo también con su frase hermana
`unidades/u11/joan-den-astean-bilbon-nengoen.mp3` — pendiente de
escuchar.)
| 10 | `guri` ("a nosotros") | `unidades/u10/guri.mp3` | suena "buri", G como B | "guri", con G clara |
| 10 | `iruditzen zait` ("me parece") | `unidades/u10/iruditzen-zait.mp3` | la T final de `zait` suena como K | T clara al final |
| 10 | `negua` ("invierno") | `unidades/u10/negua.mp3` | por lo demás bien, pero G muy suave, casi "nevua" | G clara: "negua" |
| 9 | `hondartza` ("playa") | `unidades/u9/hondartza.mp3` | "hondErtza", con E | "hondartza", con A |
| 11 | `ahaztu` ("olvidar") | `unidades/u11/ahaztu.mp3` | "aJaztu", H como jota | H muda: "aastu" |
| 11 | `berriro` ("de nuevo/otra vez") | `unidades/u11/berriro.mp3` | "berriDo", la R final como D | una R clara |
| 11 | `duela bi urte` ("hace dos años") | `unidades/u11/duela-bi-urte.mp3` | la R de `urte` suena rara, como una R inglesa (aproximante), ni castellana ni euskaldun | una R vibrante simple, breve |
| 12 | `erraza` ("fácil") | `unidades/u12/erraza.mp3` | "erratza", con africada | s sibilante: "errassa" |
| 12 | `hala ere` ("aun así") | `unidades/u12/hala-ere.mp3` | "hala ebe", la R como B | "hala ere", con R suave clara |
| 12 | `hobea` ("mejor") | `unidades/u12/hobea.mp3` | "hogea", B como G | B clara: "hobea" |
| 12 | `inor ez` ("nadie") | `unidades/u12/inor-ez.mp3` | la R de `inor` como L | R simple clara |
| 11 | `nintzen` ("yo era/estaba") | `unidades/u11/nintzen.mp3` | "niizen", desaparece el sonido `ntz` entero | `ntz` audible: "nintzen" |
| 11 | `zenuen` ("tenías/tuviste") | `unidades/u11/zenuen.mp3` | la Z como en español | la z como s sibilante |

`zatoz` arrastra `unidades/u9/nondik-zatoz.mp3` («Nondik zatoz?») y
`unidades/u9/hona-zatoz.mp3` («Hona zatoz?»).

`zergatik?` arrastra `unidades/u3/zergatik-ez.mp3` («Zergatik ez?»).

`duela bi urte` arrastra también `unidades/u11/duela-bi-urte-ezagutu-nuen.mp3`
(«Duela bi urte ezagutu nuen»). `gure` arrastra
`unidades/u2/gure-etxe-txikia.mp3` («gure etxe txikia»). `iruditzen zait`
arrastra `unidades/u10/ondo-iruditzen-zait.mp3` («Ondo iruditzen zait»).
`izena` arrastra `unidades/u2/nire-izena.mp3` («nire izena»),
`unidades/u3/nola-duzu-izena.mp3` y `unidades/u4/nola-duzu-izena.mp3`
(«Nola duzu izena?», duplicada en dos unidades) y
`unidades/u4/mikel-dut-izena.mp3` («Mikel dut izena»). `logela` arrastra
`unidades/u6/logela-txikia.mp3` («logela txikia»).

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

`nintzen` arrastra tres frases: `unidades/u11/ni-bilbon-jaio-nintzen.mp3`
(«Ni Bilbon jaio nintzen»),
`unidades/u11/atzo-bilbora-joan-nintzen.mp3` («Atzo Bilbora joan nintzen»)
y `unidades/u11/txikitan-bilbon-bizi-nintzen.mp3`
(«Txikitan Bilbon bizi nintzen»).

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
  `hamahiru`, `lehen`, `leihoa`, `nahi`, `ohea`, `zaharra` — y
  las frases narradas que las contienen (p. ej. «Anek ahizpa bat du»,
  «Bihar Bilbora joango naiz», «Kafea nahi al duzu?»).

- **La Z falla en algunas palabras, no en todas — no es un patrón fijo.**
  Confirmado con dos ejemplos (`arazoa` mal, `zenuen` mal), pero la
  pronunciación de la Z en el resto del curso es inconsistente: hay que
  escuchar palabra por palabra, no dar por mal todo lo que lleve Z.
  Pendientes de comprobar de oído (marcar aquí OK / MAL según se
  verifiquen): `azoka`, `bezain`, `bizikleta`, `duzu`,
  `ezagutu`, `gauza`, `goiza`, `hamazazpi`, `hemezortzi`, `zaizu`,
  `zuzen`. La unidad 11 tiene más candidatas por el pasado (`zen-`, p. ej.
  `unidades/u11/zer-egin-zenuen.mp3`), pero también palabra por palabra.

### Investigación: por qué falla la pronunciación, y qué opciones hay para arreglarla

- **2026-08-18 · Investigado por Claude a petición de Ric**, mientras Ric
  seguía escuchando audios. Fuentes oficiales de Google, consultadas hoy:
  [Gemini TTS — Cloud docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts),
  [Voces disponibles](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types),
  [SSML — Cloud docs](https://docs.cloud.google.com/text-to-speech/docs/ssml).

  **Diagnóstico — por qué falla:** el proyecto NO usa el "Cloud TTS
  clásico" (voces WaveNet/Neural2 con SSML) que describe `docs/brief.md`
  secciones 2 y 6. `scripts/generar-audio/generar.mjs` usa en realidad
  **Gemini TTS** (`gemini-2.5-flash-tts`, voz "Kore"), un modelo generativo
  más nuevo, controlado por un *prompt* en lenguaje natural (hoy: "Say
  this Basque phrase at a natural, normal conversational pace..."), no por
  marcado fonético. Y el dato clave: **el euskera (`eu-ES`) está listado
  oficialmente en fase "Preview" dentro de Gemini TTS**, no en
  disponibilidad general — de los 66 idiomas que soporta, es de los 42
  todavía en rodaje. Eso cuadra con lo que Ric está encontrando: falla
  bastante y de forma inconsistente (la propia Z, por ejemplo, no falla
  siempre igual), típico de un idioma con soporte inmaduro en un modelo
  generativo, no de una regla mal aplicada.

  **Documentado — el marcado fonético SSML no existe en Gemini TTS.** Los
  controles de Gemini TTS son solo de estilo/ritmo, sin evidencia de
  soporte para SSML de precisión ni etiquetas fonéticas. El Cloud TTS
  clásico sí tiene la etiqueta `<phoneme>` (con alfabeto IPA o X-SAMPA,
  para forzar la pronunciación exacta de una palabra) y `<sub alias="...">`
  (sustituir el texto por otro que se lea mejor) — pero **para euskera
  clásico solo existe una voz, `eu-ES-Standard-B`**, de nivel básico (sin
  WaveNet ni Neural2), y no hay confirmación de que el `<phoneme>` esté
  soportado específicamente para euskera (la documentación dice que varía
  por idioma, sin listar cuáles).

  **Tres caminos posibles, para elegir con Miguel:**

  1. **Probar la voz clásica `eu-ES-Standard-B` con `<phoneme>`/`<sub>`
     solo en las palabras de esta lista.** Control fonético preciso y
     barato de aplicar si funciona, pero es una voz más robótica (nivel
     "Standard", el más básico de Google) y no está confirmado que el
     `<phoneme>` funcione bien para euskera — habría que probarlo con 2-3
     palabras de la lista antes de comprometerse.
  2. **Seguir con Gemini TTS pero "trucar" el texto que se envía a
     sintetizar**, sin tocar lo que ve el usuario: escribir la palabra de
     forma distinta solo para el audio (p. ej. una respelling que fuerce
     la RR, o repetir la consonante) hasta que suene bien, y quedarse con
     esa versión. Barato de iterar con el pipeline que ya existe
     (`generar.mjs`), sin aprender una tecnología nueva — pero es prueba y
     error, no una garantía.
  3. **Regenerar varias veces y quedarse con la mejor toma.** Un modelo
     generativo no da siempre el mismo resultado con el mismo texto; puede
     que simplemente generando `hartu.mp3` tres o cuatro veces salga una
     tirada donde la U final se oiga bien. El más barato de probar ya
     mismo, sin cambiar nada del código.

  **Recomendación para plantear a Miguel:** empezar por la opción 3
  (gratis, sin decisiones de arquitectura) en las ~16 palabras de esta
  lista; si algunas siguen fallando tras varios intentos, pasar a la 2
  (respelling) antes que a la 1, porque cambiar de voz afecta a *todo* el
  curso (720 variantes, no solo las palabras sueltas) y hoy no hay
  garantía de que la voz Standard suene mejor en conjunto, solo de que
  tiene un mecanismo de control más preciso.

  **Bloqueado para probar: falta acceso al proyecto de Google Cloud.**
  Ric quiso probar la opción 3 (regenerar `hartu.mp3` varias veces y
  comparar) el 18/08/2026, pero el script (`generar.mjs`) usa credenciales
  de Google Cloud (Application Default Credentials) contra un proyecto que
  es de Miguel (`PROJECT_ID` fijo en el script, factura a su cuenta según
  `docs/brief.md`). **Pendiente de pedir a Miguel:** o bien que añada a
  Ric como colaborador (IAM) en ese proyecto de GCP con permiso para la
  API de Text-to-Speech, o que le pase temporalmente las credenciales.
  Sin esto, ninguna de las tres opciones se puede probar de forma
  independiente.

- **`katua` tiene un tipo de fallo distinto: añade un sonido que no
  existe** — se oye una R al final de la palabra, no una letra mal dicha
  sino una de más. Corregido tras aclaración de Ric (no es un
  ruido/artefacto de audio, es un sonido añadido concreto). Vigilar si
  este mismo tipo de fallo (sonido extra al final, no solo cambiado)
  aparece en otras palabras.

- **Confirmado el mismo fallo en `merkatua`**, la palabra emparentada de
  `katua` que quedó pendiente: R añadida al final en ambas (más suave en
  `merkatua`). Parece un patrón real ligado a la terminación `-tua`, no
  una casualidad — si aparecen más palabras con esa terminación al
  revisar, comprobarlas también.

### Errores de contenido en ejercicios (para el próximo lote de cambios)

- **2026-08-20 · Unidad 9, dos ejercicios de opción con enunciado
  ambiguo: "a la izquierda" / "a la derecha".**
  `data/unidades/09-nora.json:1071` («a la derecha») y
  `:1084` («a la izquierda»). Cada uno da por única respuesta correcta la
  forma de movimiento (`eskuinera`/`ezkerrera`, "hacia la derecha/hacia la
  izquierda"), pero entre las opciones también está la forma de ubicación
  (`eskuinean`/`ezkerrean`, "en la derecha/en la izquierda") — y las dos
  se traducen al castellano exactamente igual, "a la derecha"/"a la
  izquierda", así que con el enunciado tal cual las dos son defendibles.
  La propia ficha de gramática de la unidad (línea 349) ya explica la
  diferencia (el sufijo `-ra` es el que marca movimiento) pero el
  ejercicio no la aprovecha. Corrección propuesta por Ric: reescribir el
  enunciado para que quede claro que se pide la forma de movimiento —
  algo como «Cuando das una indicación y dices que hay que girar a la
  izquierda, se dice ____» (y su pareja con "derecha"/"girar a la
  derecha").

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

- **2026-08-22 · Repaso de vocabulario: pregunta "tarde" ambigua entre
  adverbio y sustantivo.** `data/unidades/07-ordua.json:235` (`berandu` →
  `es: "tarde"`, adverbio de llegar tarde) y `data/unidades/07-ordua.json:129`
  (`arratsaldea` → `es: "la tarde"`, sustantivo del momento del día).
  Duplicado también en `data/unidades-gernikes/07-ordua.json` (mismas
  líneas) y `berandu` reaparece en `data/unidades/08-egiten.json:144` /
  `data/unidades-gernikes/08-egiten.json:144`. En castellano las dos
  palabras coinciden («tarde»), y en el repaso de vocabulario la pregunta
  se muestra sin más contexto, así que no hay forma de saber cuál de las
  dos se pide. `berandu` ya lleva una `nota` que distingue de
  `arratsaldea` (en la versión de u7, no en la de u8), pero no está claro
  que el repaso la muestre. **Criterio general a aplicar:** cuando una
  palabra en castellano tiene un sinónimo/homónimo entre las palabras del
  curso, aclarar debajo de la pregunta a qué acepción se refiere (p. ej.
  «tarde (llegar tarde)» vs. «tarde (momento del día)»), no dejar la
  palabra sola. Revisar si hay más pares así en el resto del vocabulario.

- **2026-08-23 · Unidad 10: se enseñaba `dio` pero se pedía `diot`, una
  forma nunca explicada. CORREGIDO en esta rama.** La tabla de gramática
  («A quién: la -(r)i de los nombres») enseña seis formas del auxiliar de
  dar/decir — `dit, dizu, dio, digu, dizue, die` — todas con **sujeto de
  tercera persona** (es él/ella quien da): lo único que varía en la tabla
  es el destinatario. Pero la unidad usaba `diot` («yo se lo a él/ella»,
  con la `-t` de sujeto «yo»), que combina un cambio de sujeto que no se
  explica en ningún sitio: lo comprobé en las 12 unidades y no aparece
  antes ni después. Y no era un desliz aislado: estaba en la nota de
  vocabulario de `lagundu`, en el ejemplo del cuerpo, en dos frases de
  ejemplo con audio, en un ejercicio de ordenar y **en dos ejercicios de
  opción múltiple que lo daban como respuesta correcta** («Yo, a ella →
  diot»), o sea que acumulabas fallos por una forma que el curso nunca
  te había enseñado.
  - **Por qué no se añade al temario:** el paradigma completo
    NOR-NORI-NORK (auxiliar variando a la vez por sujeto, objeto y
    destinatario) es contenido de A2/B1, muy por encima del A1/HABE que
    fija `docs/brief.md`. La propia sección ya lo trataba como
    reconocimiento pasivo («No hace falta que lo domines hoy. Basta con
    reconocerlo cuando lo oigas»), así que meter el eje del sujeto sería
    justo la sobrecarga que esa frase intenta evitar.
  - **Qué se hizo:** pasar todo a `dio`, la forma que sí está en la tabla,
    ajustando el castellano («Se lo he dicho» → «Se lo ha dicho») y el
    sujeto del ejercicio de ordenar (`Nik` → `Hark`, que sí se enseña en
    la unidad 5). Los ejemplos siguen cumpliendo su función original, que
    era mostrar `-ri` con nombres propios (*Aneri*), sin introducir nada
    nuevo.
  - **Dato que confirma que `dio` era lo correcto:** la sección dialectal
    de esa misma unidad ya decía «<b>Esan deutso.</b> — Se lo ha dicho.
    (batua: esan dio)» — la parte de bizkaiera ya usaba la forma de
    tercera persona, y era el batua el que se desviaba.
  - Pendiente para Miguel: generar los dos audios nuevos (ver la sección
    «Audios nuevos que hay que generar» al principio del documento).

### La forma de la respuesta no debe delatarla en las opciones múltiples

- **2026-08-23 · Detectado por Ric repasando vocabulario. CORREGIDO el
  generador; los ejercicios escritos a mano, a medias.** Cuando la
  respuesta correcta es una pregunta o una frase y las otras tres son
  sustantivos sueltos, se acierta sin saber la palabra, solo por la
  silueta.
  - **El repaso de vocabulario (generado por código): arreglado.**
    `preguntaOpcion` en `js/app.js` rellenaba con palabras al azar del
    fondo y su único filtro era «que no signifiquen lo mismo que la
    respuesta»; no miraba la forma. Ejemplo real: «Zer ordu da?» salía
    contra «el mediodía», «el día» y «temprano» — la única con signo de
    interrogación era la buena. Ahora los candidatos se agrupan por forma
    (pregunta / frase de varias palabras / palabra suelta) y se prefieren
    los de la misma, sin perder dentro de cada grupo la preferencia por
    la misma unidad. Medido sobre el vocabulario real del curso (686
    preguntas posibles, las 12 unidades abiertas): **antes la forma
    delataba la respuesta en 73 casos (10,6%), ahora en 0**. Si el fondo
    abierto no da ninguno de la misma forma —al principio del curso, o en
    unidades como la 7 que tiene una sola pregunta entre 33 palabras— se
    rellena como antes: mejor una opción de otra forma que quedarse sin
    pregunta.
  - **Ejercicios escritos a mano: corregidos 6 de 40.** Los arreglados
    son los de vocabulario, donde bastaba cambiar un distractor por otro
    del mismo curso: u1 «Son las 11 de la noche» (`Eskerrik asko` →
    `Mesedez`, para que `Gabon` no fuera la única de una palabra; se
    descartó `Agur` porque «adiós» al cruzarte con alguien es defendible
    y un distractor no debe poder discutirse), u1 «¿Cómo
    devuelves la pregunta?» (`Zer moduz` → `Zer moduz?`, que además es
    como está en el vocabulario), u2 «¿Qué significa nirekin?» (`Para mí`
    → `Mío`, que encima se confunde de verdad con `nire`), u3 «Quieres
    que te repitan algo» (`Bai` → `Noiz?`), u3 «Eres de Bilbao pero hoy
    vienes de Gernika» (`Bilbora naiz`, que era agramatical, → la frase
    inversa `Gernikakoa naiz eta Bilbotik nator`: misma longitud y obliga
    a entenderla de verdad) y u11 «La semana pasada» (el hueco partía la
    respuesta en `____ astean`; ahora el hueco es entero y las opciones
    son las expresiones completas de la unidad).

- **PENDIENTE DE DECIDIR: quedan 34 ejercicios donde la correcta es la
  más larga.** De ellos **30 son preguntas de concepto**, en las que la
  respuesta buena es larga porque *explica* algo y los distractores son
  cortos y a menudo de broma. Ejemplo (u2): «¿Por qué en euskera se omite
  el pronombre sujeto a menudo?» → ✔ «Porque el verbo ya dice quién es»
  frente a «Por pereza», «Porque está prohibido», «Solo se omite por
  escrito». Se acierta eligiendo la larga.
  - Están repartidos así (en batua; se duplican en gernikés): u2 con 13,
    u6 con 6, u3 con 5, u4 con 4, u1 y u5 con 2, u7 y u12 con 1.
  - **No los he tocado** porque arreglarlos no es cambiar un distractor:
    hay que reescribir los tres falsos para que sean explicaciones igual
    de largas y creíbles. Son 30 × 2 archivos, es trabajo de contenido y
    con riesgo de meter errores. Decidir con Miguel si merece la pena, y
    si se hace, en qué unidades primero (la 2 sola se lleva un tercio).

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
  - **Nivel y criterio.** Mantener el criterio A1/HABE del brief y el
    esquema batua+bizkaiera (`registro`/`variantes`); cada palabra nueva
    necesita también su mp3 (el pipeline de TTS ya existe, así que es
    asumible).

  **2026-08-20 · Diseño concretado por Ric — dos vías separadas para la
  misma palabra:**
  - **Diccionario general: siempre visible desde el primer día**, sin
    desbloqueo. Estas palabras extra no pertenecen a ninguna unidad, así
    que no tiene sentido ocultarlas — están ahí para consulta libre igual
    que el resto.
  - **Repaso de vocabulario: entran poco a poco, ligadas al avance por
    las unidades.** Según se van completando ejercicios/unidades, se van
    sumando palabras del banco extra a la cola que dosifica el sistema de
    repaso espaciado ya existente — el mismo mecanismo que ya dosifica el
    vocabulario normal, solo que alimentado también por este banco
    aparte. (Concretado el 20/08: si cada palabra extra queda ligada a un
    tema/unidad —ver más abajo—, lo natural es que entre al repaso cuando
    se completa esa unidad en concreto, no por avance genérico del curso.)
  - Implica que el motor necesita distinguir "visible en diccionario" de
    "activo para repaso": hoy esas dos cosas van siempre juntas (una
    palabra en `data/unidades/*.json` es ambas a la vez). Es el cambio de
    diseño real que pide esta idea.

  **2026-08-20 · Criterio de qué palabras añadir, propuesto por Ric:
  completar los campos temáticos que cada unidad ya abre, no meter
  vocabulario suelto.** Cada unidad toca un tema pero con el vocabulario
  justo para sus ejercicios, y se queda corto frente al uso real. Ejemplo
  del propio Ric: la familia trae hermano/a, padres, hijos... pero no
  novio/a, esposo/a, abuelos. Lo mismo con animales o con comida/bebida:
  aprovechar el tema ya abierto para sumar el vocabulario común que falta,
  no palabras nuevas sin relación.
  - **Dato al revisar el curso:** la `categoria` que ya usa el filtro del
    Diccionario de Miguel es gramatical (`sustantivo`/`verbo`/`adjetivo`/
    `otros`), no temática — no existe hoy ningún campo tipo "familia" o
    "comida" que agrupe por tema. Para que esta idea funcione hace falta
    un campo nuevo (`tema`, o reutilizar/cruzar con el filtro que Miguel
    tiene en marcha en `desarrollo/diccionario-filtros`, a comprobar con
    él qué tiene pensado ahí antes de duplicar trabajo).
  - Con esto, el vocabulario extra no es una lista suelta: cada palabra
    extra queda ligada al tema (y por tanto a la unidad) del que amplía,
    lo que también responde a la pregunta pendiente de cómo dosificarla
    en el repaso (entra cuando se supera esa unidad/tema, no de forma
    genérica por avance total).

### Lista concreta de vocabulario a añadir (2026-08-20, revisada con Ric)

> ✅ **VERIFICADO CONTRA EUSKALTZAINDIA (20/08/2026).** Las palabras de
> esta lista se han contrastado **una a una** contra el Hiztegi Batua de
> Euskaltzaindia (consulta automatizada al buscador oficial,
> `euskaltzaindia.eus/hiztegibatua`). Resultado: **114 de 118
> confirmadas** como lema con su categoría gramatical y definición.
> Miguel no necesita repetir esta verificación.
>
> **Las 4 que no salieron limpias, revisadas a mano:**
> - `eta` — falso negativo del script (la búsqueda la sepultaba bajo
>   decenas de compuestos). **Existe** como `eta1`, categoría
>   *juntagailua*. ✓
> - `iloba` — **confirmadas las dos acepciones**: «Senide baten semea edo
>   alaba» (sobrino/a) y «Biloba, seme-alaben semea edo alaba»
>   (nieto/a). ✓
> - `mutil-lagun` / `neska-lagun` — existen, pero como **azpisarrera**
>   (subentrada) de `lagun`, y con una definición más amplia que
>   «novio/a»: «Jolasean, lanean edo kidekoetan aritzen den pertsona».
>   Pendiente de criterio nativo (pregunta A abajo).
> - `aitite` — **0 resultados**, no está en el diccionario normativo. En
>   cambio **`amama` sí está** (definida como «Amona»). Asimetría rara,
>   pendiente de criterio nativo (pregunta B abajo).
>
> **Dos sorpresas del diccionario:**
> - `olentzero` no se define como el personaje, sino como **«Gabon
>   eguna»** (el día de Nochebuena).
> - `gabon` viene marcada **«Heg.»** (uso de Hegoaldea, la parte
>   peninsular).
>
> ⚠️ **Lo que esta verificación NO cubre: las frases de ejemplo.** El
> diccionario valida palabras, no gramática de frases. Las 28 frases de
> ejemplo escritas para el vocabulario nuevo siguen **sin verificar** y
> las está revisando un hablante nativo (documento de revisión preparado
> el 20/08). Hasta que vuelvan, no darlas por buenas.

**Huecos estructurales encontrados al revisar (no estaban en la lista
original de Ric, salieron al comparar fichas contra vocabulario):**

1. **No hay meses en todo el curso.** La unidad 7 enseña días de la
   semana, partes del día y ayer/hoy/mañana, pero ningún mes. Es
   vocabulario A1 básico.
2. **Los números se cortan en 20, pero la ficha explica más.** La ficha
   "El sistema es de base veinte" (u5) ya menciona `berrogei`,
   `hirurogei`, `laurogei` — pero esas palabras **no están en el
   vocabulario**, así que no tienen audio ni salen en diccionario ni en
   repaso. Se explica algo que luego no se puede practicar.
3. **Faltan `eta` (y) y `edo` (o) como vocabulario** — detectado por Ric.
   Peor aún: la ficha "Enlazar frases" (u12) dice literalmente *"Los que
   ya tienes: eta (y), baina (pero), edo (o), ere (también)"*, dando por
   enseñadas dos palabras que nunca se añadieron al vocabulario. Mismo
   fallo estructural que el punto 2.
4. **No hay ropa en todo el curso.** Encaja en la u8, que ya tiene
   `erosi` (comprar) y `denda` (tienda).

*Nota metodológica: se intentó buscar más casos de este tipo con un
script (palabras en `<b>` de fichas que no están en vocabulario), pero da
demasiados falsos positivos —tablas de conjugación, contrastes de
bizkaiera, sufijos, formas declinadas de demostración— para ser fiable.
Los cuatro casos de arriba salieron de leer con criterio, no del script.*

#### Unidad 2 — conectores básicos

`eta` (y) · `edo` (o)

#### Unidad 5 — familia, animales y números

**Familia** (hoy solo hay hermanos, padres e hijos):
`mutil-laguna` novio · `neska-laguna` novia · `senarra` marido/esposo ·
`emaztea` mujer/esposa · `aitona` abuelo ⚠️(en Bizkaia se usa mucho
`aitite`) · `amona` abuela ⚠️(`amama`) · `osaba` tío · `izeba` tía ·
`lehengusua` primo · `lehengusina` prima · `iloba` sobrino/a **y también**
nieto/a · `biloba` nieto/a (esta sí inequívoca)
⚠️ *Ampliado tras la consulta nativa del 20/08 — ver sección de revisión:*
formas de bizkaiera a incluir con `registro: bizkaiera` →
`loba` (= `iloba`, recogida en el diccionario como bizkaiera),
`aitite` y `aitxitxe` (abuelo), `amuma` y `amama` (abuela).
De esas cinco solo `loba` y `amama` tienen respaldo normativo; las otras
tres son habla real sin entrada en el Hiztegi Batua.

**Animales** (hoy solo perro y gato):
`txoria` pájaro · `zaldia` caballo · `behia` vaca · `ardia` oveja ·
`txerria` cerdo · `oiloa` gallina · `untxia` conejo · `sagua` ratón

**Números por encima de 20** (ver hueco 2):
`hogeita hamar` 30 · `berrogei` 40 · `berrogeita hamar` 50 ·
`hirurogei` 60 · `hirurogeita hamar` 70 · `laurogei` 80 ·
`laurogeita hamar` 90 · `ehun` 100 · `mila` 1000

#### Unidad 6 — colores y casa

**Colores** — *decidido con Ric el 20/08: van a la u6, no a la u2, porque
es donde vive la ficha "Adjetivos: detrás, y con el artículo al final".
Hay que retocar esa ficha y añadir ejercicios con colores.*
`gorria` rojo · `urdina` azul · `horia` amarillo · `berdea` verde ·
`zuria` blanco · `beltza` negro · `grisa` gris · `marroia` marrón ·
`arrosa` rosa · `morea` morado
⚠️ `laranja` sirve para la fruta y para el color naranja — no es error,
es así en euskera, pero conviene decirlo en la ficha.
Frases de ejemplo del estilo que pedía Ric (⚠️ verificar): «etxe gorria»
(la casa roja), «gure herri zuria» (nuestro pueblo blanco). **Ojo:
`nire` = mi, `gure` = nuestro** — en el ejemplo original de Ric se
tradujo `nire herri zuria` como "nuestro pueblo blanco" y es "mi".

**Casa** (hoy hay dormitorio, cocina, baño, puerta, ventana, mesa, silla,
cama — faltan habitaciones y muebles comunes):
`egongela` salón · `jangela` comedor · `bainugela` cuarto de baño ·
`sarrera` entrada · `eskailerak` escaleras · `igogailua` ascensor ·
`balkoia` balcón · `lorategia` jardín · `garajea` garaje ·
`armairua` armario · `sofa` sofá · `telebista` televisión ·
`hozkailua` nevera · `dutxa` ducha · `ispilua` espejo · `argia` luz ·
`horma` pared · `teilatua` tejado

#### Unidad 7 — meses (ver hueco 1)

`urtarrila` enero · `otsaila` febrero · `martxoa` marzo · `apirila` abril ·
`maiatza` mayo · `ekaina` junio · `uztaila` julio · `abuztua` agosto ·
`iraila` septiembre · `urria` octubre · `azaroa` noviembre ·
`abendua` diciembre · `hilabetea` el mes

#### Unidad 8 — comida y ropa

**Comida y bebida:**
`laranja` naranja · `platanoa` plátano · `mahatsa` uva · `madaria` pera ·
`marrubia` fresa · `patata` patata · `tomatea` tomate · `tipula` cebolla ·
`letxuga` lechuga · `gazta` queso · `oilaskoa` pollo · `arroza` arroz ·
`zukua` zumo · `gatza` sal · `azukrea` azúcar

**Ropa** (ver hueco 4):
`arropa` ropa · `alkandora` camisa · `prakak` pantalones ·
`zapatak` zapatos · `jertsea` jersey · `jaka` chaqueta · `gona` falda ·
`soinekoa` vestido · `txapela` boina · `betaurrekoak` gafas
✅ *Confirmada como vigente por los nativos (20/08), y con familia
léxica que merece ficha propia:* `txapelduna` campeón/a ·
`txapelketa` campeonato — los dos salen de `txapela`, porque al ganador
se le entrega una.

#### Unidad 10 — cuerpo, estaciones, tiempo y fiestas

**Partes del cuerpo** — *idea de Ric: entran de forma natural con los
gustos, que la unidad ya enseña en plural (`gustatzen zaizkit`): «zure
begiak gustatzen zaizkit» (⚠️ verificar la frase).*
`burua` cabeza · `begia`/`begiak` ojo/ojos · `sudurra` nariz ·
`ahoa` boca · `belarria` oreja · `eskua` mano · `besoa` brazo ·
`hanka` pierna · `oina` pie · `ilea` pelo · `bihotza` corazón

**Estaciones** (la unidad ya tiene `negua` y `uda`):
`udaberria` primavera · `udazkena` otoño

**Tiempo atmosférico** (ya hay `euria` y `eguzkia`):
`eguraldia` el tiempo · `elurra` nieve · `haizea` viento · `hotza` frío ·
`beroa` calor · `hodeia` nube

**Fiestas y celebraciones:**
`Gabonak` Navidad · `Urte Berri` Año Nuevo · `Olentzero` ⚠️(personaje
navideño vasco, muy cultural — decidir si entra como vocabulario o como
nota cultural) · `Aste Santua` Semana Santa · `Inauteriak` carnaval ·
`urtebetetzea` cumpleaños · `jaieguna` día festivo
⚠️ **Detalle a explicar:** `Gabonak` (Navidad) es el plural de `gabon`,
que la u1 ya enseña como "buenas noches". Sin nota, confunde.

**Volumen total: ~115 palabras nuevas**, casi un tercio más de las 340
que tiene hoy el curso. Conviene decidir con Miguel si entran todas de
golpe o por tandas (p. ej. primero los huecos estructurales —meses,
números, eta/edo— que son los más sangrantes, y luego los temáticos).

### Cómo introducir el vocabulario nuevo: sub-unidades (decidido 20/08)

- **2026-08-20 · Propuesta de Ric, con recomendación de Claude.** En vez
  de que las palabras nuevas aparezcan flotando en el repaso, crear
  **sub-unidades**: después de la unidad 5 viene la 5.1, que es su
  ampliación de vocabulario — con sus palabras, sus explicaciones tipo
  ficha de gramática, y sus propios ejercicios. **Las palabras solo entran
  al repaso general al aprobar la sub-unidad.**

  **Por qué esta opción y no el repaso dosificado:** hay palabras que
  necesitan explicación, y una tarjeta de repaso no tiene dónde ponerla.
  Casos concretos salidos de la verificación con Euskaltzaindia:
  `iloba` (sobrino **y** nieto), `Gabonak` (Navidad) contra el `gabon`
  (buenas noches) que ya enseña la u1, `laranja` (la fruta y el color),
  los números vigesimales (`berrogei` = «dos veintes»), y las formas
  vizcaínas `aitite`/`amama`. Todo eso cabe en una ficha, no en una
  tarjeta.

  Además encaja con la decisión de diseño ya tomada («el contenido vive
  en JSON y el código no se toca para añadir temario»): una sub-unidad es
  estructuralmente una unidad más, y el motor ya sabe hacer
  gramática → vocabulario → ejercicios → 70% → completada → alimenta el
  calendario.

  **Coste real, medido:** cada unidad de hoy tiene exactamente **12
  grupos × 5 variantes = 60 variantes**, sin excepción (144 grupos y 720
  variantes en total). Si las sub-unidades copiaran esa convención serían
  300 variantes nuevas. **Recomendación: hacerlas más ligeras, 5-6 grupos
  en vez de 12.** Los 5 variantes por grupo hay que mantenerlos (el motor
  los usa para no repetir la ronda anterior, vía `progreso.ultimas`), pero
  el número de grupos no tiene por qué igualar al de una unidad completa.
  Una sub-unidad es un apéndice, no un capítulo.

  **Serían 5 sub-unidades, no 12** — solo cinco unidades reciben
  suficiente vocabulario nuevo:
  `5.1` familia, animales y números · `6.1` colores y casa ·
  `7.1` los meses · `8.1` comida y ropa · `10.1` cuerpo, tiempo y fiestas.
  La unidad 2 solo recibe `eta` y `edo`, dos palabras que no necesitan
  explicación: van directas a su vocabulario, sin sub-unidad.

  **Consecuencia que simplifica:** esta opción **hace innecesaria la
  pantalla de "vocabulario nuevo"** de la sección siguiente. No son
  complementarias, son dos soluciones al mismo problema — si la palabra
  se presenta en el vocabulario de su sub-unidad, ya no llega fría al
  repaso. Se elige una de las dos.

  **A comprobar con Miguel:** cómo se ve la portada con 17 entradas en
  vez de 12, y cómo se numeran/muestran las sub-unidades.

### Recuperar `verificar.py`, el control de calidad del original

- **2026-08-20 · Detectado por Claude, aprobado por Ric.** El repositorio
  de Miguel **no tiene `verificar.py`** — y no es que se borrara: nunca
  estuvo (comprobado en el historial de git). Es el script de control de
  calidad del proyecto original de Ric.

  **Probado contra los datos actuales de Miguel: funciona tal cual, sin
  adaptar nada.** Resultado: `Unidades: 12 · ejercicios: 144 · variantes:
  720 · Vocabulario: 364 entradas` → **sin errores**, 15 avisos menores
  (13 respuestas de `traducir` sin normalizar —inofensivo, la comparación
  ya ignora mayúsculas y puntuación— y 2 traducciones compartidas que la
  app ya resuelve sola forzando la dirección de la pregunta).

  **Qué comprueba** (relevante con 115 palabras y 5 sub-unidades nuevas):
  ids de grupo únicos en todo el curso y con el prefijo de su unidad,
  cinco variantes por grupo, tipos de ejercicio conocidos, índice de
  `correcta` dentro de rango, que las fichas de `orden` reconstruyan
  exactamente su frase, cuatro parejas en los de emparejar, enunciados sin
  repetir entre unidades, claves raras en vocabulario o gramática,
  palabras repetidas dentro de una unidad, unidades sin ficha de Gernika,
  y **pistas que mienten** al contar letras/palabras o al decir por dónde
  empieza la solución.

  ⚠️ **Corrección a lo que dijo Claude antes en la conversación:** afirmé
  que este script habría cazado los dos errores de contenido que encontró
  Ric (el enunciado sin «bonito» de la u2 y la pista que da la respuesta
  de la u4). **Es falso.** No los caza ninguno: el primero exigiría
  comparar el sentido del `es` contra el `eu`, y el segundo es una pista
  que no miente sobre letras ni sobre el comienzo, simplemente entrega la
  solución. El propio `PROYECTO.md` del original ya lo dice: *«el
  verificador cubre lo mecánico, no lo pedagógico. Una explicación puede
  estar bien formada y ser falsa.»* Sigue mereciendo la pena recuperarlo,
  pero por lo mecánico, no como red contra errores de criterio.

  **Hueco a resolver al recuperarlo:** el script lee las unidades desde
  `data/curso.json`, que solo lista `unidades/`. La variante
  **`data/unidades-gernikes/` (12 archivos) se queda sin revisar**. Es
  contenido que Miguel añadió después del original, así que el script no
  lo contemplaba. Convendría ampliarlo para que cubra las dos variantes.

  El archivo original está en la copia de Ric:
  `Dropbox/Ric/Tests Claude/euskaraz/verificar.py` (8 KB).

### Pantalla de "vocabulario nuevo" antes del repaso

> **Nota del 20/08, posterior:** si se adopta la propuesta de
> **sub-unidades** (sección anterior), esta pantalla deja de hacer falta —
> las palabras ya se presentan en el vocabulario de su sub-unidad y nunca
> llegan frías al repaso. Son dos soluciones alternativas al mismo
> problema, no complementarias. Se mantiene anotada por si se descarta la
> vía de sub-unidades.

- **2026-08-20 · Propuesta de Ric.** Al entrar en una sesión de repaso de
  vocabulario, si entre las preguntas hay palabras que nunca se han
  visto, mostrar **una pantalla previa** al primer ejercicio: "Vocabulario
  nuevo", con esas palabras y sus traducciones, como presentación.
  - **Por qué importa ahora más que nunca:** con ~115 palabras nuevas
    entrando al curso, sin esta pantalla la primera vez que ves una
    palabra es **fallando** una pregunta sobre ella. Es justo la
    frustración que se quiere evitar. Es además el patrón estándar en
    sistemas de repetición espaciada (Anki y similares "presentan" la
    tarjeta antes de examinarla).
  - **⚠️ Consecuencia a decidir — choca con una decisión ya tomada.** El
    `PROYECTO.md` establece que el calendario solo mira **la primera
    respuesta** de cada palabra en la sesión, y que el acierto que cuenta
    debe ser "en frío" porque *"acertar treinta segundos después de haber
    visto la solución no prueba nada"*. Si la palabra se enseña justo
    antes, esa primera respuesta ya **no es en frío** y el calendario la
    ascendería como si se dominara.
    **Recomendación:** que las palabras presentadas en esa pantalla **no
    puntúen para el calendario en esa primera vuelta** — se practican,
    pero el calendario empieza a medirlas en la sesión siguiente, ya en
    frío. Es coherente con lo que la app ya hace con los repasos ("son
    práctica, no examen").
  - **Detalles menores:** que sea saltable (si ya conoces la palabra es
    fricción), y poner un tope de palabras por pantalla (5-6): si un día
    caen 14 nuevas de golpe, una pantalla con 14 es un muro.

### Petición concreta para Miguel: generar los audios

El vocabulario de arriba **ya está verificado** contra Euskaltzaindia
(ver el bloque ✅), así que las palabras se pueden dar por buenas salvo
las seis que están pendientes de criterio nativo (lista más abajo). Hay
que generar un mp3 por palabra nueva con `scripts/generar-audio/generar.mjs`
y subirlos al bucket `euskaraz-audio` de Supabase Storage.

**Ya no hay nada que esperar** (actualizado 25/08): la revisión nativa
está cerrada, así que se pueden generar todos los audios de una tanda.
Ojo con estas, que se añadieron o cambiaron después de la lista inicial
y es fácil que se queden fuera: `loba`, `biloba`, `aitite`, `aitxitxe`,
`amuma`, `amama`, `txapelduna`, `txapelketa`, `zorionak zuri`.

- Son ~115 mp3 nuevos. El script ya hace el trabajo (`node generar.mjs u5`
  por unidad, con `--forzar` si hace falta rehacer).
- **Ojo al coste de revisión:** dado el estado de la voz en euskera
  (ver más arriba: `eu-ES` está en fase *Preview* en Gemini TTS, y Ric ha
  encontrado ~41 audios mal pronunciados de los existentes), es de
  esperar que **una parte de estos 115 salga mal a la primera**. Conviene
  escucharlos antes de darlos por buenos, igual que se está haciendo con
  los actuales.
- Sigue pendiente el acceso de Ric al proyecto de Google Cloud para poder
  ayudar con esto (ver bloqueo anotado más arriba).

### Revisión nativa: COMPLETA Y CERRADA (25/08/2026)

✅ **Todo el vocabulario nuevo y sus frases están verificados.** Nada
pendiente en este bloque.

- **Las palabras** (115): contrastadas una a una contra el Hiztegi Batua
  de Euskaltzaindia. 114 confirmadas directamente, 4 resueltas a mano.
- **Las seis dudas de criterio**: contestadas por hablantes nativos, y
  las formas nuevas que aportaron, re-verificadas contra el diccionario.
- **Las 28 frases de ejemplo**: 4 corregidas en la primera ronda; **las
  24 restantes revisadas y dadas por buenas por la pareja de Ric (de
  Gernika)**, que es quien ya venía revisando el contenido del curso
  según el `PROYECTO.md` original.

**Esto desbloquea:** escribir el contenido de las sub-unidades y generar
los audios. Ya no hay nada que esperar por el lado lingüístico.

Lo que sigue es el detalle de las respuestas, para que quede el rastro
del porqué de cada decisión.

#### Respuestas a las seis dudas

- **A. `mutil-lagun` / `neska-lagun`: correcto, y la ambigüedad es real.**
  Los nativos confirman que se usa **tanto para novio/a como para amigo
  chico / amiga chica** acentuando el género — «casi como
  girlfriend/boyfriend en inglés». No hay que buscar otra palabra: hay que
  **enseñar la ambigüedad**, que es parte del idioma.

- **B. En Bizkaia se usan cuatro formas, no una.** Los nativos: se dice
  **`aitite` y `aitxitxe`** para abuelo, **`amuma` y `amama`** para
  abuela, y merece la pena explicarlo. Comprobado después contra
  Euskaltzaindia: de las cuatro, **solo `amama` está recogida** (definida
  como «Amona»); `aitite`, `aitxitxe` y `amuma` dan cero resultados. No
  las invalida —son habla real y el curso quiere precisamente ese
  registro— pero conviene saber que van sin respaldo normativo, así que
  el campo `registro: bizkaiera` del esquema es exactamente su sitio.

- **C. `Olentzero` es el personaje, sin duda.** Los nativos corrigen al
  diccionario en cuanto a uso: la definición «Gabon eguna» es el sentido
  estrecho, pero en el habla es el personaje. Y añaden que es **una nota
  cultural muy bonita**, que encaja al hablar de la Navidad y las
  estaciones (o sea, en la 10.1).

- **D. `iloba` sí es ambiguo en la lengua** — puede ser las dos cosas, lo
  confirman. **Y aportan un dato nuevo: en Bizkaia se usa `loba`, sin la
  i- inicial** (lo oyen sobre todo en plural, `lobak`).
  **Investigado a fondo en Euskaltzaindia, y hay un hallazgo que resuelve
  la ambigüedad para el curso:**
  - **`loba`** está recogida, marcada **`iz. bizk.`** (sustantivo,
    bizkaiera) y definida simplemente como «Iloba». Ejemplos del propio
    diccionario: «Osaba eta loba», «Beren loba Kepari». Es decir: el
    dato de los nativos está respaldado, y encaja perfecto como
    `registro: bizkaiera` de `iloba`.
  - **`biloba`** existe y **sí es inequívoca**: «Semearen edo alabaren
    semea edo alaba» — el hijo o hija de tu hijo o hija, o sea nieto/a a
    secas. Remite explícitamente a «Ik. iloba 2» (véase iloba, acepción
    2). En bizkaiera tiene además un segundo sentido: bisnieto
    (`birbiloba`).
  - **Conclusión práctica para el curso:** el euskera *sí* tiene manera
    de desambiguar — **`biloba` para nieto/a**, y `iloba` cuando el
    contexto basta o cuando se habla de sobrinos. Merece una ficha en la
    5.1 explicando las tres (`iloba`, `loba`, `biloba`).
  - ✅ **Resuelto por los nativos (25/08):** `loba` / `lobak` en bizkaino
    vale **indistintamente para sobrino/a y para nieto/a**. Es decir,
    hereda la ambigüedad completa de `iloba`, no solo el sentido de
    sobrino que sugerían los dos ejemplos del diccionario. Con esto la
    ficha de la 5.1 queda clara: `iloba` (batua) y `loba` (bizkaiera) son
    ambiguas las dos, y `biloba` es la que desambigua hacia nieto/a.

- **E. `Gabonak` va más adelante, no junto a `gabon`.** Los nativos
  avisan de que enseñarlas cerca confunde. Debe aparecer **cuando se
  hable de momentos del año y estaciones** — que es justo donde estaba
  planificada (unidad 10 / sub-unidad 10.1). Decisión confirmada.

- **F. `txapel` es palabra vigente, y su explicación es una inmersión
  cultural.** Los nativos: campeón es **`txapeldun`** (literalmente «el
  que tiene txapela») y campeonato también sale de ahí. Comprobado en
  Euskaltzaindia, y la etimología es aún más bonita de lo que parecía:
  - `txapeldun` = «Txapelketa edo lehiaketa baten irabazlea» (el ganador
    de un campeonato o competición).
  - `txapelketa` = «Irabazleari saritzat, besteak beste, **txapela**
    ematen zaion lehiaketa» — la competición en la que al ganador se le
    da, entre otras cosas, **una txapela**. O sea: el campeonato se llama
    así literalmente por la boina que se le entrega al que gana.
  - **Añadir `txapeldun` y `txapelketa` al vocabulario**, no solo
    `txapel`, y una ficha con esta explicación.

#### Correcciones a las frases de ejemplo

- **Frase 13** — `Mahai zuria eta aulki beltza.` La frase está bien; el
  fallo era **mi traducción**: es «mesa blanca y silla negra», no «*una*
  mesa blanca y *una* silla negra». Para decir «una» habría que añadir
  **`bat`** al final de cada sintagma: `mahai zuri bat eta aulki beltz
  bat`. **Es un buen punto pedagógico**: merece nota o ejercicio propio en
  la 6.1, porque es un error natural del castellanohablante.

- **Frase 16** — `Nire urtebetetzea maiatzean da.` Correcta. Los nativos
  sugieren aprovechar palabras así para **explicar sus piezas como
  curiosidad**: `urtebetetze` sale de **`urte`** (año) + **`bete`**
  (llenar, completar — confirmado en Euskaltzaindia como verbo:
  «Zerbaitek hutsune edo tarte bat zeharo hartu»). Literalmente, «el
  completarse del año». Ficha para la 7.1.

- **Frase 23** — `Zure ahoa gustatzen zait` («me gusta tu boca»):
  gramaticalmente correcta, pero **puede resultar incómoda**. Cambiada a
  **`Zure ilea gustatzen zait`** («me gusta tu pelo»). Sigue sirviendo
  igual para enseñar el singular `zait` frente al plural `zaizkit` de la
  frase 22. `ile` verificado en Euskaltzaindia.

- **Frase 27** — `Urtebetetze zoriontsua!` **Descartada.** Los nativos la
  entienden pero no les resulta natural: nadie lo dice así. Lo normal es
  **`Zorionak!`** o **`Zorionak zuri!`**. Ventaja añadida: `zorionak` ya
  está en el vocabulario del curso (unidad 12), así que no hay que
  introducir nada nuevo.

#### Las 24 frases restantes: confirmadas (25/08)

Revisadas por la pareja de Ric, de Gernika. **Todas correctas**, sin
cambios. Junto con las cuatro corregidas arriba, las 28 frases de
ejemplo quedan listas para entrar al curso.

#### Resumen para la ficha de parentesco de la 5.1

Queda material para una ficha bonita, con todo verificado:

| Palabra | Registro | Significa |
|---|---|---|
| `iloba` | batua | sobrino/a **y** nieto/a — ambigua |
| `loba` | bizkaiera | lo mismo, igual de ambigua (confirmado por nativos) |
| `biloba` | batua | nieto/a, sin ambigüedad |

La gracia pedagógica: el castellano necesita dos palabras donde el
euskera usa una, pero el euskera **sí tiene** manera de desambiguar
cuando hace falta (`biloba`). No es una carencia del idioma, es que la
distinción no le resulta necesaria por defecto.

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

### Selector de dialecto: renombrar "Gernikés" a "Gernikera"

- **2026-08-20 · Propuesta de Ric.** La etiqueta "Gernikés" del selector
  (`index.html:37`, `data-modo="gernikes"`) no es una palabra estándar ni
  en español ni en euskera — no sigue el patrón real de gentilicios en
  español (que sería *guernicarra* o *gernikarra*, como *bilbaíno* de
  Bilbao o *donostiarra* de San Sebastián).
  - El problema de fondo: el selector empareja "Bizkaiera" (término vasco
    real, "el habla/dialecto vizcaíno") con "Gernikés", que mezcla un
    término inventado en español con uno vasco — no son de la misma
    familia.
  - **Propuesta:** cambiar la etiqueta a **"Gernikera"**, que sigue el
    mismo patrón que *Bizkaiera* y *Gipuzkera* (dialecto guipuzcoano): el
    sufijo *-era* para nombrar el habla local de un sitio. Sería "el habla
    de Gernika", igual que Bizkaiera es "el habla de Bizkaia".
  - Solo afecta al texto visible (`index.html:37`); la clave interna
    `data-modo="gernikes"` / `MODO_DIALECTO` puede quedarse igual, es un
    identificador técnico, no el nombre que ve el usuario.

### Análisis de nivel: el curso frente al A1 oficial (25/08/2026)

Investigación pedida por Ric. Fuente: **HEOC** (*Helduen Euskalduntzearen
Oinarrizko Curriculuma*), currículo oficial establecido por Orden del
Gobierno Vasco del 22/07/2015 (BOPV nº 144), marco de referencia para
euskaltegis homologados y HABE. Se leyó íntegra la sección A1,
**páginas 73-98** del PDF oficial. Informe compartible:
https://claude.ai/code/artifact/2fca0736-c0ee-41a7-b19c-ee1e4f35fde7

⚠️ **Trampa de la fuente:** las secciones A1 y A2 van seguidas y son casi
idénticas en estructura. La de A2 empieza en la pág. 99 y se reconoce
porque dice «A1 mailakoez gain» («además de los de A1»). En esta
investigación se extrajo A2 creyendo que era A1 y hubo que rehacerlo.

**Conclusión, y no es la esperada: el curso no se pasa de nivel, se
queda corto de A1.**

**Contenido de A1 que el curso NO cubre (10):** futuro (`joango naiz`) ·
imperativo (`Etorri!`, `ezazu`) · `ahal izan`/`ezin izan` · `behar izan` ·
progresivo (`ikasten ari naiz`) · verbo `eduki` (`dauka`) · ordinales ·
demostrativos completos (solo está `hau`) · casos `norentzat` y
`noraino` · exclamativas (`Hau hotza!`).

Lo llamativo: la ficha final de la u12 lista el futuro y el imperativo
como **«lo que falta para seguir hacia A2»**, y el currículo los pone en
A1. Comprobado por script que ninguno se enseña como vocabulario; solo
se mencionan en textos explicativos.

**Contenido que SÍ se pasa de A1 (3, todos menores):** los verbos de
movimiento sintéticos de la u9 (`noa`, `nator`, `nabil` — en presente A1
solo pide `izan` y `egon`; `joan`/`ibili`/`etorri` vienen marcados como
novedad de A2) · el pasado de `egon` de la u11 (`nengoen`, `zegoen` —
A1 solo pide pasado de `izan`, `ukan`, `eduki`) · `mila` de la 5.1
(A1 llega a 100).

**Temas del catálogo oficial peor cubiertos:** Euskal Herria
(territorios) 0/5 · tareas cotidianas 0/6 · datos personales
(edad, dirección, estado civil) 0/5 · servicios (correos, banco) 0/4 ·
medios de comunicación 1/4.

**Las cinco sub-unidades nuevas apuntan bien:** sus seis campos
temáticos están explícitamente en el catálogo A1, algunos con las mismas
palabras («gelak, altzariak» para la casa). Dos matices: los animales de
granja encajan regular (el catálogo dice «etxeko animaliak», domésticos)
y la ropa no figura como tema explícito de A1.

**Decisión pendiente entre Ric y Miguel** — es de producto, no técnica:
- **A.** Completar el A1 con los diez contenidos que faltan.
- **B.** Asumir que es A1 parcial y decirlo: hoy el subtítulo de la app
  dice «Nivel A1 completo», y la ficha de la u12 llama A2 a cosas de A1.
- **C.** Las dos por orden: corregir ya lo que promete la app, y añadir
  lo que falta como sub-unidades, que es un formato ya montado y probado.

## Implementadas

## Descartadas (y por qué)

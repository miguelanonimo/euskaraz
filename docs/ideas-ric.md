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

## Pendientes de comentar con Ric

Notas de Miguel/Claude tras una auditoría del curso, en el mismo formato:
fecha · qué se vio · qué se propone. Para decidir con Ric antes de tocar
código.

### Tope al backlog de repaso: no bloquear el avance a unidades nuevas

- **2026-08-20 · Detectado en auditoría.** `elegirSesion` prioriza siempre
  lo vencido sobre lo nuevo, sin ningún tope — si el usuario vuelve tras
  semanas de ausencia, el backlog puede llenar la sesión entera y no
  dejar hueco a contenido nuevo hasta vaciarlo del todo. Puede ser la
  compensación correcta (no olvidar antes que avanzar), pero **propuesta
  de Miguel: dejar una proporción fija, por ejemplo 80% repaso antiguo /
  20% contenido nuevo**, en vez de que lo vencido pueda ocupar el 100% de
  la sesión. Afecta a `js/app.js` (`elegirSesion`, usado tanto por el
  repaso mezclado como por el de vocabulario).

### Ejercicios de flexión gramatical (conjugar, declinar) en unidades con casos nuevos

- **2026-08-20 · Detectado en auditoría.** Las unidades que introducen un
  caso gramatical nuevo (u5 ergativo, u6 locativo, u10 dativo) lo explican
  en prosa y lo prueban con frases concretas ya resueltas, no con un
  ejercicio de "conjuga/declina esto en los casos vistos" — todo pasa por
  los mismos 5 tipos de ejercicio, pensados para vocabulario y frase
  suelta. **Apunte de Miguel:** puede que ya baste con lo que hay —
  "traduce esta frase" y "¿cuál es el pasado de este verbo? (elige entre
  cuatro)" ya ejercitan la flexión indirectamente. Decidir con Ric si hace
  falta algo más explícito o si el tipo `opcion`/`traducir` ya cubre el
  hueco.

### Fusionar el ejercicio de escucha

- **2026-08-20 · Ya construido, pendiente de decisión.** Los dos formatos
  de escucha (elegir qué significa lo que oyes / escribir su traducción,
  sin ver el euskera escrito) están terminados y probados en la rama
  `experimento/ejercicio-listening`, sin fusionar a `main` todavía.
  **Link de prueba:**
  https://euskaraz-git-experimento-ejercicio-listening-anonimostudio.vercel.app

## Implementadas

- **2026-08-26 · Media docena de arreglos pequeños de `ric/trabajo`**
  (commits `10a9933`, `104b3f2`, `00ff5c8`, `ed9af82`, `f0b9ff6`,
  `25c1fd2`, con Claude Fable), sin tocar la reestructuración de 10
  unidades ni `data/unidades-v2/`: campo `esAlt` para formas
  castellanas que no se deducen del texto ("gracias" vale para
  "muchas gracias"); tildes y espacios de barra ya no cuentan como
  fallo (`claveRespuesta()`, "el/ella" acepta "él / ella"); al fallar
  traduciendo AL castellano ahora dice "dijiste"/"significa" en vez de
  "escribiste"/"se escribe", y no se enseña la nota en euskera (solo
  despistaba); dos frases con "barkatu" mal usado sustituidas; dos
  pistas que daban la solución hecha, reescritas (U5); demostrativos
  bizkainos nuevos, "hura"→"ha" y "haiek"→"hareek" (U2); progreso en
  `localStorage` al probar sin cuenta en local (`MODO_LOCAL`, no toca
  producción). El resto de esa tanda (distractores de Olentzero,
  nombres de territorio, preguntas circulares, la ficha de
  demostrativos del subnivel 3.3) solo toca `unidades-v2/`, aparcado
  con el resto de la reestructuración.
- **2026-08-25 · Respuestas flexibles en castellano**, portado de
  `ric/trabajo` (commit `01ec749`, con Claude Fable). El campo `es`
  está escrito para leerse, no para compararse — «pequeño/a» marcaba
  como fallo teclear «pequeño». `variantesRespuesta()` expande
  barra/coma/paréntesis/artículo; afectaba a un tercio del
  vocabulario. Integrado con el "casi correcto" del mismo día:
  `respuestaMasCercana()` ahora compara contra todas las variantes
  aceptadas.
- **2026-08-24 · Seis piezas de `ric/trabajo` traídas a `main`**: iconos
  y `site.webmanifest` (nunca llegaron al repo aunque index.html ya los
  enlazaba), `preguntaOpcion` agrupando distractores por forma (para que
  la silueta de la respuesta no la delate), restos de la regla falsa
  "-tik pierde la k" en U9/U12 de los dos datasets, "diot" corregido a
  "dio" en U10 (nunca se enseñó, se colaba sin que hubiera forma de
  saberlo), "Gernikés" renombrado a "Gernikera", y la ambigüedad
  izquierda/derecha de U9 reformulada. La corrección de los 4 ejercicios
  Gernika/Bilbao de esa misma rama NO se trajo — ya arreglados en `main`
  con "Euskal Herria" en vez de Bilbao, por petición explícita de que
  fuera más neutro.
- **2026-08-20 · Las 45 palabras de la tabla de "audios con pronunciación
  mal generada"** regeneradas con nota de pronunciación específica por
  palabra, silencio inicial recortado, publicadas. Sigue en pie el aviso
  de que un mismo patrón (H, Z, "-tua"...) no falla igual en todas las
  palabras — cualquier audio nuevo que suene mal se trata como caso
  suelto, no como confirmación del patrón entero.
- **2026-08-19 · Audio automático quitado de práctica/repaso**, con la
  excepción acordada del icono de altavoz explícito en la caja de "toca
  las parejas".
- **2026-08-19 · Porcentaje de unidad coloreado por tramos en la home**
  (oculto <50%, ámbar 50-69%, verde ≥70%).
- **2026-08-19 · Filtro por categoría en el repaso de vocabulario.**
- **2026-08-19 · Correcciones de contenido objetivas**: regla falsa
  "-tik pierde la k" en U9, "polita" que faltaba en el enunciado de U2,
  pista que resolvía el ejercicio en U4.

## Descartadas (y por qué)

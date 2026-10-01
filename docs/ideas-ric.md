# Ideas de Ric

Notas de revisión de la app (euskaraz.vercel.app), escritas mientras la uso.
Cada idea se comenta con Miguel antes de darla por decidida. Cuando una idea
se implemente o se descarte, se anota aquí para que quede el rastro.

Formato de cada entrada: fecha · qué he visto · qué propongo.

---

## 🎨 Nuevo (01/10/2026): trabajar los dos a la vez en `rediseno`

Hay una rama nueva, `rediseno`, con el rediseño visual de la app (aún sin
pasar a `main` — es la versión de pruebas). Como ya tienes permiso de
escritura en el repo, podemos tocarla los dos, cada uno con nuestro
Claude, sin pisarnos y sin gastar crédito en lo mismo dos veces.

El mecanismo es `EN-CURSO.md`, en la raíz del repo:

1. Antes de tocar nada: `git pull origin rediseno`, y mira ese archivo.
   Si está vacío, vía libre. Si hay una línea con mi nombre, espera o
   dime qué vas a tocar para no cruzarnos (sobre todo si es
   `css/styles.css` o `js/app.js`, que son los que más se repiten).
2. Al empezar, añade una línea con tu nombre, hora y en qué vas a
   trabajar, y súbela con un commit aparte (solo ese archivo).
3. Al terminar ese bloque, borra tu línea y vuelve a subir el archivo
   vacío.

Si en algún momento los dos empujamos sin haber mirado el archivo, no
pasa nada grave: gana quien empujó primero, el otro hace
`git pull --rebase origin rediseno` y resuelve el conflicto (o se lo
pide a su Claude mirando el diff). La rama sigue sin tocar `main` hasta
que decidamos fusionarla.

---

## 🎙️ Nuevo (19/09/2026): elegir la mejor de las 3 versiones corregidas (bloque 1)

Gracias por el informe del bloque 1 — con tus 16 notas se generaron 3
versiones nuevas de cada palabra marcada mal (instrucción fonética
traducida de tu nota, mismo mecanismo que ya se usó en rondas anteriores).

Página nueva, mismo patrón que las de revisión: `revision-audio/elegir-mejor-bloque1.html`.

1. Pídele a tu Claude: "publica revision-audio/elegir-mejor-bloque1.html
   como artifact".
2. Por cada palabra tienes 4 opciones para escuchar: el **original** (el
   que marcaste mal) y **3 versiones nuevas**. Tu propia nota está a la
   vista para recordar qué buscabas.
3. Marca con el radio la que suene mejor. Si ninguna de las 3 convence,
   marca **«Ninguna vale»**: sale en el informe como `"elegida":
   "ninguna"`. (Al principio esto se pedía escribiéndolo en el cuadro del
   informe, pero ese cuadro es de solo lectura y el botón de copiar no lo
   lee; se añadió la opción el 22/09.)
4. Cópiaselo a Miguel igual que el informe anterior.

Con esa elección se aplica el audio ganador de cada palabra a
`data/unidades-v2/` y sale del limbo de `test/`. Los bloques 2-8 (unidades
5-10 + el resto de u1/u4) siguen tal cual, pendientes de tu revisión o la
de Miguel — este es solo el ciclo de vuelta del bloque 1.

---

## 📣 Nuevo (30/08/2026): cómo publicar sin esperar a que Miguel fusione a mano

Hasta ahora, cada tanda de `ric/trabajo` la fusionaba Miguel (con Claude) a
mano en `main`. Ya no hace falta esperar a eso para lo rutinario.

**Lo que cambia para ti/tu Claude: un comando nuevo cuando decidas que algo
está listo para producción** (después de haber corrido
`bash scripts/probar-todo.sh` tú mismo, como ya hacías):

```
git push origin ric/trabajo:ric/publicar --force
```

Eso mueve la rama `ric/publicar` a donde esté `ric/trabajo` en ese momento.
Un GitHub Action (`.github/workflows/publicar-ric.yml`) hace el resto solo:
fusiona `ric/publicar` en `main`, vuelve a correr `probar-todo.sh` como
comprobación final, y si pasa, empuja a `main` — Vercel despliega desde ahí,
sin que nadie tenga que estar mirando.

Si algo falla (conflicto de fusión, algún test en rojo), el Action se para
ahí mismo: `main` no se toca, y queda para revisar a mano como hasta ahora.
Se puede ver el resultado de cada intento en la pestaña "Actions" del repo
en GitHub.

`ric/trabajo` sigue siendo tu cuaderno de trabajo normal — se sigue subiendo
igual, sin que dispare nada. `ric/publicar` es solo la señal de "esto ya".
No hace falta hacer nada más para que el workflow te llegue: en cuanto tu
rama vuelva a fusionar `main` (como ya hacéis de vez en cuando), el archivo
del workflow entra con el resto.

---

## 🎧 Nuevo (08/09/2026): revisar el audio nuevo — bloque 1

Miguel está generando el audio que faltaba (389 palabras/frases nuevas en
total en `data/unidades-v2/`, se genera por bloques). El primer bloque (51,
unidades 1-4) está listo para escuchar y ya no hace falta esperar a que él
lo revise entero — puedes hacerlo tú directamente:

1. Abre `revision-audio/bloque1.html` del repo (está en `main`, en la raíz
   del proyecto — es autocontenido, con el audio ya incrustado en el propio
   archivo, no depende de red).
2. Pídele a tu Claude que te lo publique como un Artifact ("publica
   revision-audio/bloque1.html como artifact"). Es tuyo, no compartido con
   Miguel — cada uno tiene su propia copia, no hace falta que coincidan.
3. En la página: pestañas por unidad arriba, botón ▶ para escuchar cada
   palabra, y dos botones **Bien/Mal** por fila. Si marcas mal, se abre un
   campo para anotar qué falla (acento, letra que suena distinta, etc.).
4. Al final, botón **"Copiar informe"** — copia un JSON con solo lo que
   marcaste, y tu nota si dejaste una. Pégaselo a Miguel (por donde sea
   más cómodo) y él se lo pasa a su Claude para regenerar esas palabras en
   varias versiones y elegir la mejor.

No hace falta que ambos revisemos lo mismo — si repartís el bloque, mejor
(menos redundancia).

**Actualización (09/09/2026): ya está todo generado y repartido en bloques.**
En `revision-audio/` hay ya, además del 1, los bloques **2 a 8** — mismo
patrón exacto (pídele a tu Claude "publica revision-audio/bloqueN.html
como artifact", escucha, marca Bien/Mal, copia el informe al final):

| Archivo | Qué cubre | Palabras |
|---|---|---|
| `bloque1.html` | unidades 1-4 (parcial) | 51 |
| `bloque2.html` | unidad 5 completa | 53 |
| `bloque3.html` | unidad 6 completa | 44 |
| `bloque4.html` | unidad 7 completa | 48 |
| `bloque5.html` | unidad 8 completa | 24 |
| `bloque6.html` | unidad 9 completa | 44 |
| `bloque7.html` | unidad 10 completa | 22 |
| `bloque8.html` | resto suelto de u1 y u4 que no entró en el bloque 1 | 67 |

353 palabras en total entre los 8. Si quieres repartirte el trabajo conmigo
(Miguel), dime qué bloques te quedas y yo me ocupo del resto — o cada uno
revisa lo que le apetezca y ya cruzamos los informes al final.

Si en algún momento hace falta un bloque nuevo (por ejemplo si se añade más
vocabulario y vuelve a quedar audio pendiente), el script que los genera es
`scripts/generar-audio/construir-revision.mjs` — `node
construir-revision.mjs <numeroBloque> <unidadId...>` (requiere haber
corrido antes `generar.mjs <unidadId>` para tener los mp3 en `out/`).

---

## Pendientes de comentar con Miguel

### El repaso de vocabulario ya es aditivo (26/08/2026) — HECHO

Petición de Ric, resuelta. La regla que fijó:

> *Con abrir la pantalla de la gramática de un tema, o del vocabulario del
> mismo, ya se pueden añadir al repaso. Y este incluye las abiertas hacia
> atrás aunque sean de unidades anteriores.*

**Lo que había.** `fondoVocabulario()` se quedaba con las unidades que
tuvieran `progUnidad(u.id).vocab`. Era por unidad entera —abrir la pantalla
de Vocabulario de la unidad 4 metía sus **74 palabras**, incluidos los temas
sin tocar— y la señal era la equivocada: leer la explicación o practicar no
contaba.

**Lo que hay.** `progSub()` guarda ahora `desbloqueado` además de `visitado`.
Son cosas distintas a propósito: `visitado` es haber abierto la portada del
tema, `desbloqueado` es haber entrado a su gramática o a su vocabulario.
Comprobado que asomarse a la portada **no** basta.

**Dos vías de respaldo, para no dejar a nadie sin bolsa de golpe:**

- Las unidades **sin temas** (el curso viejo de `data/unidades/`, que sigue en
  el repo aunque ya no se carga) se desbloquean enteras como antes.
- El **progreso guardado antes de este cambio** marcaba la unidad y no los
  temas. Si esa marca está y no hay ningún tema abierto, se entiende que la
  unidad se vio entera. En cuanto abres un tema, manda el tema.

Y `pantallaVocabulario()` ya solo pone la marca de unidad donde no hay temas:
si la dejara puesta, asomarse a un tema desbloquearía las 74 de la unidad y no
habríamos arreglado nada.

#### Un fallo que salió al probarlo

Las tarjetas de la Home decían **«¡Completado!»** en cuanto no había nada
vencido, **sin mirar las palabras sin estrenar**. Es de antes, pero la bolsa
aditiva lo hacía cantar: desbloqueabas 32 palabras y la app te decía que
habías terminado.

`frasePendientes()` ya sabía decirlo bien —«Al día · 32 sin estrenar»— solo
que nunca se llegaba a ella. Arreglado en las dos tarjetas, la de vocabulario
y la de repaso mezclado.

Comprobado en la app: la tarjeta pasa de 32 a 40 al abrir la explicación de
otro tema, **sin recargar**.

`scripts/probar_bolsa.js` cubre los ocho casos, incluido el que importa —un
tema de la unidad 1 y otro de la 4 suman, no se pisan— y el del progreso
viejo.

---



### 📄 Audios: la lista para Miguel está en `docs/audios-pendientes.md`

Todo lo de audio —los 22 que suenan mal y los 194 que faltan— está
consolidado ahí, con el lote ejecutable `scripts/generar-audio/lote-ric-3.mjs`
listo para correr. Ric lo acordó así el 26/08: *«los audios, con que esté la
lista de lo que dije, Miguel se encarga de hacer las generaciones»*.

Lo que sigue debajo es el histórico de cómo se fue detectando cada uno, que
es donde está el porqué de cada corrección. Para trabajar, usar el documento.

### Audios nuevos que hay que generar (no son fallos, son frases que cambiaron)

- **2026-08-23 · Unidad 10, dos frases de ejemplo corregidas de `diot` a
  `dio`** (ver más abajo el porqué). Como el nombre del mp3 es el slug de
  la frase, cambian de archivo y hacen falta dos audios nuevos:
  - `unidades/u10/aneri-esan-dio.mp3` — «Aneri esan dio.»
  - `unidades/u10/lagunari-lagundu-dio.mp3` — «Lagunari lagundu dio.»

  Los antiguos (`aneri-esan-diot.mp3`, `lagunari-lagundu-diot.mp3`) quedan
  sin usar y se pueden borrar del bucket. Hasta que se generen, esos dos
  ejemplos se quedan sin audio.

### Correcciones en curso (pendientes de commitear en tanda)

Ric está probando la app continuamente —la publicada y las locales— y va
mandando lo que encuentra. Esto se va acumulando aquí y se commitea de
golpe cuando toque, para no llenar el historial de commits de una línea.

**Audios · tercera ronda (25/08/2026 en adelante)**

| Palabra | Qué se oye | Qué debería oírse | Historial |
|---|---|---|---|
| `berdin` (u12, "igual") · `unidades/u12/berdin.mp3` | la I final queda cerrada y átona | I abierta y acentuada: «berd**í**n» | Salió al revisar la lista de vecinas de `benetan`. Segundo fallo de acento tras `agian`: en los dos, la sílaba final se come el peso. |
| `daude` (u6, "están") · `unidades/u6/daude.mp3` | el acento cae mal | acentuada en la **e**: «daud**é**» | Tercer fallo de acento, tras `agian` y `berdin`. Y es de los auxiliares que arrastra `da`, así que probablemente se arreglen en la misma tanda. |
| `du` (u5, "tiene") · `unidades/u5/du.mp3` | "dui": se le añade una I que no existe | «du» limpio, dos letras | Confirma lo avisado en `da`: **los auxiliares están tocados**. Van ya `da`, `du` y `daude`. |
| `eguerdia` (u7, "el mediodía") · `unidades/u7/eguerdia.mp3` | el acento cae mal | acentuada en la **e**: «egü**é**rdia» | Cuarto fallo de acento |
| `euria` (u10, "la lluvia") · `unidades/u10/euria.mp3` | el acento cae mal | acentuada en la **i**: «eur**í**a» | Quinto fallo de acento. Ojo: `euria` y `eguerdia` empiezan igual (eu-/egu-) pero el acento va en sílabas distintas. |
| `ez horregatik` (u1, "de nada") · `unidades/u1/ez-horregatik.mp3` | "orregatit": la K final se pierde | K final clara: «horregati**k**» | **Segunda ronda para esta palabra.** El 20/08 fallaba la RR; Miguel la regeneró y el 21/08 ya sonaba bien la RR pero salía "Ez horregadit". Ahora sigue con la K mal: **tercer intento**. |
| `gara` (u4, "somos") · `unidades/u4/gara.mp3` | "dara": la G inicial suena como D | G clara: «gara» | Otro auxiliar tocado, y encaja con la G inestable ya vista: `gure`/`guri` sonaban "bule"/"buri" (G→B) y `haragia` "arayia" (G→Y). Ahora G→D. |
| `garai hartan` (u11, "en aquella época") · `unidades/u11/garai-hartan.mp3` | el acento de `hartan` cae mal | acentuada en la última a: «hart**á**n» | Sexto fallo de acento |
| `geu` (u2, "nosotros mismos") · `unidades/u2/geu.mp3` | "guiu": la E se cierra | E abierta: «g**e**u» | Conviene escuchar sus hermanas `neu` y `zeu` (u2), que tienen la misma forma. |
| `da` (u4, "es") · `unidades/u4/da.mp3` | la D suena a inglesa (alveolar, aspirada) | D dental clara, como en «dato» | ⚠️ **La más importante de la lista.** `da` es el verbo «ser» y sale en casi todas las frases del curso. Y arrastra a los auxiliares, que son las palabras más frecuentes del euskera: `dut`, `du`, `duzu`, `dugu`, `dute`, `ditut`, `dira`, `dago`, `daude`, `doa`, `dator`, `dabil` — todas con audio ya generado. Enlaza con `denda` (primera ronda: la segunda D suavizada) y `galdera` (la D casi como Y). |
| `benetan` (u12, "de verdad") · `unidades/u12/benetan.mp3` | "denetan": la B inicial suena como D | B clara: «benetan» | ⚠️ Enlaza con fallos ya vistos en la primera ronda: `hobea` sonaba "hogea" (B→G) y `gure`/`guri` sonaban "bule"/"buri" (G→B). **La B es inestable en las dos direcciones.** Vecinas con audio ya generado que conviene escuchar: `bera`, `berandu`, `beraz`, `berdin`, `berria`, `berriro`, `bederatzi`, `bezain`, `beti`. |
| `astea` (u7, "la semana") · `unidades/u7/astea.mp3` | "aspea": la T suena como P | T clara: «as-te-a» | Ric comprobó las demás con raíz «aste-» (`asteburua`, `astelehena`, `asteartea`, `asteazkena`) y **suenan bien**: no es la raíz. |
| `axola zait` (u10, "me importa") · `unidades/u10/axola-zait.mp3` | "achola": la X suena como CH | X suave, como la «sh» inglesa: «ashola» | ⚠️ Solo hay otras dos palabras con X (sin contar «tx», que sí es CH): `kaixo` (u1) y `pixka bat` (u10). Conviene escucharlas. |
| `atea` (u6, "la puerta") · `unidades/u6/atea.mp3` | "apea": la T suena como P | T clara: «a-te-a» | Mismo fallo que `astea` |
| `agian` (u3, "quizás") · `unidades/u3/agian.mp3` | el acento cae mal | acentuada en la **i**: «aguían» | Primera vez que se anota |
| `mahaia` | "maiaia" — sigue metiendo un sonido donde la H debería ser muda | "maaia": H muda y las dos A seguidas | **Tercer intento fallido.** Anotada el 20/08, regenerada por Miguel, y el 21/08 sonaba "mayayaia". Ahora "maiaia": cambia el ruido pero no se va. |

**Patrón 1 · El acento se coloca mal.** Ya son seis (la sexta es
`garai hartan`): `agian` (en la i),
`berdin` (en la i), `daude` (en la e), `eguerdia` (en la e) y `euria`
(en la i). No hay una regla simple que las una —`eguerdia` y `euria`
empiezan casi igual y llevan el acento en sílabas distintas—, así que
probablemente haya que darle a la voz la posición del acento palabra por
palabra, no confiar en que lo deduzca.

**Patrón 2 · Los auxiliares están tocados.** `da` suena a inglesa, `du`
suena "dui", `daude` lleva mal el acento y `gara` suena "dara". Son las palabras más
frecuentes del euskera y salen en casi todas las frases, así que arreglar
esta familia (`dut`, `du`, `duzu`, `dugu`, `dute`, `ditut`, `dira`,
`dago`, `daude`, `doa`, `dator`, `dabil`) rinde más que cualquier otra
tanda.

**Posible patrón: la T entre vocales convertida en P.** Confirmado en
`astea` → "aspea" y `atea` → "apea". No es la raíz «aste-»: Ric verificó
que `asteburua`, `astelehena`, `asteartea` y `asteazkena` suenan bien.
Lo que comparten las dos que fallan es la **terminación `-tea` en
palabra corta**. Queda por escuchar `urtea` (u5, el año), que es la
única del curso con esa misma forma y que ya tiene audio generado.
(`emaztea`, `hilabetea` y `tomatea` también acaban en -tea pero aún no
tienen mp3: son vocabulario nuevo.)

**Nota sobre `mahaia`:** tres regeneraciones y tres resultados malos
distintos apuntan a que **regenerar no basta para esta palabra**. Es
candidata clara para la opción 2 de la investigación de TTS: trucar el
texto que se manda a sintetizar (probar `maaia`, `ma-aia` o similar) en
vez de seguir mandando `mahaia` y esperar suerte.

**Contenido · ejercicios que suenan forzados**

- **26/08 · u1-g10 v5 y u1-g05 v3: «barkatu» pegado donde no toca.**
  Detectado por Ric. Eran «Barkatu, zer moduz?» (perdón, ¿qué tal?) y
  «Barkatu, eskerrik asko» (perdón, muchas gracias). El fallo es el
  mismo en las dos: `barkatu` sirve para **interrumpir o disculparse**,
  y pegado a un saludo o a un agradecimiento no tiene situación real.
  **Sustituidas** por «Gabon, ikusi arte.» y «Eskerrik asko. Agur!»,
  elegidas por Ric. Comprobado que `barkatu` sigue practicándose en
  otras 14 variantes, así que la palabra no se pierde.
  - *Barrido posterior:* se revisaron las 241 frases completas del curso
    buscando más casos de cortesía pegada a saludo. **No hay más.**
  - ⚠️ Queda una repetición menor: `u1-g10` tiene ahora dos variantes
    que empiezan por «Gabon» (v4 «Gabon, bihar arte» y v5 «Gabon, ikusi
    arte»). La app solo enseña una por ronda, pero si salen seguidas
    puede cansar. Revisar al probarlo.

- **25/08 · u1-g10 v1: «Zer moduz? Eta zu?» no la dice nadie.**
  Detectado por Ric probando la app. El ejercicio de ordenar encadenaba
  «¿Qué tal?» con «¿Y tú?», pero `eta zu?` es lo que devuelves **después
  de contestar**, no pegado a tu propia pregunta. El propio curso lo
  tiene bien en otros sitios: `u1-g03 v4` pregunta literalmente «¿cómo
  devuelves la pregunta después de contestar?», y `u1-g05 v4` construye
  la secuencia correcta («Ondo, eskerrik asko. Eta zu?»). Solo esta
  variante se saltaba ese orden.
  **Sustituida** por «Oso ondo, eskerrik asko.» (muy bien, gracias) —
  elegida por Ric entre tres opciones. Aplicada en las dos versiones del
  curso (`data/unidades/` y `data/unidades-v2/`). No choca con
  `u1-g05 v4`, que lleva «ondo» a secas y termina con la coletilla.

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

### Respuestas en castellano demasiado rígidas: «pequeño» no vale para «pequeño/a»

- **2026-08-25 · Detectado por Ric usando la app publicada.** En el
  ejercicio nuevo de escuchar (audio dice «txikia», hay que teclear la
  traducción), respondió «pequeño» y se marcó como fallo, porque la
  respuesta guardada es literalmente «pequeño/a». Debería aceptar
  «pequeño» y «pequeña», y decir de paso que la palabra vale para los
  dos géneros — en euskera pasa constantemente, porque el adjetivo no
  tiene género.

- **Diagnóstico (código de Miguel en `main`, que nuestra rama aún no
  tiene):** `preguntaEscucharTeclear` pasa `respuestas: [entrada.es]`
  tal cual, y `normalizar()` quita `¿?¡!.,;:«»"'()` pero **no** la
  barra `/` ni expande alternativas. Así que la única respuesta
  aceptada es la cadena entera del campo `es`. Tres familias de fallo:
  - **Barra** (43 entradas): «pequeño/a», «tú / usted», «él / ella» —
    teclear una de las dos alternativas falla.
  - **Coma** (19): «coger, tomar», «escuchar, oír» — la coma se borra
    al normalizar y queda «coger tomar»; teclear solo «coger» falla.
  - **Paréntesis** (54): «(yo) soy», «hermano (de un chico)» — se
    borran los signos pero queda el contenido («yo soy»); teclear
    «soy» a secas falla.
  **Total: 116 entradas afectadas, un tercio del vocabulario.** El
  «casi correcto» que Miguel acaba de añadir amortigua algún caso, pero
  no es la solución: «pequeño» no es *casi* correcto, es correcto.

- **Arreglo propuesto — en código, no tocando los datos:** una función
  `variantesEs(es)` que expanda el campo en todas las respuestas
  aceptables, aplicada donde se corrige una respuesta en castellano:
  1. Alternativas por barra o coma → todas valen («tú / usted» acepta
     las dos).
  2. Contracción de género «-o/a» → las dos formas («pequeño»,
     «pequeña»). También «el/la amigo/a» → amigo, amiga, con o sin
     artículo.
  3. Paréntesis aclaratorios → se acepta con y sin ellos («(yo) soy»
     acepta «soy» y «yo soy»; «hermano (de un chico)» acepta
     «hermano»).
  Y en la pantalla de acierto, cuando la palabra vale para ambos
  géneros, decirlo: es enseñanza, no solo corrección.

- **Coordinación:** el ejercicio de escuchar es trabajo reciente de
  Miguel en `main` y está desplegando estos días — este arreglo es de
  su terreno ahora mismo. Comentárselo antes de tocar nada; si prefiere
  que lo hagamos nosotros, entra cuando fusionemos `main` en
  `ric/trabajo` (pendiente de todas formas para la reestructuración).
  Para el contenido nuevo de las 10 unidades no hace falta cambiar
  ninguna convención: el campo `es` se queda legible para humanos y la
  expansión la hace el código.

#### Continuación: las tildes y los espacios de la barra (2026-08-25)

Ric, con el audio de `bera`/`hura` («él / ella»), tecleó **`el/ella`** y se
marcó mal. Dos cosas distintas, las dos arregladas:

1. **La tilde se comparaba.** El brief ya decía que una tilde de más o de
   menos es cosmética y no cuenta como fallo, pero la comparación no lo
   implementaba: `el` no casaba con `él`.
2. **La barra solo separaba con espacios alrededor.** La respuesta guardada
   es `él / ella`, y al partirla salían `él` y `ella` sueltas y la frase
   entera con espacios — pero nunca `el/ella`, que es justo como lo escribe
   cualquiera.

Ahora se comparan por una clave que aplana las dos cosas (`claveRespuesta`).
Lo que se **muestra** en pantalla no cambia: sigue apareciendo `él / ella`
bien escrito, que es lo que hay que aprender.

**La ñ se deja intacta a propósito.** En castellano y en euskera es otra
letra, no una n con adorno: aceptar `manana` por `mañana` sería enseñar mal.
Comprobado antes de aplicarlo que ninguna pareja de palabras del curso (522
entradas) se confunde al aplanar tildes — cero colisiones.

**Y una cosa que salió de aquí:** Ric estaba viendo arreglos anteriores como
si no existieran, porque el navegador servía el `app.js` cacheado. El `?v=2`
de `index.html` no sirve si no se sube el número en cada retoque, y es fácil
pasarse un rato depurando código viejo sin saberlo. Añadido
`scripts/servidor-local.py`, que es el servidor de siempre más una cabecera
`Cache-Control: no-store`. Para probar en local, usar ese en vez de
`python3 -m http.server`. No toca `index.html`, así que lo publicado sigue
igual.

```
python3 scripts/servidor-local.py 8321
```

### Pistas que entregan la solución en vez de estrecharla (2026-08-25)

Ric, en «Me llamo Ane.» (u4-g11 v3, unidad 2 del curso nuevo): la pista
decía **«Vale «Ane dut izena» o simplemente «Ane naiz»»**. Es decir, las dos
respuestas buenas, escritas enteras. *«Es demasiado literal.»* El ejercicio
se resolvía copiando de la ayuda.

Buscadas todas las iguales por los tres cursos. **Tres ejercicios**, cada uno
repetido en las tres versiones:

| Ejercicio | Antes | Ahora |
|---|---|---|
| «Me llamo Ane.» | *Vale «Ane dut izena» o simplemente «Ane naiz».* | *En euskera no existe «llamarse»: se dice, literalmente, «tengo Ane por nombre».* |
| «Tengo un perro.» | *…es «txakur bat»… También vale «txakurra dut».* | *El número va detrás del nombre, y delante de un número el sustantivo pierde el artículo: «perro uno», no «el perro uno».* |
| «Tenemos una casa.» | *«una casa» = «etxe bat». «Guk» con -k … → «dugu».* | *El sujeto de «tener» lleva -k al final. El objeto es singular, así que el auxiliar va en la forma de «nosotros».* |

El criterio: **la pista da la regla, el alumno pone las palabras.** Lo de la
`-k` de `guk` se queda porque es gramática de verdad; lo que sobraba eran
las palabras servidas.

**Para que no vuelva:** `verificar.py` tiene ahora `pista_delata()`, que falla
si todas las piezas de alguna respuesta aparecen sueltas por la pista.
Probado a la inversa (volviendo a poner la pista vieja) para confirmar que
salta de verdad.

#### De paso: el verificador no miraba el curso nuevo

Al ir a blindarlo salió que `verificar.py` solo leía `data/curso.json` — las
17 unidades publicadas. **El curso reestructurado de 10 unidades, donde está
justo el fallo que encontró Ric, no lo revisaba nadie.** Ahora:

```
python3 verificar.py            # el publicado
python3 verificar.py v2         # el de 10 unidades
python3 verificar.py gernikes   # el de Gernika
```

Al abrirlo a los tres aparecieron dos cosas más:

- **Las fichas de gramática del v2 llevan `subnivel`** y el verificador lo
  daba por clave rara: 120 errores falsos. Ya lo conoce.
- **134 grupos con el id de su unidad de origen** (el de Ric se llama
  `u4-g11` y vive en la unidad 2). No es un fallo: al mudarlos conservaron
  el id a propósito, y el código nunca lee el prefijo, solo usa el id como
  llave. Queda como aviso.
- **`u1-g06` del gernikés tiene 6 variantes en vez de 5.** Es anterior a
  todo esto y sigue sin arreglar — pendiente de decidir qué variante sobra.

### El subnivel 3.3 tenía ejercicios pero nada que estudiar (2026-08-25)

Ric: *«el Subnivel 3.3: Demostrativos no tiene nada de gramática, así es
imposible entrar a los ejercicios sabiendo».* Tenía razón: **0 fichas de
gramática y 1 sola palabra** (`hau`), contra 5 grupos de ejercicios que
preguntaban por `hori`, `hura`, `hauek`, `horiek` y `haiek` — ninguna
presentada antes. Fallo nuestro al crear los subniveles que tapaban huecos
del A1: se generaron los ejercicios y no se escribió la lección.

Barridos los 50 subniveles buscando lo mismo. Salieron seis, pero **solo el
3.3 estaba de verdad vacío**: los otros cuatro (1.2, 4.8, 8.5, 9.4) son de
vocabulario y tienen 8-13 palabras que estudiar, y el 5.4 tiene su ficha.

**Escrito lo que faltaba:**

- Ficha *«Tres distancias, y lo que cuenta es de quién está cerca»* — el
  sistema hau/hori/hura, con el matiz que piden los ejercicios: el criterio
  no son los metros, es **de quién** está cerca la cosa. Más los plurales.
- Ficha *«Van detrás del nombre, y el nombre pierde el artículo»* — el orden
  al revés que en castellano (`etxe hau`, «casa esta»), la caída de la `-a`
  (`etxea` → `etxe hau`), y por qué `hura`/`haiek` son las mismas palabras
  que «él/ella» y «ellos/ellas» de la unidad 2.
- Vocabulario: `hori`, `hauek`, `horiek`.

**Dos cosas más que salieron al mirarlo:**

1. **`u3-g05` no era de demostrativos.** Preguntaba dónde se coloca la
   palabra interrogativa — es de 3.1, donde además está su ficha. Movido. Al
   irse, 3.3 se quedó con 4 grupos, así que se escribió `u3-g29` sobre la
   gramática nueva para mantener el mínimo de 5.
2. **`u3-g23 v5` daba una respuesta falsa.** Preguntaba «¿qué demostrativo
   ya conocías de la unidad 2?» y daba por buena `hau`, que se presenta
   justo ahí. De la unidad 2 se conocen `hura` y `haiek`. Corregida a `hura`.

**Sobre `hura` y `haiek`:** primero las añadí al diccionario de la unidad 3
como «aquel/aquellos», y quedaban duplicadas con las de la unidad 2. Son la
misma palabra, no dos, así que se quedan donde estaban y se les amplió el
significado (`esAlt` + nota); la ficha de 3.3 explica el doble uso.

**Pendiente:** las tres palabras nuevas y las seis frases de ejemplo no
tienen audio. Los ejemplos sin audio ya son normales en el curso (107 de
311), así que no rompe nada, pero entran en la lista de audios por generar.
Las frases de ejemplo son nuestras y **no las ha revisado un nativo**.

### Demostrativos en bizkaiera: «ha» por «hura» (2026-08-25)

Aportación de Ric al hilo del subnivel 3.3: **en bizkaino «hura» es «ha»**.
No estaba en ninguna parte del curso — ni siquiera en la versión en gernikés.

Verificado en [bizkaiera.eus](https://www.bizkaiera.eus/bizkaiera/morfologia-puntu-batzuk/)
(Bizkaieraren ataria), que confirma el dato y añade lo que no se puede
deducir: **los plurales no se parecen nada a los del batua.**

| batua | bizkaiera |
|---|---|
| hau | hau (igual) |
| hori | hori (igual) |
| **hura** | **ha** ← dato de Ric |
| hauek | **honeek** (var. *honeik*) |
| horiek | **horreek** (var. *horreik*) |
| haiek | **hareek** (forma antigua *haek*) |

Metido por el mecanismo que ya existía (`variantes` con `registro:
"bizkaiera"`), en los dos cursos: `hura` y `haiek` en la unidad 2, `hauek` y
`horiek` en la 3. Más una ficha *«Cómo suena esto en Bizkaia: los
demostrativos»* en el 3.3 — la que ya había está en el 3.1 y va de
interrogativas, así que estudiando demostrativos no se veía.

También recoge el intensivo con **-xe-** (*hauxe, horixe, haxe*), que según
la fuente se oye sobre todo en el este de Bizkaia.

**Detalle técnico que casi se cuela:** puse el contraste con el batua en un
campo `nota` dentro de los ejemplos, y **la app solo pinta `eu` y `es`** —
se habría perdido en silencio. Había 0 ejemplos con `nota` en todo el curso,
que era la pista. Movido al texto visible.

**Sin audio:** `ha`, `honeek`, `horreek`, `hareek` y las dos frases de
ejemplo. A la lista de audios por generar.

### Revisión general del curso nuevo · bloque 1 (2026-08-26)

Ric pidió una lectura del curso reestructurado «como una persona que entra
desde cero en una lengua sin lógicas parecidas al español». Primera pasada:
dos barridos mecánicos antes de leer las 123 fichas.

#### Referencias que apuntaban al mapa viejo — ARREGLADO

Frases dentro de las explicaciones del tipo «como viste en la unidad N», con
la numeración anterior a la reestructuración. Cinco. Tres eran solo el
número mal:

- 4.2 decía *«En la unidad 5 viste que el euskera cuenta en base veinte»* —
  es 4.1, el subnivel anterior de la misma unidad.
- 4.7 citaba *«un detalle de la unidad 5»* — `ditut` está en 4.4, misma unidad.
- 6.3 decía *«Ya lo tienes de la unidad 6, con los lugares»* — se citaba a sí
  misma; el `-n` de lugar es de la unidad 5.

**Las otras dos eran el fallo del 3.3 otra vez**, escrito en prosa: le decían
al alumno que ya sabe algo que se enseña después.

- 6.4 daba `egin` por sabido *«de la unidad 8»*, pero se enseña en **7.1,
  después**. Reescrito para presentarlo como fórmula cerrada («todavía no lo
  hemos visto por dentro —eso es la unidad siguiente—, apréndete estas dos
  enteras»), que es lo que ya hace el curso en 3.4 con las frases hechas.
- 9.5 daba `oporrak` por conocido *«de la unidad 11»*, pero estaba en **10.2,
  después**. Y además se usaba en un ejercicio de 6.5, cuatro unidades antes
  de presentarse.

**`oporrak` movida de 10.2 a 6.5.** Estaba en «Cuándo pasó» rodeada de
expresiones de tiempo (`lehen`, `orduan`, `iaz`, `aurten`, `txikitan`,
`garai hartan`) siendo la única que no lo es. Su sitio es «Las fiestas del
año», con `jaiak`, `Gabonak` y `Aste Santua`. Se sigue practicando en la
unidad 10 como repaso, que es justo el comportamiento que Ric quería.

#### Ejercicios en el subnivel equivocado — PENDIENTE DE DECIDIR

Siete grupos cuyo contenido es de otro sitio. Los flagrantes:

| Grupo | Está en | Es de |
|---|---|---|
| Partes del cuerpo | 6.1 **La hora** | 9.3 El cuerpo |
| Animales | 4.7 **La familia extendida** | 4.8 Animales |
| Emparejar números | 4.4 Tener y decir tu edad | 4.1 Números |
| «¿Cómo se dice 11 y 14?» | 4.4 Tener y decir tu edad | 4.2 Seguir contando |
| «Non→-n, Nora→-ra…» | 3.1 Las interrogativas | 3.2 La familia de «non» |
| `nator`/`zatoz`, `noa`/`zoaz` | 8.2 En qué vas y por dónde | 8.1 Ir y venir |

Otros 38 saltaron en el barrido y **son falsos positivos sanos**: un
ejercicio de «decir tu edad» usa números por definición. No tocar.

**Por qué no se han movido aún:** 4.7 se quedaría en 4 ejercicios y 8.2 en 3,
así que hacen falta 3 grupos nuevos; y el del cuerpo no es un cambio de
subnivel sino **de unidad** (está en la 6, su sitio está en la 9).

#### Cuñas culturales

Ric: *«me encantan todas las cuñas sociales, históricas y contextuales».*
Comprobada la más obvia —el sistema de base veinte, `berrogei` = «dos
veintes», con el guiño al `quatre-vingts` francés— y **ya está puesta y bien
escrita**. El listón está alto. Se irán anotando los huecos al leer las
fichas.

### Barrido total de ejercicios «sucios» + dos fusiones (2026-08-26)

Ric: *«es clave que en la barrida total encuentres estas cosas sucias de
ejercicios que no son de la unidad»*. Hecho, con un criterio objetivo:
**¿se puede acertar sabiendo solo lo anterior?**

**De 47 variantes imposibles a 14.** Ningún subnivel por debajo de 5
ejercicios, y la unidad 4 baja de 8 temáticas a 7.

#### Cómo se midió, y por qué el primer número engañaba

El barrido crudo daba 107 variantes usando vocabulario posterior. Pero **55
eran la variante 4** de su grupo — artefacto del generador — y al separarlas
salió lo importante: **97 eran distractores** (una palabra posterior como
opción *falsa*, que no impide acertar) y solo **13 eran la respuesta
correcta**. Sumando parejas y traducir, donde toda palabra cuenta: 47 reales.

#### El hallazgo gordo: el tiempo escondido en «El cuerpo»

El subnivel 9.3 era el vertedero de la vieja unidad 10.1 («Gorputza,
urtaroak eta jaiak»). Las fiestas ya se habían sacado a 6.5, pero **las
estaciones y el tiempo seguían dentro**: `udaberria`, `udazkena`, `elurra`,
`haizea`, `hodeia`, `eguraldia`, `hotza`, `beroa`.

Consecuencia para el alumno: **en la unidad 6 aprendía invierno y verano, y
primavera y otoño no aparecían hasta tres unidades después, dentro de un
subnivel de partes del cuerpo.** Y cuatro ejercicios titulados «Empareja el
cuerpo» le sacaban `elurra` (nieve) o `hodeia` (nube) — más `dirua` (dinero)
y `galdetu`, que tampoco pintaban nada.

Movidas las ocho a 6.4. Limpiadas las 21 celdas contaminadas, repartiendo las
once palabras del cuerpo de forma uniforme (tres apariciones cada una) en
vez de repetir `burua` seis veces. Y reescrito `u6-g18`, que era **el tercero
de tres emparejar casi idénticos** rotando las mismas cuatro palabras, para
cubrir las recién llegadas.

#### Fusión 1 · Unidad 4: «La familia cercana» + «La familia extendida»

Idea de Ric: la línea entre cercana y extendida era arbitraria, se aprende
como un solo campo, y **la unidad 4 era la única del curso con 8 temáticas**.

Al mirarlo de cerca los dos subniveles estaban además sucios: `u4-g26` y
`u4-g27` mezclaban familia + números + animales de granja en el mismo
«empareja», y `u5-g12` metía `txakurra` y `katua` entre padre, madre e hijos.

Esas bolsas no eran malas, **estaban en el sitio equivocado**: son ejercicios
de repaso, y la unidad ya tiene un test que es literalmente «todo lo anterior
mezclado». Movidas ahí. Resultado, **sin escribir ni un ejercicio nuevo**:

| | antes | después |
|---|---|---|
| 4.6 «La familia» | 5 + 5 | **7 grupos** |
| 4.7 «Animales» (era 4.8) | 5 | **6** |
| Test | 5 | **7** |

#### Fusión 2 · Unidad 8: «En qué vas» + «Dar indicaciones» → «Cómo llegar»

También idea de Ric. Y hay un argumento que la respalda: la ficha de «Dar
indicaciones» ya decía *«fíjate en que `ezkerrera` lleva dentro el `-ra` de
movimiento»*, **y ese `-ra` se enseña en la primera ficha del otro
subnivel**. La conexión existía pero cruzaba una frontera. Añadido un puente
al principio. 8.2 queda con 3 fichas, 9 palabras y 8 grupos.

#### Unidad 1: el orden estaba del revés

«Pronunciación y dialectos» hablaba de `batua` y `euskalkia` **antes** de que
«Dónde se habla» los presentara. O sea: te explicaba cómo suenan los
dialectos antes de decirte qué es un dialecto. **Intercambiados 1.3 y 1.4.**

Y limpiadas cuatro variantes de 1.1 «Saludos» que practicaban cortesía
(`barkatu`, `eskerrik asko`, `mesedez`), que es 1.2.

#### Otros movimientos

- `u10.1-g01` (partes del cuerpo) estaba en **6.1 «La hora»** → 9.3.
- `u8-g03` y `u8-g12` (comida) estaban en 7.1, que tenía **11 grupos**, el
  doble de la mediana → 7.5 «Comer y beber».
- `non?` estaba en 3.2 aunque 3.1 «Las interrogativas» tiene las otras
  nueve → movida a 3.1. Y `u3-g04`, que enseña la familia Non/Nora/Nondik,
  subió a 3.2, que es su ficha.
- Solo **2 palabras duplicadas** en todo el curso (`bihar`, `nahi dut`), las
  dos con la misma traducción.

#### ⚠ Aviso sobre el progreso local

Se han renumerado subniveles (4.8→4.7, 8.4→8.3, 8.5→8.4, 1.3↔1.4). El
progreso guardado en el navegador va por id de subnivel, así que **lo hecho
en esos aparecerá desplazado**. Se arregla borrando el progreso local.

#### Quedan 14 variantes

Contaminaciones de una sola palabra, casi todas del subnivel siguiente:
`u2-g01` (geu/neu/zeu), `u3-g01` (la familia de non), `u9-g10`
(eskuinera/ezkerrera), `u9-g13` (erantzun/guri), y siete más con una palabra
cada una. Pendientes.

### Pasada final: lo que salió al revisar los propios cambios (2026-08-26)

Ric: *«haces una nueva pasada por todas las unidades, para asegurarnos que
con los últimos cambios no quedó algo raro»*. Buena idea, porque salieron
tres cosas — **una de ellas provocada por un arreglo anterior de hoy.**

#### 5.3 «Los colores» no tenía ni un color

Los once colores estaban en **5.2 «La casa por dentro»**, que cargaba con
**39 palabras**, la mayor del curso. Y 5.3, titulada «Los colores», contenía
adjetivos: `handia`, `txikia`, `polita`, `berria`, `zaharra`.

Ric ya había dicho en su día que **los colores fueran con los adjetivos**.
Movidos, y 5.3 pasa a llamarse **«Colores y adjetivos»** (16 palabras).
5.2 baja a 28.

**Y ahí saltó el efecto secundario:** al mover el vocabulario, su ejercicio
(`u6.1-g01`, emparejar los once colores) se quedó atrás en 5.2. La pasada lo
cazó. Movido también — y entonces 5.2 se quedó en 4 grupos, así que se
escribió uno nuevo (`u5-n01`).

El grupo nuevo **practica el patrón `-gela` que la ficha ya explicaba** en vez
de repetirlo (`egon`+gela = salón, `jan`+gela = comedor, `su`+`alde` =
cocina) y recoge `telebista`, la única palabra del subnivel sin practicar.

#### Un fallo mío en la ficha de demostrativos

La ficha que escribí para 3.3 usaba de ejemplo `etxea`, `liburua`, `mendia`,
`handia` y `txikia`. **Las cinco se enseñan después de la unidad 3** — en la
5, la 8 y la 9. Comprobé que existieran en el curso, pero no que se
enseñaran antes. Es exactamente el error que llevaba toda la tarde cazando
en los demás.

Reescritas las tres fichas y el grupo `u3-g29` con vocabulario que el alumno
sí tiene en la unidad 3: `laguna`, `ikaslea`, `irakaslea`, `medikua`,
`galdera`, `euskalduna`.

#### El id que ya existía en otra unidad

Al crear el grupo nuevo le puse `u5-g05`… que ya existía **en la unidad 4**,
porque los grupos conservan el id de su unidad de origen. Lo cazó
`verificar.py`. Renombrado a `u5-n01`.

#### Sobre los ejemplos de gramática

El barrido encontró **73 ejemplos de gramática** que usan vocabulario
posterior. **No se han tocado, y con motivo:** un ejemplo lleva la traducción
al lado, así que no exige conocer la palabra — a diferencia de un ejercicio,
donde hay que producirla o reconocerla. Muchos además son de un subnivel más
adelante dentro de la misma unidad. Corregirlos en bloque sería empeorar
ejemplos que funcionan.

#### Estado final del curso v2

| Comprobación | |
|---|---|
| Numeración de subniveles sin huecos | ✓ |
| Sin subniveles huérfanos | ✓ |
| Todos con 5+ ejercicios | ✓ |
| Todos con algo que estudiar | ✓ |
| Nada imposible de acertar | ✓ *(1 excepción, abajo)* |
| Parejas sin lados repetidos | ✓ |
| Sin preguntas circulares | ✓ |
| Sin referencias a unidades posteriores | ✓ |
| Ids únicos en todo el curso | ✓ |
| Ficha de dialecto en cada unidad | ✓ |
| Todos los grupos con 5 variantes | ✓ |

**48 subniveles, 327 grupos, 1.635 variantes, 506 palabras.**

*La excepción:* `gutxi` en dos variantes de 6.1 «La hora». No es un fallo —
la ficha lo enseña explícitamente («los minutos se cuelgan con *eta* o con
*gutxi*»); está catalogado en 9.1 con su otro sentido, «poco». Se deja así
en vez de forzar el número a cero.

### Etiquetas literales en pantalla, y tres cuñas nuevas (2026-08-26)

#### El `<u>` que se veía tal cual — ARREGLADO

Ric: *«me iba encontrando con `<u></u>` o `<b></b>` y se me pasaba
anotarlo»*. Nueve casos, todos `<u>`, en las **tres versiones del curso**,
o sea que también estaba en lo publicado.

**El fallo estaba en la app, no en los datos.** `richText()` convertía `<b>`
e `<i>` pero no `<u>`, así que salía «`<u>ogirik</u>`» en crudo. Y
`verificar.py` ya daba `<u>` por válida: el que iba por detrás era el
renderizador.

El uso además es legítimo y **no se podía sustituir por `<b>`**: marca la
pieza clave *dentro* de un ejemplo que va entero en negrita —
«Ez dut `<u>`ogirik`</u>` jaten», «Bilbo Gernika `<u>`baino`</u>` handiagoa
da»—, un segundo nivel de énfasis que la negrita no puede dar.

Añadido a `richText`, y estilado con el color de acento en vez de subrayado
a secas, que se lee como enlace.

**Comprobado de paso algo que habría sido peor:** `nota`, `explicacion`,
`pista`, `pregunta` e `instruccion` **no pasan por `richText`** sino por
`esc()`, así que cualquier etiqueta ahí saldría literal. No hay ninguna, y
ahora hay una comprobación que lo vigila.

#### Las cuñas: el curso estaba mejor surtido de lo que parecía

Al barrer las 126 fichas, **58 ya tienen contexto histórico o cultural**, y
las buenas son muy buenas: la base veinte con el guiño al `quatre-vingts`,
`asteburua` = «la cabeza de la semana», `sukaldea` = «la zona del fuego»,
el patrón `-gela`, `urdina` cubriendo un rango más amplio que el «azul»
castellano, y el remate del cuadro de hermanos: *«curiosamente, en una
lengua sin género gramatical»*.

Así que en vez de rellenar, se buscaron **huecos reales**. Tres:

**1 · «El año tenía dos estaciones, no cuatro» (6.4).** Salió de verificar
una explicación que yo había escrito de memoria: estaba bien pero corta.
Tradicionalmente el euskera solo tenía `uda` y `negu`; las otras dos se
formaron sobre el verano (*udaberri* = verano nuevo, *udazken* = final del
verano), mientras que «primavera» viene de *prima vera*, «el primer
verdor», sin relación con «verano». Cada lengua cortó el año por donde le
importaba.

**2 · «El territorio se llama como la lengua, y no al revés» (1.3).**
`Euskal Herria` = *euskal* (del euskera) + *herri* (pueblo, territorio).
El sitio toma el nombre de la lengua, al contrario que el castellano
(← Castilla) o el `français` (← Francia). Y el sistema es coherente hasta
el final: `euskaldun` = *euskal* + *-dun* («que tiene»), **el que tiene el
euskera** — no dice de dónde eres, dice qué hablas. Recogido por escrito
desde el siglo XVI, y de origen cultural, no político.

**3 · «El jueves y el viernes: los dos que no encajan» (6.2).** Tapa un
hueco visible: la ficha de los días explicaba los tres `aste-` y dejaba
`ostegun` y `ostiral` sin comentar, aunque saltan a la vista. El `ost-`
tiene que ver con el cielo y el trueno, y es la raíz de `Ortzi`. Y el
paralelo remata: *jueves* ← Júpiter, *Thursday* ← Thor, `ostegun` ← Ortzi.
Tres familias de lenguas sin relación, y las tres dieron el jueves al mismo
tipo de dios. **Lleva un aviso explícito de que es la explicación más
aceptada y no un hecho cerrado**, porque los detalles se siguen discutiendo.

Las tres verificadas antes de escribirlas, y comprobado que sus ejemplos
solo usan vocabulario ya visto.

#### Huecos que quedan y NO se han tapado

Se miraron y se descartaron a propósito, porque ya estaban cubiertos: el
patrón `egin` (*lo egin*, *hitz egin*), los meses (tienen cuatro fichas,
incluida «El año que se llena»), los dobles nombres de las ciudades, y el
sistema `neba`/`arreba`. Meter algo encima habría sido relleno.

### Saltos de línea en mitad de la frase (2026-08-26)

Detectado por Ric en la ficha «Dónde se habla el euskera»: el párrafo se
veía partido a mitad.

**La causa:** `richText()` convierte **cada `\n` suelto en un `<br>`**. Eso es
justo lo que se quiere en una lista —los territorios, las conjugaciones, los
pares de vocabulario—, pero si un párrafo de prosa se escribió ajustado a
mano a unos 70 caracteres, el lector ve la frase cortada donde acababa la
línea del editor.

**Barrido: un solo caso en todo el curso.** El detector marcó once párrafos,
pero **diez eran listas legítimas** (`uda + berri → udaberri`, `Si es un
chico: anaia…`, `Ni ikaslea naiz. → sin -k…`), donde el salto es correcto y
tocarlo lo empeoraría. El único de verdad era el que vio Ric.

De los 5 saltos de esa ficha, **3 son buenos** (la lista de los cuatro
territorios del sur) y 2 eran el párrafo mal ajustado. Unido en una línea;
comprobado en la app que ese párrafo ya tiene 0 `<br>` y que la lista de
territorios conserva los suyos.

**El problema espejo, comprobado y limpio:** `nota`, `explicacion`, `pista`,
`pregunta` e `instruccion` van por `esc()`, que **no** convierte `\n` — en
HTML se colapsaría a un espacio y un corte de párrafo intencionado se
perdería sin avisar. No hay ninguno.

**Para que no vuelva:** `verificar.py` avisa cuando dos líneas seguidas de un
párrafo parecen las dos prosa corrida en vez de elementos de una lista.
Probado a la inversa (volviendo a meter el salto) para confirmar que salta.

### La ficha del botón describía el diseño anterior (2026-08-26)

Detectado por Ric. «El botón de arriba, explicado» (u1, 1.3) contaba que el
botón de la cabecera elegía **entre dos variantes de contenido**, bizkaiera
o gernikera. Eso ya no es así, y lo dice el propio código:

> *El botón de la topbar ya no elige QUÉ dataset cargar —eso ahora es el
> desplegable de Ajustes—, sino si los ejercicios también preguntan por esa
> variante.*

**El reparto real ahora son dos controles distintos:**

| | Dónde | Qué hace |
|---|---|---|
| **Batua / Bizkaiera** | cabecera | Si los ejercicios **también** te preguntan las formas locales. Apagado de fábrica. |
| **Tu variante dialectal** | Tu cuenta | Qué variante muestra el **contenido** del curso. |

Ficha reescrita con eso. Y se aprovechó para explicar el porqué del valor
por defecto, que estaba en un comentario del código y no llegaba al alumno:
apagado, las formas locales **siguen visibles** en Vocabulario y Diccionario
para leerlas y reconocerlas — simplemente no te examinan de ellas.

#### ⚠ Incoherencia encontrada al verificarlo — NO tocada, es decisión de producto

El desplegable de «Tu cuenta» **sigue ofreciendo Gernikera**, aunque Ric dice
que ahora solo el bizkaiera está accesible. Y hay algo peor: en el curso
reestructurado, elegir Gernikera **no hace absolutamente nada**. La línea que
decide qué cargar es:

```js
var indicePath = V2 ? 'data/curso-v2.json'
                    : (MODO_DIALECTO === 'gernikes' ? 'data/curso-gernikes.json' : 'data/curso.json');
```

Con `?v2` activo, `MODO_DIALECTO` se ignora. O sea que es **un ajuste que el
usuario cambia y no pasa nada**, sin aviso ninguno. En el curso publicado sí
funciona, porque ahí `V2` es falso.

Dos salidas, y la elección es de Ric y Miguel:
1. **Ocultar Gernikera** mientras no esté lista (le falta el audio entero).
2. **Montar la versión gernikés del curso v2**, que hoy no existe: solo hay
   `data/unidades-gernikes/` con la estructura vieja de 12 unidades.

Mientras tanto, la ficha nueva no menciona Gernikera: habla de «tu variante»
y dice que la montada y con audio es el bizkaiera.

### Fuera el gernikés, y las fichas de dialecto siguen al switch (2026-08-26)

Decisión de Ric: *«eliminaremos el Gernikera, era un capricho mío porque
convivo más en Gernika, pero no es relevante»*.

#### Lo que se ha quitado

- La opción **Gernikera** del desplegable de «Tu cuenta».
- La rama `gernikes` de `cargarCurso()`, `nombreDialecto()` y `MODO_DIALECTO`.
- Los comentarios que la describían, que se habrían quedado mintiendo.

**El mecanismo se conserva a propósito**, con una sola entrada
(`var VARIANTES = { bizkaiera: 'Bizkaiera' }`), porque Ric dice que en el
futuro podría enriquecerse con otras. Añadir una es una línea.

**Los archivos NO se han borrado.** `data/unidades-gernikes/` y
`data/curso-gernikes.json` siguen en el repo, desenganchados de la interfaz.
Es contenido original de Ric y borrarlo es una decisión aparte; si se quiere,
se hace en un commit propio y limpio. `verificar.py gernikes` los sigue
revisando.

#### Lo que queda de aquello, y es lo bueno

En vez de una versión entera que mantener, el gernikés se queda como
**curiosidad dentro de la ficha de los artículos** (u2, 2.3), que es donde
encaja porque va justo de esa `-a`:

> En **Gernika** y por zonas de Busturialdea, esa *-a* final se oye a menudo
> como **-ie**: donde aquí escribimos *etxea*, allí suena **etxie**.

Con el aviso de que no hay que aprenderlo —esto es batua— pero que si se oye,
no es un error.

#### Las fichas de dialecto ahora aparecen y desaparecen con el switch

Petición de Ric: si has elegido que **no** te pregunten en bizkaiera, tampoco
tiene sentido llenarte la lección de bizkaiera.

Las 19 fichas «Cómo suena esto en Bizkaia» del curso v2 (49 contando los tres
cursos) llevan ahora **`registro: "bizkaiera"`** en el JSON — igual que ya lo
llevaba el vocabulario. El código las reconoce **por el dato, no por el
título**, que sería frágil.

| Switch | Fichas visibles |
|---|---|
| **Batua** | 107 de 126 |
| **Bizkaiera** | las 126 |

Filtrado en un solo sitio (`gramaticaVisible()`), aplicado en los tres que
importan: la pantalla de gramática, el contador de la unidad y el de cada
subnivel. Comprobado en la app: el rótulo del subnivel 3.3 pasa de
«2 explicaciones» a «3» al darle al switch, así que **el contador no miente**.

*Detalle que se simplificó al verlo:* el switch solo está visible en la Home
(`mostrar()` lo esconde en las demás), y al entrar en una unidad se pinta de
cero. Así que no hace falta repintar más pantallas — se quitaron esas ramas,
que eran código muerto.

#### ⚠ Para comentar con Miguel

El brief, sección **5.1**, es un refinamiento que pidió él: *«ambas presentes,
ninguna oculta»*. Esto **no lo contradice**, porque 5.1 habla del
**vocabulario** (`kaixo` / `aupa`), y ahí las dos formas siguen visibles y
etiquetadas como siempre — solo se ocultan las **fichas de explicación**.
Pero está lo bastante cerca como para decírselo.

### Cuarta tanda de Ric (26/08/2026) — sin subir, a la espera de Miguel

Ric abre lista nueva probando la app. Se acumulan y se suben juntas, porque
son de audios o de respuestas flexibles.

**1 · `barkatu` no aceptaba «perdona».** Solo «perdón» y «disculpa».
Añadido `esAlt: ["perdona", "perdone", "disculpe"]`, comprobado antes que las
tres estaban libres y no son de ninguna otra palabra del curso.

*Falsa alarma que conviene dejar escrita:* Ric dijo primero que el audio era
«mesedez» (que es «por favor»), lo que habría significado un mp3 cruzado en
el bucket. Se comprobó descargando los dos: **son archivos distintos**
(7.244 y 4.172 bytes, hashes distintos), y además `preguntaEscucharTeclear`
coge el audio y la respuesta **de la misma entrada**, así que no puede
descuadrarlas. Ric confirmó después que se había equivocado al escribir: era
`barkatu`. Queda anotado el método, que sirve para la próxima sospecha.

**2 · «¿Qué significa batua?» → «el batua».** No enseñaba nada. La traducción
pasa a **«el euskera unificado»**, con `esAlt` para «el estándar» y «el
batua» (aceptarlo es de justicia, aunque no sea lo que se muestra). La nota
se ajustó para no repetir lo que ya dice la traducción.

*Barrido de la misma clase de fallo:* solo tres entradas en todo el curso se
traducen a sí mismas, y **las otras dos no son un fallo**: `sofa` = «el sofá»
y `patata` = «la patata» son préstamos que coinciden de verdad. Para un
ejercicio de escuchar siguen valiendo, porque la pronunciación no es la misma.

**3 · El «casi correcto» no enseñaba la respuesta buena.** Se daba por válido
y se pasaba de largo, así que la errata volvía a la siguiente vuelta. Ahora
las dos correcciones (`corregirTraducir` y `corregirTeclear`) muestran la
comparación letra a letra igual que en un fallo — solo cambia el titular y el
color.

Detalle que importa: se compara contra **la variante a la que te acercaste**,
no contra la solución principal. Si escribiste algo parecido a la segunda
forma válida, corregirte hacia la primera sería desconcertante.

Probado en `scripts/probar_casi.js`, con el caso de control incluido:
acertando exacto **no** se enseña la respuesta, porque acabas de escribirla.

**4 · `nongoa` suena «nowa».** La G se pierde y la última vocal no se oye.
Deben sonar las tres sílabas con la G marcada: **non-GO-a**. Añadida al lote
(`lote-ric-3.mjs`, ahora 23) y a `docs/audios-pendientes.md`.

### «Tema» en vez de «subnivel», y salida del callejón al acabar (26/08/2026)

Dos cosas que Ric ve **haciendo el curso**, que es donde se notan.

#### La palabra

*«Subnivel»* pasa a **«tema»** en todo lo que se ve en pantalla: las tarjetas
de unidad («4 temas»), la cabecera del tema, y los mensajes de la pantalla
final («Tema superado», «Te quedan 3 temas en la unidad»).

**Solo el texto visible.** La clave `subnivel` de los JSON y los nombres de
las funciones se quedan como están: renombrarlas sería mucho ruido sin
ganancia, y el esquema de datos también es de Miguel. Queda esa asimetría
entre lo que se ve y lo que se programa; si molesta, es un commit aparte.

#### El callejón del final

Al acabar los ejercicios de un tema, la pantalla ofrecía **«Repetir la
unidad»** y **«Volver al inicio»**. Ninguna de las dos es lo que quieres
hacer ahí: lo natural es seguir. Y encima «repetir la unidad» era mentira,
porque lo que habías hecho era un tema.

Ahora, al terminar un tema:

| | |
|---|---|
| **Seguir: «La familia de non»** | entra en el siguiente tema por su explicación |
| Volver a la unidad | |
| Repetir este tema | |

Si era el último tema de la unidad, el primer botón pasa a ser **«Volver a la
unidad»**. El test de la unidad conserva sus botones de siempre.

**Una trampa que había que esquivar:** cuatro temas del curso son solo de
vocabulario y no tienen ficha de gramática (1.2, 4.7, 8.4 y 9.4). «Seguir» en
esos habría abierto una pantalla vacía, así que cae en la portada del tema.

Comprobado en `scripts/probar_navegacion.js`, que recorre **los 48 temas de
las 10 unidades** verificando a dónde manda cada «Seguir», que el test no lo
ofrezca, y qué botones salen en cada caso.

### Quinta tanda: agujeros de explicación en las unidades 3 y 4 (26/08/2026)

Todo detectado por Ric **haciendo el curso**, que es donde se ven.

#### Respuestas

**`zenbat?` daba «casi correcto» a «cuánto».** Su traducción es «¿cuánto?
¿cuántos?» — dos alternativas separadas solo por el cierre de interrogación,
y los separadores que el código entendía eran la coma y la barra. Las trataba
como **una sola respuesta de dos palabras**. Arreglado en el motor, no palabra
por palabra: ahora `? ¿` separa alternativas, patrón que no es ambiguo. Le
pasaba también a `zein?` y a `nondik?`.

**`zergatik?` y «porqué»: se queda como error, a propósito.** Ric preguntó si
debería aceptarse. La respuesta salió al probarlo: como las tildes se aplanan,
aceptar «porqué» acepta también **«porque»** — y «porque» ya es de `-lako`, el
sufijo causal. Aceptarla enseñaría a confundir dos palabras del curso. Es el
mismo motivo que impidió dar «bien» a `oso ondo`. En vez de eso, la nota de
`zergatik?` explica ahora la diferencia.

#### Explicaciones que faltaban

**3.4 practicaba exclamativas sin explicarlas.** Siete variantes preguntaban
por `Hau hotza!` y no había ninguna ficha. El agujero del 3.3 otra vez.
Escrita **«Exclamar: la misma palabra que para señalar»**, que engancha con
los demostrativos que se acaban de ver y avisa de que los adjetivos llegan en
la unidad 5.

**4.1 «Números del 1 al 20» empezaba por el once.** Los diez primeros estaban
en el vocabulario y no los presentaba nadie. Escrita **«Del uno al diez»**,
con los tres avisos que ahorran disgustos (`bat` es también «un/una» y va
detrás; `bi` admite las dos posiciones; detrás de número el sustantivo va sin
artículo).

**4.6 «La familia» no presentaba la familia.** Efecto de la fusión: «La
familia cercana» solo aportaba la ficha de los hermanos y «La familia
extendida» hablaba de casos particulares. Veinte palabras y nada que las
ordenara — y salían en las pruebas. Escrita **«La familia, de arriba abajo»**,
con el mapa entero y dos observaciones: casi ninguna se empareja por género
(*aita*/*ama*, *osaba*/*izeba* no se parecen), y la excepción que canta es
`lehengusua`/`lehengusina`, que vino de fuera con el emparejamiento puesto.

#### Explicaciones que se quedaban cortas

**4.2** ahora **desmonta el 71 y el 54** paso a paso, señala que el segundo
trozo nunca pasa de 19 (que es por lo que hacía falta el once-diecinueve
antes), y amplía el paralelo con el francés: *soixante-dix*, *quatre-vingts*,
y que el francés solo lo hace a partir del 60 mientras el euskera lo lleva de
principio a fin.

**4.3** lista **los doce primeros ordinales** en vez de cinco, con sus siete
palabras nuevas al vocabulario (más distractores para los ejercicios).

**4.5 `eduki`** se conjuga **entero** (nik, zuk, hark, guk, zuek, haiek),
verificado en fuente, señalando que todas empiezan por `dauka-` y que quien
tiene lleva la `-k` del ergativo. Y se quitó la referencia a `jaten dut`, que
es de la unidad 7: ahora dice que ese mecanismo llega más adelante. El
ejercicio `u4-g21 v4` lo citaba igual y también se reescribió.

**Vocabulario que se usaba sin presentar:** `astia` (no estaba en ninguna
unidad) y `dirua` (estaba en 9.5, cuatro unidades después de usarse) pasan a
4.5. Quitada la duplicada de 9.5, que la sigue practicando como repaso.

**4.6, ejemplos con «nik»** (pedido por Ric): las tres frases comparadas
—`Nik arreba bat daukat` / `Nik ahizpa bat daukat` / `Mikelek arreba bat
dauka`— dejan ver que la `-k` marca a quien tiene, y que las dos primeras son
la misma frase en castellano y palabras distintas en euskera.

#### El género en las explicaciones

Ric: *«a veces me da la sensación de que las explicaciones son siempre en
masculino»*. El vocabulario ya estaba bien («el/la amigo/a», «nosotros /
nosotras»); donde se escoraba era en **las tablas de conjugación**.

Decisión de estilo: **doblar todas las glosas dejaría el texto ilegible**. Así
que la tabla de `izan` —la primera del curso— va doblada y rematada con el
porqué («de aquí en adelante no lo repetiremos, pero da igual siempre»), y a
partir de ahí se **alterna**: las formas reforzadas abren en femenino, y la
ficha de ordinales explica que `bigarrena` es «el segundo» y «la segunda» sin
que haya que elegir.

#### Escuchando un número, la cifra vale tanto como la palabra

Ric: oyendo `zortzi` debería aceptar **«8»** además de «ocho». Lo que se
practica es reconocer la palabra en euskera, no escribir castellano.

Hecho **en el motor**, no con `esAlt` palabra por palabra, para que valga
también para los números que se añadan después: 29 entradas cubiertas de
golpe (1-20, las decenas, `ehun` y `mila`).

Dos decisiones que conviene tener anotadas:

- **Funciona en los dos sentidos.** Si algún día una respuesta se escribe con
  cifra, se aceptará la palabra.
- **Solo cuando la respuesta entera es el número.** Dentro de una frase no se
  convierte: «hace dos años» no acepta «hace 2 años». Se puede ampliar, pero
  así el comportamiento es predecible y no aparecen sorpresas donde nadie las
  busca.

Cubierto en `scripts/probar_respuestas.js`, que comprueba también que
rechace el número equivocado y las palabras parecidas (`ochenta` por `ocho`).

### El curso en gernikés, borrado (26/08/2026)

Ric: *«el gernikés se puede borrar definitivamente»*. Estaba desenganchado de
la interfaz desde hace unas horas; ahora se van también los archivos.

**Lo que se ha ido:** `data/unidades-gernikes/` (12 unidades, 77 fichas, 365
palabras, 721 variantes) y `data/curso-gernikes.json`. Unos 456 KB.
Recuperables en el historial de git si algún día hicieran falta.

**Y el cableado que quedaba**, que era más de lo que parecía: el registro de
cursos de `verificar.py`, el bloque informativo de `probar-todo.sh`, y la
opción del selector en `revisar.html` — una herramienta que no habíamos
mirado y que también lo llevaba.

#### Lo que NO se toca, porque no es lo mismo

Ric lo precisó: *«cuando se usa Gernika en los textos y explicaciones está OK,
es la variante y explicaciones localizadas»*. **Las once menciones a Gernika
en las fichas se quedan**, incluida la curiosidad del `etxie` por `etxea` en la
ficha del artículo. Lo que se borra es la versión paralela del curso, no el
sitio ni sus rasgos.

También se quedan las menciones en `docs/` y `CHANGELOG.md`: eso es histórico
y borrarlo sería reescribir el pasado.

#### Un fallo que salió del barrido

`u1-g14 v4` **seguía preguntando por el botón «Bizkaiera / Gernikera»**. Al
reescribir su ficha se me pasó el ejercicio, así que estaba doblemente mal: el
botón ya no dice eso, y tampoco hace lo que la respuesta correcta afirmaba.
Actualizado.

`scripts/gen_14.py` se conserva —es el registro de cómo se montó el subnivel
1.4— pero **con un aviso arriba de que ya corrió y no hay que relanzarlo**: la
ficha que escribe describe el selector retirado, y volver a ejecutarlo
pisaría la versión buena.

### La barra dice dónde estás, y las burbujas van al final (26/08/2026)

#### Unidad y tema en la barra superior

Ric: dentro de un tema quiere ver **la unidad y el tema** arriba. Antes solo
cabía una de las dos —en Gramática se veía la unidad, en la portada del tema
el tema— así que metido en un ejercicio no sabías de qué tema era.

Empecé metiéndolo en una línea y **no cabía**: el peor caso, «Zenbat eta
familia · 4.4 Tener, y decir tu edad», se corta en un móvil, y lo que se
perdía era justo el nombre del tema. La barra mide 60px y una línea usa 22,
así que **van en dos líneas**: la unidad arriba en gris, el tema debajo. Con
la barra de progreso del ejercicio ocupa 45 de 59px, así que cabe de sobra.

Comprobado a 375px con el título más largo del curso: los dos enteros, sin
recortar. Las pantallas de una sola línea (Home, unidad, diccionario) no
cambian.

*Detalle:* la clase de las dos líneas la pone el JS en vez de usar `:has()`
en el CSS, que es un selector reciente y esto tiene que verse igual en
cualquier navegador.

#### Las burbujas de dialecto, al final de su tema

Ric: *«estas burbujas localizadas deben estar al final del tema que les
corresponde»*. En medio cortan la explicación en dos.

Barridas las 21. **Cuatro estaban en medio** —una de ellas por mi culpa, al
insertar la ficha del jueves en 6.2 empujé la burbuja detrás— y **tres
estaban en el tema equivocado**:

- La de **`egon`** vivía en 5.2 «La casa por dentro» y habla del verbo:
  pasa a **5.1**. La encontró Ric.
- La de 5.2 mezclaba **colores y casa**. Partida: los colores a **5.3**
  (donde los moví hace unas horas), la casa se queda.
- La de 6.5 «Las fiestas» abría hablando **del cuerpo** (`belarria`). Otro
  resto de la vieja unidad 10.1: ese párrafo se va a **u9 9.3**.

Todas las unidades conservan al menos una. **`verificar.py` comprueba ahora
que ninguna burbuja tenga una ficha normal detrás**, así que la regla se
mantiene sola.

### El test de unidad, de 7 preguntas a 12 (26/08/2026)

Ric: *«el test de unidad debería tener al menos 10 preguntas, ideal que sean
12, porque recoge preguntas de todos los temas»*.

**Lo que había.** El test cogía un ejercicio de cada grupo marcado como
`test` —cinco en casi todas las unidades— más las dos de escuchar que se
cuelan en cualquier práctica. **Siete preguntas.** La unidad 4, con siete
grupos, llegaba a nueve.

**Lo que hay.** Se completa hasta doce tirando de los grupos de los temas, que
es lo coherente con lo que el test dice ser: todo lo anterior mezclado. No
hizo falta escribir ni un ejercicio nuevo.

**Se reparte por turnos**, uno de cada tema, para que ninguno acapare. Y se
baraja también **el orden de los temas**, no solo los grupos dentro de cada
uno: sin eso, en las unidades que solo necesitan dos o tres de relleno
saldrían siempre de los primeros temas y los últimos no entrarían nunca en el
test. Comprobado en la unidad 4, que solo necesita tres: en 60 tiradas
aparecen sus **siete** temas.

Las diez unidades llegan a 12. Verificado también en la app: el contador dice
**0/12** y la barra, «Galderak · Test».

`scripts/probar_test.js` comprueba las dos cosas —el tamaño y el reparto— y
el mínimo de 10 por si algún día se toca el número.

### Números compuestos en los ejercicios (26/08/2026)

Ric: *«estaría bien que alguna de las preguntas preguntara algún número que
no sea exacto 40, 60, 50… sino algo más complicado como 42 o 76»*.

Tenía razón y era peor de lo que parecía: **los cinco grupos de 4.2
preguntaban solo decenas redondas**, ni un compuesto — justo lo que la ficha
enseña a construir. Y entre ellos eran casi el mismo ejercicio con las
palabras barajadas.

Reescrito `u4-g44`, uno de los cinco: ahora va de componer y descomponer
(42, 76, 22, 91, 35), y remata con la idea que sostiene todo el sistema — el
segundo trozo nunca pasa de 19, que es por lo que hacen falta el once al
diecinueve antes de contar alto. De paso baja la repetición del tema.

**Aviso sobre la verificación, que casi me la cuela.** Al buscar la
construcción, el resumen del buscador afirmó que **42 es «hogeita bi»**. Es
falso: `hogeita bi` es 20+2 = **22**. La fuente consultada después lo da bien
(`berrogeita bi`). Y de 76 y 91 la extracción devolvía el redondo más
cercano (70 y 90).

Por eso las ocho formas del ejercicio —respuestas y distractores— se pasaron
por un comprobador aritmético que las desmonta pieza a pieza. Los
distractores además no coinciden por accidente con la respuesta:
`hirurogeita sei` es 66, `laurogeita hamasei` 96 y `hirurogeita hamar` 70.

### «Azkena» estaba de paso en la ficha de ordinales (26/08/2026)

Ric: en los ordinales se explica `lehena` pero no `azkena`, y debería estar
en el texto de gramática.

Estaba — pero en **una línea suelta** entre la lista y las irregularidades,
tan de paso que Ric la leyó y no se le quedó. Y es **el problema del 3.3 al
revés**: `azkena` se practica en **siete variantes** y se explicaba en media
frase.

Reescrita esa parte con un encuadre que además es cierto y se recuerda: **los
dos extremos de la serie son justo los que se escapan de la regla.** `lehena`
no es «batgarrena», y `azkena` no se construye con ningún número.

Y se le añade el porqué, que es lo que faltaba: «último» **no es un puesto
fijo**, depende de cuántos haya. En una fila de tres, el tercero y el último
son el mismo; en una de diez, no. Por eso necesita palabra propia y no puede
salir de un número más `-garren`.

Ejemplos ampliados con `Lehena eta azkena`, y comprobado que ninguno usa
vocabulario posterior.

### Los animales pasan al caserío (26/08/2026)

Idea de Ric: un tema de solo vocabulario se hace raro, y los animales encajan
mejor en la unidad de la casa. Le propuse partirlo —mascotas en la 4, granja
en la 5— porque `txakurra` y `katua` sostienen seis fichas del verbo `ukan`.
Ric decidió moverlo entero: *«no pasa nada que se hable de perros y gatos
antes, y después introducirlos todos»*. Los ejemplos llevan la traducción al
lado, así que se sostiene.

**El tema 4.7 pasa a ser 5.5 «El caserío y sus animales»**: 10 palabras y 6
grupos. Tamaños después: la unidad 4 baja de 7 temas a **6** (83 → 73
palabras) y la 5 sube de 4 a **5** (52 → 63). Mucho más parejas.

#### La ficha, con el `baserri` como hilo

El enganche es mejor de lo que parecía: **`baserria` no es un edificio**. Es
la casa más la tierra, los animales y quien vive allí, contado como una sola
unidad de trabajo y de familia. Y muchísimos apellidos vascos **son el nombre
del caserío**, no el del padre — Etxeberria, «la casa nueva». En castellano el
apellido dice de quién eres hijo; en euskera, muchas veces, de qué casa.

Con eso delante, la lista de animales deja de ser una lista suelta: los de
dentro, los que dan de comer, los del monte y el corral.

**Corrección de Ric, preguntando por allí:** escribí que `baso` es «el monte,
la tierra». Es **el bosque** — yo había fundido las dos glosas de la fuente
(`baso` bosque + `herri` en su sentido antiguo de tierra) en una sola.
Corregido a `baso` (bosque) + `herri` (pueblo, que el alumno ya conoce de la
unidad 2): literalmente, **el poblado del bosque**, la casa de fuera del
pueblo.

#### Lo que hubo que limpiar detrás

El test de la unidad 4 preguntaba por animales que ya no son suyos: **9 celdas**
cambiadas por vocabulario de la propia unidad (familia). Y al endurecer la
comprobación aparecieron cuatro grupos más que miraban hacia adelante: el test
de la unidad 2 usaba adjetivos de la 5 y `norekin?` de la 3; el de la 6,
`bazkaria` (u7) y `zorionak` (u10).

### 🔴 PENDIENTE · Vocabulario usado antes de estar catalogado

Al afinar el comprobador para lo anterior salió un patrón de fondo que **no
se ha tocado**, porque es grande y hay que decidirlo:

**102 variantes en 54 grupos** usan palabras en unidades **anteriores** a
donde están catalogadas. Las que más se repiten: `niri`, `etxea`, `al`,
`polita`, `txikia`, `ikaslea`, `medikua`, `anaia`, `laguna`.

**No todas son un fallo.** El curso enseña a propósito frases hechas como
bloques —la ficha 3.4 lo dice literalmente: *«apréndetelas enteras por
ahora»*— y ahí aparecen formas verbales sin explicar. Separar eso de lo que sí
es un descuido es trabajo de criterio, no automático.

*Nota sobre el comprobador, que costó afinar:* la regla buena es mirar
primero **la expresión más larga** que esté en el vocabulario y solo juzgar lo
que queda suelto. Sin eso, «Gabon, ikusi arte» marcaba `ikusi` como palabra de
la unidad 7, cuando `ikusi arte` es de la 1.1. Y hay que normalizar los signos
de interrogación de las claves, o `eta zu?` no casa con `eta zu`.

### «Komuna» explicada, y una referencia vieja que se había escapado (26/08/2026)

Ric: `komuna` estaba en el vocabulario **sin explicar**, y es una oportunidad
perdida porque **en público se pregunta por el komuna, no por el bainugela**.

Añadido a la ficha de la casa, con la distinción práctica: en casa es
<b>bainugela</b>; en un bar, un restaurante o un museo, lo que se pregunta y lo
que pone en la puerta es <b>Komunak</b>, casi siempre en plural. Y la frase
entera, <b>Non dago komuna?</b>, que se construye con `non` y `dago`, ya
suyos. Las notas de las dos palabras se remiten la una a la otra.

#### El fallo que salió de paso

La misma ficha decía: *«jan y egon son verbos que llevas usando desde las
unidades 6 y 8»*. Estamos en la **5**. `egon` es del tema anterior de esta
misma unidad y `jan` es de la **7** — o sea que mandaba hacia adelante y hacia
atrás a la vez, resto de la numeración vieja.

**Se le había escapado al barrido de referencias**, que buscaba «(en/de) la
unidad N» en singular y no cazaba las plurales. `verificar.py` coge ahora
también «las unidades 6 y 8», y da error si una explicación remite a su propia
unidad o a una posterior. Probado a la inversa con el texto viejo puesto.

### «Batzuk» se preguntaba sin explicarse (26/08/2026)

Detectado por Ric: 5.4 explica `bat` pero no `batzuk`, y `batzuk` es **la
respuesta correcta de dos variantes** de ese mismo tema. Encima el subnivel
tenía el vocabulario vacío, así que la palabra no estaba en ninguna parte.

Añadido a la ficha, enganchándolo con lo que el alumno ya tiene — el plural
`-ak`, que es donde se ve la diferencia de verdad:

> **mahaiak** — las mesas (esas, las que sabemos)
> **mahai batzuk** — unas mesas (algunas, cualesquiera)
>
> Es la misma diferencia que en castellano entre «trae las sillas» y «trae
> unas sillas».

Con el aviso de que `batzuk` ya lleva el plural dentro: no se dice «mahaiak
batzuk». Y la palabra al vocabulario del tema, que estaba a cero.

*Curiosidad que salió del comprobador:* marcó `zuri` en el ejemplo «Mahai
zuri bat» como vocabulario posterior. Es un **falso positivo por homógrafo**:
`zuri` es a la vez la raíz de `zuria` (blanco, 5.3) y el dativo de `zu` («a
ti», 9.2). El ejemplo está bien; lo que no distingue es el comprobador.

### Los ejercicios de ordenar se resolvían sin saber euskera (26/08/2026)

Ric: en las fichas de ordenar, **la mayúscula marca el principio y el punto o
la interrogación marcan el final**, así que dan el orden sin necesidad de
entender nada. Y propone lo que hace Duolingo: meter alguna palabra que no
sea de la frase.

Era sistemático: **136 de 144** tenían las dos pistas. En «Egun on. Zer
moduz?» las fichas eran `Egun · on. · Zer · moduz?` — se resuelve a ojo.

**Tres cambios, los tres suyos:**

1. **Fichas despojadas** de mayúscula inicial y de signos: `egun · on · zer ·
   moduz`.
2. **El «?» como ficha suelta**, que era su idea. Deja de marcar cuál es la
   última palabra, y de paso enseña que en euskera la pregunta no lleva
   signo de apertura. No hace falta colocarlo para acertar —`normalizar()`
   lo ignora al corregir— así que es honesto sin ser puntilloso.
3. **Distractores**: una o dos fichas que no son de la frase, sacadas del
   vocabulario del propio tema o de la unidad, así que son palabras conocidas
   y creíbles. Las 144 tienen.

**La corrección no hubo que tocarla**: `corregirOrden()` ya comparaba con
`normalizar()`, que quita signos y mayúsculas. Y usar un distractor sale mal
solo, porque se compara contra la frase entera.

*Dónde se complicó:* la regla para quitar mayúsculas. La primera versión
—«minúscula si la palabra está en minúscula en el diccionario»— dejó con
mayúscula las **formas declinadas** (`Etxean`, `Nik`, `Goizean`), que no
están así catalogadas. Invertida a una lista explícita de nombres propios. Y
todavía se coló `Astelehenean`, porque «Aste Santua» me había dejado `aste`
como raíz de nombre propio: los sitios y las personas se comparan por
prefijo (se declinan: *Bilbon*, *Aneri*) y el resto por igualdad.

Quedan con mayúscula solo `Aneri`, `Bilbo`, `Bilbokoa`, `Bilbon`, `Bilbora`,
`Gernika` y `Madrilgoak`.

`scripts/probar_ordenar.js` comprueba las cinco propiedades en los 144, y
`verificar.py` avisa si un distractor está dentro de la solución.

*No pude probarlo pinchando en la app:* los bucles para atravesar el examen
hasta un ejercicio de ordenar atascaban el navegador. Verificado sobre los
datos y la lógica.

### La referencia académica de 6.1, fuera (26/08/2026)

Ric: *«(Euskaltzaindia, araua 35)» se hace rara aquí y es la primera vez que
vemos algo así»*. Cierto — **era la única cita en ese formato de todo el
curso**. Las otras menciones a Euskaltzaindia van contadas dentro del texto
(«reunió las formas comunes y fijó el estándar», «su diccionario define
txapelketa como…»), que es otra cosa y funciona.

Retirada. La ficha ya explicaba la regla; el paréntesis no añadía nada salvo
un cambio de tono.

### «El domingo» tenía dos respuestas buenas (26/08/2026)

Detectado por Ric en 6.1. El ejercicio decía **«El domingo. → ____»** y entre
las opciones estaban `igandea` e `igandean`. Las dos se traducen «el
domingo» en castellano:

- **`igandea`** — el día en sí. *Gaur igandea da*, hoy es domingo.
- **`igandean`** — el cuándo. *Igandean etorriko naiz*, vendré el domingo.

Ric propuso quitar `igandea` y poner otro distractor. **Hecho, y además
desambiguada la pregunta**: quitar la opción arregla el marcador pero deja al
alumno igual de perdido, y esa distinción es justo lo que enseña el tema.
Ahora dice *«Nos vemos el domingo» — el domingo, ahí, es un cuándo*, y la
explicación cuenta el porqué de la confusión.

**Barrido de la misma trampa.** Saltaron 13 ejercicios con la forma con `-n` y
sin ella entre las opciones, pero **doce son falsos positivos**: tener `ardoa`
y `ardoan` de distractores está bien cuando la respuesta es `ardorik` y el
castellano no admite dudas.

Lo que distingue el caso real: **el castellano sin preposición**. «Por la
mañana», «por la tarde», «a mediodía» fuerzan la lectura temporal; «el
domingo», a pelo, no. De los cinco de ese mismo grupo, solo el de Ric la
tenía.

### 6.1 pedía cosas que enseña 6.2 (26/08/2026)

Ric lo vio en un «bihar arratsaldean». El tema **6.1 «La hora»** tiene como
vocabulario `goiza`, `arratsaldea`, `gaua`… pero **la forma con `-n`
(`goizean`, `arratsaldean`) la explica 6.2**, junto con los días de la
semana. Así que 6.1 pedía cosas de la ficha siguiente.

No era un ejercicio suelto:

- **`u7-g06` entero** —«Por la mañana», «Por la tarde», «A mediodía»…— son
  los cinco la `-n` de tiempo. **Movido a 6.2.**
- **`u7-g08 v3`** pedía «Hoy es viernes» (los días son 6.2) → ahora «Son las
  once».
- **`u7-g08 v5`** era el de Ric, «Mañana por la tarde» → ahora «A las tres y
  media».
- **`u7-g09 v3`** pedía «El domingo por la mañana estoy en casa» —días **y**
  la `-n`— → ahora «A las cinco estoy en casa».

Los tres reemplazos usan las formas de la propia ficha de 6.1
(`hamaikak dira`, `hiru eta erdietan`, `bostetan`), que es de lo que va el
tema. **No hizo falta crear ningún grupo**: 6.1 se queda con cinco, el
mínimo, y 6.2 sube a seis.

*Y el verificador me pilló a mí:* al cambiar las respuestas, las **pistas
seguían describiendo las viejas** —«Empieza por gaur», «Dos palabras»—.
Saltó la comprobación de pistas que se añadió esta misma mañana. Reescritas
con la regla en vez de con la forma.

### Retirada la ficha de Ortzi: el remate era falso (26/08/2026)

Ric dudó de la ficha «El jueves y el viernes: los dos que no encajan»
—a los hablantes que conoce no les sonaba el `ost-`— y pidió fuentes o
retirarla. **Tenía razón, y el fallo era peor de lo que parecía.**

La fuente buena es **M. Glonti, «Sobre los nombres vascos del jueves», en
*Euskera* XXIX**, la revista de Euskaltzaindia. Lo que dice:

- **`ortz` sí significa «cielo, dios, trueno»** — esa parte de la ficha estaba
  bien.
- **Pero `ortzegun` es un CALCO del latín *Iovis dies*.** Conclusión literal
  del artículo: *«en el tiempo latino el vasco sí que produjo el calco
  ortzegun»*. Y la semana de siete días llegó a Europa por el latín, así que
  el jueves como concepto no es prelatino en euskera.
- El artículo repasa **cuatro hipótesis enfrentadas** (Gorostiaga,
  Barandiarán y otras). No hay consenso.

**Mi remate decía justo lo contrario:** *«El euskera no copió el nombre: llegó
por su cuenta a la misma idea»*. Es falso. Sí lo copió — lo tradujo. Y era
precisamente la frase que hacía la ficha memorable.

El aviso que le puse («esto es la explicación más aceptada, no un hecho
cerrado») **no salva nada**: hedgear un dato no lo arregla si el dato está al
revés.

**Retirada la ficha.** En su lugar, una frase dentro de «Los días de la
semana» que dice la verdad y no promete magia: el jueves y el viernes
arrancan por `ost-`, de una capa más antigua, **su origen se sigue discutiendo
entre especialistas**, y lo práctico es aprendérselos tal cual.

**Lección para las cuñas culturales:** verificar antes de escribir no bastó —
lo hice, y la primera búsqueda me dio un resumen que confirmaba lo que quería
oír. Lo que faltó fue **ir a la fuente primaria** en vez de a los resúmenes.
Las otras dos cuñas de ese día (las estaciones y `Euskal Herria`) se apoyan en
etimologías transparentes y verificadas; esta se apoyaba en una
reconstrucción discutida.

### Las listas largas, una por línea (26/08/2026)

Ric, sobre los doce meses: iban de tres en tres separados por «·», y uno por
línea **se lee y se memoriza mejor**. Hecho.

Aplicado el mismo criterio a las otras listas apretadas del curso, pero solo
donde es un **conjunto que hay que aprenderse**:

- los números **del uno al diez**
- los **ordinales del 4 al 12**
- los **demostrativos en plural** (hauek / horiek / haiek)
- las tres tablas de contraste del **repaso de bizkaiera** (naiz → naz…)

**Tres se quedan en una línea, a propósito**, porque ahí la línea dice algo:

- `hogei · berrogei · hirurogei · laurogei` — seguidas se ve la escalera de
  veintes, que es justo lo que enseña esa ficha.
- `Lapurdi · Nafarroa Beherea · Zuberoa` — es un apunte breve, no una lista
  que memorizar; el detalle está en los cuatro del sur.
- `1. = lehena · 2. = bigarrena · 3. = hirugarrena` — son el ejemplo de cómo
  se escribe con cifra, no la lista de ordinales.

### 6.4 explicaba dos veces lo mismo (27/08/2026)

**Duplicado que creé yo** al escribir la cuña de las estaciones: la ficha
nueva («El año tenía dos estaciones, no cuatro») solapaba entera a la que ya
había («Las cuatro estaciones salen de dos palabras»), y no me di cuenta.
Detectado por Ric, que además prefiere la segunda.

Borrada la vieja y subida la buena al principio del tema. **Antes de borrar
se comparó concepto a concepto**, no a ojo:

- Todo lo que decía la vieja está en la que queda, salvo dos cosas, que se
  rescataron: el matiz de que `udaberria` es «el verano nuevo, **el que está
  por venir**», y los cuatro nombres sueltos como ejemplos.
- Los ejemplos de la ficha borrada **no tenían audio**, así que no se pierde
  ninguna grabación. Las cuatro palabras siguen en el vocabulario del tema.
- Los **7 ejercicios** de 6.4 que preguntan por la construcción
  (`udaberria`/`udazkena`) siguen cubiertos por la ficha que queda.

**Barrido del resto del curso** por si había más duplicados de la misma
clase, comparando las fichas de cada tema por las palabras con peso que
comparten: **ninguno más**.

### Tanda del 27/08: siete cosas de Ric, y dos errores míos del mismo tipo

#### El mismo fallo dos veces: comparar con el castellano pensando en inglés

**Los meses.** La ficha decía *«A diferencia del castellano, en euskera los
meses se escriben en minúscula»*. **Falso**: en castellano también van en
minúscula. La lengua que los escribe con mayúscula es el inglés. Corregido a
«igual que en castellano», con la aclaración de quién es el raro.

**Urtebetetzea.** Decía *«No es "el día de tu nacimiento" como en
castellano»*. También falso: **«cumpleaños» es literalmente cumplir años**,
exactamente la misma idea que *urte + bete*. El que dice «el día del
nacimiento» es el inglés, con *birthday*. Reescrita para señalar que las dos
lenguas cuentan lo mismo.

Los dos los detectó Ric, y son el mismo descuido: tenía la norma inglesa en la
cabeza y la atribuí al castellano.

#### Zorionak, donde toca

Estaba en la burbuja de bizkaiera de 6.3, **y es batua**. Subido a la ficha de
cumpleaños, con la precisión de Ric: `Zorionak` es «felicidades» a secas —vale
para un premio o una boda, no solo para los años— y `Zorionak zuri` es
«felicidades a ti». La burbuja se queda con `zenbatean?`, que sí es de aquí.

De paso, `zorionak` estaba catalogada en 10.6 y se usa en dos ejercicios de la
unidad 6: **movida a 6.3**, donde se usa primero.

#### Olentzero: primero la fiesta, después el personaje

Ric aportó el dato que faltaba: *Olentzero* era el nombre con el que se
llamaba, en zonas de Navarra y Gipuzkoa, a la **Vigilia de Navidad y a la
celebración del solsticio de invierno**. Con los siglos la fiesta tomó forma
humana y nació la leyenda del carbonero.

La ficha lo mencionaba de refilón («el nombre designaba primero el día») y así
no se entendía. Reescrita con ese orden, y enlazada con lo que ya sabe el
alumno: `Gabonak` son las Navidades y `gabon` es «buenas noches» — todo gira
alrededor de la noche más larga.

#### La familia: una sola burbuja, y `izeko`

Había **dos fichas de dialecto** en 4.6 más una mención suelta a `loba` dentro
de la ficha de `iloba`. Juntadas en una: los abuelos (aitite/aitxitxe,
amama/amuma), `izeko`, `loba`/`lobak` y el `dot`/`dodaz` del verbo.

**`izeko` verificado**: es el «tía» de Bizkaia frente al `izeba` del batua,
recogido en el diccionario de Labayru y en el OEH. El tío es `osaba` en las
dos. Añadida como variante en el vocabulario.

#### Palabras que dan nombre a algo y no se enseñaban

Ric lo vio con **`egutegia`**: es el título de la unidad 6 y no estaba en
ninguna parte, ni en el diccionario. Barrido:

- **`egutegia`** (u6), **`familia`** (u4) y **`mugitu`** (u8, cuyo imperativo
  es el título «Mugi zaitez!») — añadidas, con una nota que las conecta con el
  título de su unidad.
- `galderak` **no** hacía falta: es el plural de `galdera`, que sí se enseña.
- Y el mismo barrido sobre los temas sacó dos más: **`gorputza`**, que da
  nombre al tema 9.3 y no estaba, y **`oparia`**, que se pregunta en un
  ejercicio de 9.5 sin estar tampoco.

#### Los títulos de tema, en euskera

Los 48 llevan ahora `titulo_eu`, y se pintan en euskera con el castellano
debajo en pequeño — en las tarjetas y en la portada del tema.

**Regla que me impuse al escribirlos: solo palabras o frases que el curso ya
enseña.** Por eso varios son listas de tres palabras («Nor, zer, noiz») en vez
de títulos elegantes, y por eso se descartaron `izenordainak` (pronombres) y
`ahoskera` (pronunciación): son términos gramaticales que no aparecen en
ninguna parte del curso. Quedaron «Ni, zu, hura» y «Euskalkiak».

En la barra superior se sigue viendo el castellano: ahí solo cabe una línea, y
es la etiqueta con la que navegas.

**No los ha revisado un nativo.** Son míos.

#### «Me gustan tus ojos» en el test de la unidad 6

Lo encontró Ric haciendo el test. Era `u10.1-g02`, un grupo entero sobre
`gustatzen zaizkit` con partes del cuerpo —las dos cosas de la unidad 9—
que se quedó en la unidad 6 al reestructurar. **Movido a 9.3.** Y una variante
suelta igual en 6.4, reescrita como «En verano hace calor».

*Detalle:* la primera versión de ese reemplazo fue «hace viento», y se cambió
porque **no encaja en el patrón `egiten du`** que enseña la ficha: para el
viento el euskera dice más `haizea dabil`. Se usó el paralelo exacto de
`hotz egiten du`.

**Barrido de todos los tests** buscando lo mismo. Salieron tres más, los tres
arreglados con vocabulario de su propia unidad:

- u4 preguntaba «Las vacas están en el monte» (`behia` 5.5, `mendia` 8.1,
  `daude` 5.1)
- u5 preguntaba «La calle es vieja» (`kalea` 8.4)
- u7 preguntaba «He comprado una camisa blanca» — el fallo no era la camisa,
  que sí es de 7.5, sino **`erosi`**, de 9.5

Los dos que siguen saltando son **falsos positivos** y conviene tenerlo
anotado: el test de la unidad 2 usa «Nola duzu izena?» y «Nor zara zu?», que
sus propias fichas enseñan como frases hechas; y «Zukua edan nahi dut» aparece
como ejemplo de una ficha de la unidad 9 que **reutiliza** una frase de la 7,
así que el detector la registró allí.

### Ejercicios que iban por delante de la explicación (27/08/2026)

Ric, probando el 7.1: *«me sale la pregunta "no como carne" pero aquí aún no
hemos aprendido la negación»*. Cierto: la negación se explica en el **7.2**.

Al barrer resultó que no era un ejercicio suelto, sino que **el 7.1 se había
quedado con casi toda la práctica de negación** al repartir los temas:

| Ejercicio | Qué pasaba | Qué se ha hecho |
|---|---|---|
| `u8-g04` | 5 variantes, todas de negación | movido al 7.2 |
| `u8-g09` | 5 de ordenar, todas con `ez` | movido al 7.2 |
| `u8-g08` | v0 «no como carne», v4 «no hay pan» | reescritas en afirmativo |
| `u8-g11` | la pregunta de bizkaiera partía de una frase negativa | reescrita en afirmativo |

El 7.1 se quedaba en 7 ejercicios, así que entra uno nuevo (`u8-g31`, emparejar
verbos) y vuelve a 8. El 7.2 pasa de 5 a 7.

Sueltos, en otras unidades: `gehiago`/`gutxiago` (10.4) y `ezin dut` (8.3)
salían de distractores en el 6.1, el 8.1, el 10.1 y el 10.3. Cambiados por
palabras ya dadas.

**Ahora lo vigila `scripts/probar_adelantos.js`**, dentro de `probar-todo.sh`.
Comprueba nueve construcciones (negación, partitivo, `ari`, `gustatzen`,
pasado, `al`, `ezin`, `behar`, comparativos) y avisa si aparecen antes de su
tema. Deja fuera las frases hechas que el curso enseña enteras a propósito
(`ez dakit`, `ez dut ulertzen`, `ez horregatik`).

Ojo con los homógrafos, que daban 98 falsos positivos en la primera versión:
`nago`/`dago` no son comparativos en `-ago`, y el `zuen` de la 2.2 es
«vuestro», no el pasado.

### «No como pan» dicho de dos maneras (27/08/2026)

Ric: *«primero usas "Nik ez dut ogia jaten" y justo después "Ez dut ogirik
jaten", ambas traducidas como "no como pan"… me resulta extraño»*.

Tenía razón, y **no significan lo mismo**:

- `Ez dut ogia jaten` — No como **el** pan. Uno concreto.
- `Ez dut ogirik jaten` — No como pan. Ninguno, nunca.

Verificado en la [Euskararen Gramatika de Euskaltzaindia][eg] (15.5,
partitiboa) y en la [guía de la EHU][ehu]: el partitivo es siempre
indefinido; con el artículo, quien escucha entiende que hablas de algo
determinado. Poner las dos con la misma traducción castellana, una detrás de
otra, era confuso de verdad.

[eg]: https://euskaltzaindia.eus/index.php?ItemId=1765&kodea=1505&lang=eu&option=com_liburuak&task=gramatika
[ehu]: https://www.ehu.eus/documents/2660428/5068953/partitiboa.pdf

Qué se ha hecho:

- La ficha de la negación usa ahora un objeto **de verdad concreto**
  (`liburua`, «no leo el libro»), así no compite con la del partitivo, y
  cierra anunciando el cambio que viene.
- La del partitivo pone las dos frases **una al lado de la otra** con su
  diferencia explicada. Antes decía que el partitivo «es opcional y nadie te
  va a corregir», que se saltaba justo esto; ahora dice que sin él la frase se
  entiende como algo concreto.
- El mismo fallo estaba **propagado a los ejercicios**: `u7-g32` v0 pedía «No
  como pan» y daba por buena `Ez dut ogia jaten`. Igual en `u8-g09` v0 y v1.
  Pasados a partitivo. La v3 se queda con artículo a propósito, para que se
  vea el contraste, y lo que se ajusta es el castellano («no compro **la**
  carne»).

### Formato nuevo: escribir con la bolsa a la vista (30/08/2026)

Idea de Ric a partir de la nota de investigación: **los ejercicios de ordenar,
pero tecleando**. Ves los huecos, escribes cada palabra, y la que aciertas se
pone verde y se apaga abajo en la bolsa.

Encaja de lleno con lo que dice la nota: recuperar **produciendo** gana con
diferencia a reconocer, y los formatos **híbridos** —con algo de andamio, pero
produciendo— fueron los más eficaces del metaanálisis de 217 estudios. Un
ejercicio de ordenar es reconocimiento: las piezas están ahí y se colocan.
Este obliga a producir cada palabra, con la bolsa solo como red.

Decisión de diseño: **las fichas de la bolsa no se pueden pinchar**. Si se
pudieran, volvería a ser un ejercicio de reconocer y se perdería justo lo que
lo hace valer.

**Cómo está montado.** Tipo `escribir`, con los mismos campos que `orden` —
`es`, `eu`, `palabras`, `distractores`—, así que comparte sus comprobaciones en
`verificar.py` y no hace falta contenido nuevo: cualquier ejercicio de ordenar
se puede duplicar como `escribir` cambiando una palabra.

**Prototipo**: cinco variantes en el tema 2.3 —`u4-g02`, `u4-g03`, `u4-g04`,
`u4-g05` y `u2-g61`— más `u2-g08` (2.2) y `u8-g05` (7.1). Van **como variante
de más**, encima de las cinco que ya había, no sustituyendo a ninguna. El
verificador admite esa sexta solo si es de este tipo.

**Y hubo que darle peso.** Ric probó doce veces y la vio una. La cuenta
explicaba por qué: el 2.3 tenía **un solo ejercicio de ordenar** de nueve, así
que la probabilidad era 1/9 × 1/6 ≈ **1,9%** por ejercicio mostrado. Dos
arreglos:

- `elegirVariante` **pondera**: una variante `escribir` cuenta como **3**, y
  como **5 en el test de fin de unidad**, que es donde más rinde producir. Era
  la idea que ya había apuntado Ric.
- Cinco de los nueve ejercicios del 2.3 tienen ahora variante `escribir`.

Medido sobre los datos reales: de **1,9% a 21%** por ejercicio, es decir de
0,2 a **2,6 apariciones** en doce ejercicios.

### Dos intentos por hueco, y se cierra (30/08/2026)

Ric, probando el formato nuevo: *«si fallas dos veces, el espacio se debería
poner rojo y bloquearse, porque ahora escribes todas las opciones hasta que te
da bien, y entonces el ejercicio siempre cuenta como hecho OK»*.

Fallo de verdad, y de los que importan: no solo hacía el ejercicio inútil, sino
que **le mentía al calendario de repaso**, que registraba un acierto donde solo
hubo tanteo. Es justo lo que la nota de investigación dice que hay que evitar —
la pista o el atajo barato sustituyendo al intento.

**Dos intentos por hueco.** Al segundo fallo se cierra en rojo, deja de
aceptar texto y el ejercicio cuenta como fallado aunque los demás huecos estén
en verde.

El detalle que decide si esto funciona o molesta: **un intento se cuenta al
SALIR del hueco** —Tab, Enter, o pinchar fuera—, no en cada tecla. Si se
contara por tecla, escribir «lagunak» gastaría los dos intentos antes de llegar
a la k.

Hay un estado intermedio, `is-tocado`: tras el primer fallo el borde avisa en
rojo pero el hueco sigue abierto.

Probado en el navegador **intentando hacer trampa a propósito**: tecleé «gu»,
luego «zu», y al tercer intento la correcta — el hueco ya estaba cerrado y el
ejercicio salió «No exactamente» con la solución delante.

### «Completa la frase» donde no había frase (31/08/2026)

Ric, mirando `u8-g10`: el enunciado decía «Completa la frase», pero ahí no hay
frase — es un verbo suelto (`hartu → ____`) y lo que se pide es pasarlo a
`-t(z)en`.

Al barrerlo salieron **20 variantes** con ese enunciado sin frase, y **no eran
todas el mismo caso**:

- **Quince son traducciones** (`En coche. → ____`, `a mí → ____`, `más grande
  → ____`): pasan a **«Escoge la traducción»**, que es el enunciado que Ric ya
  había pedido para `u7-g10`.
- **Cinco son transformación**, todas de `u8-g10`, que es el único ejercicio de
  su tipo en el curso y por eso se quedó con el genérico. Pasan a **«Pasa el
  verbo a -t(z)en»**: describe lo que hay que hacer y usa la etiqueta que el
  curso ya le ha dado —las dos fichas del 7.1 se llaman «verbo en -t(z)en» y
  «Cómo se forma el -t(z)en»—, sin meter metalenguaje nuevo.

**Un fallo mío en el barrido**: conté palabras para decidir si había frase, con
el umbral en dos, y `Barazkiak ____ gustatzen.` cayó del lado equivocado — la
única que yo mismo había dicho que no tocara. Devuelta a «Completa la frase».

De paso, **la firma de las variantes en la app de revisión incluye ahora el
enunciado**. Sin eso, cambiar solo la instrucción no desmarcaba nada y estas
veinte no habrían vuelto a la cola de revisión.

### Cómo se llama el «-t(z)en» (31/08/2026)

Pregunta de Ric. Es el **partizipio burutugabea**, participio imperfectivo, y
marca el **aspecto imperfectivo**. Comprobado en la [Euskararen Gramatika][eg].

Conviene saber que **la gramática de Euskaltzaindia NO lo analiza** como
«nombre verbal + inesivo» (`jate` + `-n`), que es la otra explicación que
circula: lo llama participio, y describe la construcción como perífrasis
`[-t(z)en + izan/edun]`.

El curso **no lo nombra en ninguna ficha**, y probablemente está bien así para
un A1. Si algún día se quiere, el sitio es el 10.1, donde ya se habla de
aspecto y se ponen los tres tiempos en fila.

[eg]: https://www.euskaltzaindia.eus/index.php?Itemid=1765&kodea=2606&lang=eu&option=com_liburuak&task=gramatika

### Cuarta tanda de revisión: veintiuna (30/08/2026)

Ric, con 1028 de 1819 variantes vistas. Ya entran las del formato nuevo, y de
hecho cuatro de sus avisos son distractores de esas.

Lo que más se repite sigue siendo lo mismo: **enunciados que dan la respuesta**.

- «¿De qué dos palabras sale *urtebetetzea*?» — leyendo la pregunta ya
  contestas. Sustituida por «*Urtebetetzea* significa cumpleaños. ¿Qué dice
  literalmente?», que es lo que de verdad hay que entender.
- «*Udaberria* y *udazkena* se construyen sobre la misma palabra, ¿cuál?» —
  con las dos delante, `uda` salta a la vista. Cambiada por cuántas estaciones
  tenía el año antiguo, que es el dato que importa.
- «*Asteburua* se arma con…» — se contestaba sola. Ahora pregunta qué
  significa.
- «Ordena de menor a mayor: eguna, astea, hilabetea» — **el enunciado traía la
  respuesta escrita**.

También: el «en agosto» que iba dentro de la respuesta correcta de la Aste
Nagusia, movido a la corrección; y «El carbonero» fuera de las opciones del
Olentzero, porque con la ficha que dice que primero fue una fiesta y después un
personaje, esa opción es una trampa y no un distractor.

**Tres variantes de emparejar con las mismas cuatro palabras** (`u6-g16`,
`u6-g17`): repartidas con otras del tema —`udazkena`, `udaberria`, `elurra`,
`haizea`, `hodeia`, `beroa`—.

**El enunciado admite negrita ahora.** Ric quería marcar «el domingo» dentro de
la frase para que se vea de qué parte se pregunta, y el enunciado pasaba por
`esc()`, así que las etiquetas salían literales. Añadido `richInline()`: igual
que el `richText` de las fichas pero sin partir en párrafos, y con la misma
seguridad —escapa todo y solo devuelve `<b>`, `<i>` y `<u>`—. Comprobado que
ningún otro enunciado del curso lleva `<`.

**Y una que no apliqué tal cual**: Ric pidió cambiar un distractor por
«L'Automàtica». Es catalán y no pinta nada en un ejercicio de euskera, así que
lo tomé por un pegado accidental y puse `hiru`, que junto a `bi` sí hace de
distractor.

### El formato «escribir», en todo el curso (30/08/2026)

Ric lo probó y dio el visto bueno, con el peso en 3. Extendido a **los 40
ejercicios que tienen variante de ordenar**, todos con una variante `escribir`
encima, sin quitar ninguna.

La frase de cada uno se toma de una de sus propias variantes de ordenar,
prefiriendo las de 2 a 5 huecos: teclear siete palabras cansa y deja de medir
lo que quiere medir.

**Los signos sueltos se pintan fijos.** Tres ejercicios se quedaban fuera
porque llevan el `?` como ficha aparte —de cuando Ric pidió que el signo no
delatara la forma—, y poner un hueco para teclear un interrogante no enseña
nada. Ahora se dibujan como texto, no cuentan para la corrección y no aparecen
en la bolsa. Con eso entran los tres.

**Por qué añadir y no reemplazar** (era la duda de Ric): los de ordenar no
sobran. Enseñan **orden de palabras**, que en euskera no es menor —el salto del
auxiliar en la negación, el verbo al final—. Lo que no enseñan es a producir.
Son cosas distintas. Y reemplazarlos sería tirar ejercicios ya revisados por
Ric para meter otros sin revisar.

Con el peso en 3, una variante `escribir` sale en el **37%** de las
apariciones de su grupo, y en el **50%** en el test de fin de unidad.

### El «-a»/«-ak», misma familia de riesgo (30/08/2026)

La nota mete la oposición `-a`/`-ak` en el mismo saco que el ergativo, y con
razón: entre `irakaslea` y `irakasleak` hay **una consonante** de diferencia, y
esa `-k` carga con toda la información del plural. Apenas se oye, y el verbo ya
la ha dado —`da` frente a `dira`—, así que es redundante.

Lo despachaba **una línea** de la ficha del 2.3: «El plural es -ak:
irakasleak, etxeak».

Mismo tratamiento que el ergativo: la ficha explica por qué se escapa y da la
regla de que **artículo y verbo tienen que ir de acuerdo** (`Ni ikaslea naiz` /
`Gu ikasleak gara`), más pares mínimos (`u2-g60`) y producción (`u2-g61`).

### Nota de motor para Miguel (30/08/2026)

`docs/evidencia-motor.md`: los tres huecos de la nota de investigación que no
se arreglan con contenido, con su dato y su coste. Por orden de rendimiento:
el **repaso gramatical intercalado** (que no necesita contenido nuevo, solo
seleccionar y barajar lo que ya hay), el **pretest de tres ítems** al abrir
unidad, y el **realce del sufijo en la corrección**. Más el aviso de que si
medimos algo, sean sesiones e ítems y no minutos.

### El ergativo, tratado como lo que es (30/08/2026)

De la nota de investigación que pasó Ric («Evidencia para Euskaraz»). Uno de
los cinco huecos que señala es que **los sufijos de baja saliencia no reciben
tratamiento diferenciado**, y pone el ergativo `-k` como caso de manual.

El argumento es fuerte porque cumple **los tres criterios de riesgo a la vez**:

- **poco saliente** — una consonante final átona, que en habla rápida se pierde
- **redundante** — el auxiliar ya dice quién hace qué, así que quitarla no
  impide que te entiendan
- **bloqueado** — el castellano no tiene caso, así que el alumno llega con un
  sistema completo que resuelve lo mismo sin él

La predicción de la teoría (N. Ellis, *learned attention*) es que **no se
adquiere por exposición, ni con mucha**. Y los ejercicios que había eran casi
todos metalingüísticos —«¿cómo se llama esa marca?»—, que construyen
conocimiento declarativo, no procedimental.

Tres medidas, las que la nota recomienda:

1. **La ficha lo dice.** Añadido el porqué se resiste, para que el alumno no lo
   lea como torpeza suya, y una regla operativa de un vistazo: *¿hay algo a lo
   que se le hace la acción?* Sí → `-k` y familia `dut`. No → sujeto limpio y
   `naiz`/`nago`.
2. **Pares mínimos contrastivos** (`u4-g60`), que es el formato canónico para
   dirigir la atención a una marca redundante: la misma frase con y sin
   ergativo, y hay que elegir. `Ni ikaslea naiz` frente a `Nik ikaslea naiz`.
3. **Producción obligatoria** (`u4-g61`): teclear la frase entera. La nota es
   tajante — *se proceduraliza lo que se practica*, y el ergativo solo se
   practica produciéndolo.

**Lo que queda y no es contenido**: el realce tipográfico del sufijo en la
solución tras el fallo es de `app.js`. Y el hueco más gordo de la nota —**no
hay repaso gramatical intercalado entre unidades**— pide un modo nuevo, no
ejercicios. El dato que lo respalda es de los más claros de la nota: intercalar
baja el acierto en la sesión del 87% al 77% y **mejora el recuerdo una semana
después** (d=0,64), y el alumno no lo percibe, así que no se puede decidir
preguntándole.

### Tanda de Ric probando la app publicada (29/08/2026)

Siete avisos, y **dos exigían investigación de verdad**.

**«Ari naiz» no puede ir solo.** Ric: sus conocidos lo cuestionaban. Tenían
razón. La [Euskararen Gramatika][eg] es explícita: la perífrasis `ari izan`
exige el verbo principal en `-t(z)en`. `Ari naiz` a secas no significa «estoy
en ello», le falta la mitad. La ficha del 7.4 presentaba `ari naiz — yo estoy`
como si fuera un paradigma suelto, y el vocabulario lo glosaba igual.
Corregidas las dos cosas. **Los ejercicios estaban bien**: todos lo usan con su
verbo (`ikasten ari zara`, `kafea edaten ari naiz`).

**Los plurales bizkainos: correctos, pero mal enmarcados.** Ric: en Gernika no
les suenan. Comprobado en [Bizkaieraren ataria][ba]: `honeek`, `horreek`,
`hareek` son exactamente lo que recoge la gramática, con las variantes
`honeik`/`horreik` y la antigua `haek` — la ficha no se inventaba nada. Pero
las presentaba como lo que vas a oír, y eso sí era pasarse: mucha gente
escolarizada en batua usa hoy `hauek/horiek/haiek` también en casa. Añadido un
aviso que lo dice, en la línea del que ya hay en la primera unidad.

[eg]: https://euskaltzaindia.eus/index.php?ItemId=1765&kodea=2604&lang=eu&option=com_liburuak&task=gramatika
[ba]: https://www.bizkaiera.eus/bizkaiera/morfologia-puntu-batzuk/

**Un cuarto ejercicio con la respuesta fuera de las opciones.** `u9-g22` v4
preguntaba «¿Qué significa jaieguna?» y daba por buena **«el fútbol»**; la
respuesta correcta ni estaba, y `jaieguna` además es del 6.5. Van cuatro de
esta familia (`alaba`/oveja, `izeba`/conejo, `erantzun`/guztia, y esta).

**Y el párrafo del 9.4 se contradecía**, como vio Ric: decía que en euskera lo
que gusta «va delante igual» que en castellano, cuando en castellano va detrás.
Reescrito: lo que coincide es **el reparto de papeles** —el fútbol es el sujeto
en las dos lenguas, por eso decimos «me gustaN los libros»— y el orden es justo
al revés.

**Otro `.replace()` que había fallado en silencio.** La duplicación de las
gafas que Ric detectó entre el 9.3 y el 9.5 venía de ahí: una edición anterior
para quitarla del 9.5 no encajó con el texto y no hizo nada. Es la segunda vez
en dos días. Ahora todas las ediciones llevan `assert`, y en esta misma tanda
me ha parado tres veces.

Lo demás: el `-dun` del 9.4 enlaza ya con `euskalduna`; las gafas se cierran en
el 9.5 con **anteojos**, que es la misma idea en castellano; y `oporrak` se
queda donde está, pero diciendo por qué —va en plural por la misma razón que
las prendas—.

### El curso entero, sin vocabulario huérfano (29/08/2026)

Terminada la pasada. **526 palabras, ninguna sin presentar en su tema.**

|  | antes | ahora |
|---|---|---|
| u1 | 62% | 0% |
| u5 | 51% | 0% |
| u9 | 40% | 0% |
| u3 | 33% | 0% |
| u6 | 31% | 0% |
| **todas** | **~30%** | **0%** |

En esta última tanda, además de las listas que faltaban, salieron ganchos que
merecen quedar:

- **`-le`/`-la`, quien hace algo** (2.4): `irakaslea` de `irakatsi`, `idazlea`
  de `idatzi`, `langilea` de `lan`. Y el aviso de que **ninguna profesión lleva
  género**, que es donde más se nota.
- **`inoiz` solo es «alguna vez»** (3.1): es el `ez` el que lo vuelve «nunca»,
  igual que el «jamás» castellano necesita el «no».
- **`eguzkia` lleva `egun` dentro** (6.4), la misma pieza que está en `egun on`
  y en `egutegia`.
- **`jaieguna` = jai + egun**, y **`Aste Santua`** lleva la `astea` del tema
  anterior (6.5).
- **`etxeko lanak` = etxe + -ko + lanak** (7.3), los trabajos de la casa.
- **`hemen`/`han`** (5.1) presentadas como las hermanas de `hau`/`hura`.

**Un fallo mío que conviene no repetir**: la corrección del 10.4 de ayer
—añadir `gutxiago`, `txarragoa` y `berdin`— **nunca llegó a guardarse**. Usé
`.replace()` sin comprobar que el texto encajara, así que no hizo nada y no
avisó de nada. Desde entonces, o `assert` antes de reemplazar, o añadir al
final del cuerpo, que no depende de encajar con nada.

Sobre el criterio, que Ric matizó: **dentro de una misma unidad no pasa nada**
que una palabra aparezca antes de su tema — a veces hace falta para poder
formar frases. Por eso la comprobación de ejemplos solo avisa **cruzando
unidad**. `liburua` y `musika` se han movido igualmente al 7.1, pero por otra
razón: así entran en el repaso de vocabulario cuando el alumno los conoce, y no
dos unidades después.

### Unidades 1 y 9, a cero (29/08/2026)

Siguiendo con lo del vocabulario sin presentar. Las dos peores eran la 1 (62%)
y la 9 (40%).

**El 1.2 «Cortesía y cómo estás» no tenía NI UNA ficha** para sus 13 palabras
—el mismo caso que el 8.4 y el 9.4—, y era el primer tema de verdad del curso.
Ficha nueva con la escala entera de respuestas a `zer moduz?`, de `oso ondo` a
`gaizki`, señalando que `oso` («muy») sirve para todo y no solo ahí.

**En el 1.1 se preguntaba por `arte` sin explicarlo**: `u1-g09` v3 pregunta qué
significa en `bihar arte`. Ficha nueva con los saludos, y el gancho de que
`arte` es «hasta» y va **detrás**: `ikusi arte`, `gero arte`, `bihar arte`. Con
eso, cualquier palabra de tiempo que aprenda después le sirve para despedirse.

**Y dos desajustes de catalogación en la 9, en sentidos opuestos:**

- `niri`, `zuri`, `hari`, `guri`, `zuei`, `haiei` estaban en el **9.2**, pero
  **la ficha del 9.1 enseña la serie entera**. Movidos al 9.1. Esto es
  justo lo que decía el informe de la sesión de terminal, que contaba 15 usos
  de `zuri`/`niri` antes de su tema — la etiqueta estaba mal, no los
  ejercicios.
- `iruditzen zait`, `interesatzen zait` y `axola zait` estaban en el **9.1** y
  los explica la ficha del **9.2**. Movidos al 9.2.

El resto son listas que faltaban: las cuatro partes del cuerpo del 9.3, las
siete prendas del 9.5, `antzerkia` en el 9.4, y una ficha en el 9.1 para
`gustatu`, `janaria`, `edaria`, `gauza` y `guztia` — con el detalle de que
`janaria` y `edaria` llevan dentro `jan` y `edan`.

**Otra vez me colé con los ejemplos**: escribí `Dena ondo` (`dena` es del 10.5)
y `Edaria hotza da` (`hotza` es del 6.4). Van cuatro esta semana. Es siempre lo
mismo: `probar_adelantos.js` mira ejercicios, no los ejemplos de las fichas.

|  | antes | ahora |
|---|---|---|
| u1 | 62% | **0%** |
| u9 | 40% | **0%** |

Quedan por mirar: **3.1** (10 palabras), **6.x** (20 repartidas) y **2.4** (8).

### La casa: 22 palabras que nadie presentaba (29/08/2026)

Ric: *«en la unidad de la casa no hay introducción a las partes de la casa,
todo es vocabulario que introducimos en el diccionario y en los ejercicios»*.

Medido: el **5.2 tenía 28 palabras y 22 sin mencionar en ninguna ficha**. Lo
único que había era la ficha del `-gela` (las habitaciones) y `komuna`; todo lo
demás —puerta, ventana, cama, armario, tejado, ascensor— entraba directo al
diccionario.

Ficha nueva, **«La casa entera, de la puerta al tejado»**, por zonas: lo que
ves antes de entrar, y lo que hay dentro. Va **antes** de la del `-gela`, que
así queda como el detalle de las habitaciones.

Dos ganchos, los dos verificados:

- **`-gailu`, la pieza de «aparato»**: `igo` (subir) + `-gailu` → `igogailua`;
  `hotz` (frío) + `-gailu` → `hozkailua`. El [Elhuyar][eg] confirma que es un
  sufijo productivo, y da `garbigailua` (lavadora) y `lehorgailua` (secador).
  Y el ajuste de consonante enlaza con el `-ko`/`-go` de la segunda unidad,
  que ya se explicaba como comodidad al hablar.
- **Los préstamos**: `sofa`, `telebista`, `garajea`, `balkoia`, `dutxa` se
  entienden a la primera. De veintitantas palabras, cinco vienen regaladas, y
  decirlo quita agobio.

**Lo que NO afirmo**: iba a explicar `sukaldea` como `su` (fuego) + `alde`
(zona). Es la etimología que todo el mundo repite, pero **el diccionario no me
la confirma**, así que fuera. A cambio da un dato que sí está: `sukalde` vale
para la cocina **como habitación y como aparato**, el fogón. Eso es lo que
entra en la ficha.

[eg]: https://hiztegiak.elhuyar.eus/eu_es/igogailu

Con esto la unidad 5 baja del **51% al 17%** de vocabulario sin presentar.
Las que quedan peor son la **1** (62%, casi todo en el 1.2) y la **9** (40%,
sobre todo el 9.1).

### «Hamaika» también es «un montón» (29/08/2026)

Ric: la explicación de que `hamaika` vale por «muchísimos» estaba **en un
ejercicio y en ninguna ficha**. Y la había escrito yo el día anterior, al
ampliar los ejercicios del 4.1: exactamente el defecto que llevamos toda la
semana corrigiendo, cometido por mí.

Verificado en el [Elhuyar][eh]: además de «once», *«muchos, infinidad,
tantos»*, con ejemplos del tipo «se lo pedí infinidad de veces». Añadido a la
ficha **«Del once al diecinueve»**, donde ya se explica que el 11 es la
irregular del grupo.

[eh]: https://hiztegiak.elhuyar.eus/eu_es/hamaika

**Y me volvió a pasar con el ejemplo.** Escribí *«Hamaika aldiz esan dizut»*:
`aldiz` no está enseñado y `esan dizut` es del **9.2**. En el 4.1 solo hay
números e `izan`. Cambiado por **`hamaika lagun`**, que además aprovecha la
regla que la propia ficha acaba de dar —detrás del número, el sustantivo va en
singular y sin artículo, como en `hiru lagun`—.

Es la tercera vez esta semana que me pasa lo mismo: escribo el ejemplo con
gramática de unidades posteriores. `probar_adelantos.js` no lo caza porque
solo mira **ejercicios**, no los ejemplos de las fichas.

De paso, `u4-g52` v2 decía «Ojo con el parecido: astea es…», que depende de
venir tras otra pregunta. Ahora es «¿Qué significa astea?».

### Primeras 50 correcciones de la revisión (28/08/2026)

Ric, con 536 de 1755 variantes revisadas en la app, pasó un informe con 50
avisos. **Dos eran fallos de verdad**, no matices de redacción:

- **`u4-g27` v3** preguntaba *«la oveja» se dice…* y daba por buena **`alaba`**,
  que es «la hija». La corrección decía `ardia` — palabra que ni estaba entre
  las opciones y que además es de la unidad 5. Arreglado cambiando el
  enunciado a «la hija», que es lo que encaja con las cuatro opciones.
- **`u1-g07` v0** tenía la pista de otro ejercicio: para `agur` (adiós) decía
  *«Literalmente: gracias muchas»*, que es la de `eskerrik asko`.

El resto, por familias:

- **Enunciados que dependían del orden** (`u4-g12`, `u3-g07`, `u4-g19`): «¿Y
  «erdalduna»?» solo se entiende si viene después de otra. Si algún día
  barajamos las variantes, se rompen. Ahora son autónomos.
- **Respuestas que la forma delataba**: en los emparejar, una sola pregunta
  entre tres palabras se acierta sin saber nada. Repartidos.
- **Distractores poco creíbles**: `medikua` frente a «(yo) soy» no es una
  elección. Ahora frente a «la medicación» o «el hospital».
- **Bilbocentrismo**: Bermeo, Durango y Gernika donde antes todo era Bilbao.
- **`batua = el batua`** no traducía nada: ahora «el euskera estándar».

Dos que investigué antes de tocar:

- **`ere`**: Ric dudaba de «detrás de la palabra a la que acompaña». La regla
  es correcta —el [Elhuyar][ee] confirma que va pospuesto a cualquier
  elemento, no solo al pronombre, con ejemplos tras sustantivo y tras verbo—,
  así que se conserva la pregunta y se reescribe el enunciado: «justo detrás
  de lo que quiere subrayar».
- **La jota de `jan`**: Ric avisa de que dentro de Bizkaia varía. Cierto, y la
  ficha del 1.4 ya matiza que en Gipuzkoa suena distinto. Pregunta sustituida
  por una que no va de pronunciación.

[ee]: https://hiztegiak.elhuyar.eus/eu_es/ere

**Y dos que me pillé a mí mismo aplicando el informe:**

- Ric pidió `izeko` en un emparejar de familia. **`izeko` es la forma
  bizkaina** de `izeba`, y vive en el bloque dialectal, no en el vocabulario.
  En un ejercicio de batua va `izeba`.
- Al rehacer `u3-g20` metí *«Nora zoaz?»*… y **`zoaz` es del 8.1**, cinco
  unidades más tarde. Cambiado por «nongoa zara», que usa el `zara` del 2.3.

Ese segundo es revelador: **`probar_adelantos.js` no lo cazó**, porque solo
vigila construcciones gramaticales, no vocabulario. Es justo el hueco que
señalaba el informe de la sesión de terminal.

Una que no cambio, y por qué: `u5-g08` («Yo tengo dos hermanas») es de
**ordenar palabras**, no de traducir. Ric pide que valga sin `nik`, pero ahí
las palabras vienen dadas y hay que usarlas todas — no hay nada que aceptar.
La equivalente de traducir, `u5-g09` v1, **sí** acepta las dos formas.

### «Edonor» se preguntaba y no se enseñaba (28/08/2026)

Ric, revisando ejercicios con la app: *«mira a ver si en el 3.1 incluyes
edonor, edonon, edonora en el vocabulario, porque creo que no lo veo»*.

No estaban. Y el caso era peor de lo que parecía:

- `u3-g10` es el ejercicio de la **burbuja de bizkaiera** (zelan, nogaz,
  zelango), pero **dos de sus cinco variantes preguntan por `edonor` y
  `edonon`**.
- Esas palabras **no son bizkaiera** — la explicación del propio ejercicio lo
  decía: *«Es batua, no solo bizkaiera»*.
- **No estaban en el vocabulario** de ningún tema.
- **No las explicaba ninguna ficha.** La única mención en todo el curso era un
  ejemplo suelto (`Edonor etor daiteke`) dentro de la burbuja de dialecto.

Arreglado: ficha nueva en el 3.1, **«Edo-»: de la pregunta a "cualquiera"**,
que sale directa de las interrogativas recién aprendidas; las tres palabras al
vocabulario; y el ejemplo fuera de la burbuja, que no era su sitio.

Y **enlaza con el 10.5**: la ficha de indefinidos que escribí ayer hacía
`nor → norbait → inor ez`. El `edo-` es la tercera familia del mismo sistema,
así que el 3.1 da la primera y el 10.5 cierra las otras dos, diciéndolo.

Verificado en el Elhuyar: `edonor` es pronombre indefinido, «cualquiera,
quienquiera»; `edonon`, «en cualquier parte». Existe la familia entera
(`edonondik`, `edonongo`).

Dos veces me colé escribiendo los ejemplos: primero con `sar daiteke` y
`joan naiteke`, que son **formas potenciales** —justo lo que el 10.6 lista
como pendiente para después del A1—, y luego con `Edonon dago`, que usa el
`egon` del 5.1. En el 3.1 el alumno solo tiene `izan`. Se conserva un único
ejemplo, el que ya tenía mp3 grabado, con un aviso de que el `daiteke` llega
mucho después.

### Cobertura: que cada tema ejercite lo que enseña (28/08/2026)

Ric corrigió el enfoque: *«olvida la regla de 2 anteriores… lo clave es que con
todo el contenido y el vocabulario que hemos ampliado, ahora que hemos
reestructurado todo, todas las unidades tengan bien sus ejercicios y
**aprovechen todo su contenido**»*.

Eso es **cobertura**, no contaminación — que es lo que medía el informe de la
sesión de terminal (`docs/revision-temas-unidades.md`, sin commitear a
propósito). Medido de nuevo:

**El vocabulario estaba al 96%.** Solo 16 palabras no aparecían en ningún
ejercicio del curso. Varias eran **la palabra que da nombre a su propio tema**
—`gorputza` (9.3), `egutegia` (6.2), `baserria` (5.5)—, el mismo despiste que
Ric ya había cazado con «Egutegia». **Ahora es el 100%.**

**El problema de verdad era el reparto plano.** 30 de los 50 temas tenían
exactamente 5 ejercicios, tuvieran 1 palabra o 28:

    7.5   28 palabras · 6 ejercicios
    5.2   28 palabras · 5 ejercicios
    4.1   20 palabras · 5 ejercicios
    5.4    1 palabra  · 5 ejercicios

El curso se amplió y se reordenó, pero los ejercicios se quedaron donde
estaban. Un tema con 28 palabras y 25 variantes no puede tocarlas todas.

Por eso **no seguí el plan de ampliar todo de 5 a 8 uniforme** (1670 → 2672
variantes): eso multiplica el trabajo por 1,6 y **conserva el desequilibrio**.
Repartido por carga en su lugar: 17 ejercicios nuevos en los temas cargados,
los ligeros sin tocar.

|  | antes | ahora |
|---|---|---|
| temas con 5 ejercicios | 30 | 22 |
| temas con 7 u 8 | 9 | 15 |
| total | 334 ej · 1670 var | **351 ej · 1755 var** |

De paso, `altua` se usaba en la ficha del 10.4 y en un ejercicio nuevo sin
estar catalogada. Añadida.

**Sobre los «72 grupos con vocabulario de tema posterior» del informe**: mi
propio detector da **44**, y al mirarlos uno a uno **la mayoría son falsos
positivos por homógrafos**. Todos los de `al` son el «al» castellano («Al
final», «pegada al verbo»), no la partícula vasca del 10.5. Y `zuri` es «a ti»
(9.2) pero también «blanco» (5.3). Queda pendiente separar los reales, que son
pocos; el candidato más claro es `etxea`, catalogada en 5.2 pero usada desde la
2.2, donde probablemente lo que hay que mover es la etiqueta, no los
ejercicios.

### Repasada la unidad 10 (27/08/2026)

La medida que lo destapó: **34 de las 66 palabras de la unidad no las
mencionaba ninguna ficha de su tema**. Y no eran de adorno — **21 de ellas se
preguntaban en ejercicios**, algunas seis o siete veces (`norbait` ×7, `jaio`
×6, `zaila` ×6). `norbait` llegaba a preguntarse en el **10.1** estando
catalogada en el **10.5**.

Antes de dar por hecho que la 10 era la peor, medí las diez unidades. **No lo
era**: la 1 sale al 62% y la 5 al 51%, igual que la 10. Pero el porcentaje
engaña — en la 1 lo no presentado son saludos, que se explican solos en la
lista; en la 10 eran palabras que se preguntan sin haberse explicado nunca.
**La unidad 5 sí merece una mirada después.**

|  | antes | ahora |
|---|---|---|
| 10.1 | 4 fichas, 8 sin presentar | 5 fichas, **0** |
| 10.4 | **1 ficha**, 7 palabras | 2 fichas, 15 palabras |
| 10.5 | 2 fichas, **16 sin presentar** | 3 fichas, **0** |
| toda | **34 sin presentar** | **0** |

Lo estructural: **el 10.5 era un cajón de sastre** —22 palabras de cuatro
temas distintos con dos fichas— y **los comparativos estaban mal catalogados**:
`baino`, `-ago` y `-ena` figuraban en el 10.5 aunque se enseñan en el 10.4.

Movidos al 10.4, y con ellos los adjetivos (`zaila`, `erraza`,
`garrantzitsua`, `azkar`, `poliki`), que no es un apaño: comparar necesita
adjetivos, y ahí se ve `zailagoa` saliendo de `zaila`.

Fichas nuevas: los nueve verbos del 10.1 que nadie presentaba, los adjetivos
del 10.4, y **los indefinidos del 10.5**, que era la que más me interesaba
porque sale de lo que ya sabe desde la tercera unidad:

    nor  (quién) → norbait  (alguien)      → inor ez  (nadie)
    zer  (qué)   → zerbait  (algo)         → ezer ez  (nada)
    non  (dónde) → nonbait  (en algún sitio)

`ezer ez` ya lo tenía del 7.2. Verificado `norbait` en el Elhuyar, que además
apunta que se usa en contextos **no** negativos — justo el contraste con
`inor ez`.

**Y el 10.6 estaba lleno de cosas caducadas.** No tenía título en castellano
(decía «Dena batera» en los dos campos), y su ficha «Qué viene después»
prometía como pendientes **el futuro** (que se enseña en el 10.3, dos temas
antes), **el imperativo** (que hoy mismo hemos metido en el 8.2) y **`eduki`**
(que está en el 4.5) — y hablaba de «estas **doce** unidades» cuando son diez.

### «Siempre con su traducción» (27/08/2026)

Ric, sobre la ficha nueva del 9.4: *«cuando introduces asko, pixka bat y
batere ez, no pones las traducciones… siempre introducimos las palabras con su
traducción»*.

Arreglado eso y **barridas todas las fichas escritas hoy**: seis casos reales
(`asko`/`pixka bat`/`batere ez`, `pilota`, `burua`/`sudurra`/`ahoa`/`bihotza`,
`niri`/`zuri`/`hari`, `Mugitu!`, `joan`/`etorri`/`ibili`, y los verbos del 7.3
citados de pasada en el 7.5).

Al revisarlo apareció otro hueco: el **9.2 tiene cinco verbos en el
vocabulario** —`eman`, `esan`, `galdetu`, `erantzun`, `lagundu`— **que las
fichas no presentaban**, el mismo problema que el 7.5. Ahora van listados con
su traducción.

**La comprobación queda puesta en `verificar.py`**, como aviso. Dos decisiones
que la hacen utilizable en vez de ruido:

1. **Se mira por tema entero, no por ficha.** A veces una palabra se glosa en
   una ficha y se usa en la de al lado, y eso vale.
2. **Solo las que se ESTRENAN en ese tema.** Las ya dadas no hay que
   reglosarlas cada vez que se mencionan.

Sin esas dos, saltaban 108 avisos en 59 de las 140 fichas y no servía para
nada. Con ellas, 8 — y los ocho revisados a mano: son casos donde la
traducción está en la prosa en vez de detrás de la palabra (`Euskal Herria`
se explica entero, `bosgarrena` va en una lista numerada, `ezkerrera` se
traduce dos líneas más abajo). Se dejan como aviso, no como error,
precisamente por eso.

### «Pilotalekua»: ¿es batua? (27/08/2026)

Ric preguntó de dónde salía. Buena pregunta: yo lo había sacado de una página
de instalaciones deportivas y del título de una exposición, que no es lo mismo
que confirmarlo.

Comprobado en el [Elhuyar][ep]: entrada normativa, con compuestos propios
(`pilotaleku ireki`, `labur`, `luze`) y ejemplo de uso. Y buscando «frontón» al
revés, el diccionario da **las dos**: `pilotaleku` primero y `frontoi` después.

La ficha lo dice ahora así: las dos valen, `pilotalekua` es la formada con
piezas vascas y la que los diccionarios ponen primero, pero `frontoia` también
se oye.

[ep]: https://hiztegiak.elhuyar.eus/eu_es/pilotaleku

### Reestructurada la unidad 9 (27/08/2026)

Ric: *«no me gusta que para explicar "me gusta" usemos el cuerpo… al final es
todo un poco extraño hablar del cuerpo de otra persona»*, más que el 9.4 no
tenía explicación y que `txapelduna` estaba en el tema siguiente.

Las tres cosas eran ciertas, y **las dos primeras estaban conectadas**. El
cuerpo no es de lo que uno dice que le gusta; lo que uno dice que le gusta es
el fútbol, la música, el cine. O sea que la gramática de la unidad se estaba
practicando en el sitio equivocado: forzada en el cuerpo (9.3) y ausente del
ocio (9.4), que era justo su terreno y no tenía **ni una ficha**.

|  | antes | ahora |
|---|---|---|
| 9.3 | 2 fichas, 722 car. | 3 fichas, 1826 car. |
| 9.4 | **0 fichas, 0 car.** | 3 fichas, 2261 car. |

**9.3** pierde la ficha del «me gustan tus ojos» y gana dos:

- *El cuerpo que ya usabas sin saberlo*: `oin`+`-z`→`oinez`, `esku`+`-z`→`eskuz`,
  `buru`+`-z`→`buruz`, y `begi`+`aurre`+`-ko`→`betaurrekoak`. Es el `-z` del
  8.3 cobrando intereses: ya venía diciendo `oinez nator` con un pie dentro.
- *Describirte*: posesivos del 2.2 y colores del 5.3, sobre uno mismo. Mantiene
  lo útil (los pares van en plural) sin hablar del cuerpo de nadie.

**9.4** recibe la ficha de la txapela desde el 9.5 —con una línea que dice por
qué vive ahí— más `txapelduna` y `txapelketa`, y estrena dos: el `gustatzen`
aplicado al ocio, que es su terreno, y la pilota con el frontón como plaza del
pueblo (el Gobierno Vasco lo llama «el ágora vasca»). También recupera para el
9.2 el ejercicio `u10-g03`, que era del dativo y estaba ahí por error.

**9.5** cierra la unidad con *Un regalo es siempre para alguien*, que junta
`oparia` + `erosi` + el dativo del 9.2.

Tres cosas que me cacé al escribir:

- `luzea` (largo) en un ejemplo, sin estar enseñado.
- `eman diot`, cuando el 9.2 solo da la serie `dit`/`dizu`/`dio` y encima avisa
  de que basta con reconocerla.
- El 9.5 decía «como viste en la **6.1**» para el orden del adjetivo, que es
  del **5.3**. Es un tipo de referencia caducada que no había buscado: a un
  **tema**, no a una unidad. Barrido el curso entero, era la única.

Y un hueco que apareció solo: al escribir la ficha del regalo metí el
`-entzat`, y resulta que **`u9-g29` ya lo preguntaba en cuatro variantes sin
que se explicara en ningún sitio**. La ficha nueva lo tapa.

El subtítulo decía «Gustos, el cuerpo y regalos» y el ocio es un tema entero:
ahora «Gustos, ocio, el cuerpo y regalos».

### Reestructurada la unidad 8 (27/08/2026)

Ric: en el 8.1 se hablaba de salir y entrar sin explicarlos, y *«la 8.1 está
muy cargada y las demás no tanto… la 8.4 es importante hacerle explicación»*.

Al medirla, el desequilibrio era peor de lo que parecía: **el 8.1 se llevaba
el 48% del vocabulario de la unidad** (22 de 45) y **el 8.4 tenía 0 caracteres
de explicación** para 10 palabras y 5 ejercicios.

De las 22 del 8.1, solo 11 eran suyas:

- 11 · `joan`/`etorri`/`ibili` y sus formas → correctas
- 7 · `hondartza` `mendia` `urrun` `gertu` `hona` `hara` `hemendik` → **se
  explicaban en el 8.2**, un tema después
- 4 · `sartu` `irten` `iritsi` `mugitu` → **no se explicaban en ningún sitio**,
  y se usaban en seis ejercicios

`irten` llegaba a aparecer por primera vez **dentro de la burbuja de
bizkaiera**, como «el *irten* del batua por allí es *urten*»: se presentaba la
variante dialectal de una palabra que nunca se había presentado.

Y la unidad se llama «Mugi zaitez!» con el subtítulo «moverse, **mandar** y la
ciudad», pero el imperativo solo se mencionaba de pasada en una nota de
vocabulario.

**Ahora son cinco temas** (era la única unidad con cuatro junto a la 1, 2 y 3):

| | Tema | Palabras | Qué cambió |
|---|---|---|---|
| 8.1 | Joan eta etorri | 22 → **11** | aligerado |
| 8.2 | **Sartu eta irten** | **4** | nuevo: los verbos huérfanos + el imperativo |
| 8.3 | Nora zoaz? | 9 → **16** | recibe las 7 que ya explicaba |
| 8.4 | Ahal eta behar | 4 | sin tocar |
| 8.5 | Hiria | 10 | **tres fichas nuevas** |

El 8.2 tiene buen gancho: los del 8.1 van en una pieza, estos van con el
`-t(z)en` de la unidad 7, y de paso repasan la regla de formación
(`sartu→sartzen`, `iritsi→iristen`, `irten→irteten` son justo los tres casos
que se enseñaron allí). El imperativo va detrás porque prepara el 8.3, que ya
usaba `Zuzen joan, mesedez`.

La burbuja de bizkaiera del 8.1 llevaba dos cosas ajenas —el `urten` y una
nota sobre el Mercado de la Ribera—; repartidas al 8.2 y al 8.5. Y `u9-g03`,
que era de verbos de movimiento, estaba en «la ciudad».

Verificado antes de escribir: `irteten` y que va con `naiz` y no con `dut`
([Elhuyar][ei]) —importa, porque es justo lo que cambia en bizkaiera—, y
`okindegia` para el `-tegi` ([Elhuyar][eo]). Quitada una frase mía que decía
que el cambio de auxiliar de `urten` es «de los pocos casos en que pasa»: sin
respaldo.

[ei]: https://hiztegiak.elhuyar.eus/eu_es/irten
[eo]: https://hiztegiak.elhuyar.eus/es_eu/panader%C3%ADa

### «Azoka» es mercado antes que feria (27/08/2026)

Ric: *«cuando hablas de azoka le dices feria, pero yo lo pienso como mercado…
si es indistinta preferiría que lo llamaras mercado»*.

El [Elhuyar][ea] da **«mercado» como primera acepción** y «feria» como
segunda, la de exposición comercial (la de Durango). Cambiado.

Pero no basta con traducir las dos igual, porque `merkatua` también es «el
mercado» y el repaso las marcaría como **traducción ambigua**, dejando de
preguntarlas del castellano al euskera. Separadas por lo que de verdad las
distingue:

- `azoka` — el mercado de la calle, el de los días señalados (Gernika)
- `merkatua` — el mercado como edificio (la Ribera)

Explicado en la tercera ficha del 8.5.

[ea]: https://hiztegiak.elhuyar.eus/eu_es/azoka

### El 7.5: vocabulario presentado, y la ropa a su unidad (27/08/2026)

Ric: quitar `lursagarra` («nadie que conozco ha oído eso») y **presentar el
vocabulario**, porque el tema es casi todo palabras nuevas y no se
introducían.

Ficha nueva, **«La despensa entera, por grupos»**: cinco bloques —las tres
comidas, para beber, en el plato, de la huerta, fruta— en vez de una lista
plana, que ya la da la pantalla de vocabulario. Cada bloque con algo de lo que
agarrarse; el mejor, el `-ardo`:

    sagar (manzana) + ardo  → sagardoa, la sidra
    garagar (cebada) + ardo → garagardoa, la cerveza

Añadida `arana`, **la ciruela** (verificada en el [OEH][oeh]; también se oye
`okaran`). Y de aquí salió un malentendido que merece quedar escrito: Ric
escribió «añade Arana a las frutas» y yo entendí **Sabino Arana**, a cuento de
que `garagardoa` la acuñó él en 1896. Llegué a escribirlo en la ficha. Era la
ciruela.

[oeh]: https://www.euskaltzaindia.eus/index.php?Itemid=&id=124884&lang=es&option=com_oehberria&task=sarreraIkusi

**La ropa estaba en el tema de comer.** «Jan eta edan» tenía 12 palabras de
ropa catalogadas, dos ejercicios enteros de ropa y cuatro preguntas de ropa
en el test de la unidad — mientras el 9.5, «Arropa eta opariak», tenía tres
fichas de gramática sobre ropa y **3 palabras**. Movido todo al 9.5:
12 palabras, `u8.1-g03` y `u8.1-g04` enteros, y reescritas las variantes
mezcladas de `u7-g25`, `u7-g26`, `u7-g23` y las tres del test. El 7.5 queda
con 28 palabras de comida y el 9.5 con 15 de ropa.

### El generador de audio no ve el curso que se publica (27/08/2026)

Salió tirando del hilo anterior, y es lo más importante del día para Miguel.

`scripts/generar-audio/generar.mjs` lee **`data/unidades/`**, que son los
ficheros **v1**. El curso que se publica es **`data/unidades-v2/`**.

Mientras el vocabulario de v2 venía heredado de v1 daba igual. Pero **todo lo
que hemos añadido directamente en v2 no existe en v1**, así que el generador
no lo ve y nunca le hará audio. Son **54 palabras**, y no son de relleno: los
ordinales enteros, `eduki` con sus formas, los verbos de la rutina del 7.3,
el `ari naiz` del 7.4, los de poder y deber del 8.3.

Listadas una a una en `docs/audios-pendientes.md`, apartado C, con las dos
salidas posibles. Decide Miguel.

De paso: casi piso la cifra de 194 audios pendientes por 181, y **no cuentan
lo mismo** —la de 194 va sobre los ficheros v1 e incluye frases de ejemplo,
la mía solo vocabulario de v2—. Restaurada.

### Ampliada la diferencia «hoy» / «nunca» (27/08/2026)

Ric pidió dejar más claro «cuando no comes pan hoy y cuando no comes pan
nunca». La ficha del partitivo lo explica ahora con dos escenas:

- **Sentado a la mesa, con el pan delante** → `Ez dut ogia jaten`. Hay un pan
  concreto que los dos miráis.
- **Te preguntan qué comes y qué no, sin pan a la vista** → `Ez dut ogirik
  jaten`. Hablas del pan en general.

Con una advertencia que va a contracorriente de la intuición y que conviene
mantener: **esto no va de tiempo**. Lo que decide es si hay un pan concreto de
por medio. Se ve añadiendo el adverbio, porque el partitivo no se mueve:

    Gaur ez dut ogirik jaten.   — Hoy no como pan.
    Inoiz ez dut ogirik jaten.  — Nunca como pan.

`gaur`, `inoiz ez` y `beti` son todos del 3.1, así que se pueden usar sin
adelantar nada.

Al cambiar los ejemplos me llevé por delante `Ez dut ezer nahi`, que era el
único sitio donde se explicaba `ezer` — y hay tres ejercicios del 7.2 que
preguntan por él. Repuesto, con una línea que lo ata al partitivo.

**Nota sobre los duplicados de vocabulario**: `bihar` (3.1 y 10.3) y `nahi dut`
(7.1 y 8.3) están catalogados dos veces, a propósito («ya la tenías; aquí se
usa con el futuro»). Comprobado que **no molestan**: `fondoVocabulario()`
deduplica por palabra antes de armar el repaso, y se queda con la primera, que
es la que lleva audio.

### La ficha del plural estaba en el tema de negar (27/08/2026)

También de Ric: *«la ficha siguiente es sobre el plural, ¿no crees que
deberíamos tenerla en el 7.1?»*.

Sí, y hay un dato que lo decide: **los ejercicios de objeto plural (`u8-g07`)
ya estaban en el 7.1**. Era la ficha la que estaba fuera de sitio — el mismo
desajuste explicación/ejercicio que el de la negación, pero al revés.

Movida al 7.1, entre «Cómo se forma el -t(z)en» y «Cuando no hay objeto»: de
más objeto a menos. Su último ejemplo era negativo (`Ez ditut haragia eta
arraina jaten`) y ahí aún no toca, así que se cambia por uno afirmativo.

No hace falta renombrar el 7.2: su resumen ya decía «el salto del auxiliar y
el partitivo», sin mencionar el plural.

### Referencias a unidades que quedaron caducadas (27/08/2026)

Tirando del hilo anterior apareció otra cosa. Varias fichas se remiten unas a
otras («ya de la sexta unidad»), y **la reordenación a diez unidades dejó ocho
apuntando a la unidad equivocada**:

- 6.1 los números → decía 5ª, están en la **4**
- 7.1 el `ukan` → decía 5ª, está en la **4**
- 7.1 `egon` → decía 6ª, está en la **5**
- 7.1 `joan`/`etorri` → decía 9ª, están en la **8**
- 10.1 el presente de `izan` → decía 4ª, está en la **2**
- 10.1 el `-it-` y el mecanismo de dos piezas → decían 8ª, están en la **7**
- 7.1 el `-tik` → decía «llega en la unidad 9», y en realidad **ya se ha visto
  en la 5**: el número estaba mal y la dirección también

Había una comprobación para esto que **nunca llegó a funcionar**: el patrón era
`unidades?`, que exige la «e» y solo casa con el plural «unidad**es** 6 y 8»,
nunca con «unidad 9». Corregido a `unidad(?:es)?`. Además ahora mira los
ejemplos (donde estaba escondido el del `-tik`) y entiende los ordinales en
letra, que era la forma más común y la que se escapaba entera.

Las referencias hacia adelante son **avisos, no errores**: anunciar lo que
viene está bien hecho y el curso lo hace cuatro veces a propósito. Saber si el
número acierta exige saber dónde se enseña cada cosa, así que eso se repasa a
ojo; el aviso solo lo pone delante.

De paso, `verificar.py` acepta `--filtro texto`, porque con 249 avisos la lista
se cortaba a 40 y no había manera de mirar una familia concreta.

### 6.5 — la burbuja de Bizkaia (27/08/2026)

Ric: *«no se entiende bien el inicio de la frase»*. Decía «el 20 de enero,
San Sebastián, en Bilbao no es gran cosa». Quería decir **el día** de San
Sebastián (la Tamborrada donostiarra); se lee como que **la ciudad** no es gran
cosa en Bilbao. Quitado.

En su lugar, y a propuesta suya, la **feria de Gernika**: el `Urriko Azken
Astelehena`. El nombre entero se arma con vocabulario ya dado — `azkena` (4.3),
`astelehena` (6.2), `urria` (6.3), `-ko` (2.4) — comprobado uno por uno antes
de escribirlo. De regalo sale una nota de gramática real: `azken` delante del
nombre pierde la `-a` y el artículo se lo queda la palabra siguiente.

No he usado `azoka` (feria), que es de 8.4.

Corregido de paso un error de dato: la Aste Nagusia **no es «el 15 de agosto»**,
empieza el sábado siguiente y dura nueve días.

### Las rutas absolutas de mis bancos de pruebas (27/08/2026)

Miguel, al fusionar: *«Rutas absolutas de los tres scripts de test nuevos
corregidas a relativas, **igual que la vez pasada**»*.

Es un error mío y **es la segunda vez que se lo arregla él**. Los bancos de
pruebas usaban `process.env.HOME + '/Proyectos/euskaraz/...'`, que funciona en
el portátil de quien lo escribió y falla en el del otro. Lo correcto es
`path.join(__dirname, '..')`, que es como los ha dejado.

Para que no haya una tercera, **`probar-todo.sh` lo comprueba ahora**: si algún
`scripts/probar_*.js` contiene `process.env.HOME`, falla y dice qué usar en su
lugar. Probado metiendo uno a propósito.

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

- **2026-09-28 · Campo `explica` en los grupos de ejercicios**, para que
  el botón del libro lleve a la ficha correcta cuando el ejercicio
  practica algo de otro tema (lo encontró Ric el primer día de uso).
  Los otros 8 quedaron apuntados el mismo día; solo `u1-g25` se dejó como
  estaba, por ser un repaso de fin de unidad que toca tres temas.


- **2026-09-28 · La ficha del tema desde dentro del ejercicio** (idea de
  Ric): botón de icono junto a «Continuar» que abre la explicación en una
  hoja, sin salir del test y sin desbloquear el tema.


- **2026-09-24 · «gurasoak» y «senidea»** (los propuso Ric). El curso no
  tenía forma de decir «mis padres», y «senidea» resultó ser la salida
  neutra del sistema anaia/arreba/neba/ahizpa: Euskaltzaindia lo define
  como hermano o hermana, no como «pariente».


- **2026-09-24 · «bere», que faltaba entero** (lo detectó Ric comparando
  con otras apps). Es batua —genitivo reflexivo de *bera*— y la regla es
  la ley de Linschmann-Aresti, en la Gramatika de Euskaltzaindia. Lo
  dialectal es que en el oeste *bere* se coma a *haren*. Ningún *haren*
  del curso estaba mal usado.


- **2026-09-18 · «Esan» con ficha, ejercicios y «esan nahi du»** (lo
  señaló Ric: salía en 36 sitios sin haberse explicado). Pendiente de
  decidir si se enseñan las formas sintéticas (*diot, diozu, dio*).
- **2026-09-18 · Sexta tanda de revisión**: 12 arreglos, sobre todo
  huecos sin frase que traducir y negaciones que pedían -rik.


- **2026-09-13 · Ficha nueva sobre la «a itsatsia»** (4.6), a raíz de una
  pregunta de Ric: «bi anaia» o «bi anai». Es «bi anaia» —la -a es parte
  de la palabra, no el artículo—, y la unidad lo usaba sin explicarlo
  teniendo la regla contraria en la 4.1.


- **2026-09-09 · «Al día · 136 sin estrenar» era engañoso** (lo preguntó
  Ric mirando producción). Son las palabras que aún no te ha preguntado
  nunca, y entran con cuentagotas; gastado el cupo del día no quedaba
  nada que hacer, pero la tarjeta seguía enseñando el número entero y
  entrar llevaba a una sesión vacía. Decidido con él: el cupo sube a 25
  y cada sesión reserva sitio para 2 sin estrenar mientras queden, para
  que goteen en vez de gastarse de golpe. Y el número de las que faltan
  sale de la portada y pasa a **Tu cuenta**, donde informa en vez de
  pedir.


- **2026-09-06 · Al repaso mezclado solo entran las unidades superadas**
  (lo preguntó Ric). Antes bastaba con abrir la portada de la unidad, y
  sus ejercicios enteros caían al calendario sin haberlos estudiado. Y el
  reparto diario ya no gasta cupo en fichas de unidades que se han caído
  del repaso. El vocabulario sigue igual: aditivo por tema.


- **2026-09-06 · La app de revisión gana el vocabulario.** Ric preguntó
  por qué no podía corregir los ejercicios de escuchar: no están, porque
  se fabrican al vuelo desde el vocabulario y no existen como ejercicio
  en los ficheros. Un fallo de escuchar es casi siempre un fallo de la
  traducción de la palabra, así que la app lleva ahora una segunda
  sección con las **526 palabras** (538 formas contando las dialectales,
  que cuelgan de la misma ficha). Las dos secciones cuentan aparte, para
  que el avance de los ejercicios se siga leyendo como hasta ahora.
- **2026-09-06 · «Pilotalekua» se arma con…** (u9-g36 v0) se contestaba
  sola: la respuesta estaba escrita en la opción. Sustituida por la
  pareja *pilotalekua* / *frontoia*, que sí tiene contenido: las dos son
  correctas y la vasca es la que los diccionarios ponen primero.


- **2026-09-06 · «askotan» acepta «muchas veces»** (lo pilló Ric en un
  ejercicio de escuchar). Y con ello salió que el campo `esAlt` —las
  otras traducciones válidas— no llegaba nunca a la pregunta, porque
  `formasDe()` no lo copiaba: las cinco entradas que lo usaban daban por
  malas sus propias alternativas.


- **2026-09-02 · El calendario de repaso, replanteado.** Ric: al día
  siguiente de ponerse al día le salían 177 pendientes. Se simuló antes
  de tocar nada y el número sale solo: con 881 fichas y la escala corta,
  un alumno al día tiene ~50 repasos diarios y picos de 170. Un tope de
  45 al trabajo diario **empeoraba** las cosas (la cola se iba a 693: lo
  no hecho se acumula sobre lo del día siguiente), así que el arreglo va
  por otro lado — escala más abierta, reparto del atasco en cola,
  sesión compuesta a propósito y cupo de novedades. Detalle en el
  CHANGELOG.
- **2026-09-02 · Ruta desplegable en la cabecera.** Los dos trozos del
  título abren un panel con pestañas (unidades / temas de la unidad
  abierta / portada). Antes solo había «atrás».


- **2026-09-02 · Quinta tanda de revisión (20 arreglos, unidad 7).**
  Primera publicada por la vía automática de Miguel (`ric/publicar`).
  Traducción añadida al texto de post-respuesta donde se acertaba el
  auxiliar sin entender la frase (`u8-g02` entero); distractores de
  otra categoría gramatical o que también eran correctos, cambiados en
  cinco preguntas de vocabulario; tres ejercicios de parejas en los que
  la única entrada de varias palabras se emparejaba sola; dos preguntas
  retiradas —«*ari naiz* = estoy en ello», que contradecía la ficha de
  su propio tema y que los nativos no reconocen, y «*ez dakit* es la
  negación de…», que se contestaba sin leer—; el truco de la sal, que
  no se sostenía con *gazta* entre las opciones. «Tomo café» acepta
  ahora también `kafea edaten dut`: Elhuyar documenta *kafea hartu*
  (acepción 6 de *hartu*: tomar, beber, comer) y la unidad enseña
  *kafea edaten* en cuatro sitios.

  Queda **abierto un patrón de fondo** que salió al ordenar la tanda:
  en las preguntas de vocabulario («¿Qué significa X?») hay **132
  variantes en las diez unidades** con algún distractor de otra
  categoría gramatical —un verbo o una perífrasis compitiendo con un
  sustantivo—, que se descartan sin saber la palabra. Las peores están
  en `04-zenbat` (33), `10-atzo` (24), `08-mugi` y `09-gustatzen` (17
  cada una). Pendiente de decidir con Ric si se barren todas.


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

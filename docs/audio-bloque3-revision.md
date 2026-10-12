# Bloque 3 de audio: revisión de Ric — para aplicar

Ric revisó el bloque 3 el 12/10/2026: **44 palabras y frases, 30 bien y 14
mal**. Todas son de la unidad 6 (`06-egutegia.json`).

---

## Lo primero: cinco están mudas en el curso

Igual que en los bloques 1 y 2. Estas cinco no tienen campo `audio` en su
entrada de vocabulario, así que la app ni pinta el altavoz:

`elurra` · `haizea` · `gabonak` · `urte-berri` · `jaieguna`

No basta con regenerar el mp3: hay que **añadirles el campo** en
`06-egutegia.json` o seguirán mudas.

Y un aviso de enlazado: **`gabonak` está en los dos estados**, muda en el
vocabulario pero enlazada en la ficha 6.5 a `unidades/u6/gabonak.mp3`.

### No te asustes con los números de carpeta

Al mirar esto se ve que `zorionak` apunta a `unidades/u12/zorionak.mp3` y
`astelehena` a `unidades/u7/astelehena.mp3`, siendo las dos de la unidad 6.
Parece un error y **no lo es**: **257 de las 342 palabras con audio (el 75 %)
tienen la ruta de otra unidad**, y el desplazamiento es sistemático — u6→u7,
u7→u8, u8→u9… Son las carpetas de cuando el curso tenía diez unidades, que se
quedaron con su nombre al renumerar a doce.

Comprobado que no hay ficheros compartidos entre unidades por esto:
`u12/zorionak.mp3` lo usa solo la unidad 6, tres veces. Así que regenerar
cualquiera de estos afecta únicamente a donde se usa.

---

## Lo importante: las causas se repiten entre bloques

Esto ya no son fallos sueltos. Cruzando el bloque 2 y el 3 salen **las mismas
cuatro causas**, y eso apunta a ajustes de la voz, no a palabras concretas.

### La erre fuerte — 3 casos en dos bloques

| bloque | clave | lo que dice Ric |
|---|---|---|
| 2 | `etxe-gorria` | la RR de *gorria* debe ser clara |
| 3 | `elurra` | la RR rodada, marcada, como «perro» |
| 3 | `urte-berri` | «berri» con RR rodada; aquí suena mal |

### Vocales y consonantes finales que se come — 7 casos

| bloque | clave | |
|---|---|---|
| 2 | `armairua` | la segunda r no se escucha |
| 2 | `txerria` | la a suena separada |
| 2 | `aulki-batzuk-beltzak-dira` | no se entiende la k de *beltzak* |
| 2 | `txakurra-etxean-dago` | *dago* suena *nano* |
| 3 | `gabonak` | la a final abierta y clara: gabonAk |
| 3 | `zorionak` | la a final abierta y clara: zorionAk |
| 3 | `negua-hotza-da` | dice *da* como *na*: la d debe ser clara |

Siete de los veintinueve problemas de los dos bloques son esto. Es el ajuste
que más rinde.

### La jota — 2 casos

| bloque | clave | |
|---|---|---|
| 2 | `laranja` | la j no es la castellana |
| 3 | `jaieguna` | la j **sí** debe ser la castellana; aquí suena como una s |

⚠️ **Ojo, que van en direcciones opuestas y no es contradicción.** En batua la
`j` suele ser [j] («yod»), y en Gipuzkoa suena como la jota castellana. La
ficha de pronunciación de 1.4 lo dice: «j — normalmente *y*, como en yo. En
Gipuzkoa suena como la jota castellana». Lo que pide Ric en cada caso es lo
que suena natural en esa palabra, así que **conviene decidir una norma** y
aplicarla, no caso a caso.

### Sibilantes y africadas — 3 casos

| bloque | clave | |
|---|---|---|
| 2 | `grisa` | suena *Grisha* |
| 2 | `zaldia` | la z silbante: *Saldia* |
| 3 | `neguan-hotz-egiten-du` | *hotz* debe sonar claramente tz; suena *och* |

---

## Lo nuevo del bloque 3: la entonación de las frases

Cuatro de los catorce no son de un sonido, sino de cómo se dice la frase
entera. Es un problema distinto y puede que necesite otro ajuste (velocidad,
pausas, o una voz distinta para frases largas):

| clave | lo que dice Ric |
|---|---|
| `nire-urtebetetzea-maiatzean-da` | dicción más plana; parece acentuar varias palabras, y «maiatzean da» suena arrastrado |
| `gaur-eguraldi-ona-dago` | más pausado, y el acento suena extranjero |
| `aste-nagusia` | más pausa entre palabras |
| `zorionak-zuri` | las palabras sueltas están bien, pero la frase suena extraña |

El caso de `zorionak-zuri` es el más revelador: Ric dice que **las palabras por
separado están bien y juntas no**. Eso no se arregla regenerando la palabra,
se arregla en cómo se genera la frase.

---

## Y dos que están mal dichas, sin más

| clave | |
|---|---|
| `aratusteak` | añade una s o algo en medio |
| `urriko-azken-astelehena` | *astelehena* está mal pronunciado: dice otra palabra |

La de `astelehena` conviene mirarla con cuidado, porque esa palabra tiene
**tres audios distintos**: el suyo suelto en el vocabulario de la unidad 6
(`unidades/u7/astelehena.mp3`), el de esta frase, y el de
`Astelehenero azokara joaten naiz` en la ficha 8.1. Si la voz la dice mal,
probablemente lo haga en los tres — conviene escucharlos antes de dar el
bloque por cerrado.

---

## Y uno de vocal

`haizea` — ahora suena «aizer». Se tienen que entender la e y la a, con el
acento en la é: «haizéa».

---

## Cómo aplicarlo

1. Para las cinco mudas, generar **y añadir el campo `audio`**.
2. Cuidado con `zorionak`, que comparte fichero con la unidad 12.
3. Antes de ir una por una, probar los dos ajustes que más rinden: **la erre
   fuerte** y **las finales que se come**. Entre los bloques 2 y 3 son diez de
   los veintinueve problemas.
4. Decidir la norma de la **j** antes de tocar esas dos.
5. Las cuatro de entonación son otro problema: conviene atacarlas aparte.

## Estado de los bloques

| | palabras | revisado |
|---|---|---|
| 1 | 64 | sí (`docs/audio-bloque1-elecciones.md`) |
| 2 | 53 | sí — 15 mal (`docs/audio-bloque2-revision.md`) |
| 3 | 44 | sí — 14 mal (este) |
| 4–8 | 205 | pendiente |

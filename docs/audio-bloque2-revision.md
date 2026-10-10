# Bloque 2 de audio: revisión de Ric — para aplicar

Ric revisó el bloque 2 el 10/10/2026: **53 palabras y frases, 38 bien y 15
mal**. Todas son de la unidad 5 (`05-etxea.json`).

Aquí está el detalle con lo que hace falta para aplicarlo, que **no es solo
regenerar ficheros**.

---

## Lo primero: 7 de las 15 no tienen audio en el curso

Igual que pasó en el bloque 1. Al buscar dónde vive cada clave en
`data/unidades-v2/05-etxea.json` aparece que **siete no tienen campo
`audio`**: existen en el bucket de pruebas, generadas para poder revisarlas,
pero nunca se enlazaron. La app no pinta el altavoz cuando falta el campo,
así que ahora mismo están mudas.

| sin audio en el curso | con audio, hay que sustituirlo |
|---|---|
| `grisa` · `bainugela` · `eskailerak` · `armairua` · `zaldia` · `txerria` | `etxe-gorria` · `mahai-zuria` · `nire-logela-urdina-da` · `mahai-zuri-bat` · `mahai-batzuk` · `aulki-batzuk-beltzak-dira` · `mahai-bat-eta-lau-aulki` · `txakurra-etxean-dago` |

Y dos avisos de enlazado:

- **`laranja` está en los dos sitios**: muda en el vocabulario, pero enlazada
  en la ficha 5.3 a `unidades/u5/laranja.mp3`. Hay que arreglar el fichero
  **y** añadir el campo que falta.
- **`etxe-gorria` aparece dos veces** —fichas 5.2 y 5.3— apuntando al **mismo**
  fichero. Se arregla una vez y vale para las dos.

---

## Los 15, agrupados por causa

No son quince problemas sueltos: son **seis causas**. Conviene atacarlas por
ahí, porque cada una se repite y porque casi todas afectarán también a
palabras de otras unidades que aún no se han revisado.

### A · «mahai» — una sola palabra, cuatro de los quince

| clave | lo que dice Ric |
|---|---|
| `mahai-zuria` | se deben escuchar las dos «a» de mahai: *ma-ai zuria* |
| `mahai-zuri-bat` | mahai: deben sonar todas las letras salvo la h, que es muda |
| `mahai-batzuk` | no suena la h, es algo como *ma-ai* |
| `mahai-bat-eta-lau-aulki` | suena *maiá* y debe ser *maai bat* |

La voz está tratando la `h` como si fuera algo, o colapsando las dos vocales.
En euskera la `h` es muda: `mahai` son dos sílabas con las dos aes audibles.
**Arreglando cómo suena `mahai` se arreglan cuatro de los quince**, y también
las frases de otras unidades donde aparezca.

### B · Bustidura: la `i` que palataliza la `n` y la `l`

| clave | lo que dice Ric |
|---|---|
| `bainugela` | la i-n debe sonar ñ: *baiñuguela* |
| `eskailerak` | la i-l debe sonar ll: *eskaillerak* |
| `nire-logela-urdina-da` | *urdina* debe ser *urdiña* |

**Esto es una decisión de criterio, no un error — conviene saberlo.** El
*Euskara Batuaren Eskuliburua* de Euskaltzaindia dice que esta palatalización
**no se escribe** (`baina`, no `baña`; `langile`, no `langille`), y que en la
pronunciación **depende del dialecto**: quien palataliza dice [ɲ] y [ʎ], quien
no, dice [in] y [il] sin palatalizar. Las dos son correctas.

Lo que pide Ric es la variante palatalizada, que es coherente con que el curso
tire a bizkaiera. Pero si se adopta, **hay que adoptarla en todo el curso**, no
solo donde se note: un alumno no debe oír `baiñuguela` en la unidad 5 y
`bainugela` en la 7.

⚠️ **Ojo con el objetivo.** Euskaltzaindia avisa expresamente de que `il`/`ll`
**no** se pronuncian como la *y* castellana (yeísmo). El sonido que hay que
pedirle a la voz es [ʎ], la *ll* de «llave» en pronunciación no yeísta — no la
[j] con la que la mayoría de los hispanohablantes leería «eskaillerak».

### C · Las sibilantes: `z` y `s` no son lo mismo

| clave | lo que dice Ric |
|---|---|
| `grisa` | suena *Grisha*; la s es silbante |
| `zaldia` | la z es silbante: *Saldia* |

Las dos van en la misma dirección: la voz está metiendo un sonido tipo *sh* o
un ceceo donde debe haber una sibilante limpia. Es la distinción vasca entre
`z` (laminal) y `s` (apical), que ninguna de las dos es la *z* castellana.

### D · La `j`

| clave | lo que dice Ric |
|---|---|
| `laranja` | la j no es la castellana, mejor *laranlla* |

La voz está usando la jota castellana [x]. En batua la `j` suele ser [j]
(o [ʃ] en algunas zonas), nunca la jota de «jamón».

### E · Finales que se comen

| clave | lo que dice Ric |
|---|---|
| `armairua` | la segunda r no se escucha |
| `txerria` | la a suena separada, como *txerriha*; es seguida |
| `aulki-batzuk-beltzak-dira` | no se entiende la k de *beltzak*; *dira* suena otra cosa |
| `txakurra-etxean-dago` | *dago* suena *nano*; debe sonar con todas las letras |

Todos son de articulación floja al final de palabra. Probablemente sea el
mismo ajuste de voz o de velocidad.

### F · La erre fuerte

| clave | lo que dice Ric |
|---|---|
| `etxe-gorria` | la RR de *gorria* debe ser clara: *Etxe GoRRia* |

---

## Cómo aplicarlo

1. Para las siete sin audio, no basta con generar: hay que **añadir el campo
   `audio`** a su entrada de vocabulario en `05-etxea.json`, o seguirán mudas
   aunque el mp3 exista.
2. Antes de regenerar nada, **decidir lo de la bustidura** (bloque B). Si se
   adopta, afecta a la generación de todo el curso, no solo a estas tres.
3. Las causas A, C, D, E y F son ajustes de la voz, no de palabras sueltas.
   Merece la pena probar una y escuchar si arrastra a las demás antes de ir una
   por una.
4. Al terminar, pasarle a Ric un bloque nuevo con las regeneradas para que
   confirme, como se hizo con el bloque 1.

## Lo que queda de los bloques

Ric lleva hechos el 1 y el 2. Quedan del 3 al 8 — **205 palabras**. Los enlaces
están publicados; si hacen falta otra vez, se regeneran desde
`revision-audio/bloqueN.html`.

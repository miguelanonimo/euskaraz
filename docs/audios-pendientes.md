# Audios pendientes — para Miguel

Todo lo de audio que hay ahora mismo pendiente, en un sitio. Sale de lo que
Ric fue detectando de oído probando la app, más el vocabulario nuevo que
aún no tiene mp3.

Son **dos trabajos distintos** y conviene no mezclarlos:

| | Qué es | Cuántos | Cómo |
|---|---|---|---|
| **A** | Audios que ya existen pero **suenan mal** | 22 | `node lote-ric-3.mjs` |
| **B** | Palabras nuevas **sin audio ninguno** | 194 | `node generar.mjs <unidad>` |

---

## A · Regenerar los 22 que suenan mal

```
cd scripts/generar-audio
npm install
mkdir -p /tmp/audio-trim-work/lote
node lote-ric-3.mjs
```

Salen a `/tmp/audio-trim-work/lote/`, con las barras de la ruta cambiadas
por guiones bajos (`unidades_u3_agian.mp3`). Mismo mecanismo que
`lote-ric.mjs`, el de la tanda anterior: a cada palabra se le adjunta una
instrucción fonética en inglés, porque el modelo no acepta SSML ni fonemas.

Las 22 rutas están verificadas contra los JSON del curso: todas existen y
ninguna está repetida.

### Grupo 1 · El acento cae en la sílaba equivocada (6)

`agian` · `berdin` · `daude` · `eguerdia` · `euria` · `garai hartan`

**No hay una regla que los una.** `eguerdia` y `euria` empiezan casi igual
y llevan el acento en sílabas distintas. Por eso en el lote se le indica la
posición palabra por palabra en vez de esperar que la deduzca — si esto
funciona, es la receta para los que salgan en el futuro.

### Grupo 2 · Los auxiliares (3)

`da` · `du` · `gara`

**Este grupo es el que más rinde de toda la lista.** `da` es el verbo
«ser» y sale en casi todas las frases del curso. Si el problema es de
familia, arrastra a `dut`, `du`, `duzu`, `dugu`, `dute`, `ditut`, `dira`,
`dago`, `daude`, `doa`, `dator` y `dabil` — todas con audio ya generado y
ninguna revisada aún con este oído.

- `da` — la D suena inglesa (alveolar, aspirada); debe ser dental, como en «dato»
- `du` — suena «dui», se le añade una I que no existe
- `gara` — suena «dara», la G inicial se convierte en D

### Grupo 3 · Consonantes concretas (6)

- `benetan` — suena «denetan» (B→D)
- `astea` — suena «aspea» (T→P)
- `atea` — suena «apea» (T→P)
- `axola zait` — suena «achola»; la X es «sh» inglesa, no «ch»
- `geu` — suena «giu», la E se cierra; debe ser abierta
- `ez horregatik` — **tercer intento.** El 20/08 fallaba la RR, se
  regeneró, y el 21/08 salía «horregadit». Ahora pierde la K final.

**Sobre la T→P:** confirmado en `astea` y `atea`, y **no es la raíz**: Ric
verificó que `asteburua`, `astelehena`, `asteartea` y `asteazkena` suenan
bien. Lo que comparten las dos que fallan es la terminación **`-tea` en
palabra corta**. Queda por escuchar `urtea`, la única más del curso con esa
forma que ya tiene mp3.

### Grupo 4 · Segunda ronda que siguió fallando (6)

Estas se regeneraron el 20/08 y el 21/08 seguían mal, con un fallo
**distinto** al original:

`inor ez` · `iruditzen zait` · `joan` · `logela` · `noren` · `zatoz`

### El caso aparte: `mahaia`

**Tres regeneraciones, tres resultados malos distintos** («mayayaia»,
«maiaia»). Va en el lote con la instrucción más explícita que se puede
escribir, pero si vuelve a fallar, **regenerar no es el camino**: habría
que trucar el texto que se envía a sintetizar (mandar `maaia` en lugar de
`mahaia`). No lo he hecho porque cambia lo que se sintetiza y esa decisión
es tuya.

---

## B · Generar el vocabulario nuevo (194)

Son palabras que **nunca han tenido audio**, casi todas del vocabulario que
Ric aprobó ampliar. `generar.mjs` lee la unidad entera —vocabulario,
variantes dialectales y frases de ejemplo de gramática— y **salta las que ya
tienen mp3**, así que se puede correr sin miedo:

```
cd scripts/generar-audio
node generar.mjs u2
node generar.mjs u5.1
node generar.mjs u6.1
node generar.mjs u7.1
node generar.mjs u8.1
node generar.mjs u10.1
```

| Unidad | | Faltan |
|---|---|---|
| `u2` | Ni eta zu | 2 |
| `u5.1` | Familia eta animaliak | 47 |
| `u6.1` | Koloreak eta etxea | 41 |
| `u7.1` | Hilabeteak | 25 |
| `u8.1` | Janaria eta arropa | 39 |
| `u10.1` | Gorputza, urtaroak eta jaiak | 40 |

**Ojo con dos cosas:**

1. **El identificador lleva punto:** es `u5.1`, no `u5b` ni `u5`. Con `u5`
   generarías la unidad equivocada, que ya está completa.
2. **`generar.mjs` comprueba si el mp3 existe en `out/` local, no en el
   bucket.** En un clon limpio se pondría a regenerar todo. Si tienes los
   mp3 de tandas anteriores, déjalos en `out/` antes de correrlo.

Los 2 de `u2` son de esta semana: `ha` y `hareek`, las formas bizkainas de
los demostrativos (dato de Ric, verificado en Bizkaieraren ataria).

---

## C · Dos archivos que cambiaron de nombre

Al corregir dos frases de la unidad 10 de `diot` a `dio`, cambia el slug y
por tanto el nombre del mp3:

- `unidades/u10/aneri-esan-dio.mp3` — «Aneri esan dio.»
- `unidades/u10/lagunari-lagundu-dio.mp3` — «Lagunari lagundu dio.»

Los viejos (`...-diot.mp3`) quedan sin usar y se pueden borrar del bucket.
Hasta que se generen, esos dos ejemplos salen sin audio.

---

## Lo que NO está aquí

- **El curso reestructurado** (`data/unidades-v2/`) tiene otros 173
  huecos de vocabulario y 115 de ejemplos. No los meto en esta lista
  porque ese curso aún no está decidido que entre.
- **Nada de esto está verificado por un nativo.** Las frases de ejemplo
  nuevas las hemos escrito nosotros.

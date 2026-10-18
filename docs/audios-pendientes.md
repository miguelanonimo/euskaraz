# Audios pendientes — para Miguel

Todo lo de audio que hay ahora mismo pendiente, en un sitio. Sale de lo que
Ric fue detectando de oído probando la app, más el vocabulario nuevo que
aún no tiene mp3.

Son **tres trabajos distintos** y conviene no mezclarlos. El C salió hoy y
es el que conviene mirar primero, porque afecta a cómo se genera todo lo demás:

| | Qué es | Cuántos | Cómo |
|---|---|---|---|
| **A** | Audios que ya existen pero **suenan mal** | 23 | `node lote-ric-3.mjs` |
| **B** | Palabras nuevas **sin audio ninguno** | 194 | `node generar.mjs <unidad>` |
| **C** | Palabras de v2 que el generador **no podía ver** | 58 | ya arreglado, ver abajo — falta ejecutar |

---

## A · Regenerar los 23 que suenan mal

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

Las 23 rutas están verificadas contra los JSON del curso: todas existen y
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

### Grupo 5 · Cuarta ronda (1)

- `nongoa` — suena «nowa»: la G se pierde y la última vocal no se oye.
  Deben sonar las tres sílabas, con la G marcada: **non-GO-a**.

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

> **Actualización del 13/10/2026 (Miguel + Claude): las 24 de abajo, ya generadas y subidas, junto con 9 más que
> solo faltaban en el diccionario (`ha`, `hareek`, `honeek`, `aitxitxe`, `amuma`, `izeko`) o ya existían sin enlazar.
> El diccionario queda con las 556 entradas con audio. Todo lo nuevo está listado para escucharlo en
> `docs/audios-nuevos-para-revisar.md`.** Generador: `scripts/generar-audio/generar-faltantes.mjs`
> (genera todo lo que no tenga `audio`, lo sube y lo enlaza en el JSON; se puede repetir).

## B-bis · ~~Lo que falta por generar~~ · HECHO el 13/10/2026

> **Ya no falta nada.** Miguel generó y enlazó las 24 de esta lista y nueve
> más, y el **vocabulario del curso está en 544 de 544 con audio: cero
> palabras mudas**. Comprobado el 18/10/2026 sobre los datos de `main`.
>
> Las nueve del paradigma de la unidad 10 salieron con el lote que quedó
> preparado aquí, y `dena` y `astiro` con las rutas exactas que estaban
> apuntadas: `unidades/u10/dena.mp3` y `unidades/u11/astiro.mp3`.
>
> **Lo que queda es escucharlo**, que es otra cosa: hay 430 audios nuevos
> sin que nadie los haya oído, listados en `docs/audios-nuevos-para-revisar.md`.
> La lista de abajo se deja como registro de cómo se llegó hasta aquí.

Lo que decía esta sección cuando se escribió, el 13/10/2026: de las palabras
sin audio del curso, la inmensa mayoría ya tenían el mp3 subido y solo les
faltaba la línea en el JSON (175, enlazadas el 12/10/2026); estas 24 eran las
que no existían en ninguna parte.

### Las 13 de siempre

`bere` · `edonor` · `edonon` · `edonora` · `familia` · `seigarrena` ·
`dirua` · `astia` · `itsusia` · `batzuk` · `hotza` · `esan nahi du` · `bihar`

### Las 2 añadidas el 12/10/2026

| palabra | qué es | ruta de destino |
|---|---|---|
| `dena` | «todo», en el tema 9.1, junto a `guztia` | `unidades/u10/dena.mp3` |
| `astiro` | «despacio», en el tema 11.3, junto a `poliki` | `unidades/u11/astiro.mp3` |

Las dos salieron de oír a Dei y están verificadas en el
*Euskaltzaindiaren Hiztegia*: `dena` y `guztia` son equivalentes, y `astiro`
es la palabra que el propio diccionario usa para definir `poliki`.

Ojo con `astiro`: la ficha 11.4 menciona también **`astia`**, que está en la
lista de arriba. Generando las dos, ese párrafo se enciende entero.

### Las 9 de los paradigmas de la unidad 10 (13/10/2026)

**Hay un script preparado:** `scripts/generar-audio/lote-paradigmas-u10.mjs`.
Lleva dentro las nueve rutas y, en cada una, las instrucciones fonéticas de
los fallos que la voz ya comete —la z silbante, las finales que se come, el
grupo tz—, para no gastar una ronda de revisión en descubrir lo sabido.

```
cd scripts/generar-audio && npm install
mkdir -p /tmp/audio-trim-work/lote
node lote-paradigmas-u10.mjs
```

| forma | qué es |
|---|---|
| `zenuten` | (vosotros) teníais |
| `nituen` | (yo) los tenía |
| `zenituen` | (tú) los tenías |
| `zituen` | (él/ella) los tenía |
| `genituen` | (nosotros) los teníamos |
| `zenituzten` | (vosotros) los teníais |
| `zituzten` | (ellos) los tenían |
| `zeunden` | (tú) estabas |
| `zeundeten` | (vosotros) estabais |

Todas a **`unidades/u11/`**: trece de las quince formas hermanas del
paradigma ya viven ahí. (La carpeta no coincide con el número de unidad por
el desplazamiento histórico de cuando el curso tenía diez. No es un error.)

**De dónde salen.** La unidad 10 enseña 24 formas verbales en pasado y doce
no estaban en el vocabulario: solo vivían en el texto de la ficha, así que no
salían en el diccionario, no volvían en el repaso y no tenían audio. Ya están
las doce; tres de ellas (`zuen`, `geunden`, `zeuden`) ya tenían mp3 y se
enlazaron. Estas nueve se buscaron en las doce carpetas de unidad y en los
prefijos de pruebas —198 rutas— y no existe ninguna.

**Formas verificadas** antes de escribir 46 ejercicios encima: el paradigma
de `egon` en pasado (`nengoen, zeunden, zegoen, geunden, zeundeten, zeuden`)
coincide en varias tablas independientes, y `geunden` aparece en un ejemplo
del propio *Euskaltzaindiaren Hiztegia*.

### Cuando estén subidas

Hay que **añadir el campo `audio`** a sus entradas de
`data/unidades-v2/*.json`, o seguirán mudas aunque el mp3 exista. Es el
mismo paso que se hizo con las 175.

Y entonces se podrá usar el tipo de ejercicio «pares» con estas formas, que
ahora mismo no se puede: «pares» exige audio en cada palabra, y por eso dos
grupos de la unidad 10 tuvieron que escribirse como opción.

---

### Un mp3 que queda sin uso

Al corregir la gramática de la ficha 11.2 dejó de usarse
`unidades/u11/gaur-joaten-naiz.mp3`. **No hay que generar nada**: la frase
que ocupa su sitio ya tenía su mp3. El fichero se puede dejar donde está;
solo conviene saber que está huérfano por si algún día se limpia el bucket.

Ojo para la revisión de audio: Ric dio `gaur-joaten-naiz` por **bueno** en el
bloque 7. El audio estaba bien; lo que estaba mal era la frase — juntaba un
tiempo puntual («gaur») con la forma de la costumbre, y la *Euskararen
Gramatika* (26.6.1.1) marca eso como agramatical con los verbos que tienen
forma sintética viva, como `joan`.

---

## C · El agujero de antes: ya arreglado, falta ejecutarlo

**Ya no es un agujero — `generar.mjs` lee `data/unidades-v2/` directamente
desde el 27/08/2026** (ver la nota de Miguel más abajo). Se deja el
contexto y la lista porque siguen sirviendo para saber qué falta generar,
no porque el generador siga sin verlas.

Hasta ese arreglo, `generar.mjs` leía `data/unidades/` (v1), y todo lo
añadido directamente en v2 —sin pasar por v1— quedaba invisible para
siempre, por muchas veces que se corriera el script. Eran **58 palabras**
en el último recuento (27-29/08), y no son de relleno: están los
ordinales enteros, `eduki` con sus formas, los verbos de la rutina diaria
del 7.3, el `ari naiz` del 7.4 y los de poder y deber del 8.3. Con el
curso siempre creciendo, esta cifra ya no es la que manda — lo que hace
falta generar de verdad, en cualquier momento, es "todo lo que no tenga
`audio` en `data/unidades-v2/`", categorías B y C ya fusionadas en una
sola desde el arreglo.

| Tema | Palabra | Castellano |
|---|---|---|
| `1.3` | `Euskal Herria` | el País Vasco |
| `1.3` | `euskalkia` | el dialecto |
| `1.3` | `batua` | el euskera unificado |
| `1.3` | `Bizkaia` | Vizcaya |
| `1.3` | `Gipuzkoa` | Guipúzcoa |
| `1.3` | `Araba` | Álava |
| `1.3` | `Nafarroa` | Navarra |
| `3.3` | `hori` | eso, ese |
| `3.3` | `hauek` | estos |
| `3.3` | `horiek` | esos |
| `4.3` | `lehena` | el primero |
| `4.3` | `bigarrena` | el segundo |
| `4.3` | `hirugarrena` | el tercero |
| `4.3` | `laugarrena` | el cuarto |
| `4.3` | `bosgarrena` | el quinto |
| `4.3` | `azkena` | el último |
| `4.3` | `seigarrena` | el sexto, la sexta |
| `4.3` | `zazpigarrena` | el séptimo, la séptima |
| `4.3` | `zortzigarrena` | el octavo, la octava |
| `4.3` | `bederatzigarrena` | el noveno, la novena |
| `4.3` | `hamargarrena` | el décimo, la décima |
| `4.3` | `hamaikagarrena` | el undécimo, la undécima |
| `4.3` | `hamabigarrena` | el duodécimo, la duodécima |
| `4.5` | `daukat` | (yo) tengo |
| `4.5` | `daukazu` | (tú) tienes |
| `4.5` | `dauka` | (él/ella) tiene |
| `4.5` | `eduki` | tener |
| `4.5` | `astia` | el tiempo (del que se dispone) |
| `4.6` | `familia` | la familia |
| `5.4` | `batzuk` | unos, unas, algunos |
| `5.5` | `baserria` | el caserío |
| `6.2` | `egutegia` | el calendario |
| `7.3` | `esnatu` | despertarse |
| `7.3` | `jaiki` | levantarse |
| `7.3` | `dutxatu` | ducharse |
| `7.3` | `jantzi` | vestirse |
| `7.3` | `gosaldu` | desayunar |
| `7.3` | `bazkaldu` | comer (al mediodía) |
| `7.3` | `afaldu` | cenar |
| `7.3` | `garbitu` | limpiar |
| `7.3` | `lo egin` | dormir |
| `7.3` | `etxeko lanak` | las tareas de casa |
| `7.4` | `ari naiz` | estoy (haciendo algo) |
| `7.4` | `ari zara` | estás (haciendo algo) |
| `7.4` | `ari da` | está (haciendo algo) |
| `7.5` | `arana` | la ciruela |
| `8.1` | `mugitu` | mover, moverse |
| `8.3` | `ahal dut` | puedo |
| `8.3` | `ezin dut` | no puedo |
| `8.3` | `behar dut` | tengo que, necesito |
| `9.3` | `gorputza` | el cuerpo |
| `9.5` | `oparia` | el regalo |
| `10.3` | `etorkizuna` | el futuro |
| `10.3` | `asmoa` | la intención, el plan |

**Decidido (27/08/2026, Miguel): opción 1.** `generar.mjs` ya lee
`data/unidades-v2/` en vez de `data/unidades/`. Comprobado a mano antes de
tocar el script: los ids de unidad y las rutas de audio que referencian los
datos siguen coincidiendo aunque el contenido se haya movido de unidad al
reestructurar (p. ej. los animales, trasladados a la 5, ya llevan
`unidades/u5/...`), así que no hizo falta ningún mapeo especial — solo
cambiar el directorio de origen en `buscarPorId()`.

De paso, nuevo flag `--subnivel <id>` para no tener que regenerar la unidad
entera por 5-10 palabras nuevas: `node generar.mjs u4 --subnivel 4.3` genera
solo el vocabulario y los ejemplos de ese tema. Las 54 de la tabla de arriba
se reparten en 16 subniveles — con el flag, cada tanda es una llamada.

Pendiente: correr `generar.mjs` de verdad para las 54 (necesita credenciales
de Google Cloud y cuesta tiempo/cuota) — el script está listo, no se ha
ejecutado todavía.

---

## D · Dos archivos que cambiaron de nombre

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

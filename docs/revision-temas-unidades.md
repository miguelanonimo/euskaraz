# Revisión de coherencia temática — borrador temporal

**Estado: solo análisis, sin tocar ningún fichero de contenido todavía.**
Generado el 28/08/2026 en sesión de terminal, para continuar desde la app de escritorio.

## El encargo

Dos partes, en orden:

1. Revisión exhaustiva de que los ejercicios encajan con el tema (subnivel) de
   su unidad. Regla: está bien que una variante use temas **anteriores** de
   la misma unidad, nunca **posteriores**, y nunca más de 2 de las variantes
   de un mismo ejercicio apoyándose en temas anteriores.
2. Una vez revisado: ampliar cada ejercicio de 5 a **8 variantes**, para que
   los repasos sean más dinámicos.

Antes de tocar nada, tocaba dar un informe. Esto es ese informe.

## Cómo se hizo el análisis

Script en Python (no guardado en el repo, era de usar y tirar) que:

- Por cada unidad, sabe en qué subnivel se introduce formalmente cada
  palabra del vocabulario (`data/unidades-v2/*.json`, campo `vocabulario[].subnivel`).
- Recorre cada variante de cada ejercicio y comprueba qué palabras usa y de
  qué subnivel son, comparando con el subnivel asignado al ejercicio
  (`ejercicios[].subnivel`).

**Limitaciones a tener en cuenta:**

- Solo mira vocabulario, no gramática. Si un ejercicio usa una estructura
  gramatical de un tema posterior pero con vocabulario ya conocido, no lo
  detecta.
- Tuvo que depurarse dos veces: al principio confundía castellano con
  euskera dentro del mismo texto (p. ej. "al", "el", "no" coincidiendo con
  palabras vascas cortas), y troceaba frases fijas ("bihar arte" = hasta
  mañana) en palabras sueltas, generando falsos positivos. Ya corregido,
  pero pueden quedar casos sueltos raros.
- Se excluyó el tema **1.4 "Pronunciación y dialectos"** de la regla: ahí se
  citan palabras de cualquier punto del curso a propósito, como ejemplos de
  sonidos (zu, zortzi...), y eso no es un fallo.

## El resultado, en una frase

**139 de los 334 ejercicios (42%) tienen algún aviso.** Se dividen en dos
tipos de problema distintos, con distinta gravedad:

| | Grupos afectados |
|---|---|
| Usa una palabra de un tema **posterior** en la respuesta correcta (no solo en opciones incorrectas) | **72** (68 fuera de fonética) |
| Más de 2 de las 5 variantes se apoyan en temas **anteriores** de la misma unidad | **85** |
| Ambos a la vez | 14 |
| Sin ningún aviso | 195 (58%) |

## 1. Referencias a temas futuros (lo más serio)

De las apariciones de palabras-fuera-de-tema: **85 casos cruzan a otra
unidad entera** (más grave — usa vocabulario que no se introduce hasta
unidades más adelante) y **98 casos se quedan dentro de la misma unidad**
(usa un tema siguiente de la misma unidad).

Por unidad (ejercicios con al menos una referencia a futuro en la respuesta
correcta, fuera de fonética):

| Unidad | Ejercicios | Con referencia a futuro |
|---|---|---|
| U1 Kaixo! | 25 | 4 |
| U2 Ni eta zu | 27 | **13** |
| U3 Galderak | 29 | 10 |
| U4 Zenbat eta familia | 42 | 6 |
| U5 Etxea | 33 | 5 |
| U6 Egutegia | 30 | 4 |
| U7 Zer egiten duzu? | 35 | **11** |
| U8 Mugi zaitez! | 34 | 4 |
| U9 Gustatzen zait | 36 | 7 |
| U10 Atzo eta bihar | 43 | 4 |

**El hallazgo más útil no son los 68 ejercicios sueltos, sino que casi la
mitad de esas apariciones son las mismas ~12 palabras repetidas una y otra
vez**, mucho antes de su tema formal:

| Palabra | Se usa antes de tiempo | Se introduce oficialmente en |
|---|---|---|
| `zuri` (a ti) / `niri` (a mí) | 15 veces combinadas | 9.2 |
| `polita` (bonito/a) | 7 veces | 5.3 |
| `etxea` (la casa) | 6 veces | 5.2 |
| `kafea` (café) / `nongoa` (de dónde) | 5 veces cada una | 7.5 / 3.2 |
| `handia` / `txikia` (grande/pequeño) | 4 + 3 veces | 5.3 |
| `ikaslea`, `medikua` (profesiones) | 4 y 3 veces | 2.4 |
| `duzu`, `dut` (formas de "ukan") | 6 veces combinadas | 4.4 |

Esto sugiere que en varios casos el problema real no es "arreglar cada
ejercicio", sino que estas palabras funcionan como vocabulario
básico/de relleno usado por todo el curso y quizá su etiqueta de subnivel
debería moverse antes — sobre todo `zuri`/`niri` (pronombres dativos), que
parecen necesitarse mucho antes del 9.2.

## 2. Exceso de apoyo en temas anteriores (regla de "nunca más de 2 de 5")

85 grupos tienen 3, 4 o los 5 de sus variantes actuales apoyándose en
vocabulario de un tema anterior de la misma unidad, en vez de ceñirse al
tema propio. Muy repartido entre unidades (5 a 14 cada una), sin ningún
patrón de palabras dominante como en el caso anterior — parece más bien
ejercicios de repaso/test que reciclan vocabulario a propósito.

**Pregunta abierta:** ¿la regla de "máximo 2" aplica también a los
ejercicios de repaso final de cada unidad (subnivel `"test"`), o esos
pueden apoyarse libremente en todo lo visto en la unidad? Muchos de los 85
casos son justo esos grupos de test.

## Decisiones pendientes antes de seguir

1. **¿Corregir primero estos 139 casos y luego ampliar a 8 variantes?** O
   aprovechar la ampliación de 5→8 para corregir lo que le toque a cada
   grupo de paso (más eficiente, pero mezcla dos tareas).
2. **Los grupos de test:** ¿aplica la regla de "máximo 2 con tema
   anterior" igual que en los temas normales?
3. **Las ~12 palabras recurrentes** (`zuri`, `niri`, `polita`, `etxea`...):
   ¿mover su subnivel de introducción antes, en vez de tocar cada ejercicio
   uno a uno?

## Siguiente paso, una vez decidido lo de arriba

Ampliar cada uno de los 334 ejercicios de 5 a 8 variantes (curso completo:
1670 → 2672 variantes), aplicando ya la regla de coherencia temática
corregida.

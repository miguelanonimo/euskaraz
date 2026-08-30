# Tres cosas de motor que la evidencia respalda — para Miguel

Salen de la nota de investigación que preparó Ric («Evidencia para Euskaraz»),
que repasa la literatura sobre apps de idiomas, tipos de ejercicio, pistas y
adquisición gramatical. **Cinco de sus huecos son nuestros. Dos ya los he
tapado con contenido** (el ergativo y el `-a`/`-ak`, ver `ideas-ric.md`).
**Estos tres piden código**, y van ordenados por relación resultado/esfuerzo.

---

## 1 · Repaso gramatical intercalado entre unidades

**El hueco.** El SRS cubre el léxico. La gramática se practica dentro de su
unidad y no vuelve nunca. Eso es *práctica en bloque*, que es la que rinde en
el momento y se olvida.

**El dato.** Nakata y Suzuki (2019), *Modern Language Journal*, 115 aprendices
practicando cinco estructuras gramaticales:

| | acierto durante la práctica | recuerdo una semana después |
|---|---|---|
| en bloque | **87,2 %** | — |
| intercalado | 77,0 % | **d = 0,64 a favor** |

En el postest inmediato no hubo diferencia; la ventaja aparece a la semana. Y
**el aprendiz no lo percibe**, porque durante la práctica falla más — así que
esto no se puede decidir preguntándole si le gusta. El beneficio fue **mayor
para los que menos sabían**.

**Qué habría que construir.** Un modo de repaso paralelo al de vocabulario,
pero de estructuras: mezcla ejercicios de temas gramaticales ya desbloqueados,
de unidades distintas, en la misma sesión.

**Lo bueno:** no hace falta contenido nuevo. Los 351 ejercicios ya llevan su
`subnivel`, y la progresión ya sabe qué temas están abiertos. Es selección y
barajado sobre lo que existe. Los pares que más rinden son los que compiten
entre sí: `nor` contra `nork`, presente contra pasado, `-n` contra `-ra` contra
`-tik`, `dut` contra `naiz`.

---

## 2 · Pretest de tres ítems al abrir cada unidad

**El hueco.** Nada obliga a intentar antes de leer la explicación.

**El dato.** El efecto de *pretesting*: intentar algo que aún no se ha
estudiado, fallar y recibir la respuesta correcta deja mejor memoria que
estudiar el material directamente. **d = 1,29 inmediato y d = 0,69 a las 24
horas** (*Journal of Cognition*, 2024; réplica de robustez en *Memory &
Cognition*, 2025).

La condición es innegociable: **tiene que haber feedback correctivo**, porque
el aprendiz no corrige su error solo. Eso ya lo hacemos.

**Qué habría que construir.** Tres preguntas del tema, antes de la ficha, con
la solución detrás. No puntúan para el SRS. La nota lo llama *la intervención
con mejor relación coste/beneficio de toda la revisión*, porque es contenido
que ya existe, reordenado.

---

## 3 · Realce del sufijo en la corrección

**El hueco.** Cuando alguien falla `Nik` por `Ni`, ve las dos frases enteras y
la diferencia es una letra perdida en medio.

**El dato.** Los morfemas de baja saliencia —el ergativo `-k`, la oposición
`-a`/`-ak`, la concordancia del auxiliar— **no se adquieren por exposición**
(N. Ellis, *Annual Review of Applied Linguistics*, 2012). Necesitan realce y
atención dirigida. El euskera los tiene a puñados.

**Qué habría que construir.** Al mostrar la corrección, comparar lo escrito con
la forma correcta y **marcar tipográficamente lo que cambia**. Es barato: ya
tenemos `respuestaMasCercana()` calculando la distancia, así que la información
de qué difiere está ahí.

---

## Y una métrica, si vamos a instrumentar algo

En el estudio independiente de Duolingo (*Language Learning & Technology*
28(1), 2024), **el tiempo semanal NO correlacionó con los resultados**. Sí lo
hicieron la **tasa de sesiones completadas** y la experiencia de uso.

Si medimos algo para la subvención, que sea **sesiones terminadas e ítems
resueltos**, no minutos. Los minutos son la métrica que peor predice
aprendizaje y la más fácil de inflar.

---

## Lo que la nota confirma de lo que ya tenemos

Por si sirve para la memoria de la subvención, cuatro decisiones nuestras salen
respaldadas: los dos aciertos a distancia creciente, que **solo puntúe la
primera respuesta de la sesión** (lo llama «correcto y poco habitual»), mostrar
el error junto a la forma correcta, y glosar todo el euskera de la gramática.

Y hay un argumento de originalidad que conviene no perder: **no existe
literatura sobre variantes dialectales opcionales en apps de idiomas**. Es
exactamente lo que hacemos con el bizkaiera, y no hay con qué compararlo.

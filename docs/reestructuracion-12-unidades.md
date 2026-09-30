# La unidad 10, partida en tres

Duda de Ric (30/09/2026): «me da la sensación de que es muy complejo el
aprendizaje de todo el pasado y todo el futuro, los conectores… es
demasiado para una sola unidad de cierre». Decidido: 12 unidades.

## El problema no era el tamaño

La unidad 10 estaba en la media del curso: 11 786 caracteres de fichas
(media 11 159), 67 palabras (media 53), 45 grupos (media 36). La unidad
más cargada era —y es— la 4, con 16 594 caracteres.

El problema era que **10.1 rompía el criterio del propio proyecto**. La
`propuesta-10-unidades.md` dice: «Un subnivel = una idea». El tema 10.1
tenía cinco fichas y cinco ideas: el pasado de *izan*, el de *ukan*, el
de *egon*, la distinción comí/he comido/comía, y los verbos de mirar
atrás.

Y el contraste que lo remata: **en presente, cada uno de esos tres
verbos tuvo un tema entero para él solo** —*izan* en 2.3, *ukan* en 4.4
y 4.5, *egon* en 5.1—. Aprender `nago` costaba un tema; aprender
`nengoen`, una ficha de 269 caracteres metida entre otras cuatro.

El segundo apelmazamiento estaba en 10.5, que juntaba tres sistemas sin
relación: la partícula `al`, los conectores y los indefinidos.

## Cómo queda

| unidad | temas |
|---|---|
| **10 · Atzo** *(el pasado)* | 10.1 pasado de izan · 10.2 pasado de ukan · 10.3 pasado de egon · 10.4 comí/he comido/comía · 10.5 cuándo pasó |
| **11 · Bihar** *(lo que viene, y comparar)* | 11.1 el futuro · 11.2 los tres tiempos · 11.3 comparar · 11.4 los adjetivos que más se comparan |
| **12 · Dena batera** *(cerrar el nivel)* | 12.1 la partícula al · 12.2 enlazar frases · 12.3 los indefinidos · 12.4 todo junto |

Cada verbo en pasado tiene ahora su tema, y **al final de cada uno una
tabla presente · pasado** con el pasado en negrita, más **cinco frases de
ejemplo**. La app le pone altavoz a cada forma sin hacer nada.

El futuro **no** aparece en esas fichas. Se probó y Ric lo descartó:
«verlo al explicar el pasado, de la nada, es extraño y añade ruido».
La tabla de los tres tiempos vive en **11.2**, al final del futuro, que
es cuando ya se ha visto todo. Allí se cuenta además que el futuro de
«tener» es *izango dut*, con el participio de *izan*: no hay *ukango*.

## Lo que costó, y lo que no

**Nadie pierde progreso.** Los 45 grupos conservan su id: el calendario
de repaso y la app de revisión van por id de grupo, no por unidad. Solo
cambian de `subnivel` y de fichero. Cuando se pasó de 12 a 10 unidades
sí se perdió todo, porque los ids cambiaron.

**La app no necesitó ni una línea.** Doce unidades es una lista más
larga; el motor de temas y tests ya estaba.

**Ejercicios nuevos: 9 grupos, 45 variantes.** Repartidos en los temas
que se quedaron flacos al partir, más los tests de las unidades 10 y 11,
que antes no existían. El tema 12.3 (indefinidos) se había quedado con
**cero** ejercicios: lo cazó `probar_test.js`, que comprueba que el test
de cada unidad reparta entre sus temas.

Reparto final de grupos por tema:

    u10  10.1:5  10.2:3  10.3:3  10.4:3  10.5:4  test:3   (21)
    u11  11.1:4  11.2:3  11.3:5  11.4:3  test:2           (17)
    u12  12.1:3  12.2:3  12.3:1  12.4:5  test:4           (16)

Siguen por debajo de la media del curso (6,1 grupos por tema). Es el
trabajo que queda: **12.3 es el más flaco**, con un solo grupo.

## De paso, ejercicios que estaban mal colocados

Al repartir aparecieron varios que no estaban donde tocaba y se han
recolocado: `u11-g03` (pasado de *izan*) vivía en el tema de comparar, y
tres grupos de comparativos (`u12-g02`, `u12-g03`, `u12-g07`) vivían en
el de los conectores. Ya estaban señalados con `explica`; ahora además
están en su sitio.

## Pendiente

- Subir el número de grupos por tema hacia la media, empezando por 12.3.
- Revisión nativa de las frases de ejemplo nuevas de las tablas.

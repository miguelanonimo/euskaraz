# Idea guardada: progreso de las lecciones, propuesta A («Relleno que avanza»)

Pendiente de implementar. Elegida por Miguel el 10/10/2026 de entre cuatro propuestas
(A relleno, B aro, C barra, D marcas por tema). Maqueta: https://claude.ai/artifact/Kp3pz5KoPNdmPmoFNerEf1

**Qué es.** En la lista de Lecciones, el fondo de cada tarjeta se va llenando de
izquierda a derecha con el color de la lección sobre su tono suave:

- Sin empezar: tono suave de la lección (ya con color, no «apagado»).
- En curso: relleno parcial con el color principal (a ~55 % de intensidad) y el
  porcentaje a la derecha, en el color fuerte de la lección.
- Completada: color pleno, con un tic blanco sobre el color fuerte.
- Sin negro: ni el anillo ni el tic son negros (hoy el anillo es negro).

**Qué se pidió ver.** Probar la A con las 12 completadas: queda un arco de color del rojo
al rosa y funciona bien; el tic blanco sobre las tarjetas más claras (amarillo de la 3,
verde de la 4) se ve flojo — se podría poner el tic en el color fuerte de su lección.

**Ya aplicado (v73).** Solo el punto de partida: el fondo de las lecciones sin empezar es
el tono suave de cada lección, no el 10 % del color de antes. Se mezcla del suave al color
pleno según el avance (`js/app.js`, lista de Lecciones).

**Pendiente.** El relleno de izquierda a derecha (hoy es un fundido de todo el fondo), el
porcentaje en curso, el tic blanco en vez del anillo negro y la lección en curso resaltada.

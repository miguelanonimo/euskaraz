# Propuestas para la interfaz

> **Pendiente:** la 3, los colores de las unidades 10, 11 y 12 (añadida el
> 10/10/2026, abajo del todo).
>
> **Estado (03/10/2026, 15:00): Miguel implementó las dos primeras.** `2636cdf` «El
> dialecto pasa de interruptor a selector de euskalki» y `909be93` «Repasar
> una pregunta ya contestada desde los pasos de arriba». El análisis de
> abajo se deja como registro de por qué se hicieron así, no como pendiente.
>
> La segunda se resolvió por una vía mejor que la que se proponía: en vez
> de un gesto, **tocando un paso de la barra de arriba** se abre la
> pregunta con su resultado y el botón de la explicación (`revisarPregunta()`,
> con `estado.historial`). El gesto llegó después y solo para las fichas.

Dos cosas que salieron trabajando con Ric el 2 y el 3 de octubre de 2026.
Las dos son de `js/app.js`, el carril de Miguel. Aquí queda el análisis
hecho para que no haya que repetirlo.

---

## 1. El dialecto debería ser un selector, no un interruptor

**Por qué ahora.** Ric (03/10/2026): *«estamos haciendo ahora solo con
bizkaiera, pero la intención es que en el futuro podamos añadir más
euskalkiak para que los estudiantes puedan seleccionar las formas propias
de su zona»*.

**Lo que ya está listo.** El dato lo soporta tal cual: `registro` es texto
libre y ya convive con dos valores. Hoy hay 21 fichas y 12 variantes de
vocabulario marcadas `bizkaiera`. Y `etiquetaRegistro()` (`app.js`) ya
contempla `gipuzkera`:

```js
return { bizkaiera: 'Biz', gipuzkera: 'Gip' }[r] || r;
```

**Lo que no.** `incluirDialectales` es un booleano: pregunta *«¿con
dialecto o sin él?»* cuando tendría que preguntar *«¿cuál?»*. Se nota en
cuatro sitios:

| dónde | qué da por hecho |
|---|---|
| `gramaticaVisible()` | filtra con `g.registro !== 'bizkaiera'`, literal |
| `formasDe()` | con el booleano activo mete **todas** las variantes, sean del dialecto que sean |
| el segmentado de Tu cuenta | dos opciones fijas, `Batua` / `Bizkaiera` |
| `verificar.py` (305, 315) | exige una ficha `registro: "bizkaiera"` por unidad |

**La forma.** Pasar de `incluirDialectales` (sí/no) a `euskalkiActivo`
(`null` / `'bizkaiera'` / `'gipuzkera'`…), y que los dos filtros comparen
contra esa variante en vez de contra una constante:

- `gramaticaVisible()`: pasa la ficha si no tiene `registro` o si coincide
  con el activo.
- `formasDe()`: incluye solo las variantes cuyo `registro` coincida.
- El segmentado: las opciones salen de los `registro` que existan en el
  curso, no escritas a mano.

**Dos avisos:**

- **Es mucho más barato hacerlo ahora.** Con un solo dialecto es un
  refactor contenido y no hay datos que migrar. Con dos conjuntos de
  contenido ya montados, además del código hay que decidir qué pasa con lo
  que cada usuario tenía puesto.
- **Hay migración, aunque sea mínima.** En `localStorage` ya hay usuarios
  con `incluirDialectales` a `'1'` o `'0'`. Al leer el ajuste nuevo, un
  `'1'` viejo tiene que convertirse en `'bizkaiera'`, no quedarse en nada.

---

## 2. Poder volver atrás, dentro de un test, a lo ya contestado

**Lo que pidió Ric** (02/10/2026): *«cuando estás en un test, y vas
avanzando, pudieras hacer un swipe para desplazarte por los ejercicios que
has hecho (sin poder corregirlos) para poder repasar después lo que
fallaste haciendo click en el botón de lección que creamos»*.

**Lo bueno.** El botón del libro sobrevivió al rediseño (`temaDe()`,
`fichasDe()`, `abrirHoja()` y el puntero `__explica`), así que funcionaría
tal cual sobre el ejercicio que se esté mirando.

**Y lo que era mi mayor duda, comprobado: no hay choque de gestos.** Las
fichas de «ordena las palabras» **se colocan tocando, no arrastrando** —
en `pintarOrden()` es `bank.addEventListener('click', …)`. Un deslizamiento
horizontal no se pelea con nada.

**Lo que falta.** La app **no guarda lo que respondiste**. Lleva
`estado.ejercicios`, `estado.indice` y `estado.falladas` (solo las
falladas). Para volver atrás hay que registrar, por ejercicio contestado,
qué se puso y si estaba bien.

**Recomendación sobre cómo pintarlo.** No reutilizar el ejercicio en vivo
bloqueado: son siete tipos, cada uno con sus manejadores, y es justo donde
se cuela que puedas volver a contestar. Mejor una **vista de repaso**
aparte y compacta: el enunciado, lo que pusiste marcado en verde o rojo, la
respuesta buena y el botón del libro. Más simple, más segura, y es
literalmente lo que se pide: repasar sin corregir.

---

## 3. Apuntado aparte

El «100%» que se sale de su tarjeta en la pantalla de resultado está
analizado y medido en `docs/ideas-ric.md`, con las cuatro salidas posibles
y la recomendada. También sin aplicar.


---

## 3. Las unidades 10, 11 y 12 salen todas del mismo color

**Pendiente.** Añadido el 10/10/2026.

**Qué vio Ric.** En la pantalla de Hoy, con la pila de lecciones abierta por
la 9: *«la unidad 10 y la 11 salen con el mismo tono, cuando todas las
anteriores van variando»*. Lo mandó con una captura.

**Por qué pasa, y no es un fallo.** Está documentado en el propio código
(`js/app.js`, el comentario encima de `familia()`): `FAMILIAS` tiene **10
colores para 12 lecciones**, y `familia()` recorta con
`Math.min(numero - 1, FAMILIAS.length - 1)`. Resultado: la 10, la 11 y la
12 reciben las tres el último color de la lista, el rosa
`255,180,237`. El comentario ya dice que es provisional y que la salida es
«ampliar FAMILIAS y quitar el Math.min».

Esto se decidió a propósito, y bien: la alternativa de entonces era reciclar
por módulo el rojo de la 1 y el naranja de la 2, lo que habría dado a la 10 y
la 11 el color de lecciones que ya existen. Compartir un color nuevo entre
las tres últimas confunde menos. Pero ahora que Ric estudia por la 9, las
tres últimas le quedan a la vista y el patrón se nota.

**Lo que falta,** entonces, no es código sino **tres colores**: los de la 10,
la 11 y la 12, en el mismo formato que los otros diez —terna de
`base / soft / strong` en RGB sin paréntesis—. La escala actual va del rojo al
rosa pasando por amarillo, verde, azul y morado, así que las tres nuevas
tendrían que seguir después del rosa sin volver al rojo del principio.

Con los colores en la mano el cambio es de dos líneas: añadirlos a
`FAMILIAS` y quitar el `Math.min` de `familia()`.

**Nota.** Los campos `color` de `data/unidades-v2/*.json` (la 10 dice
«negro», la 11 «azul») **no son los que se usan** en la interfaz nueva: son
de la versión anterior y hoy no los lee nadie. Conviene saberlo para no
buscar ahí el arreglo.

# Palabra del día («Gaurko hitza») — lógica anotada, sin desarrollar

Pedido por Miguel el 11/10/2026 tras la idea de una betatester y los comentarios de Ric (ver punto 5 de
`docs/feedback-betatesters.md`). **Solo lógica y diseño: no hay nada implementado.** Propuestas de diseño en el
artefacto «Palabra del día».

## Qué es

Una tarjeta que ofrece una palabra cada día. Al tocarla se **gira** y enseña su traducción y, si la hay, información
sobre su uso o su construcción (de qué piezas está hecha). La tarjeta ocupa **toda la altura** de la pantalla.
Cada palabra que se va viendo **se añade al diccionario**, y hay un sitio donde volver a verlas.

## Reglas de la lógica (decididas por Miguel)

1. **Tarjeta a pantalla completa**, con dos caras: delante la palabra (en euskera); detrás, la traducción + uso/construcción.
2. **Girar = tocarla.** Una vez girada se puede volver a girar (la cara de la palabra sigue disponible).
3. **Se guarda al verla.** La palabra entra en el diccionario como «palabra del día» cuando se ve; se propone que cuente
   como vista al **girar** la tarjeta (ver la palabra sin girarla no basta).
4. **Hay un sitio para volver a verla.** Cada palabra del día ya vista se puede reabrir (mismo formato de tarjeta).
5. **Sin puntos.** No suma puntos, ni siquiera racha (a decidir si cuenta como actividad del día).

## Decisiones que quedan abiertas (con la recomendación)

| Tema | Opciones | Recomendación |
|---|---|---|
| ¿Es la misma palabra para todos? | La misma para todos / según el punto del curso | La misma para todos, elegida por la fecha (sin servidor) |
| De dónde salen | Vocabulario del curso / lista aparte curada (~700 palabras o frases) / mezcla | Empezar con el vocabulario del curso; la lista curada como evolución. Ric propone ~700 con algunas **fijadas a fechas** (Navidad, carnavales, Semana Grande, último lunes de octubre) |
| Qué pasa si aún no has llegado a esa palabra | Se muestra igual (es un descubrimiento) / solo palabras que conoces | Se muestra igual, con la construcción como pista (es la gracia de la dinámica original) |
| Cuándo se ve la respuesta | En el momento (girar) / bloqueada unas horas | En el momento por defecto; la espera de ~4 h es idea de Ric, como modo opcional |
| Compartir fuera de la app | Imagen para WhatsApp/Instagram / nada | Nada de momento: Ric prefiere que viva dentro de la app |
| Aviso | Recordatorio de Web Push con la palabra / sin aviso | Se puede aprovechar el recordatorio ya construido (apagado hasta poner la clave VAPID) |

## Datos que haría falta

- Una lista de palabras con: `eu`, `es`, `uso` (nota breve), `piezas` (construcción: p. ej. `nora` + `bide`), `audio`, y
  opcionalmente `fecha` (día del año fijo) y `nivel`.
- En el progreso de cada persona: qué días se vio la palabra y si se giró (`palabrasDia: { <día>: { girada: true } }`).
- Reutilizar el audio ya existente cuando la palabra esté en el vocabulario; generar el resto con la voz habitual.

## Lógica de selección (propuesta)

- Palabra de hoy = elemento `hash(día) mod N` de la lista, salvo que haya una **palabra fijada a esa fecha**.
- Sin repetir en las últimas N semanas; si una persona se salta días, **no se acumulan**: solo hay la palabra de hoy
  y las que ya vio (el archivo es lo visto, no lo perdido).

## Dónde volver a verla (a decidir según el diseño)

- En el **Diccionario**, con un filtro «Palabras del día» (lista con la fecha de cada una).
- En una **pila de tarjetas** por días, al deslizar hacia abajo desde la de hoy.
- En un **calendario** de días con palabra, dentro de Hoy o de Ajustes.

## Ejemplo de contenido

*Norabide*: dirección (de un camino). Construcción: *nora* («a dónde») + *bide* («camino»). Se ve en los carteles de
las carreteras y de Bilbao. (Contenido ilustrativo, por validar según `GRAMATIKA.md` antes de usarlo en la app.)

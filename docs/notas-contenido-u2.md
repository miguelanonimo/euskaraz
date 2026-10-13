# Notas de contenido — Unidad 2 (Ni eta zu)

Registro de cambios de la Fase 3 (contenido), para poder auditar el criterio
sin saber euskera. Ver metodología en `docs/brief.md` sección 5.

## Qué se revisó

Se contrastaron con fuentes externas las tres afirmaciones dialectales de
"Cómo suena esto en Bizkaia":

- **Formas reforzadas (neu, zeu, geu) como uso corriente, no solo
  enfático.** Confirmado por la propia gramática de Euskaltzaindia
  ([13.4 — Pertsona izenordain indartuak](https://euskaltzaindia.eus/index.php?Itemid=&kodea=1304&lang=eu&option=com_liburuak&task=gramatika)):
  "mendebaleko euskaldunek ekialdekoek baino joera nabarmenagoa dute forma
  indartuak erabiltzeko" (los hablantes del occidente tienen una tendencia
  más marcada a usar las formas reforzadas que los del oriente).
- **Sufijo «-gaz» frente a «-rekin».** Confirmado por
  [ahotsak.eus](https://ahotsak.eus/euskalkiak/mendebalekoa-bizkaiera/),
  que lo describe como el sufijo comitativo característico del euskera
  occidental (-gaz en singular, -kaz en plural).
- **«Hika» vivo en Bizkaia.** No se encontró una fuente que precise con
  qué frecuencia se usa hoy (la nota original decía "se usa a diario").
  Es coherente con lo que se sabe en general sobre la vitalidad del hika
  en zonas occidentales, pero al no poder respaldar la frecuencia
  concreta, se suavizó la nota: de "se usa a diario entre amigos y en
  familia" a "sigue vivo... no tenemos una fuente que precise con qué
  frecuencia exacta, tómalo como orientación, no como dato cerrado".

## Por qué NO se aplicó el esquema `registro`/`variantes` de vocabulario

A diferencia de la Unidad 1 (kaixo/aupa, zer moduz/zelan zagoz), aquí no
hay parejas léxicas batua/bizkaiera — palabras distintas para lo mismo.
Lo dialectal de esta unidad es:

- **Frecuencia de uso** (neu en vez de ni: es la misma palabra, existe en
  batua también, solo cambia cuánto se usa según el dialecto).
- **Morfología** (el sufijo -gaz sobre nirekin/zurekin: ni siquiera son
  entradas de `vocabulario`, solo aparecen en ejemplos de gramática).

Forzar esto dentro de `variantes` habría representado mal el fenómeno
(sugeriría "palabra distinta" donde en realidad es "misma palabra, más o
menos frecuente" o "mismo lema, sufijo distinto"). Se dejó como está: bien
explicado en prosa dentro de "Cómo suena esto en Bizkaia", sin tocar el
array de `vocabulario`.

## Qué NO se tocó

- El vocabulario (`vocabulario`) no cambió: los pronombres, posesivos y
  formas reforzadas ya estaban completos y correctos.
- Los ejercicios (`ejercicios`) no se tocaron.
- El dataset gernikés (`unidades-gernikes/02-izenordainak.json`) no se
  tocó — su contenido está verificado por una persona local, con su
  propio criterio, no por las fuentes externas usadas aquí.

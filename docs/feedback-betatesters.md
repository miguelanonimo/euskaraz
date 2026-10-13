# Feedback de betatesters — correcciones posibles

Documento vivo. Cada punto es una cosa que han contado los betatesters (o
Miguel al probar), con mi lectura de qué está pasando y qué se podría hacer.
Se va completando a medida que llega feedback. Estado de cada punto:
**resuelto**, **propuesto** (hay idea, falta decidir) o **a pensar**.

Empezado el 10/10/2026.

---

## 1. Los audios suenan entrecortados la primera vez — **resuelto** (v77)

**Qué cuentan.** La primera vez que se oye una palabra, el audio sale a
medias («empieza a mitad») y hay que tocar varias veces. Lo notó Miguel en
escritorio y lo ha repetido un betatester.

**Qué pasaba.** Todo el audio iba por un único `<audio>`: se le ponía el mp3 y
se llamaba a `play()` al instante. La primera vez de cada palabra el
navegador empezaba a sonar mientras aún descargaba y decodificaba. Además
Supabase Storage sirve los mp3 con `cache-control: no-cache`, es decir, el
navegador revalida con el servidor cada vez que el `<audio>` pide un
fichero, y el precalentado de caché que ya había (`fetch` con `force-cache`)
no lo usa el `<audio>`. A partir de la segunda vez el fichero ya estaba a
mano y por eso «luego sí suena».

**Qué se ha hecho.** El mp3 se descarga y se decodifica entero antes de sonar
(Web Audio) y queda guardado ya decodificado en memoria (hasta 120 audios).
Al abrir una unidad se precargan en segundo plano, así que lo normal es que
suene al instante y siempre desde el principio. Un margen de 60 ms antes de
arrancar evita que el altavoz o el auricular Bluetooth se coman el comienzo
al despertar. Si un aparato no soporta Web Audio, se cae al `<audio>` de
siempre. El contexto de audio se despierta con el primer toque (iOS no deja
antes).

**Qué mirar al probar.** Primera pulsación de una palabra recién abierta,
primera pulsación tras un rato sin sonido (Bluetooth) y el audio que salta
solo al entrar en «Escucha y elige».

**Corrección del 11/10/2026 (v77).** La solución de la v65 (decodificar con Web Audio) hizo
que en el iPhone dejara de oírse todo: Web Audio se silencia con el interruptor de silencio y
con las restricciones de Safari, y un `<audio>` normal no. Se ha vuelto al `<audio>` de
siempre y se ha mantenido lo bueno: al abrir una unidad cada mp3 se descarga entero a un
Blob en memoria, y se reproduce desde ahí, sin esperar red y desde el principio. Si el mp3
todavía no está descargado, se usa la URL directa, como antes. Ver el punto 13.

---

## 2. Orden de los ejercicios: primero repasar lo leído, luego los audios — **propuesto**

**Qué cuentan.** «Cuando aprendo prefiero ver primero los ejercicios de rever
las palabras que he leído antes de los audios, pero esto es personal.»

**Cómo lo leo.** En una práctica de tema, el orden de las preguntas es
aleatorio (`barajar`), y las preguntas de escuchar («Escucha y elige»,
«Escucha y tradúcelo»), que se cuelan en cada sesión, pueden salir las
primeras. Lo que pide es empezar por los ejercicios con texto a la vista
(emparejar, elegir, ordenar), que repasan lo que acaba de leer en la ficha,
y dejar los de oído para después, cuando ya ha reforzado las palabras.

**Idea.** Mantener el orden aleatorio entre los ejercicios de texto y colocar
las preguntas de escuchar en la segunda mitad (o al final) de la sesión. Es
un cambio pequeño en `empezarPractica()` (`js/app.js`). No hace falta un
ajuste de usuario: es lo pedagógicamente natural (leer → recordar → oír).
Queda por decidir si va solo al final o repartido en la segunda mitad.

---

## 3. «Escucha y tradúcelo»: escriben lo que oyen en vez de la traducción — **a pensar** (Ric no cambiaría el ejercicio)

**Qué cuentan.** Les ha pasado a 3 personas: al oír el audio escriben la
palabra en euskera (lo que han escuchado) en vez de su traducción al
castellano. Ejemplo real: oyen «ikusi arte» y escriben «ikusi arte»; la app
responde «No exactamente!», «Dijiste: ~~ikusi arte~~», «Significa: hasta
luego».

**Cómo lo leo.** No es un fallo de ellas, es una confusión del ejercicio: con
un audio y un campo de texto, lo natural es transcribir (dictado). El
enunciado «Escucha y tradúcelo» no basta para romper ese reflejo, y el
feedback las castiga como si hubieran dicho un disparate, cuando en realidad
han oído y escrito bien.

**Ideas (sin decidir).**
- Detectar que lo escrito coincide con la palabra en euskera y responder con
  un mensaje específico, sin marcarlo como error grave: «Eso es lo que has
  oído. Ahora escribe qué significa en castellano.» y dejar reintentar una
  vez (que no cuente como fallo).
- Poner la pista del idioma en el campo: marcador «Escribe en castellano…» y
  quizá una banderita o etiqueta «ES».
- Reforzar el enunciado: «Escucha y escribe en castellano qué significa».
- Cambiar el tipo de ejercicio por opción múltiple de traducciones (más
  fácil, menos ambiguo), dejando la escritura para el repaso avanzado.

Recomendación para empezar: la primera (mensaje específico sin penalizar) más
la pista en el campo; es barato y arregla el momento de frustración sin
cambiar el ejercicio.

**Respuesta de Ric (11/10/2026).** No cambiaría por opción múltiple (que ya hay): escribir es lo que más fija lo aprendido. Le
pasó a él varias veces, es frustrante pero a la segunda ya se tiene en cuenta; lo atribuye a la
dinámica de «jugar» (la gamificación nos automatiza y no leemos la interfaz), no a un fallo del
ejercicio. Propone dos cosas baratas: un **tooltip rojo «Traduce!»** al enfocar el campo de
texto, o un **paso de confirmación** al pulsar Comprobar («¿lo has traducido al castellano?»,
con opción de volver). Dice que no le preocupa mucho. *Queda descartada la opción de pasar a
opción múltiple; pendiente decidir entre el tooltip y la confirmación (o ninguno).*

---

## 4. «Aupa» se echa de menos en la lección y luego aparece en el examen — **resuelto** (v66 + ficha de Ric)

**Qué cuentan.** Una betatester (Bilbao) echó de menos «aupa» en la lección
inicial y lo vio después en un ejercicio («Empareja cada saludo con su
momento», tema 1.2). Dice que puede ser que leyera deprisa.

**Qué pasa de verdad.** No es que leyera deprisa: es un fallo de la app, y
es el primero de los dos que se sospechaban. «Aupa» es una **forma
bizkaina** del 1.1: está en el vocabulario como variante de «kaixo» y en la
ficha «Cómo suena esto en Bizkaia», y ambas **solo se ven si en Ajustes se
elige Bizkaiera** (por defecto está en Batua). Pero los ejercicios no
distinguen: dos ejercicios de la unidad 1 (`u1-g01` en el 1.1 y `u1-g04` en
el 1.2) piden «aupa» como una palabra más, **con Batua puesto**, donde nunca
se ha explicado. Con Bizkaiera puesto, sí aparece explicada (vocabulario del
1.1) y el ejercicio es correcto.

Otras dos preguntas de la unidad 1 y 3 («En Bizkaia oyes “Zelan zagoz?”…»)
sí nombran el dialecto en el enunciado, así que se entienden con cualquier
ajuste y se dejan.

**Qué se ha hecho.** Un ejercicio ya puede llevar `dial: "bizkaiera"`: solo
sale si esa persona estudia ese euskalki (`elegirVariante` en `js/app.js`);
con Batua se saltan. Se han marcado los dos de «aupa» (`u1-g01`, variante 5,
y `u1-g04`, variante 4). El grupo conserva sus otras variantes.

**Pendiente de decidir y revisar.**
- Un barrido automático saca ~25 ejercicios más, en las unidades 4, 5, 6, 8,
  9 y 12, que usan palabras que solo se explican en una ficha de dialecto
  (p. ej. «aitite», «amama», «ze ordu da», «aratusteak», «bilbora noa»,
  «zegaitik», «ni be bai»). No se han tocado: hay que mirar uno a uno cuáles
  son bizkainismos sin contexto (se marcan igual) y cuáles son batua con
  una palabra que el barrido ha confundido.
- **Ajuste por defecto:** la app está pensada para gente de Bilbao y arranca
  en Batua. Si la mayoría de betatesters quiere ver «aupa» desde el primer
  día, quizá el ajuste por defecto debería ser Bizkaiera, o preguntarlo al
  entrar. Decisión de producto.
- **Ajuste que no viaja:** el euskalki elegido se guarda solo en ese aparato
  (`localStorage`), no en la cuenta: quien entra desde otro móvil vuelve a
  Batua sin avisar. Convendría guardarlo con el progreso.
- No puedo saber qué tenía puesto esa persona; si me confirma que en
  Ajustes tenía Batua, queda explicado.

**Respuesta de Ric (11/10/2026).** Confirma que era una ficha de la variante bizkaina del 1.1 que había desaparecido (o se
fusionó con la del 1.4, la de los dialectos). Ya la ha recuperado: hay una ficha condicional
(«¡Aupa!, el saludo de la calle») que solo sale si se tiene Bizkaiera seleccionado en el 1.1.
Eso encaja con lo que hicimos: los ejercicios con formas bizkainas (`dial: "bizkaiera"`) solo
salen si se estudia ese euskalki.

---

## 5. Idea: «Gaurko hitza» (la palabra del día) — **idea, sin decidir** (Ric: dentro de la app)

**Qué cuentan.** Una betatester, que lleva tiempo estudiando, propone una
dinámica que a ella le motivó mucho. Al llegar al País Vasco, un compañero de
baile le preguntaba cada jueves la *gaurko hitza*; a ella le pareció poco y en
su trabajo montaron un grupo de WhatsApp (una compañera con el C2 puso cinco
palabras a la semana): cada día una palabra suelta vista en el autobús o en
las noticias, **sin traducción**, y había que adivinar qué significaba, a
veces con una pista. Lo bueno, dice, era pasarse el día dándole vueltas,
analizar palabras compuestas o usar el sentido común, y luego fijarse en los
carteles. Ejemplo: *norabide guztiak*, con la pista «grupo de música»
(One Direction); salió cuando alguien recordó que *norabide* sale en los
carteles de Bilbao para indicar direcciones. Propone un modo «gaurko hitza»
con una palabra al azar y varias opciones de significado, con puntos o sin
ellos (sabe que la app no tiene sistema de puntos).

**Cómo lo leo.** Lo valioso no son las opciones: es la **adivinanza con
tiempo** (pensarlo todo el día) y el **vínculo con la calle** (ver la palabra
en un cartel y reconocerla). Esas dos cosas son lo que enganchaba, y encajan
con lo que ya tiene la app: Hoy, el recordatorio diario y el diccionario con
audio.

**Cómo se podría hacer (de menos a más).**
1. **Versión barata.** Una tarjeta «Gaurko hitza» en Hoy con una palabra al
   día, la misma para todos (se elige por la fecha, sin servidor), sacada del
   vocabulario del curso. Se muestra la palabra con su audio, la persona
   toca para adivinar entre 3 opciones y después se revela el significado
   con su nota y, si es compuesta, cómo se parte. Sin puntos; solo cuenta
   para la racha si se quiere.
2. **Con el recordatorio.** El aviso (ya construido, apagado hasta poner la
   clave VAPID) podría llevar la palabra del día como gancho en vez de un
   texto genérico: «Gaurko hitza: norabide. ¿Qué crees que significa?».
3. **La versión de verdad: palabras de la calle.** Una lista aparte, curada,
   de las palabras que se ven en carteles, autobús y tiendas (*irteera*,
   *sarrera*, *norabide*, *ireki*, *itxi*, *kaixo*…), cada una con una
   pista y con el «por qué»: de qué piezas se forma. Esa lista sale de
   alguien que viva allí, no del curso; sería contenido nuevo (Ric o las
   betatesters).
4. **Compartirla, con una tarjeta de diseño propio.** Un botón para mandar la
   palabra por WhatsApp, que es donde nació, pero no como texto suelto sino
   como una **imagen con diseño** (como cuando se comparte algo de Spotify):
   la app la dibuja en el propio móvil con un `canvas`, con las tipografías,
   los colores de la unidad y el lauburu, y la entrega con el menú nativo de
   compartir (`navigator.share` con archivo), que abre WhatsApp o Instagram con
   la imagen ya adjunta. En escritorio se descarga o se copia. No hace falta
   servidor. Dos tarjetas: **«Adivina»** (la palabra grande, sin traducción y con
   la pista; es la que engancha, como en el grupo original) y **«Solución»**
   (con el significado y cómo se parte si es compuesta). Formato vertical
   1080×1920 para historias y chat, y cuadrado 1080×1080; abajo,
   «euskaraz.vercel.app». Serviría igual para compartir logros (una racha, una
   unidad). Límites: hay que esperar a que carguen las tipografías antes de
   dibujar, y la imagen es un archivo, no una vista previa de enlace (para eso
   haría falta una función en Vercel; no se recomienda de entrada). Siguiente
   paso: diseñar las dos tarjetas en Claude Design y que la app las reproduzca.

**Qué cuesta.** La 1 y la 2 son pequeñas y reutilizan lo que hay. La 3 es
trabajo de contenido, no de código. La 4 es una línea. No requiere servidor
ni puntos.

**Recomendación.** Empezar por la 1 con palabras del propio curso para ver si
engancha, y dejar la 3 como evolución si la gente la usa. Antes, conviene
confirmar con más betatesters si les motivaría una palabra al día.

**Respuesta de Ric (11/10/2026).** Le gusta la idea: hay muchas palabras interesantes, y cosas que se entienden con raíces y
sufijos que se aprenden en la app. **La mantendría dentro de la app**: conectarla con
Instagram o WhatsApp le parece un jaleo innecesario (por tanto, la tarjeta compartible de la
propuesta 4 queda en duda). Sin puntos; dos pantallas (la palabra y, si se quiere, la
explicación en otra tarjeta). Preguntas abiertas que plantea: ¿es la misma palabra para
todos, vaya por donde vaya del curso y sea la fecha que sea? Una opción: un listado de unas
700 palabras o frases y asignar algunas a fechas concretas (Navidad, carnavales, Semana
Grande, último lunes de octubre). Otra: que veas la palabra y no puedas ver la respuesta hasta
unas 4 horas después de abrirla, para dejar espacio a la reflexión.

---

## 6. «Como en pizza» no es una referencia fiable para «ts» y «tz» — **resuelto** (v78)

**Qué cuentan.** Una betatester comenta, con humor, que «pizza» es seguramente
la palabra con más formas de pronunciarse en castellano, y que lo debatieron
el viernes pasado cinco personas (una de Vigo, dos bizkainas…). Lo dice
viendo la ficha de pronunciación del 1.1/1.4, donde pone «**ts y tz** — "ts",
como en *pizza*».

**Cómo lo leo.** Tiene razón: *pizza* se dice «pitsa» (la pronunciación
italiana, la que queremos), pero también «pisa», «pidza» o «piza» (con zeta
castellana). Justo la palabra que se usa de ejemplo para el sonido «ts» es
una de las que más cambia según el hablante, así que no ancla el sonido; en
muchos casos confunde. El sonido «ts» es difícil de nombrar en castellano
precisamente porque no existe como letra.

**Propuesta.** Cambiar la referencia por algo más estable y dar además una
pista física:
- *tsunami* (en castellano se dice casi siempre «tsunami» con el golpe «ts»),
  o el «tz» de *Mozart*;
- y la pista: «la t y la s pegadas, en un solo golpe de lengua, sin soltar la
  t: como el final de *gats* en inglés».

Texto posible: «**ts** y **tz** — la t y la s juntas, en un solo golpe: como
en *tsunami*, o como el final del inglés *cats*.»

**Antes de cambiarlo.** Lo ideal es que lo valide Ric o una persona nativa;
si se acepta, es una línea del JSON (`data/unidades-v2/01-kaixo.json`, ficha
de pronunciación, tema 1.4). El resto de la lista de la ficha («z» como la
*s* inglesa de *see*, «x» como *show*, «tx» como *chico*) la ha leído sin
queja.

**Respuesta de Ric (11/10/2026).** El problema es de quien pronuncia mal «pizza», no de la palabra, pero hay que buscar otra
referencia mejor. «Tsunami» tal vez, pero mucha gente dice «sunami». Le gusta más la pista de
**«cats»** (y apunta que en el texto aparecía «gats», que era una errata mía): el inglés *cats*
es más inequívoco.
**Aplicado (v78):** la ficha de pronunciación dice ahora «ts y tz — «ts»: la t y la s juntas,
en un solo golpe, como el final del inglés *cats*», y la opción incorrecta del ejercicio
equivalente pasa de «como en pizza» a «como el final de cats». Tsunami queda descartada.

---

## 7. «Escribe la frase»: no se entiende que hay que traducir — **resuelto** (Ric)

**Qué cuentan.** «Con esta instrucción pasé tiempo, no me di cuenta de que hay
que traducir la frase. Me lo dijo Marta.» (captura: tema 1.2, ejercicio de
escribir con la frase en castellano «Regular, gracias.»).

**Cómo lo leo.** En ese ejercicio el título grande es la frase en castellano
y la única pista de qué hay que hacer está en la etiqueta pequeña, en
mayúsculas y gris: «ESCRIBE LA FRASE. LAS FICHAS DE ABAJO SON SOLO AYUDA.».
No dice **en qué idioma** hay que escribir ni que es una traducción. Quien
lee el título grande y ve fichas en euskera no sabe si hay que copiar,
ordenar o traducir. Es el mismo problema de fondo que el punto 3 (escriben lo
que oyen en vez de traducir): **no queda claro hacia qué idioma se va**.
Ya han coincidido tres o cuatro personas, así que no es casual.

**Ideas.**
- Poner la dirección en el propio título del ejercicio: «Escríbelo en
  euskera:» encima de «Regular, gracias.», o una etiqueta «ES → EU».
- Cambiar el enunciado: «Traduce al euskera. Las fichas de abajo son solo
  ayuda.» (la etiqueta ya existe, solo cambia el texto; se puede aplicar a
  todos los ejercicios de escribir y de ordenar).
- En los ejercicios de escuchar (punto 3), el equivalente: «Escribe en
  castellano qué significa».
- Poner el campo de escribir con un marcador «en euskera…» / «en
  castellano…» según el caso.

**Recomendación.** Tratar los puntos 3 y 7 juntos: una regla común de
enunciados que diga siempre «de qué idioma a qué idioma». Es un cambio de
texto en el `instruccion` de las variantes de los tipos escribir, ordenar,
traducir y escuchar, sin tocar el código.

**Respuesta de Ric (11/10/2026).** Corregido por él. Cambia el enunciado de los ejercicios de escribir, sobre todo porque puede
ser el primer momento en que se ve este tipo de ejercicio: «Escribe la frase en euskera. Entre
las palabras de abajo están todas las necesarias.» Ya está en el curso (grupos de escribir y de
ordenar de todas las unidades).

---

## 8. «Kaixo» y «agur» son los dos saludos — **resuelto** (Ric)

**Qué cuentan.** Un comentario con risas: en una pregunta de elegir, tanto
«kaixo» como «agur» son saludos.

**Dónde está.** En el 1.1, `u1-g02`, variante 4: «No sabes qué hora es y
quieres saludar sin equivocarte. ¿Qué dices?» con las opciones *Egun on,
Kaixo, Gabon, Agur*; la correcta es *Kaixo*. El problema: en castellano
«saludar» incluye a veces el «adiós», y *agur* se oye también al encontrarse
y en las zonas en que se usa para los dos. Quien responde *Agur* no se
equivoca del todo, y el enunciado no deja claro que es solo al llegar.

**Propuesta.** Una de dos:
- Cambiar el enunciado: «…quieres **saludar al llegar** sin equivocarte».
- O cambiar el distractor «Agur» por otro que sea claramente otra cosa
  (p. ej. *Barkatu* o *Eskerrik asko*).
Lo más limpio es hacer las dos.

**Revisar también.** Otras preguntas de esa unidad que mezclan saludos y
despedidas como si fueran categorías cerradas (`u1-g09` «¿qué despedida
oirás con más frecuencia?» tiene *Gero arte* y *Bihar arte*, que son ambas
despedidas válidas). Para que no pase de nuevo, una regla para quien escriba
contenido: en una pregunta con una sola respuesta correcta, ningún
distractor debe poder defenderse con la lectura habitual del enunciado.

**Respuesta de Ric (11/10/2026).** Hecho: ha cambiado el distractor «Agur» por «Ikusi arte», que es de la unidad. Cuenta que
su compañera Dei no conoce a nadie que salude al llegar con *agur*; él no confunde saludar
con despedirse, pero entiende que en algunos sitios se haga. Con esto el enunciado y la opción
correcta («Kaixo») ya no tienen ambigüedad.

---

## 9. «Esto no me lo explicaron antes»: preguntas de un tema que se explica en otro — **decisión previa + parte arreglada** (v66); Ric: caso por caso

**Qué cuentan.** Dos mensajes que dicen lo mismo: «esto no me lo explicaron
antes» (captura: tema 2.1, «“Nigaz” es la forma de Bizkaia para… nirekin
(conmigo)») y «algunas preguntas de un tema están asociadas a un tema
anterior: el concepto se explica en el 2.2 pero la pregunta sale en los
ejercicios del 2.1; me pasó 2 o 3 veces». Añade, en broma, que igual lo
queríamos para el «challenge».

**Qué hay detrás.** Son dos cosas distintas.

1. **Un euskalki sin avisar (arreglado).** «Nigaz» es la forma bizkaina de
   «nirekin». Con Batua puesto no se explica en ningún sitio y, aun así, una
   pregunta del 2.1 y un emparejado del test final la pedían. Es el mismo fallo
   que «aupa» (punto 4). Esas dos variantes (`u2-g09`, variante 5, y
   `u2-g12`, variante 5) llevan ahora `dial: "bizkaiera"` y solo salen si se
   estudia bizkaiera.

2. **Preguntas con palabras de un tema posterior (decisión de diseño de Ric,
   a discutir).** Es la queja general. El curso se diseñó así a propósito: un
   tema puede usar en sus ejercicios palabras que el vocabulario cataloga más
   adelante (por ejemplo, los posesivos del 2.2 se practican con *herria*,
   *laguna* o *izena*, que son del 2.4), porque sería imposible enseñar
   posesivos sin nombres, y el enunciado en castellano las traduce.
   Está recogido en `CLAUDE.md` («el orden del vocabulario no se vigila»);
   sólo se vigilan las **construcciones gramaticales** prematuras. Los
   betatesters lo notan igual: no saben que es a propósito.

   Cifras (barrido del 10/10): 91 ejercicios de 1.615 (5,6 %) usan como
   objetivo o respuesta una palabra de un tema posterior de su unidad; en la
   unidad 2 son 30: 21 del 2.3 con palabras del 2.4 (*ikaslea*, *medikua*,
   *idazlea*…), 7 del 2.2 con palabras del 2.4 y 2 del 2.1 con palabras
   del 2.2.

**Opciones.**
- **A. Etiquetarlo en pantalla (recomendada, barata).** Cuando una pregunta use
  una palabra aún no vista, la pantalla lo dice: una etiqueta pequeña
  «Reto: esta palabra la verás en el 2.4» (o «Aún no la hemos visto, pero
  puedes deducirla»). Convierte el fallo en lo que era la intención
  («challenge») y quita la sensación de injusticia. Funciona porque el
  motor ya sabe de qué tema es cada palabra.
- **B. Reordenar el contenido.** Mover cada grupo al tema donde se enseña su
  vocabulario, o cambiar las palabras por otras ya vistas. Mucho trabajo y
  algunos ejercicios dejarían de tener sentido en su sitio.
- **C. Dejar el vocabulario compartido a la vista.** Que la ficha de cada
  tema tenga una línea «palabras de apoyo» con las que se usan sin ser del
  tema (*herria*, *laguna*, *izena*…) y su traducción. Es contenido.

Recomendación: A para todo el curso, y revisar con Ric sólo los grupos donde
la palabra adelantada es la respuesta correcta (no un distractor), que son
los que más chocan.

**Respuesta de Ric (11/10/2026).** Es buena queja; lo ideal es **ver caso por caso**. Va a montarse un artefacto para revisar
esas preguntas una a una (o añadir una búsqueda al que ya tiene). Su criterio coincide con la
regla del punto 10: si la palabra adelantada es un **distractor**, le parece bien ir viendo
palabras nuevas; si es **la respuesta correcta**, es muy frustrante.

---

## 10. Regla nueva: lo que no se ha enseñado solo puede ser distractor — **auditado, por arreglar** (Ric de acuerdo)

**Qué se pide.** Respuesta de Miguel al punto 9: las palabras de un tema
posterior pueden salir en un ejercicio, pero **solo como opción incorrecta
(distractor)**; nunca como lo que se pregunta ni como la respuesta correcta.
No se puede preguntar por una palabra que la persona aún no ha aprendido.

**Qué hemos medido.** 89 de las 1.615 variantes de ejercicio por tema (5,5 %)
incumplen la regla: piden como objetivo o respuesta una palabra que se
enseña en un tema posterior. Detalle completo, variante a variante, en
[`auditoria-palabras-no-vistas.md`](auditoria-palabras-no-vistas.md).

| Unidad | U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 | U11 | U12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Variantes | 5 | 24 | 14 | 13 | 8 | 2 | 3 | 8 | 8 | 1 | 2 | 1 |

La unidad 2 concentra casi un tercio: los posesivos del 2.2 se practican con
*laguna*, *herri* y *berria* (que se enseñan en el 2.4 y el 5.3), y las
profesiones del 2.3 con *lagunak*, *ere* e *idazlea* (2.4).

**Cómo se mide.** «Enseñada» = aparece en el vocabulario del tema o en un
ejemplo de ficha de ese tema o anterior. «Objetivo o respuesta» = lo que va
entre «» en la pregunta, la opción correcta, el lado euskera de las parejas
y las fichas de ordenar, escribir y traducir. El test final queda fuera
(mezcla todo el curso). Es un barrido por palabras sueltas, no una revisión
humana: hay falsos positivos (*lo*, *al*, *ere*, y palabras que sí están en
la ficha del tema pero no como entrada de vocabulario).

**Cómo arreglarlo.**
1. Revisar a mano cada fila y confirmar cuáles son reales.
2. En cada variante real, sustituir la palabra no vista por una ya enseñada
   (o, si la palabra es el objetivo del ejercicio, mover la variante a un
   tema posterior). Son cambios de contenido en euskera: conviene que los
   valide Ric o una persona nativa, según `GRAMATIKA.md`.
3. Empezar por las unidades 2 y 3 (38 de las 89).
4. Añadir a `verificar.py` una comprobación que cuente estos casos y falle si
   se introduce uno nuevo, para que no vuelva.

**Ligado a** el punto 9 (opción A: etiquetar en pantalla los casos que se
decida mantener como «reto») y a la nota de `CLAUDE.md` sobre el orden del
vocabulario, que habría que actualizar si se adopta esta regla.

Ric está de acuerdo con esta regla en el hilo del punto 9 y va a revisar los casos en su
artefacto: se pueden repartir las 89 filas de `auditoria-palabras-no-vistas.md` entre los dos.

---

## 11. «Hay play en todas las frases, pero no todas suenan» — **resuelto** (v67)

**Qué cuentan.** Una betatester (captura: parejas de frases del tema 2.4)
tiene la sensación de que no todas las frases tienen audio aunque todas
muestran el icono de reproducir.

**Qué pasaba.** Tenía razón. En «Toca las parejas» el icono de audio se pintaba
en **todas** las palabras en euskera, con o sin mp3. Medido en todo el curso,
**550 de las 1.688 palabras de las parejas (33 %, 217 textos distintos)** no
tenían audio: al tocar el icono no pasaba nada. Los 715 audios que ya existían
estaban bien (ninguno vacío ni cortado).

**Qué se ha hecho.** (1) El icono solo se pinta si hay audio. (2) Se han
generado y subido los 217 audios que faltaban. (3) `verificar.py` da error si
una pareja no tiene audio, para que no vuelva a pasar. Detalle y lista de los
217 textos en [`audios-parejas-sin-audio.md`](audios-parejas-sin-audio.md).

---

## 12. La unidad aparece con el tic aunque no está al 100 % — **resuelto** (v78)

**Qué cuentan.** Si se completa el test de la unidad con un 92 %, la unidad
se marca como completada y en el listado aparece con el tic, pero el progreso
real no es del 100 %. Propone que pueda salir de Hoy (para seguir con la
siguiente), pero que en el listado no lleve el tic, sino el progreso real,
avanzado pero no al 100 %.

**Qué pasa.** Hay dos cosas distintas con el mismo nombre. `completada` se
activa al superar el test de la unidad con un 70 % o más (`js/app.js`,
`ratio >= 0.7`). El progreso que se muestra es otra cuenta: la media de la
mejor nota de cada tema y del test (`progresoUnidad()`). Con un test del 92 %
y temas más bajos el progreso queda por debajo de 100, pero el listado de
Lecciones pinta el anillo lleno y el tic en cuanto `completada` es verdadero
(`anillo(..., { hecho: pu.completada })`).

**Propuesta.**
- Mantener `completada` como está: sirve para que Hoy avance a la siguiente
  unidad y para el contador de «unidades completadas».
- En el listado, pintar el tic **solo cuando el progreso real sea el 100 %**; si
  no, el anillo con su porcentaje real (92 %) y el color de la unidad ya
  sólido, para que se vea que está superada pero se puede mejorar.
- El 100 % exacto exige haber sacado la nota máxima en todos los temas y en el
  test, lo que casi nadie conseguirá. Conviene decidir si es lo que se
  quiere (el tic sería un premio raro) o si el tic debería salir al superar
  todos los temas y el test aunque la media no sea 100 %.

**Ligado a** lo que ya anotó Ric sobre el «100 %» que se desborda de la tarjeta
en el resultado (`docs/ideas-ric.md`).

**Respuesta de Ric (11/10/2026) y lo aplicado.** Está de acuerdo, y ya había hecho un par de
arreglos en esto («a los que tenemos algo de TOC nos molesta mucho»): el tic debe aparecer
**solo cuando todo está al 100 %**; si algo no llega, se muestra el porcentaje y el anillo lleno
en proporción. Y propone mantener la norma de que superar el test final saca la unidad de Hoy,
pero que en Progreso se vea el anillo hasta donde se va, no el tic (cree que ahora ya es así).
Nota: el umbral real del test es el **70 %** (decisión de Ric del 01/10/2026), no el 75 % que él
recuerda; no se ha tocado.
**Aplicado en v78:** en la lista de Lecciones el tic y el color pleno solo salen cuando el
progreso real es el 100 %; antes salían al superar el test. Con la unidad superada pero, por
ejemplo, al 92 %, la tarjeta muestra el anillo al 92 % sin tic y el color casi pleno, y Hoy
sigue avanzando a la siguiente unidad.

---

## 13. En el móvil no se oía ningún audio — **resuelto** (v77)

**Qué cuentan.** Miguel: en el móvil no suenan los audios (en el ordenador sí), y en otras
webs sí se oye el sonido, así que no era cosa del teléfono.

**Qué pasaba.** Era una consecuencia de mi arreglo del punto 1 (v65): al pasar el audio a Web
Audio, en iPhone el sonido queda silenciado por el interruptor de silencio y por las
restricciones de Safari (en el ordenador no pasa).

**Qué se ha hecho (v77).** Vuelve el reproductor `<audio>` normal, que suena siempre, y se
conserva lo que arreglaba el corte inicial: precarga de cada mp3 como Blob en memoria al abrir
la unidad. Además se pide a iOS que trate la página como reproducción de medios
(`navigator.audioSession.type = 'playback'`). *Pendiente de confirmar en el iPhone de Miguel.*

---

## 14. Navegar entre ejercicios deslizando (idea de Ric) — **propuesto**

**La idea.** Poder moverse entre ejercicios con un deslizamiento, y no solo con los puntos de la barra de arriba. **Solo
hacia preguntas ya respondidas; nunca hacia delante.**

**Qué hay ya.** Casi todo el mecanismo existe:
- Tocar un paso de la barra abre el repaso de esa pregunta (`revisarPregunta`).
- **Dentro de ese repaso ya se desliza**: `alDeslizar(el.modalPanel, …)` salta a la anterior o a la siguiente pregunta
  *contestada* (`revisarVecina`), saltándose los huecos por delante (un test permite volver atrás). Fue otra petición de Ric.
- Las fichas de un tema también se recorren deslizando.

**Qué falta.** El gesto **desde la propia pantalla del ejercicio**: hoy hay que tocar un punto de la barra para entrar en el
repaso, y recién dentro se puede deslizar. Lo que pide Ric sería que, estando en una pregunta, deslizar hacia la derecha
abra la anterior ya contestada (y nunca hacer nada al deslizar hacia la izquierda sobre la actual).

**Cómo se haría.** Unas diez líneas: un `alDeslizar` más sobre la pantalla del ejercicio, con `haciaAtras` abriendo
`revisarPregunta` de la última contestada antes de la actual y `haciaDelante` vacío. Reutiliza el mismo detector
(rápido, ≥60 px, más horizontal que vertical, pasivo: no estorba al scroll).

**Cosas a vigilar:**
- **El repaso de vocabulario queda fuera**, como está decidido (ahí la cola no es una lista de preguntas).
- **Choque con el gesto de «atrás» del navegador:** en iPhone, deslizar desde el borde izquierdo vuelve a la página
  anterior de Safari. Convendría ignorar los gestos que empiezan en los primeros ~20 px del borde.
- **Ejercicios con arrastre:** las piezas de «ordena» y «escribe la frase» se colocan **tocando**, no arrastrando, así que
  no hay conflicto; la caja de escribir sí recibe toques horizontales para mover el cursor, pero el detector exige un gesto
  rápido y largo.
- **No hay pista visual** de que se puede deslizar. Se podría enseñar una vez (un tooltip la primera vez) o no decir nada.

**Recomendación.** Sí, es pequeño y coherente con lo que ya hay. Solo conviene probarlo en un móvil de verdad
(el iPhone, por el gesto del borde) antes de darlo por bueno.

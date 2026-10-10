# Feedback de betatesters — correcciones posibles

Documento vivo. Cada punto es una cosa que han contado los betatesters (o
Miguel al probar), con mi lectura de qué está pasando y qué se podría hacer.
Se va completando a medida que llega feedback. Estado de cada punto:
**resuelto**, **propuesto** (hay idea, falta decidir) o **a pensar**.

Empezado el 10/10/2026.

---

## 1. Los audios suenan entrecortados la primera vez — **resuelto** (v65)

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

## 3. «Escucha y tradúcelo»: escriben lo que oyen en vez de la traducción — **a pensar**

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

---

## 4. «Aupa» se echa de menos en la lección y luego aparece en el examen — **resuelto en parte** (v66)

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

---

## 5. Idea: «Gaurko hitza» (la palabra del día) — **idea, sin decidir**

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
4. **Compartirla.** Un botón para mandar la palabra por WhatsApp, que es
   donde nació.

**Qué cuesta.** La 1 y la 2 son pequeñas y reutilizan lo que hay. La 3 es
trabajo de contenido, no de código. La 4 es una línea. No requiere servidor
ni puntos.

**Recomendación.** Empezar por la 1 con palabras del propio curso para ver si
engancha, y dejar la 3 como evolución si la gente la usa. Antes, conviene
confirmar con más betatesters si les motivaría una palabra al día.

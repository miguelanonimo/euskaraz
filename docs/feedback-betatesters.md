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

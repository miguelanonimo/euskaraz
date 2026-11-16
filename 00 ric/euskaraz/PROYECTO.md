# Euskaraz — cuaderno del proyecto

Documento de contexto para retomar el trabajo en otra sesión. El `README.md` explica **cómo funciona** la aplicación y cómo añadir contenido; esto explica **por qué está hecha así**, qué se decidió y qué queda pendiente.

Última actualización: 10 de agosto de 2026 (segunda sesión del día).

---

## 1. Qué es

Una aplicación web para aprender euskera batua desde cero, en castellano, con notas del bizkaiera de la zona de Gernika. Sin dependencias, sin build, sin backend: HTML, CSS y un archivo de JavaScript. Se sube a un servidor estático y funciona.

El público es una persona concreta —alguien de entorno castellanohablante que quiere entender el euskera que oye en Busturialdea— y eso condiciona todas las decisiones de contenido.

## 2. Estado actual

Nivel A1 cerrado. `data/curso.json` está en la versión 4.0.

| | |
|---|---|
| Unidades | 12 |
| Grupos de ejercicios | 144 |
| Variantes | 720 (420 de opción, 110 de ordenar, 100 de emparejar, 90 de traducir) |
| Vocabulario | 359 entradas, 340 únicas |
| Fichas de gramática | 73, con una de Gernika en cada unidad |
| Código | 1208 líneas de JS, 933 de CSS, 230 de HTML |

Funciones: recorrido por unidades (gramática, vocabulario, práctica), repaso mezclado entre unidades, repaso de vocabulario, diccionario buscable, calendario de repaso espaciado, progreso en `localStorage` (`euskaraz.progreso.v2`), versión de un solo archivo para abrir sin servidor.

### Archivos y para qué sirve cada uno

```
index.html                 estructura, una <main> por pantalla
css/styles.css             hoja única
js/app.js                  toda la lógica, IIFE, sin dependencias
data/curso.json            índice: metadatos + orden de las unidades
data/unidades/*.json       el contenido, un archivo por unidad
verificar.py               control de calidad de los JSON
construir-standalone.py    genera euskaraz-standalone.html
README.md                  manual de uso y de formato
PROYECTO.md                este documento
```

### El ciclo de trabajo

```bash
python3 -m http.server 8000   # probar en local; no vale abrir index.html con doble clic
python3 verificar.py          # después de tocar cualquier JSON; devuelve 1 si algo falla
python3 construir-standalone.py
```

## 3. Decisiones tomadas, y por qué

Estas son las que conviene no deshacer sin pensarlo, porque cada una resuelve un problema concreto.

**El contenido vive en JSON y el código no se toca para añadir temario.** Añadir una unidad es crear un archivo y añadir su ruta a `curso.json`. El orden de esa lista es el orden en pantalla. Esto es lo que ha permitido pasar de 6 a 12 unidades sin tocar `app.js`.

**Cinco variantes por grupo de ejercicios.** La app elige una al azar en cada ronda y evita repetir la de la ronda anterior (se guarda en `progreso.ultimas`). Así se practica el concepto en vez de memorizar la respuesta, y hay cinco rondas distintas antes de que nada se repita. El `id` de cada grupo es la clave de ese recuerdo, así que **tiene que ser único en todo el curso**.

**La entrada es lenta a propósito.** No hay verbos conjugados hasta la unidad 4. Las unidades 2 y 3 asientan pronombres e interrogativas primero. Las frases con verbo de la unidad 3 se dan como bloques cerrados y se desmontan después. El salto grande está en la unidad 8, con el mecanismo de dos piezas (`jaten dut`); todo lo posterior es ese mismo mecanismo con auxiliares distintos.

**Una ficha de Gernika en cada unidad, con su aviso.** Contrastan batua y bizkaiera de Busturialdea. Llevan siempre la advertencia de que es habla comarcal, no fonética de Gernika pueblo, y de que la gente joven mezcla con batua. Están para entrenar el oído, no como norma.

**Sin audio.** La síntesis de voz de los navegadores prácticamente no soporta euskera. Fingirlo sería peor que no tenerlo. La salida honesta es grabar audio real y añadir un campo `audio` al vocabulario.

**Paleta de papel, tinta, un rojo y un verde.** El verde entró después: hasta entonces el rojo servía para el acierto y para el fallo a la vez, y una respuesta correcta se marcaba con una barra roja, que decía justo lo contrario de lo que pasaba.

Son dos tokens, no uno. `--bien` (#0caa39) es el color elegido, y va donde el tamaño ya hace de contraste: el titular del resultado, la barra de la opción acertada, el filete del feedback. `--bien-txt` (#09852d) es el mismo tono bajado hasta contrastar 4.2 sobre el papel —exactamente lo que contrasta el rojo— y va en el texto pequeño: el «Oso ondo!», el ✓, las cifras del marcador, el fondo de las letras marcadas. El verde claro sobre papel se queda en 2.7, que a 76px se lee de sobra pero en cuerpo 20 no.

Un cero no se pinta de rojo: cero fallos es la mejor noticia de la pantalla y en rojo parece una avería. El color del marcador solo entra cuando la cifra es mayor que cero.

Los JSON tienen un campo `color` por unidad que el diseño **no usa**. Queda ahí por si algún día se quiere diferenciar unidades por color.

**El progreso es `localStorage`, sin cuentas.** Clave `euskaraz.progreso.v2`. Es por dominio y por navegador: móvil y portátil son dos progresos distintos, y `localhost` no es lo mismo que el dominio real. Sincronizar exigiría backend. Una unidad se marca completada al acertar el 70 % o más.

**Los repasos no cuentan para el progreso.** No marcan unidades como completadas ni mueven el porcentaje. Son práctica, no examen. Solo tiran de unidades ya visitadas, para no preguntar gramática que aún no se ha leído. El tamaño de cada ronda está en `LARGO_REPASO` y `LARGO_VOCAB`, al principio de `app.js`.

**Un solo calendario para ejercicios y palabras.** El `srs` del progreso mezcla los dos, distinguidos por prefijo (`g:u7-g03`, `v:kaixo`). Se decidió así para no acabar con dos planificadores que hay que mantener a la vez y que se desincronizan. La escala de intervalos, `PASOS`, es única y está al principio de `app.js`.

**El calendario cuenta días enteros, no horas.** `toca` y `visto` son días desde 1970 en hora local. Lo que toca hoy toca todo el día, y la frontera cae a medianoche de aquí y no a las dos de la madrugada, que es lo que pasaría contando en UTC. Guardar marcas de tiempo exactas habría obligado a decidir qué es «un día» cada vez que se consulta.

**Fallar devuelve al primer peldaño, y punto.** No hay factores de facilidad al estilo SM-2. Con 144 grupos y 340 palabras, afinar el intervalo por ítem no cambia la experiencia lo suficiente como para justificar el código.

**Lo fallado no se repite dentro de la misma sesión.** Vuelve al día siguiente. Reinyectarlo al final de la cola era la otra opción, pero entonces el marcador de la esquina deja de tener denominador fijo y la barra de progreso retrocede. Queda anotado por si algún día parece que compensa.

## 4. Qué se hizo en la conversación del 8-10 de agosto de 2026

Se partía de 6 unidades y se cerró el A1.

**Seis unidades nuevas.** 7 la hora y los días; 8 el presente habitual `-t(z)en`, la negación y el partitivo; 9 los verbos de movimiento y el instrumental `-z`; 10 el dativo y los gustos; 11 el pasado; 12 la partícula `al`, comparativos, conectores y repaso general, con una ficha final de qué falta para seguir hacia A2.

**Dos funciones nuevas** en la pantalla de inicio: repaso mezclado y diccionario buscable (búsqueda simultánea en euskera, castellano y notas, insensible a tildes, con la unidad de origen de cada palabra).

**`verificar.py`**, escrito para este trabajo. Comprueba ids únicos, cinco variantes por grupo, índices de `correcta` dentro de rango, que las fichas de `orden` reconstruyan exactamente su frase, opciones sin repetir, enunciados que no se solapen entre unidades y —añadido después— que las pistas no mientan.

**Dos correcciones de contenido salidas de la revisión del usuario**, ambas instructivas:

- Una pista de la unidad 3 decía que «hoy» tenía cinco letras; `gaur` tiene cuatro. Este error era **invisible para la app**: la pista se muestra pero no se usa para corregir. De ahí salió la comprobación de pistas de `verificar.py`. Un barrido de las 720 variantes no encontró más casos reales.
- Un ejercicio de la unidad 5 hacía pasar «heme-» por un número: preguntaba de qué se compone `hemezortzi` y daba por buena «heme + zortzi» frente a «hamar + zortzi». Los números **son** diez y ocho; lo único que cambia es la vocal del prefijo. Se rehízo el ejercicio, la variante hermana que tenía la misma trampa en versión suave, y la ficha de gramática que era la raíz del problema: metía el 11, el 18 y el 19 en el mismo saco de «excepciones que hay que memorizar», cuando el 11 (`hamaika`) sí es opaco y los otros dos siguen el patrón con desgaste fonético.

La lección de las dos: **el verificador cubre lo mecánico, no lo pedagógico.** Una explicación puede estar bien formada y ser falsa.

## 4 bis. Qué se hizo en la segunda sesión del 10 de agosto

**Repaso espaciado.** Estaba en la lista de ideas y se ha hecho. El progreso pasa a `euskaraz.progreso.v2`, con un campo `srs` que guarda por ítem el peldaño, la fecha de vuelta y el histórico de aciertos y fallos. La migración desde v1 es automática y conserva unidades y variantes; el calendario arranca vacío, porque no hay forma de saber cuándo se estudió nada antes de que existiera.

Los dos repasos ya no barajan el fondo entero: piden al calendario qué toca —primero lo vencido, luego lo nuevo, y si sobra sitio lo que vence antes— y solo barajan el resultado. La práctica de una unidad sigue siendo la unidad entera, pero también alimenta el calendario. En la portada, cada tarjeta lleva la cifra de lo que vence hoy, y solo cuando hay algo.

**Repaso de vocabulario.** Tercera entrada de la portada. Ya no es una lista de veinte preguntas que se recorre una vez: son catorce palabras en una cola que no se vacía hasta que están todas puestas.

Al fallar, la palabra no se pierde: vuelve a los dos, tres o cuatro ejercicios, y si esa la aciertas todavía vuelve una vez más, a seis u ocho y en un formato más exigente. Dos aciertos, y el segundo en frío, porque acertar treinta segundos después de haber visto la solución no prueba nada. Si solo queda ella en la cola, se repite en el acto, que es lo que pasa al final de cada sesión. Hay un tope de piedad en seis fallos: a la séptima la palabra sale igual, para no dejar a nadie encerrado.

Tres formatos, y los tres salen desde el primer día: una sesión de un solo formato aburre, y variar la manera de preguntar es parte de lo que hace que la palabra se quede. Lo que hace el calendario no es elegir el formato sino inclinar la balanza: una palabra recién vista se pregunta sobre todo reconociéndola, una que llevas semanas acertando se pregunta sobre todo escribiéndola. Al fallar la palabra vuelve un peldaño más fácil, y la comprobación final sube uno. Además se evita repetir el formato con el que acabas de fallar: si vuelve, que vuelva preguntada de otra manera.

Con un jugador que acierta el 80 %, la mezcla que sale es: palabras nuevas 61 % opción / 15 % ortografía / 25 % teclear; asentadas 14 / 16 / 69. Unas 21 preguntas por sesión de 14 palabras.

La primera versión de esto ataba el formato al peldaño de forma rígida —0-1 opción, 2-3 ortografía, 4+ teclear— y estaba mal: con un progreso normal daba 100 % de opción múltiple, o sea exactamente lo de antes, y los formatos nuevos no aparecían nunca. La lección es que un umbral duro sobre un calendario que casi todo el mundo tiene bajo equivale a no haber hecho el cambio.

**Ortografía** es la misma palabra escrita de tres maneras, una buena. Las erratas se generan al vuelo con reglas de los tropiezos reales —la hache que no suena y se cae, tx/tz/ts entre sí, z/s/x, la erre doble, sonoras y sordas entre vocales, y las interferencias del castellano: c y qu por k, v por b, ñ por in—. Cada regla se aplica en una sola posición, elegida al azar: cambiar todas las zetas de golpe da un adefesio que se descarta de un vistazo. Toda errata generada se contrasta contra el diccionario completo y se descarta si resulta ser una palabra del curso: «hitz» → «hits» sería una trampa, no un error. Si las reglas no dan al menos dos erratas creíbles —palabras cortas, o sin ninguna letra conflictiva— la palabra no usa este formato: se prefiere una opción menos a rellenar con un disparate. Cerca de la mitad del vocabulario está en ese caso, así que el peso de la ortografía en la mezcla va subido a propósito para compensar las tiradas que se pierden. Cuando toca y no se puede, adónde se cae depende del nivel: una palabra asentada se va a teclear; una recién vista se va a opción múltiple, porque pedirle que la escriba de memoria la primera vez no es exigencia, es una encerrona.

**Lo que ve el calendario.** Solo la primera respuesta de cada palabra en la sesión. Las vueltas entrenan pero no puntúan: el calendario intenta averiguar si te la sabes dentro de tres días, y una repetición a distancia tres no responde a esa pregunta. Sin esto, fallar una palabra y acertarla dos veces seguidas la subiría de peldaño como si la dominaras, que es justo al revés.

Los distractores de opción múltiple se buscan primero en la misma unidad que la palabra preguntada. La barra de progreso mide palabras puestas, no preguntas hechas: una barra que retrocede cada vez que fallas desanima. El marcador final cuenta cuántas salieron a la primera, cuántas necesitaron vuelta y cuántas respuestas costó en total; después, la lista de las que costaron, que ahorra el viaje al diccionario.

**Enseñar el error, no solo la solución.** Al fallar un ejercicio de escribir o de ortografía se alinean las dos grafías y se marca lo que sobra en la tuya y lo que falta respecto a la buena: «elegiste ~h~egun on · se escribe egun on». Por letras cuando es una palabra, por palabras cuando es una frase, donde el detalle de cada letra sería ruido.

El detalle que no se veía venir: hay dos traducciones que sirven para más de una palabra —«hasta luego» es `ikusi arte` y `gero arte`; «él / ella» es `hura` y `bera`—. Preguntadas del castellano al euskera tendrían dos respuestas buenas y solo una contaría. La app lo detecta al montar la sesión y fuerza la dirección segura; `verificar.py` las lista para poder revisarlas a mano.

**Banco de pruebas.** Se escribió uno que carga el standalone en jsdom y maneja la aplicación como una persona: comprueba la migración, la forma de las preguntas, que la escala de intervalos se mueva como debe y que borrar el progreso borre también el calendario. Son 43 comprobaciones. No está en el repositorio porque depende de jsdom y el proyecto no tiene dependencias; se puede rehacer cuando haga falta.

## 5. Riesgos conocidos

**El euskera no lo ha revisado un hablante nativo.** Es el riesgo grande y no se resuelve con scripts. Son 720 variantes, 73 fichas de gramática y 12 notas de dialecto. Lo más expuesto: las traducciones libres de las unidades 10 y 11, las frases completas de los ejercicios de traducir, y las fichas de bizkaiera, que son las que más varían de pueblo a pueblo. Los dos errores encontrados hasta ahora los detectó el usuario leyendo, no el verificador.

Desde esta sesión hay revisión en marcha: la pareja del usuario, de Gernika, va leyendo el contenido y avisando de lo que suene raro. Las correcciones entran por ahí.

**El repaso de vocabulario pregunta pares aislados.** Sabe el `eu` y el `es` de cada entrada, nada más. Una palabra cuya traducción depende del contexto se preguntará igual, y la única respuesta buena será la que esté en el JSON. Es el precio de generar las preguntas solas en vez de escribirlas.

**Caché del navegador al desplegar.** Los JSON se piden con `cache: 'no-cache'`, pero `index.html`, `styles.css` y `app.js` sí se cachean. Si queda un `index.html` viejo con un `app.js` nuevo, el JS busca botones que no existen y la aplicación no arranca. Hay que forzar recarga limpia y purgar CDN si lo hay.

**El progreso no viaja.** Cambiar de dominio, de navegador o de dispositivo lo pierde. Está asumido, pero conviene decírselo a quien use la app.

**El standalone se queda desfasado.** Cada vez que se toca un JSON hay que regenerarlo. No hay nada que lo avise.

## 6. Ideas para seguir

Sin comprometerse a ninguna. Ordenadas por relación entre lo que aportan y lo que cuestan.

**Nivel A2.** Lo siguiente, ya acordado. La unidad 12 ya deja escrito lo que falta y en qué orden: futuro `-ko`, imperativo, subordinadas (`-la`, `-n`, `-lako`), hitano, y los sintéticos que quedan (`jakin`, `eduki`, `ekarri`, `eraman`). El hitano tiene interés especial aquí, porque en Bizkaia se usa mucho.

**Audio grabado.** Un campo `audio` en el vocabulario y archivos reales. Caro de producir, pero es el hueco más visible del curso.

**Exportar e importar el progreso.** Un botón que vuelque el `localStorage` a un archivo y otro que lo lea. Resuelve a mano el problema de los dispositivos sin montar backend. Barato.

**Tipos de ejercicio nuevos.** Dictado (necesita audio), completar un diálogo, elegir entre batua y bizkaiera. El motor admite tipos nuevos sin tocar el formato: hay que añadir un `case` en `pintarEjercicio` y su función de corrección.

**Filtro por unidad en el diccionario**, y quizá marcar palabras como favoritas para repasarlas.

**Ver el calendario.** Ahora el `srs` solo se asoma como una cifra roja en la portada. Una pantalla que enseñe qué vence esta semana, o qué palabras se atragantan más —el campo `fallos` ya lo sabe—, saldría casi gratis con los datos que ya se guardan.

**Repetir lo fallado dentro de la sesión.** La otra mitad del repaso espaciado, la de intervalos cortos. Hay que decidir antes qué se hace con el marcador y la barra de progreso cuando la cola crece a mitad de ronda.

**Modo oscuro.** La paleta está toda en variables CSS al principio de `styles.css`, así que es sobre todo trabajo de elegir bien los valores.

## 7. Convenciones al añadir contenido

El formato completo está en el `README.md`. Lo que hay que respetar sí o sí:

- `id` de grupo único en todo el curso, con el prefijo de su unidad (`u7-g01`).
- Cinco variantes por grupo. Pueden mezclar tipos.
- En `orden`, el campo `palabras` tiene que reconstruir exactamente `eu`.
- En `traducir`, listar todas las variantes razonables de respuesta; la comparación ignora mayúsculas, espacios de más y `¿ ? ¡ ! . , ; : « » " ' ( )`.
- Las pistas que cuentan letras o palabras tienen que ser ciertas. `verificar.py` lo comprueba.
- No repetir enunciados entre unidades.
- Cada unidad, su ficha de Gernika.
- El `es` del vocabulario es la única respuesta buena en el repaso de palabras: que sea la traducción más neutra, no una contextual.
- Pasar `verificar.py` y regenerar el standalone antes de dar nada por terminado.

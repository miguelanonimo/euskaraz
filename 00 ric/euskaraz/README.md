# Euskaraz

Curso de euskera batua desde cero. Nivel A1 completo: doce unidades, 144 ejercicios con 5 variantes cada uno (720 en total), 340 palabras de vocabulario y notas de bizkaiera de la zona de Gernika en cada unidad.

En `PROYECTO.md` está el cuaderno del proyecto: por qué está hecho así, qué se decidió, qué riesgos tiene y qué ideas hay para seguir. Este archivo es el manual de uso y de formato.

## El recorrido

La entrada es deliberadamente lenta. Los verbos no aparecen hasta la cuarta unidad.

| # | Unidad | Contenido |
|---|--------|-----------|
| 1 | Kaixo! | Saludos, pronunciación, el adjetivo detrás |
| 2 | Ni eta zu | Los seis pronombres, posesivos, aviso sobre la declinación |
| 3 | Nor? Zer? Non? | Palabras interrogativas, la familia `non/nora/nondik/nongoa` |
| 4 | Ni Ane naiz | `izan` (ser), el artículo `-a`, el origen con `-ko/-go` |
| 5 | Zenbat? | Números, `ukan` (tener), el caso ergativo `-k` |
| 6 | Non zaude? | `egon` (estar), el locativo `-n`, la casa |
| 7 | Zer ordu da? | La hora, los días, `-etan`, las partes del día |
| 8 | Zer egiten duzu? | El presente habitual `-t(z)en` + auxiliar, la negación, el partitivo |
| 9 | Nora zoaz? | `joan`, `etorri`, `ibili`, los plurales `-etara/-etatik`, el instrumental `-z` |
| 10 | Zer gustatzen zaizu? | El dativo: la serie `zait`, el plural `zaizkit`, `-ri` y `dit/dizu/dio` |
| 11 | Atzo zer egin zenuen? | El pasado de `izan`, `ukan` y `egon`; comí / he comido / comía |
| 12 | Dena batera | La partícula `al`, comparativos, conectores, `-lako` y repaso de todo |

Las unidades 2 y 3 no traen verbos conjugados: sirven para asentar pronombres e interrogativas antes de que llegue lo pesado. Las frases con verbo que aparecen en la unidad 3 se presentan como bloques cerrados, y se desmontan a partir de la 4.

El salto grande está en la octava, con el mecanismo de dos piezas (`jaten dut`). Todo lo que viene después es ese mismo mecanismo con auxiliares distintos, así que conviene no pasar de largo si no ha quedado claro.

La última unidad cierra con una ficha de qué falta para seguir: futuro, imperativo, subordinadas, hitano y los verbos sintéticos que quedan.

## Tipografía

La interfaz usa **Inter**, cargada desde Google Fonts en el `<head>` de `index.html`. Si prefieres autoalojarla, descarga la familia (pesos 400, 500, 600 y 700), déjala en `css/fonts/` y sustituye el `<link>` por un `@font-face`. Hay una pila de respaldo del sistema, así que sin conexión no se rompe nada: solo cambia la fuente.

## Subirlo al servidor

Copia la carpeta entera a tu servidor. No necesita PHP, ni base de datos, ni build. Solo hace falta que el servidor sirva archivos estáticos.

```
euskaraz/
├── index.html
├── site.webmanifest
├── css/styles.css
├── js/app.js
├── construir-standalone.py
├── verificar.py
├── icons/
│   ├── favicon.ico             ← 16/32/48/64 en un solo archivo
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── apple-touch-icon.png    ← 180×180, iOS
│   ├── icon-192.png            ← Android
│   ├── icon-512.png
│   ├── icon-maskable-512.png   ← Android recorta las esquinas de este
│   └── icon-512-transparente.png
└── data/
    ├── curso.json          ← índice: metadatos y lista de unidades
    └── unidades/
        ├── 01-agurrak.json
        ├── 02-izenordainak.json
        ├── 03-galderak.json
        ├── 04-izan.json
        ├── 05-zenbat.json
        ├── 06-non.json
        ├── 07-ordua.json
        ├── 08-egiten.json
        ├── 09-nora.json
        ├── 10-gustatzen.json
        ├── 11-atzo.json
        └── 12-dena.json
```

**Importante:** no funciona abriendo `index.html` con doble clic. El navegador bloquea la lectura de los archivos de `data/` desde `file://` por seguridad. Para probarlo en local:

```bash
cd euskaraz
python3 -m http.server 8000
```

Y abre `http://localhost:8000`.

## Probarlo sin servidor

`euskaraz-standalone.html` es la misma app con todo incrustado en un único archivo (unos 340 KB). Ábrelo con doble clic y funciona, también en el móvil si te lo envías. Sirve para enseñárselo a alguien rápido.

Después de editar cualquier archivo de `data/`, regenéralo:

```bash
python3 construir-standalone.py
```

## Los tres repasos

En la pantalla de inicio, debajo de las unidades, hay tres entradas más.

**Repaso mezclado** junta los ejercicios de todas las unidades que has abierto alguna vez y te pasa quince. Cada ejercicio lleva encima el número y el título de su unidad, para que sepas dónde volver si algo falla. No cuenta para el progreso: no marca ninguna unidad como completada ni cambia el porcentaje. Es práctica, no examen.

**Repaso de vocabulario** es lo mismo pero solo con palabras: veinte preguntas de opción múltiple con cuatro respuestas. La dirección se sortea en cada una —unas veces te da el euskera y eliges el castellano, otras al revés—, así que entrena a la vez el reconocer y el producir. Los distractores salen preferentemente de la misma unidad que la palabra preguntada, que es donde el parecido hace daño. Al final te enseña la lista de las que se te han escapado.

Hay una excepción a lo de sortear la dirección. Cuando dos palabras en euskera comparten traducción —`ikusi arte` y `gero arte` son las dos «hasta luego»— preguntar del castellano al euskera tendría dos respuestas buenas y solo una contaría como acierto; en ese caso se fuerza la dirección segura.

Los dos repasos solo tiran de unidades ya visitadas, así que si no has abierto ninguna te lo dicen y no arrancan. El tamaño de cada ronda está en `LARGO_REPASO` y `LARGO_VOCAB`, al principio de `js/app.js`.

**Diccionario** es todo el vocabulario del curso en una lista alfabética, con la unidad de la que sale cada palabra. El buscador mira a la vez el euskera, el castellano y la nota, e ignora las tildes: `musica` encuentra `musika`. Si la misma palabra aparece en dos unidades, se queda la primera vez que salió.

### Qué entra en cada ronda

No se baraja el fondo entero: lo elige el calendario de repaso espaciado. Cada ítem —un grupo de ejercicios o una palabra— lleva un paso dentro de esta escala, en días:

```
PASOS = [1, 2, 4, 8, 16, 32, 64, 120]
```

Aciertas y subes un peldaño: el ítem no vuelve hasta que pase ese plazo. Fallas y vuelves al primero, así que te sale mañana. La sesión se llena por este orden:

1. lo vencido, empezando por lo que lleva más tiempo esperando y lo que más has fallado;
2. lo que nunca has visto, en el orden del curso;
3. si aún sobra sitio, lo que vence antes.

La urgencia decide qué entra, no en qué orden sale: la lista final se baraja. La cifra roja de la portada es lo vencido hoy, y solo aparece si hay algo.

La práctica de una unidad no se dosifica —es la primera pasada, ahí toca verlo todo— pero también alimenta el calendario, para que el repaso posterior sepa qué se falló.

## Añadir una unidad

1. Crea `data/unidades/13-loquesea.json` con la estructura de abajo.
2. Añade la ruta a la lista `unidades` de `data/curso.json`, en la posición que quieras.
3. Regenera el standalone si lo usas.

No hay que tocar el código. El orden de la lista es el orden en que aparecen en la pantalla de inicio.

### Estructura de una unidad

```json
{
  "id": "u7",
  "numero": 7,
  "titulo": "Zer ordu da?",
  "subtitulo": "La hora y la rutina",
  "objetivo": "Frase corta que aparece en la portada de la unidad.",
  "color": "azul",
  "vocabulario": [...],
  "gramatica": [...],
  "ejercicios": [...]
}
```

`color` está en el JSON pero el diseño actual no lo usa: la paleta es papel, tinta y un solo rojo. Queda ahí por si más adelante quieres diferenciar unidades por color.

## Las cinco variantes

Cada entrada de `ejercicios` es un **grupo** con cinco variantes. La app elige una al azar al empezar cada ronda y evita repetir la que salió la ronda anterior. Así practicas el concepto en lugar de memorizar la respuesta, y tienes cinco rondas distintas antes de que nada se repita.

```json
{
  "id": "u7-g01",
  "variantes": [
    { "tipo": "opcion", "...": "primera versión" },
    { "tipo": "opcion", "...": "segunda versión" },
    { "tipo": "opcion", "...": "tercera versión" },
    { "tipo": "opcion", "...": "cuarta versión" },
    { "tipo": "opcion", "...": "quinta versión" }
  ]
}
```

Las variantes no tienen por qué ser del mismo tipo: puedes mezclar `opcion`, `orden` y `traducir` dentro de un grupo si te apetece.

El `id` debe ser único en todo el curso: es la clave con la que se recuerda qué variante salió la última vez. Y conviene que los enunciados no se repitan entre unidades, o acabarás practicando lo mismo dos veces sin darte cuenta.

### Vocabulario

```json
{ "eu": "kaixo", "es": "hola", "nota": "Opcional. Puede ser null." }
```

### Ficha de gramática

```json
{
  "titulo": "El verbo izan",
  "cuerpo": "Texto largo.\n\nDos saltos de línea = párrafo nuevo.\nUno solo = salto simple.\n\nAdmite <b>negrita</b> y <i>cursiva</i>.",
  "ejemplos": [
    { "eu": "Ni Ane naiz.", "es": "Yo soy Ane." }
  ]
}
```

### Los cuatro tipos de ejercicio

**Emparejar** — se autocorrige al completar las cuatro parejas.

```json
{
  "tipo": "pares",
  "instruccion": "Empareja los saludos",
  "pares": [{ "eu": "kaixo", "es": "hola" }]
}
```

**Opción múltiple** — `correcta` es el índice, empezando en 0.

```json
{
  "tipo": "opcion",
  "instruccion": "Elige la opción correcta",
  "pregunta": "Ni Mikel ____.",
  "opciones": ["da", "naiz", "zara", "gara"],
  "correcta": 1,
  "explicacion": "Se muestra después de responder. Opcional."
}
```

**Ordenar palabras** — `palabras` se baraja sola; el orden que escribas aquí da igual.

```json
{
  "tipo": "orden",
  "instruccion": "Ordena las palabras",
  "es": "Yo soy estudiante.",
  "eu": "Ni ikaslea naiz.",
  "palabras": ["Ni", "ikaslea", "naiz."]
}
```

**Escribir la traducción** — `respuestas` admite variantes; todas se dan por buenas.

```json
{
  "tipo": "traducir",
  "instruccion": "Escríbelo en euskera",
  "es": "Tengo un perro.",
  "respuestas": ["nik txakurra dut", "txakurra dut"],
  "pista": "Opcional."
}
```

La comparación ignora mayúsculas, espacios de más y estos signos: `¿ ? ¡ ! . , ; : « » " ' ( )`. Todo lo demás cuenta, así que conviene listar las variantes razonables.

## Progreso

Se guarda en `localStorage` del navegador, bajo la clave `euskaraz.progreso.v2`. Es por dispositivo: quien entre desde el móvil y desde el portátil verá dos progresos distintos. Si más adelante quieres cuentas de usuario, hará falta backend.

Una unidad se marca como completada al acertar el 70 % o más.

```json
{
  "version": 2,
  "unidades": { "u1": { "visitada": true, "completada": true, "mejor": 0.85, "intentos": 2 } },
  "ultimas":  { "u1-g01": 3 },
  "srs": {
    "g:u1-g01": { "paso": 2, "toca": 20310, "aciertos": 3, "fallos": 1, "visto": 20306 },
    "v:kaixo":  { "paso": 0, "toca": 20307, "aciertos": 0, "fallos": 1, "visto": 20306 }
  }
}
```

`unidades` y `ultimas` son lo de siempre: qué has completado y qué variante salió la última vez en cada grupo. `srs` es el calendario: una entrada por ítem, con prefijo `g:` para los grupos de ejercicios y `v:` para las palabras. `toca` y `visto` son días enteros contados desde 1970 en hora local, no marcas de tiempo: lo que toca hoy toca todo el día.

Si al abrir la app no hay clave v2 pero sí una v1, se sube sola: unidades y variantes se conservan y el calendario empieza vacío, que es lo correcto —no sabemos cuándo se estudió nada antes de que el calendario existiera. La clave vieja se deja donde está por si hay que volver atrás; «Reiniciar mi progreso» borra las dos.

## Qué no incluye

- **Audio.** No hay pronunciación grabada. La síntesis de voz del navegador prácticamente no soporta euskera, así que lo honesto es no fingirlo. La alternativa es grabar el audio y añadir un campo `audio` al vocabulario.
- **Repetición dentro de la misma sesión.** Lo que fallas hoy vuelve mañana, no diez preguntas después. Se podría reinyectar al final de la cola, pero entonces el contador de aciertos deja de tener denominador fijo.
- **Cuentas de usuario ni sincronización.**

## Iconos

Todos salen de `favicon.png` (1080×1080). Se recortó el margen sobrante, se recentró con un aire uniforme y se compuso **sobre blanco**: con fondo transparente, la «EU» negra desaparecería en las pestañas en modo oscuro.

Si cambias el logo, regenera los tamaños con el bloque de Pillow que hay en el historial del proyecto, o a mano: 16, 32, 180, 192 y 512 px sobre blanco, más un `favicon.ico` multitamaño y un *maskable* de 512 con el logo al 62 % del ancho (Android le recorta las esquinas).

## Navegación

Desde la portada de cada unidad se entra a gramática, vocabulario o ejercicios. Al final de la gramática y del vocabulario hay dos salidas: pasar a los ejercicios o ir a la otra lectura. Así puedes recorrer la unidad en el orden que te apetezca sin volver atrás.

## Verificación del contenido

La gramática cubre: pronunciación, orden SOV, el adjetivo pospuesto, los seis pronombres y los posesivos, las palabras interrogativas, el artículo `-a/-ak`, los verbos `izan`, `ukan` y `egon` en presente y en pasado, `joan`, `etorri` e `ibili` sintéticos, el caso ergativo `-k`, el dativo `-ri` con las series `zait` y `dit`, el locativo `-n` y su plural `-etan`, el adlativo `-ra`, el ablativo `-tik`, el genitivo locativo `-ko/-go`, el instrumental `-z`, el partitivo `-(r)ik`, la forma en `-t(z)en`, la negación con salto del auxiliar, la partícula interrogativa `al`, el comparativo `-ago`/`baino`/`bezain`, el superlativo `-ena` y el `-lako` causal. Todo en batua.

`verificar.py` comprueba lo mecánico: ids únicos, cinco variantes por grupo, índices de `correcta` dentro de rango, que las fichas de `orden` reconstruyan exactamente la frase, opciones sin repetir y enunciados que no se solapen entre unidades. También lista las traducciones que sirven para más de una palabra en euskera, que son las que el repaso de vocabulario solo puede preguntar en un sentido. Y contrasta las pistas con su solución: si una dice «cuatro letras» o «empieza por g», comprueba que sea verdad. Ese tipo de error no se nota nunca en la app, porque la pista se enseña pero no se usa para corregir. Se lanza con `python3 verificar.py` y conviene pasarlo después de tocar cualquier JSON: devuelve código 1 si algo está roto. Lo que no comprueba —y es lo importante— es si el euskera está bien.

Cada unidad cierra con una ficha «Cómo suena esto en Gernika» que contrasta el batua con el bizkaiera de Busturialdea: `naiz`/`naz`, `dut`/`dot`, `zaude`/`zagoz`, `zait`/`jat`, `nintzen`/`nintzan`, `nuen`/`neban`, `zegoen`/`egoan`, `eman`/`emon`, `irten`/`urten`, `ere`/`be`, el ablativo sin ka (`-tik`/`-ti`), los nombres de los días (`martitzena, eguaztena, eguena, barikua, zapatua, domeka`), el plural en `-z`, la asimilación vocálica del artículo (`etxea`/`etxie`), `nola`/`zelan`, `zergatik`/`zegaitik`, `-rekin`/`-gaz`, la partícula de duda `ete` y el diminutivo `-txu`.

Esas notas son bizkaiera general de la comarca, no fonética de Gernika pueblo. El habla cambia de localidad en localidad y la gente joven mezcla constantemente con batua. Están para entrenar el oído, no como norma.

Antes de publicarlo conviene que lo revise alguien con euskera, sobre todo las frases completas de los ejercicios de traducción y las fichas de dialecto.

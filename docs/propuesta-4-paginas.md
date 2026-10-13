# Euskaraz — de one-page a app de 4 pestañas (para Claude Design)

Documento de contexto para proponer diseño, no una decisión ya tomada.
Miguel quiere plantear la app como una PWA con 4 secciones fijas —
**Hoy · Lecciones · Diccionario · Ajustes** — en vez de la Home única
actual con navcards. Aquí va todo lo que hace falta para proponer algo
informado: qué hace la app, qué contenido y tipos de ejercicio tiene,
cómo está estructurada ahora, y qué sistema de diseño ya existe.

---

## 1. Qué es la app

Euskaraz es una app web para aprender euskera batua (con vocabulario
bizkaino/bilbaíno marcado aparte) desde castellano, nivel A1. Vanilla
JS/HTML/CSS, sin build ni framework, un solo `js/app.js` de ~2900
líneas. Backend en Supabase (auth + progreso en Postgres + audio en
Storage). Desplegada en Vercel, `euskaraz.vercel.app`.

Ya es instalable como PWA (`site.webmanifest` con
`"display": "standalone"`), pero hoy no se saca partido a ese modo: la
interfaz es la misma dentro de Safari que instalada en el escritorio
del móvil.

## 2. Por qué 4 pestañas

Hoy la navegación es: una Home con secciones apiladas (estadísticas,
"Qué toca hoy", lista de Unidades, Diccionario, ajustes al fondo) más
una topbar con botón de "volver" cuando estás dentro de algo. Todo
vive en una sola pantalla de inicio con scroll.

La idea es una barra de navegación fija con 4 destinos, pensada
específicamente para cuando la app corre en modo standalone (sin la
barra de URL del navegador, así que hay espacio de sobra para una
barra propia — ver el hilo de contexto abajo). En una pestaña normal
del navegador la interfaz seguiría siendo la actual.

1. **Hoy** — progreso general + "qué toca hoy" (acceso directo a la
   lección de turno y a los dos tipos de repaso).
2. **Lecciones** — listado completo de unidades, para entrar a
   cualquiera (no solo la de turno).
3. **Diccionario** — buscador de todo el vocabulario del curso.
4. **Ajustes** — cuenta, preferencias (modo silencioso, variante
   dialectal, incluir variantes en el repaso), reiniciar progreso.

## 3. Detección de standalone

```js
window.matchMedia('(display-mode: standalone)').matches
// + navigator.standalone === true como respaldo en iOS Safari antiguo
```

Se puede usar para renderizar la barra de pestañas solo cuando de
verdad hay espacio recuperado (instalada desde el icono), y dejar la
interfaz actual cuando se abre en una pestaña suelta del navegador. Es
una decisión fija al cargar la página, no cambia en caliente.

## 4. Inventario de pantallas actuales

Todas viven en el mismo `index.html`, mostradas/ocultadas por JS
(`mostrar(nombre)`), nunca rutas de verdad (no hay `history`/URLs por
pantalla):

| Pantalla | Qué es |
|---|---|
| `screenAuth` | Login/registro (email + contraseña) |
| `screenCuenta` | Cuenta: cambiar contraseña, modo silencioso, variante dialectal, reiniciar progreso, cerrar sesión |
| `screenHome` | Portada: stats, "Qué toca hoy", lista de Unidades, Diccionario |
| `screenUnit` | Portada de una unidad: gramática / vocabulario / práctica |
| `screenGram` | Fichas de gramática de la unidad |
| `screenVocab` | Vocabulario de la unidad, con filtro por categoría |
| `screenQuiz` | El ejercicio en curso (práctica, repaso mezclado o repaso de vocabulario — mismo motor) |
| `screenResult` | Resultado al terminar una sesión |
| `screenDicc` | Diccionario de todo el curso: buscador + filtro por letra/tipo |

**Cabecera actual** (persistente arriba): botón atrás, título de la
pantalla, barra de progreso (solo en quiz), botón de variante
dialectal (switch "Batua / [tu variante]"), icono de cuenta, contador
de aciertos (`hearts`, solo en quiz).

## 5. El contenido: tamaño y estructura de los datos

- **12 unidades** (`data/unidades/*.json`), cada una con:
  - `vocabulario`: lista de palabras/frases (`eu`, `es`, `nota`,
    `audio`, `categoria`, y opcionalmente `registro`+`variantes` para
    marcar formas dialectales bizkainas junto a la batua).
  - `gramatica`: fichas explicativas (título + cuerpo + ejemplos con
    audio), incluida siempre una sección "Cómo suena esto en Bizkaia".
  - `ejercicios`: grupos de práctica, cada uno con varias variantes
    (para no memorizar la respuesta).
- Existe también una **variante dialectal completa** en paralelo
  (`data/unidades-gernikes/`, mismo esquema, contenido de Gernika en
  vez de Bilbao) — el usuario elige cuál cargar en Ajustes.
- **~487 palabras de vocabulario**, **audio propio en Supabase Storage**
  para casi todo (Google Cloud TTS), diccionario buscable con filtro
  por letra inicial y por categoría gramatical (sustantivo/verbo/
  adjetivo/otros).
- Hay una propuesta de reestructuración a 10 unidades con subniveles
  en marcha (`docs/propuesta-10-unidades.md`) — **no es parte de este
  encargo**, pero conviene saber que el número de unidades podría
  cambiar más adelante.

## 6. Tipos de ejercicio (todos dentro de `screenQuiz`, mismo motor)

1. **Opción múltiple** (`opcion`) — elegir entre 3-4 opciones. Incluye
   la variante "ortografía": la misma palabra escrita de 3 formas, una
   correcta.
2. **Ordenar** (`orden`) — construir una frase tocando chips de
   palabras en orden.
3. **Traducir** (`traducir`) — escribir una frase en euskera a partir
   del castellano, en un `<textarea>`.
4. **Teclear** (`teclear`) — igual pero de una sola palabra
   (vocabulario), letra a letra.
5. **Emparejar** ("toca las parejas", `pares`) — tocar euskera↔castellano
   en dos columnas, con botón de audio explícito en cada palabra
   euskera.
6. **Escuchar** (dos variantes) — el prompt es un botón grande de play
   en vez de texto: "escucha y elige qué significa" (opción múltiple)
   o "escucha y tradúcelo" (teclear). Requiere que la palabra tenga
   audio narrado.

**Corrección con matices**, no solo bien/mal:
- Un acierto puede llevar una etiqueta "BIZKAIERA" si la palabra en
  juego es una variante dialectal (para no confundir con un error de
  tecleo si se responde rápido).
- Un fallo pequeño (falta un sufijo, una letra cambiada, una palabra
  suelta distinta en una frase) se trata como acierto pero avisa
  distinto: **"Casi correcto"**, en ámbar en vez de verde — tercer
  estado entre acierto y fallo.
- Las respuestas en castellano son flexibles: tildes, "el/ella" vs
  "él / ella", sinónimos y formas alternativas ("gracias" por "muchas
  gracias") se aceptan sin ser el texto exacto guardado.
- Al fallar, se muestra un diff visual (qué sobra, qué falta) en vez
  de solo la solución.

## 7. El sistema de repetición espaciada (relevante para "Hoy")

- **Repaso mezclado**: cola de ejercicios de gramática de las unidades
  ya abiertas, priorizada por calendario (lo vencido primero, luego lo
  nuevo).
- **Repaso de vocabulario**: motor propio, cola de palabras que no se
  vacía hasta acertar cada una dos veces (la segunda a distancia). El
  formato de pregunta (opción/ortografía/teclear/escuchar) varía según
  lo asentada que esté cada palabra.
- Ambos comparten un calendario por-palabra/por-grupo en
  `progreso.srs` (pasos de 1 a 120 días).
- **"Qué toca hoy"** (ya implementado en Home) resume esto en 3
  tarjetas: la lección de turno (primera unidad sin completar) +
  repaso de vocabulario + repaso mezclado, con un contador
  "pendientes/total" que baja al completar cada una. Cada tarjeta pasa
  a "¡Completado!" cuando no queda nada vencido en ese frente por hoy.

## 8. Sistema de diseño actual

Estilo "internacional/editorial": retícula estricta, tipografía como
protagonista, un único acento cromático, **cero esquinas
redondeadas** en toda la app (deliberado, no un olvido).

**Color** (variables CSS):
```
--papel:      #f2f0ec   fondo
--papel-alto: #ffffff   tarjetas/inputs
--tinta:      #161513   texto principal
--tinta-70/45/20         grises derivados de la tinta, no grises puros
--filete:     #d6d3cc   líneas divisorias finas
--acento:     #d8321b   único color de marca — también "fallo"
--bien / --bien-txt      #0caa39 / #09852d — dos tonos de verde (acierto)
--progreso-empezada  #b8601a — ámbar, estado intermedio ("casi", "casi correcto", "sigue por donde lo dejaste")
```

**Tipografía**: pareja compartida con el estudio (Ippo) — "Lastik"
para titulares grandes, "PP Neue Montreal" para todo el resto (cuerpo,
euskera, botones). El euskera se distingue del castellano por peso y
color, nunca cambiando de familia. Escala de 13px a 54px, cuerpo base
20px, retícula de 8px para todo el espaciado.

**Componentes reutilizables** ya existentes: `navcard` (fila con
título/subtítulo/badge de pendientes/flecha — la pieza base de
cualquier lista de navegación), `.vitem` (fila de vocabulario con
botón de audio), tarjetas de unidad con badge de progreso por tramos
(gris/ámbar/verde según nota), botón "Escuchar" a todo lo ancho igual
que "Comprobar", switches/checkboxes simples sin skeuomorfismo.

## 9. Restricciones técnicas a tener en cuenta

- Sin framework: cualquier propuesta se traduce a HTML generado por
  JS + CSS a mano, no hay Router ni estado reactivo — el coste de
  interactividad compleja es más alto que en React.
- No hay URLs por pantalla hoy (todo es un solo documento con
  `hidden`) — pasar a 4 pestañas con navegación fija es compatible con
  seguir así, pero es buen momento para plantear si conviene URLs de
  verdad (`history.pushState`) para poder compartir enlaces o usar el
  botón atrás del sistema.
- Mobile-first estricto — el uso real es casi 100% móvil.
- El PWA manifest y los iconos ya existen; falta la lógica de
  detección de standalone y la barra de navegación en sí.

## 10. Preguntas abiertas para la propuesta de diseño

- Durante un ejercicio activo (`screenQuiz`), ¿la barra de pestañas se
  oculta (para no robar espacio ni foco) o se queda fija con la pestaña
  "Lecciones" marcada?
- ¿"Hoy" y "Lecciones" son secciones separadas de verdad, o "Lecciones"
  es solo el acceso a la lista completa de unidades que hoy vive
  dentro de Home?
- El botón de variante dialectal (switch "Batua / [variante]") vive
  hoy en la topbar — ¿pasa a Ajustes, se queda fijo, o depende de la
  pestaña?
- ¿Cómo entra Gramática/Vocabulario/Práctica de una unidad concreta en
  este esquema? Hoy son pantallas propias a las que se llega desde la
  portada de la unidad — ¿siguen así o pasan a vivir "dentro" de la
  pestaña Lecciones con su propia navegación interna?

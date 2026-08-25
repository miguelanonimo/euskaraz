# Estado del trabajo de Ric — traspaso entre sesiones

Documento para retomar el trabajo desde otra sesión de Claude sin perder
nada de lo acordado. **Última actualización: 25 de agosto de 2026.**

Si estás leyendo esto como sesión nueva: lee esto entero antes de tocar
nada, y luego `docs/ideas-ric.md`, que es el cuaderno con el detalle.

---

## 1. Lo básico

| | |
|---|---|
| Repositorio | `miguelanonimo/euskaraz` (privado) |
| Copia local | `~/Proyectos/euskaraz` — **fuera de Dropbox a propósito**: git + Dropbox se corrompen |
| Rama de Ric | `ric/trabajo` |
| Rama principal | `main` — es de Miguel, no se toca sin hablarlo |
| App publicada | euskaraz.vercel.app (despliega desde `main`) |
| Servidor local | `python3 -m http.server 8321` desde la raíz del repo |
| Cuenta GitHub de Ric | `ric-tj` · `gh` instalado en `~/.local/bin/gh` |

**Ojo con `gh`:** el PATH solo se añadió a `~/.zshrc`, pero la shell de Ric
es bash y la escritura en `.bash_profile` fue bloqueada por permisos. Usar
la ruta completa: `~/.local/bin/gh`.

**Copia antigua en Dropbox:** `Dropbox/Ric/Tests Claude/euskaraz` es el
proyecto original de Ric, desfasado. **No trabajar ahí.** Solo sirve como
fuente de cosas que Miguel no se llevó (de ahí salió `verificar.py`).

---

## 2. Cómo trabajar con Ric

- **No es técnico.** Explicar cada paso de Git en lenguaje sencillo
  **antes** de hacerlo, sin dar por supuesto nada de programación.
- **Responder en castellano.**
- **Avisar siempre antes de cualquier cosa visible para Miguel** — push,
  merge, pull request — explicando qué va a pasar. Ric lo pidió
  explícitamente y se ha respetado toda la colaboración.
- El flujo que funciona: Ric dicta hallazgos → se anotan en
  `docs/ideas-ric.md` → un commit por hallazgo → se sube cuando Ric lo
  pide.

---

## 3. Qué es el proyecto

App web para aprender euskera batua desde castellano. Vanilla JS, sin
build ni dependencias. **Ric es el autor del original**
(jstk.org/euskaraz); el repo de Miguel es su adaptación personal, hecha
con permiso. Ahora colaboran los dos.

Decisiones cerradas del repo (están en `CLAUDE.md` y `docs/brief.md`,
**leerlos**): vanilla JS sin React · persistencia en Supabase (JSONB,
magic link) · audio con Google Cloud TTS cacheado en Supabase Storage ·
contenido batua + variantes bizkainas explícitas (esquema
`registro`/`variantes`).

---

## 4. Qué se ha hecho (todo en `ric/trabajo`)

### 4.1 · Inventario de audios mal pronunciados — CERRADO

**41 palabras** con la pronunciación mal generada, detectadas de oído por
Ric una a una. Están en tabla ordenada por unidad en `docs/ideas-ric.md`,
con qué se oye y qué debería oírse, más las frases que las arrastran.

**Diagnóstico investigado:** el proyecto no usa el Cloud TTS clásico sino
**Gemini TTS** (`gemini-2.5-flash-tts`, voz Kore), y **el euskera está en
fase *Preview*** ahí — de 66 idiomas soportados es de los 42 sin terminar.
Eso explica que falle de forma inconsistente.

**Tres vías propuestas**, de menos a más esfuerzo: (1) regenerar varias
veces y quedarse con la mejor toma; (2) trucar el texto que se envía a
sintetizar sin tocar lo que ve el usuario; (3) cambiar a la voz clásica
`eu-ES-Standard-B` con SSML `<phoneme>` — pero esa afecta a las 720
variantes del curso entero, no solo a estas palabras.

⚠️ **Bloqueado:** Ric no tiene acceso al proyecto de Google Cloud de
Miguel. Hay que pedirle que le añada como colaborador IAM con permiso de
Text-to-Speech.

**Lección aprendida, importante:** no generalizar por letras. Parecía que
«toda J falla» y resultó falso (`joan` suena mal pero «joan den astean»
suena bien). Cada audio se verifica de oído, uno por uno.

### 4.2 · Errores de contenido encontrados — anotados, sin corregir

- **u2, `02-izenordainak.json:917`** — el enunciado dice «su amigo (de
  ella)» pero la frase a reconstruir es «haren lagun **polita**», con un
  «bonito» que no aparece en el castellano.
- **u4, `04-izan.json:1069`** — la pista de «Me llamo Ane» entrega las dos
  respuestas literales en vez de orientar.
- **u9, `09-nora.json:1071` y `:1084`** — «a la izquierda» / «a la
  derecha» dan por única correcta la forma de movimiento
  (`ezkerrera`/`eskuinera`), pero entre las opciones está también la de
  ubicación (`ezkerrean`/`eskuinean`), que en castellano se traduce igual.

### 4.3 · Vocabulario nuevo — VERIFICADO Y ESCRITO

**124 palabras nuevas** repartidas en cinco sub-unidades. Todo verificado:

- **Las palabras**: contrastadas una a una contra el Hiztegi Batua de
  Euskaltzaindia (consulta automatizada al buscador oficial). 114 de 118
  confirmadas directamente, las 4 restantes a mano.
- **Las 6 dudas de criterio**: contestadas por hablantes nativos.
- **Las 28 frases de ejemplo**: revisadas y dadas por buenas por la pareja
  de Ric, de Gernika.

Registro completo con el porqué de cada decisión:
https://claude.ai/code/artifact/c5a82659-2cad-41cd-9008-696420c1a602

### 4.4 · Las cinco sub-unidades — ESCRITAS Y FUNCIONANDO

| | Título | Contenido |
|---|---|---|
| 5.1 | Familia eta animaliak | 29 palabras · 5 fichas · 6 grupos |
| 6.1 | Koloreak eta etxea | 29 palabras · 5 fichas · 5 grupos |
| 7.1 | Hilabeteak | 14 palabras · 5 fichas · 5 grupos |
| 8.1 | Janaria eta arropa | 27 palabras · 5 fichas · 5 grupos |
| 10.1 | Gorputza, urtaroak eta jaiak | 25 palabras · 6 fichas · 5 grupos |

Archivos: `data/unidades/{05b-familia,06b-koloreak,07b-hilabeteak,08b-janaria,10b-gorputza}.json`,
registrados en `data/curso.json` detrás de su unidad.

Total del curso ahora: **17 unidades, 170 grupos, 850 variantes, 487
palabras**. `verificar.py` pasa sin errores.

### 4.5 · `verificar.py` recuperado y adaptado

No existía en el repo de Miguel (nunca estuvo). Recuperado de la copia de
Dropbox y adaptado en dos puntos:

- El vocabulario solo admitía `{eu,es,nota}`; ahora acepta también
  `audio`, `categoria`, `registro` y `variantes`, y valida las variantes
  por dentro. Sin esto daba 392 errores falsos.
- La ficha de dialecto se buscaba por «Gernika»; Miguel las tituló «Cómo
  suena esto en Bizkaia». Acepta las dos.

⚠️ **Hueco pendiente:** lee las unidades desde `data/curso.json`, que solo
lista `unidades/`. La variante **`data/unidades-gernikes/` (12 archivos)
se queda sin revisar**.

⚠️ **Trampa a recordar:** `BASE = os.path.dirname(os.path.abspath(__file__))`.
El script se localiza por **su propia carpeta**, no por el directorio de
trabajo. Ejecutarlo desde fuera valida el repo equivocado —
ya pasó una vez y dio un informe falso de «todo correcto».

### 4.6 · Acceso sin cuenta en local

`js/app.js` tiene `MODO_LOCAL`, condicionado a `location.hostname` siendo
localhost. En local la app arranca sin magic link, con el progreso solo en
memoria (no se guarda nada). **En el dominio real es false siempre**: no
hay bandera que activar, habría que editar esa línea.

---

## 5. Convenciones acordadas — NO reabrir

1. **Sub-unidades, no dosificación en el repaso.** El vocabulario nuevo
   entra por sub-unidades con sus fichas y ejercicios, porque hay palabras
   que necesitan explicación y una tarjeta de repaso no tiene dónde
   ponerla. Esto **hace redundante** la idea anterior de una «pantalla de
   vocabulario nuevo» antes del repaso: son alternativas, no
   complementarias.
2. **Las sub-unidades son más ligeras que una unidad:** 5-6 grupos, no 12.
   Pero **siempre 5 variantes por grupo** — el motor las usa para no
   repetir la ronda anterior (`progreso.ultimas`).
3. **Los colores van a la 6.1**, no a la 2: es donde vive la ficha de
   adjetivos.
4. **Los meses llevan artículo**: `urtarrila`, `otsaila`, `martxoa`… No en
   forma de diccionario. Es como se usan y encaja con el resto de
   sustantivos del curso (`etxea`, `herria`).
5. **Sal y azúcar son entradas separadas**: `gatza` / `azukrea`.
6. **Criterio de qué vocabulario añadir:** completar los campos temáticos
   que cada unidad ya abre pero deja cortos (la familia traía hermanos
   pero no abuelos, etc.), no meter palabras sueltas sin relación.
7. **Los ejercicios se apoyan en material verificado.** Emparejar y opción
   sobre significado usan solo vocabulario contrastado; las frases
   completas son las 28 que revisaron los nativos. No inventar frases
   nuevas sin marcarlas como pendientes de verificar.
8. **Verificación en dos niveles:** las palabras contra Euskaltzaindia
   (`euskaltzaindia.eus/hiztegibatua`, se puede automatizar); las frases y
   el criterio de uso, contra hablantes nativos. El diccionario valida
   palabras, no gramática de frases.
9. **Tramos de color del progreso en la home** (propuesto, sin
   implementar): por debajo de 50% no se enseña número, 50-69% naranja
   («Mejor intento · X%»), desde 70% verde («Completada · X%»). El rojo no
   se usa en la home. Filosofía del original: no desanimar.

---

## 6. Pendiente

### Inmediato

- **Los 4 commits locales están sin subir.** Ric quería revisar las
  sub-unidades en local antes. Preguntarle.
- ⚠️ **Punto abierto que Ric acaba de plantear (25/08):** dice que en las
  sub-unidades **faltan explicaciones al introducir palabras nuevas —
  «siempre la traducción»— y convenciones ya acordadas.** Se hizo una
  comprobación automática de las fichas buscando palabras en `<b>` sin
  glosa cerca, y salieron sobre todo falsos positivos (los casos reales
  sí llevan traducción). **Falta que Ric precise a qué caso concreto se
  refiere** antes de tocar nada.

### Requiere a Miguel

- Visto bueno a las sub-unidades (es cambio de estructura del curso).
- **Generar los audios**: ~124 mp3 nuevos con
  `scripts/generar-audio/generar.mjs` al bucket `euskaraz-audio`. Las
  sub-unidades se escribieron **sin campo `audio`** a propósito: la app no
  pinta el botón de altavoz si falta (`js/app.js` ~línea 215), así que
  queda limpio hasta que existan. Al generarlos hay que añadir el campo.
  - Ojo con las que se añadieron tarde: `loba`, `biloba`, `aitite`,
    `aitxitxe`, `amuma`, `amama`, `txapelduna`, `txapelketa`.
- Acceso IAM al proyecto de Google Cloud para que Ric pueda ayudar.
- Decidir si las sub-unidades deben existir también en la variante
  gernikés (`data/curso-gernikes.json` → `data/unidades-gernikes/`).
  Ahora mismo **solo están en la variante bizkaiera**, que es la de
  defecto.
- Coordinar con su rama `desarrollo/diccionario-filtros`, que toca el
  mismo terreno que la propuesta de filtrar vocabulario en los repasos.

---

## 7. Cosas que salieron mal y conviene no repetir

- **Ejecutar `verificar.py` desde fuera del repo** → valida la carpeta
  equivocada y da un «sin errores» falso. Pasó, y se informó mal a Ric.
- **Generalizar patrones de fallo de audio por letra** → se afirmó que
  «toda J falla» y lo desmintió el propio Ric con «joan den astean».
- **Afirmar que `verificar.py` habría cazado los errores de contenido** →
  falso. Solo cubre lo mecánico. El `PROYECTO.md` original ya lo decía:
  «el verificador cubre lo mecánico, no lo pedagógico».
- **Caracteres homoglifos**: se coló una `а` cirílica en una opción de la
  6.1. Merece la pena escanear los JSON nuevos antes de dar nada por
  bueno.
- **Caché del navegador** al probar en local: `index.html`, `styles.css` y
  `app.js` se cachean. Si un cambio en `app.js` «no hace nada», recargar
  con un parámetro (`?v=2`) antes de buscar el fallo en otro sitio.

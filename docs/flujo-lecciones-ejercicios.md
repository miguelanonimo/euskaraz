# Flujo de lecciones y ejercicios — para diseño

Documento de referencia para Claude Design. Cubre todo lo que hoy vive
"dentro de una lección" — lo que falta catalogar además de Home,
Lecciones, Diccionario, Progreso y Ajustes: la jerarquía unidad → tema →
ficha, los dos tipos de repaso, el motor de preguntas (7 tipos de
ejercicio) y la pantalla de resultado. Describe pantallas y estados, no
decide layout — eso es justo lo que se le pide a la propuesta de diseño.

---

## 1. Cómo se organiza el contenido

```
Curso
 └─ Unidad (10 en total)
     └─ Tema / subnivel (id "4.3", "7.1"... — entre 4 y 7 por unidad)
         ├─ Explicación — una o varias fichas de gramática
         ├─ Vocabulario — lista de palabras del tema
         └─ Practicar — los ejercicios del tema
     └─ Test de la unidad — mezcla de todos sus temas
```

Cada **tema** es una porción pequeña y autocontenida: su propia
explicación, su propio vocabulario, sus propios ejercicios. Un tema
puede estar "en preparación" (aparece en la lista, pero no se puede
abrir — sin contenido todavía).

## 2. Navegación dentro de una unidad

1. **Portada de la unidad** — número, título en euskera, subtítulo en
   castellano, objetivo de la unidad, y la **lista de temas** (una fila
   por tema + una fila final para el test).
2. **Fila de un tema** en esa lista, con tres estados:
   - *Pendiente*: solo el resumen de qué trae ("3 explicaciones · 12
     palabras · 6 ejercicios").
   - *Empezado*: se ha entrado, pero no se ha superado (etiqueta
     "empezado").
   - *Superado* (≥70%): marca ✓ + porcentaje, fila resaltada.
3. **Portada del tema** — número + título (euskera con castellano
   debajo), resumen, y hasta **tres tarjetas de acceso**:
   - *Explicación* → pantalla de fichas de gramática.
   - *Vocabulario* → lista de palabras del tema.
   - *Practicar* → arranca el motor de preguntas (sección 4).

   Solo aparecen las tarjetas de lo que el tema realmente tiene (un
   tema puede no tener, por ejemplo, ficha de gramática propia).
4. **Fila del test** — al final de la lista de temas de la unidad,
   visualmente distinta ("Test de la unidad · Todo lo anterior
   mezclado · 12 ejercicios"). Se supera igual que un tema (≥70%), y
   ES lo que marca la unidad entera como completada.

## 3. El "menú de ruta" de la cabecera

La cabecera, dentro de una unidad o un tema, es tocable: abre un panel
con pestañas (unidades / temas de la unidad actual) para saltar
directamente a otra unidad o a otro tema sin volver atrás pantalla por
pantalla.

## 4. El motor de preguntas (común a Practicar, Test, y los dos repasos)

Es una única pantalla de "ejercicio en curso", reutilizada en los
cuatro contextos que producen preguntas. Estructura común de la
pantalla:

```
┌─────────────────────────────────┐
│ [barra de progreso de la sesión]│
│ INSTRUCCIÓN (mayúsculas, gris)  │
│ [etiqueta BIZKAIERA] (opcional) │
│ PROMPT (frase en castellano,    │
│  o un botón grande "Escuchar")  │
│                                  │
│  [zona de interacción del tipo] │
│                                  │
├─────────────────────────────────┤
│ [Comprobar]                     │
└─────────────────────────────────┘
```

- **Etiqueta BIZKAIERA**: aparece cuando la palabra en juego es una
  variante dialectal (no la forma estándar) — para no confundirla con
  un error de tecleo si se responde rápido.
- **Al comprobar**, un panel de feedback sustituye la barra de acción,
  con **tres estados posibles** (no solo bien/mal):

| Estado | Cuándo | Color | Título tipo |
|---|---|---|---|
| **Bien** | acierto exacto | verde | "¡Oso ondo!" |
| **Casi correcto** | fallo pequeño que se da por bueno (falta un sufijo, una letra en palabra larga, una palabra suelta distinta en una frase) — palabras de 3 letras o menos no dan este margen | ámbar | "Casi correcto" |
| **Mal** | fallo real | rojo | "No exactamente" + la solución, marcando qué sobra/falta |

  Al acertar (bien o "casi"), si la respuesta correcta está en
  euskera y tiene audio grabado, **se reproduce sola** junto al
  feedback.

### 4.1 · Los 7 tipos de ejercicio

Cada uno usa una zona de interacción distinta; instrucción y prompt
son siempre iguales por fuera.

1. **Opción múltiple** — 4 botones en columna, se elige uno y se
   comprueba. Incluye la variante "ortografía": las 4 opciones son la
   misma palabra escrita de distintas formas, solo una correcta.
2. **Ordenar** — palabras sueltas en una "bolsa" abajo; se van tocando
   en el orden correcto y se apilan arriba, formando la frase. Se
   puede sacar una ficha ya puesta tocándola. La bolsa incluye algún
   distractor (palabra que no pertenece a la frase).
3. **Escribir** *(nuevo)* — como "ordenar", pero cada palabra de la
   frase es un hueco de texto que hay que teclear; la misma bolsa de
   palabras se queda visible debajo **solo como ayuda visual, no se
   puede tocar**. Cada hueco acertado se pone verde y se bloquea, y su
   ficha correspondiente se apaga en la bolsa. **Dos intentos por
   hueco**: al segundo fallo el hueco se cierra en rojo y ya no acepta
   más texto — el ejercicio cuenta como fallado aunque el resto de
   huecos estén en verde. Los signos de puntuación sueltos (el "¿"/"?")
   se muestran fijos, no como hueco.
4. **Traducir** — un área de texto libre (2 líneas), se escribe la
   frase completa en euskera. Puede llevar una pista corta debajo del
   prompt.
5. **Teclear** — como traducir, pero de una sola palabra suelta (1
   línea). Puede pedir escribir en euskera o —en el formato de
   escuchar— en castellano.
6. **Toca las parejas** — dos columnas (euskera / castellano) con 4
   palabras cada una, desordenadas; se toca una de cada columna para
   emparejar. Acierto → las dos se ponen verdes y se bloquean. Fallo →
   parpadeo rojo breve y se sueltan. Cada palabra en euskera lleva su
   propio botón de audio. **Se autocorrige sola** al completar las 4
   parejas — no hay botón "Comprobar" en este tipo.
7. **Escuchar** *(dos variantes, prompt = audio en vez de texto)* — en
   vez de la frase en castellano, un botón grande "Escuchar" que
   reproduce la palabra/frase en euskera (y se puede volver a tocar
   para repetir):
   - *Escuchar y elige* — opción múltiple sobre qué significa.
   - *Escuchar y tradúcelo* — teclear su traducción al castellano.

### 4.2 · Los cuatro contextos que producen estas preguntas

| Contexto | De dónde sale el contenido | Tamaño de la sesión |
|---|---|---|
| **Practicar** (dentro de un tema) | los ejercicios propios del tema | los del tema + 2 de escuchar |
| **Test de la unidad** | ejercicios de "test" de la unidad, completados con más de sus temas si hace falta | 12 preguntas fijas |
| **Repaso mezclado** | ejercicios de gramática de **unidades ya superadas** (con su test aprobado) | 15 + hasta 3 de escuchar |
| **Repaso de vocabulario** | palabras de todos los temas ya "desbloqueados" (se ha entrado a su explicación o su vocabulario) — es acumulativo, no se pierde nada hacia atrás | cola de 14 palabras, con repetición espaciada (ver 4.3) |

### 4.3 · Repaso de vocabulario: mecánica distinta

No es una lista fija de preguntas — es una **cola** que no se vacía
hasta que cada palabra se acierta **dos veces** (la segunda, a
distancia de varias preguntas). Un fallo la devuelve más cerca, en un
formato más fácil; hay un tope de piedad (a partir de seis fallos, la
palabra sale igual). El formato de cada pregunta (opción, ortografía,
teclear, escuchar) no es fijo por palabra — varía, inclinado hacia el
formato más exigente cuanto más asentada esté esa palabra en el
calendario de repaso.

## 5. Pantalla de resultado

Al vaciar la cola/lista de la sesión, una pantalla de cierre con:

- **Título + subtítulo**, en 4 escalones según el % de aciertos:
  Bikain! (100%) / Oso ondo! (≥80%) / Ondo! (≥70% en práctica, ≥50% en
  repasos) / Ia-ia… (por debajo). Solo el último escalón se pinta en
  color neutro/de aviso — los otros tres son variantes de "bien".
- Si el resultado es de un **tema**, y quedan temas sin superar en la
  unidad, lo dice ("Te quedan 2 temas en la unidad").
- Si es de **repaso de vocabulario**, lista aparte de "Las que
  costaron" — las palabras falladas durante la sesión, con su
  traducción, para no tener que ir a buscarlas al diccionario.
- Acciones para volver a la portada de la unidad/tema o a la Home,
  según de dónde se vino.

## 6. Tabla resumen de constantes (por si el diseño necesita cifras reales)

| Qué | Valor |
|---|---|
| Preguntas del test de unidad | 12 |
| Tamaño de sesión de repaso mezclado | 15 (+ hasta 3 de escuchar) |
| Tamaño de cola de repaso de vocabulario | 14 palabras |
| Preguntas de escuchar coladas en "Practicar" de un tema | 2 |
| Umbral para superar un tema/test/unidad | 70% |
| Intentos por hueco en "Escribir" antes de cerrarlo en rojo | 2 |
| Unidades del curso | 10 |
| Temas por unidad | 4–7 |

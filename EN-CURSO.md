# ¿Quién está tocando `rediseno` ahora?

Miguel y Ric trabajan en la misma rama `rediseno`, cada uno con su propia
sesión de Claude, de forma escalonada — sin rama propia por persona, para
no duplicar trabajo ni crear fusiones. Este archivo es el aviso de "estoy
aquí" para no pisarse, sobre todo en `css/styles.css` y `js/app.js`, que
son los que más se cruzan.

**Antes de tocar código en `rediseno`:**
1. `git pull origin rediseno` — partir siempre de lo último.
2. Mirar este archivo. Vacío = vía libre. Si hay una línea, avisar a esa
   persona antes de tocar los mismos archivos, o esperar a que la borre.

**Al empezar un bloque de trabajo**, añadir aquí una línea con nombre,
fecha/hora y qué se va a tocar, y hacer commit+push de solo este archivo
(commit rápido, separado del trabajo real):

- **Ric** · 01/10/2026 13:37 — traigo a `rediseno` el contenido de `main` que falta
  (6 commits: ejercicios recolocados, 12.3, el «bonito» del 2.2, fuera
  «senidea», test afinado). Toco `data/`, `CHANGELOG.md` y `CLAUDE.md`.
  **`css/styles.css` y `js/app.js` NO se tocan**: en el cruce del CSS gana
  la versión del rediseño.

**Al terminar ese bloque** (al hacer push del cambio real), borrar la
línea propia y volver a dejar el archivo vacío, con su propio commit.

Si dos personas empujan a la vez sin haberse visto aquí, gana quien
empujó primero: la otra hace `git pull --rebase origin rediseno` y
resuelve el conflicto a mano (o se lo pide a su Claude, mirando el diff).

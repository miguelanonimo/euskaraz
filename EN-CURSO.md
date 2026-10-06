# ¿Quién está tocando `rediseno` ahora?

Miguel y Ric trabajan en la misma rama `rediseno`, cada uno con su propia
sesión de Claude, de forma escalonada — sin rama propia por persona, para
no duplicar trabajo ni crear fusiones. Este archivo es el aviso de "estoy
aquí" para no pisarse, sobre todo en `css/styles.css` y `js/app.js`, que
son los que más se cruzan.

**Dos carriles:** `main` es el contenido (texto, audio, `data/`) — ese
sigue siendo el carril de siempre (`ric/trabajo` → `ric/publicar`).
`rediseno` es solo diseño visual. Traer contenido fresco de `main` a
`rediseno` para probar con datos reales (como hiciste el 01/10) es un
bloque de trabajo normal: se anota aquí igual que cualquier otro.

**Sin preview de Vercel en `rediseno`:** los pushes a esta rama ya no
generan deploy (`vercel.json`, a propósito) — esperar 1-2 minutos por
cada cambio para comprobarlo en una URL no compensa. Para ver tus
cambios al momento: `python3 scripts/servidor-local.py [puerto]` (por
defecto 8321) y abre `http://localhost:<puerto>/`. Sirve el repo
entero sin caché, así que un refresh del navegador basta — no haga
falta tocar el `?v=` de `index.html`. No uses `python3 -m http.server`
a secas: ese sí cachea, y es como lo que te pasó antes con arreglos
que parecían no aplicados.

**Antes de tocar código en `rediseno`:**
1. `git pull origin rediseno` — partir siempre de lo último.
2. Mirar este archivo. Vacío = vía libre. Si hay una línea, avisar a esa
   persona antes de tocar los mismos archivos, o esperar a que la borre.

**Al empezar un bloque de trabajo**, añadir aquí una línea con nombre,
fecha/hora y qué se va a tocar, y hacer commit+push de solo este archivo
(commit rápido, separado del trabajo real):

- Miguel, 06/10/2026 — animación de la pantalla de Unidad (temas y color que avanza). Toca `js/app.js` y `css/styles.css`.

**Al terminar ese bloque** (al hacer push del cambio real), borrar la
línea propia y volver a dejar el archivo vacío, con su propio commit.

Si dos personas empujan a la vez sin haberse visto aquí, gana quien
empujó primero: la otra hace `git pull --rebase origin rediseno` y
resuelve el conflicto a mano (o se lo pide a su Claude, mirando el diff).

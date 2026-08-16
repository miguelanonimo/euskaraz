# Euskaraz (adaptación) — Brief técnico para Claude Code

*Preparado en el proyecto "10-Year Plan" · Base: código de jstk.org/euskaraz/ (con permiso del autor)*

---

## 1. Objetivo

Herramienta personal para aprender euskera batua desde cero, partiendo del código
de la app de un amigo (vanilla JS, sin build, sin dependencias). El registro es
batua con vocabulario y expresiones bizkainas/bilbaínas activamente incluidas
(ver sección 5). Uso personal ahora; posible comercialización más adelante
(no es el objetivo actual, pero el diseño de datos debe dejarlo abierto sin
retrabajo).

**Horizonte a explorar (no diseñado todavía, ver sección 10):** que la app
analice el propio progreso — qué cuesta más, qué patrones de error se repiten
— y adapte el contenido servido en consecuencia, dentro de la progresión de
niveles ya localizada (HABE/batua A1). Es una dirección a futuro, no un
requisito de las primeras fases.

---

## 2. Decisiones de arquitectura (ya cerradas — no volver a plantear)

| Decisión | Elegido | Por qué |
|---|---|---|
| Motor de la app | **Mantener vanilla JS/HTML/CSS del original**, sin migrar a React | El algoritmo de repetición espaciada ya funciona y está bien escrito. Migrar ahora sería sobre-ingeniería para un caso de uso de un solo usuario. Revisar esta decisión solo si se decide comercializar. |
| Persistencia | **Supabase**, mismo shape de datos que ya usa `localStorage`, guardado como JSONB | Cero rediseño del algoritmo de repaso. `user_id` desde el día uno para que sea multiusuario sin remigrar si se comercializa. |
| Autenticación | Supabase Auth, **magic link** (sin contraseña) | Un solo usuario por ahora; magic link es lo más simple de mantener. |
| Audio | **Google Cloud Text-to-Speech (voz `eu-ES`)**, generado una vez por palabra/frase en tiempo de autoría, cacheado como mp3 en Supabase Storage | Confirmado soporte de euskera en Cloud TTS. Verificado (agosto 2026): la capa gratuita mensual es de 1M de caracteres/mes para voces WaveNet/Neural2 y 4M/mes para voces Standard — recurrente, no de un solo uso. Todo el vocabulario de las 12 unidades (unas pocas decenas de miles de caracteres, generados **una sola vez**) cabe muy por debajo de eso. **Coste real: 0€.** Requiere activar billing en la cuenta de Google Cloud (tarjeta en el sistema) aunque no se llegue a cobrar nada. Web Speech API del navegador descartado: soporte de voz en euskera no garantizado según el SO. |
| Alcance del audio | **Solo escuchar (TTS)**, sin grabación ni corrección de pronunciación por ahora | Decisión explícita de Miguel. Revisar más adelante si se quiere añadir grabación + comparación (STT en euskera es bastante menos maduro que TTS). |
| Contenido | Reescribir manteniendo la **misma estructura de 12 unidades** (el orden temático ya coincide con progresiones A1 batua estándar) | Ver metodología en sección 5. |

---

## 3. Modelo de datos de progreso (del código original — NO cambiar la forma)

```js
// js/app.js — cargarProgreso() / anotar() / guardarProgreso()
{
  version: 2,
  unidades: {
    [unidadId]: { visitada: bool, completada: bool, mejor: number, intentos: number }
  },
  ultimas: {
    [grupoId]: indiceDeVarianteUsadaLaUltimaVez  // evita repetir variante
  },
  srs: {
    // clave = 'g:' + grupoId  (grupo de ejercicios)  ó  'v:' + palabraNormalizada (vocabulario)
    [clave]: { paso: number, toca: number /* día */, aciertos: number, fallos: number, visto: number /* día */ }
  }
}
```

Escala de repetición espaciada: `PASOS = [1, 2, 4, 8, 16, 32, 64, 120]` (días).
Acierto → sube un peldaño. Fallo → vuelve a 0. `hoy()` cuenta días locales
(no UTC) desde epoch.

**Tarea:** sustituir las dos funciones de persistencia (`cargarProgreso`,
`guardarProgreso`) por lectura/escritura contra Supabase, manteniendo
exactamente este mismo objeto como valor de una columna JSONB. El resto del
motor (`anotar`, `vencido`, `ficha`, etc.) no debería necesitar tocarse.

---

## 4. Esquema Supabase

```sql
create table public.euskaraz_progreso (
  user_id uuid references auth.users(id) primary key,
  data jsonb not null default '{"version":2,"unidades":{},"ultimas":{},"srs":{}}',
  updated_at timestamptz not null default now()
);

alter table public.euskaraz_progreso enable row level security;

create policy "solo su propio progreso"
  on public.euskaraz_progreso
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Nota de implementación: `anotar()` en el original guarda en cada respuesta.
Para no saturar Supabase con escrituras, conviene debounce (guardar 1-2s
después del último cambio, o al cambiar de pantalla / cerrar pestaña) en vez
de un upsert por cada acierto/fallo individual.

**Storage** (para los mp3 de audio):
- Bucket `euskaraz-audio`, público en lectura (son solo pronunciaciones de
  palabras sueltas, no hay dato personal).
- Convención de nombre: `unidades/{unidadId}/{claveNormalizada}.mp3`.

---

## 5. Metodología de contenido — batua de Bilbao, no de Gernika

**Corrección importante (16/08/2026):** el criterio NO es "quitar sabor
bizkaino". Miguel vive en Bilbao y quiere precisamente ese registro: batua
con vocabulario y expresiones bizkainas de uso urbano (`aupa`, `gero arte`,
etc.), porque es lo que se habla a su alrededor. Lo que hay que vigilar no es
el vocabulario, sino que la **gramática** de base sea la norma batua estándar
(no estructuras hiperlocales de un pueblo concreto como Gernika, que pueden
diferir sutilmente de cómo se habla en Bilbao aunque ambos sean bizkaino).

**Regla de trabajo revisada:** cuando se encuentre información específica de
Bizkaia (vocabulario, expresiones, notas de uso) durante la investigación de
contenido, **incluirla activamente**, no filtrarla. Es información relevante
y bienvenida, no un sesgo a corregir.

**Fuentes de referencia:**
- **Euskaltzaindia** (euskaltzaindia.eus) — academia oficial, su diccionario
  marca registro y uso dialectal por entrada. Sirve para verificar que una
  forma bizkaina es reconocida y correcta (no inventada), no para
  descartarla por ser regional.
- **HABE** (organismo público del Gobierno Vasco para enseñar euskera a
  adultos) — referencia de progresión y de qué se considera vocabulario A1
  estándar.
- Cursos A1 estructurados en Euskara Batua confirman que la progresión
  temática del original ya es correcta: saludos → pronombres → preguntas →
  verbo izan → números → ubicación → hora → verbos de acción → direcciones →
  gustos → pasado → repaso. **No tocar el esqueleto.**

**Qué revisar en cada unidad:** la gramática (que siga norma batua, no una
conjugación o declinación hiperlocal de Gernika) y que el vocabulario sea
real y verificable — no necesariamente "neutro". El vocabulario bizkaino que
ya trae el original (`aupa`, `gero arte`...) se mantiene; si al investigar
aparecen más formas típicas de Bilbao que el original no recoge, se añaden.

**Regla de trabajo:** al reescribir cada unidad, dejar un comentario (fuera
del JSON que lee la app, en un archivo de notas aparte) de qué se cambió y
por qué, para que Miguel pueda auditar el criterio sin tener que saber
euskera él mismo.

### 5.1 — Enseñar ambas formas explícitamente (batua + bizkaina)

Refinamiento pedido por Miguel: no elegir una sola forma, sino aprender las
dos a la vez, etiquetadas por registro. Por ejemplo, en la unidad de
saludos: `kaixo` como forma normativa/universal, y `aupa` como forma
bizkaina, ambas presentes, ninguna oculta.

Esto requiere ampliar el esquema de vocabulario del original (que hoy es
`{eu, es, nota}`) con un campo de variantes:

```json
{
  "eu": "kaixo",
  "es": "hola",
  "registro": "batua",
  "nota": "Vale a cualquier hora, en cualquier zona de Euskal Herria.",
  "variantes": [
    { "eu": "aupa", "registro": "bizkaiera", "nota": "Muy usado en Bilbao entre conocidos." }
  ]
}
```

Implicaciones:
- Los ejercicios de emparejar/opción múltiple pueden usar indistintamente la
  forma normativa o la variante como pregunta, dejando claro en la
  instrucción o en el color/etiqueta qué registro es cada una.
- El diccionario (pantalla de consulta libre) debe mostrar ambas juntas, no
  la variante escondida en una nota de texto suelta como hace el original.
- Para los futuros ejercicios de "escribir" (sección 9), la lista
  `alternativas` puede aceptar ambas formas como correctas, aunque quizá
  conviene indicar cuál se está pidiendo específicamente en unidades más
  avanzadas, para no mezclar registros sin querer en una frase.

---

## 6. Pipeline de audio (Google Cloud TTS)

1. Script de autoría (Node o Python, se ejecuta una vez por unidad, no en
   producción): recorre el JSON de la unidad, para cada palabra de
   `vocabulario` (y frases relevantes de `ejercicios`) llama a la API de
   Cloud TTS con voz `eu-ES`, guarda el mp3 resultante.
2. Sube los mp3 al bucket `euskaraz-audio` de Supabase Storage con la
   convención de nombre de la sección 4.
3. En el JSON de la unidad, añadir un campo `audio` (ruta relativa) a cada
   entrada de vocabulario.
4. En el frontend: botón de altavoz junto a cada palabra → `<audio
   src="{urlPublicaDelBucket}/{audio}">`.

Coste esperado: trivial (tarifa por carácter de Cloud TTS, y solo se genera
una vez por palabra, no por reproducción).

---

## 7. Roadmap de fases (dentro de Claude Code)

**Fase 1 — Fontanería, sin tocar contenido**
Portar persistencia a Supabase (schema + auth + debounce de guardado).
Validar con el contenido *original* tal cual (sin reescribir todavía) que
todo sincroniza entre dispositivos correctamente. Esto aísla los bugs de
infraestructura de los bugs de contenido.

**Fase 2 — Audio**
Montar el script de generación TTS, generar audio para Unidad 1 (piloto),
añadir el botón de escuchar en el frontend.

**Fase 3 — Contenido**
Reescribir Unidad 1 siguiendo la metodología de la sección 5, como piloto
completo (contenido + audio + progreso). Validar con Miguel antes de
replicar a las 11 unidades restantes.

**Fase 4 — Ejercicios de escribir (futuro, no inmediato)**
Ver diseño en sección 9.2, con el principio de corrección de la 9.1.

**Fase 5 — Conversación por chat con IA (futuro, más avanzado)**
Ver diseño en sección 9.3.

**Fase 6 — Horizonte largo, sin diseñar todavía**
Input comprensible (diálogos/textos cortos por unidad, sección 8) y análisis
adaptativo de progreso (sección 9.4). Se retoman después de validar las
fases anteriores.

---

## 8. Metodologías de aprendizaje aplicadas (investigación, 16/08/2026)

Miguel pidió comprobar si hay metodologías educativas con evidencia real
detrás que podamos aplicar. Resumen de lo consultado, contrastado contra lo
que el motor del original ya hace:

| Método | Evidencia | ¿Ya lo tiene el original? |
|---|---|---|
| **Repetición espaciada** (efecto Ebbinghaus, algoritmos tipo SuperMemo/Anki) | Muy sólida; aumenta la retención frente a repasar todo junto | **Sí** — es exactamente el sistema `PASOS`/`srs` ya descrito en la sección 3 |
| **Retrieval practice / recuerdo activo** (contestar en vez de releer) | Muy sólida; recordar algo activamente fija más la memoria que repasarlo pasivamente | **Sí, parcialmente** — los ejercicios de opción/pares/orden ya exigen recordar, no solo leer |
| **Interleaving** (mezclar temas/tipos en vez de practicar en bloques) | Sólida; mejora la capacidad de discriminar entre ítems parecidos | **Sí, parcialmente** — el "repaso mezclado" ya interleava entre unidades |
| **Feedback inmediato** | Sólida para aprendizaje de idiomas/procedimental | **Sí** — la app corrige nada más responder cada ejercicio |
| **Producción activa** (escribir/hablar, no solo reconocer) | Sólida (hipótesis del output de Swain); fuerza un procesamiento más profundo y revela huecos que el reconocimiento no muestra | **No** — todos los tipos actuales (`pares`, `opcion`, `orden`, `traducir`) son de reconocimiento/elección, ninguno de producción libre |
| **Input comprensible** (Krashen, "i+1"): exposición a contenido natural ligeramente por encima del nivel actual, no solo vocabulario suelto | Sólida como complemento (no sustituto) de la práctica activa | **No** — el original es enteramente de vocabulario y gramática aislados, sin textos o diálogos conectados para leer/escuchar en contexto |

**Lectura práctica:** el motor que ya tienes cubre bien la mitad de lo que
la evidencia recomienda (repetición espaciada, recuerdo activo, algo de
interleaving, feedback inmediato). Los dos huecos reales son exactamente
donde apuntaban tus dos ideas: **producción activa** (tu "escribir" y el
chat con IA, sección 9) y algo que tú no habías planteado todavía —
**input comprensible**: pequeños diálogos o textos cortos por unidad,
naturales y conectados (no solo la lista de vocabulario suelta), para
leer/escuchar en contexto una vez dominado el vocabulario base de esa
unidad. Lo dejo anotado como posible Fase futura adicional, no urgente,
pero con buen respaldo si en algún momento quieres ampliar más allá de
escribir y del chat.

---

## 9. Funcionalidades futuras (planificadas, no inmediatas)

Se documentan aquí para que el diseño de datos actual (Fase 1-3) no las
bloquee sin querer, pero no se construyen hasta que se llegue a esa fase.

### 9.1 — Principio de corrección: errores grandes vs. pequeños

Diseño para no desincentivar (pedido explícito de Miguel), aplicable tanto a
"escribir" como al futuro chat con IA:

**Clasificación de errores:**
- **Cosméticos** (no cuentan como fallo): mayúscula/minúscula, signos de
  interrogación/exclamación de apertura, espacios de más, tilde de más o de
  menos si la hubiera. Se normalizan antes de comparar — ni siquiera llegan
  a evaluarse como error.
- **De contenido** (sí cuentan como fallo, y sí resetean el paso de
  repetición espaciada en `srs`): palabra equivocada, forma verbal
  incorrecta, sufijo/declinación incorrecta, orden de palabras que cambia el
  sentido.

**Visualización de la corrección:** mostrar la respuesta del usuario y la
forma correcta juntas, con la diferencia resaltada carácter a carácter —
no solo "❌ incorrecto" sin más contexto. Ejemplo con tu propio caso:

```
Tú escribiste:   caixo
Forma correcta:  kaixo
                 ^
```

Esto deja ver exactamente qué letra falló, sin necesidad de explicar la
regla completa cada vez (aunque si es la primera vez que aparece ese patrón,
sí conviene una nota breve, como en tu ejemplo: "el saludo se escribe con
K, no con C").

**Aplicado a la repetición espaciada:** un error cosmético no debería tocar
`paso`/`toca` en el modelo de la sección 3 — solo los errores de contenido
cuentan como `fallo`. Esto evita que un simple despiste de formato tire
hacia atrás el calendario de repaso de una palabra que en realidad ya
dominas.

### 9.2 — Ejercicios de tipo "escribir"

El original ya tiene un tipo `traducir`, pero es de elección/verificación,
no de escritura libre. Añadir un tipo nuevo:

```json
{
  "tipo": "escribir",
  "instruccion": "Escribe en euskera: ¿qué tal?",
  "direccion": "es-eu",
  "objetivo": "zer moduz?",
  "alternativas": ["zer moduz"],
  "pista": "Es una pregunta de dos palabras."
}
```

Notas de diseño:
- `alternativas` recoge variantes válidas (con/sin signo de interrogación,
  con/sin mayúscula inicial) para no penalizar por formato.
- Normalizar antes de comparar: minúsculas, trim, opcionalmente ignorar
  puntuación final.
- Decidir si se acepta coincidencia exacta o con tolerancia a pequeños
  errores tipográficos (distancia de Levenshtein baja) — esto último da
  mejor experiencia pero es una decisión de producto, no solo técnica: hay
  que decidir cuánto margen de error se considera "sabías la palabra".
- Encaja de forma natural en el motor de ejercicios ya existente (mismo
  patrón que `pares`/`opcion`/`orden`); es la ampliación más barata de las
  dos funcionalidades futuras.

### 9.3 — Conversación por chat con IA, corregida en línea

Más ambicioso. Diseño de referencia:

**Arquitectura:** un Supabase Edge Function como intermediario — nunca
llamar a la API del modelo desde el cliente, porque expondría la clave de
API. El frontend manda el historial de la conversación + el id de la
unidad; la función añade el contexto de la lección y llama al modelo.

**Contexto por lección:** el system prompt de cada conversación se
construye con el vocabulario y la gramática *ya vistos* hasta esa unidad
(se puede generar automáticamente a partir del JSON de la unidad y las
anteriores). Esto evita que la IA use palabras que Miguel todavía no ha
estudiado.

**Formato de corrección (como en tu ejemplo):**
El modelo responde siempre en euskera de forma conversacional; si detecta
un error en el turno del usuario, añade una segunda línea de corrección.
Para que el frontend pueda separar "respuesta" de "corrección" de forma
fiable, conviene pedir salida estructurada (dos campos, no texto libre
mezclado) en vez de parsear un formato de texto con delimitadores.

**Elección de modelo y coste real (verificado 16/08/2026):** dos opciones
razonables — API de Claude (Anthropic) o Gemini. Como ya trabajas dentro del
ecosistema Claude, la API de Claude encajaría de forma más directa.

**Importante — no es lo mismo que la suscripción de Claude.ai:** la API de
Claude para construir esta app es un producto de facturación **separada**
de cualquier suscripción de pago de Claude.ai (Pro/Max/Code) que Miguel ya
tenga. Hace falta crear una cuenta de API/Consola aparte, con su propio
método de pago. Suele traer unos créditos de bienvenida gratuitos al
crearla.

Sobre lo de "siempre herramientas gratuitas": no existe una API de calidad
suficiente que sea gratis de verdad para esto — pero a tu volumen de uso
(conversaciones cortas, un único usuario) el coste real es prácticamente
cero, no una cuota mensual. Con el modelo más barato de Claude (Haiku 4.5,
1$/5$ por millón de tokens de entrada/salida) una conversación de práctica
de tamaño normal cuesta fracciones de céntimo; cientos de intercambios al
mes seguirían estando por debajo de un euro. Lo que sí importa más que el
coste es acotar bien el alcance de la conversación al vocabulario de la
lección — el euskera es una lengua de pocos recursos para cualquier modelo,
y cuanto más libre sea la conversación, más probable es que aparezcan
errores no detectados. Conviene que supervises tú mismo (o alguien con más
nivel) una muestra de conversaciones reales antes de confiar en las
correcciones a ciegas, especialmente al principio.

**Corrección aplicada:** usa el mismo principio de errores grandes vs.
pequeños de la sección 9.1 — no marcar como error un despiste cosmético, y
mostrar la forma correcta junto a lo que escribiste, no solo señalar que
está mal.

**Alcance ya decidido:** de momento solo texto (escribir en el chat), sin
grabación de voz ni reconocimiento de pronunciación — eso queda fuera por
ahora según lo hablado en la sección de audio.

### 9.4 — Análisis adaptativo de progreso (horizonte más lejano, sin diseñar aún)

Idea de Miguel: que la app analice su propio progreso (qué le cuesta más,
qué patrones de error se repiten) y adapte lo que le sirve, dentro de la
progresión de niveles ya localizada. Nota técnica: el modelo de datos `srs`
de la sección 3 ya guarda `aciertos`/`fallos` por ítem, así que la base para
esto ya existe sin cambios — lo que faltaría es una capa de análisis encima
(por ejemplo, detectar que fallas sistemáticamente un patrón gramatical
concreto, no solo palabras sueltas) y una forma de traducir eso en qué
priorizar en el siguiente repaso. No se diseña en detalle todavía; se deja
anotado para retomar después de las Fases 1-5.

---

## 10. Pendiente / a confirmar sobre la marcha

- Cuenta de Google Cloud con billing activado para Cloud TTS (coste esperado
  mínimo, pero requiere tarjeta).
- Alojamiento final: ¿Netlify (como ya usa Miguel) con dominio propio o
  subdominio, o mantenerlo privado sin publicar mientras sea solo personal?
- Confirmar con el autor original el uso/adaptación del código antes de
  cualquier publicación pública.

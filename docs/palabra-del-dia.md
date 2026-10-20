# Gaurko hitza — la palabra del día

Una palabra por día, atada al calendario. Las entradas viven en `data/palabras-del-dia.json`.

## Formato de cada entrada

| Campo | Qué es | Obligatorio |
|---|---|---|
| `fecha` | `MM-DD`. Se repite cada año (ej. `"10-11"`). | sí |
| `eu` | La palabra en euskera. | sí |
| `es` | Su significado, en grande en la cara de atrás. | sí |
| `nota` | Matiz bajo el significado («de un camino o de una carretera»). | no |
| `audio` | Ruta del mp3 en el bucket (`unidades/…/palabra.mp3`). Sin ella no sale el botón de escuchar. | no |
| `partes` | `[{ "eu": "nora", "es": "a dónde" }, …]`. Si no hay, se oculta «¿Cómo está hecha?». | no |
| `contexto` | Párrafo de uso o curiosidad. | no |
| `pistas` | Hasta **2** textos; se descubren de uno en uno con «ver pista». | no |

## Cómo funciona

- Sin entrada para el día de hoy, la app enseña una palabra provisional del vocabulario del curso.
- La palabra abierta se apunta en el progreso (`progreso.palabras[día]`). Entra al diccionario con el sol en el sitio del indicador de unidad, aunque no sea del curso.
- La carta usa el color de la lección en curso y se gira («ver significado» / «ver palabra»).
- Antes de dar por buena una palabra, verifícala (ver `GRAMATIKA.md`).

## Ideas pendientes (de Ric, 21/10/2026)

- **El sol del diccionario tiene que ser clicable.** Hoy es solo un icono junto a la palabra que ya salió como palabra del día. La idea: al tocarlo se abre directamente la carta de esa palabra, igual que desde Hoy.
- **Deslizar para pasar a la siguiente.** Con la carta abierta desde el diccionario, el gesto (y las flechas del teclado en ordenador) lleva a la carta de la siguiente palabra del día que ya hayas visto. Sería la lista de palabras abiertas, no las que aún no han salido.
- **Matiz sobre el contenido:** *udazkena* es una palabra que el curso sí enseña, en el tema del calendario (lección 6). Por eso aparece con su audio y su ficha, y no es una palabra «nueva» para quien ya llegó ahí. Está bien que salga como palabra del día, pero conviene tenerlo en cuenta al elegir las palabras: mejor que sean de la época del año y, cuando se pueda, que no se repitan con el temario.

Sin implementar todavía: la carta se abre hoy solo desde la tarjeta de Hoy; hace falta decidir cómo se ordena la lista de palabras vistas (por fecha de apertura o por orden del calendario) y qué pasa en los extremos.

## Criterio de contenido (Ric, 20/10/2026)

- **La palabra del día no debería estar en el temario.** La idea es que sean unas 360 palabras más que se aprenden fuera de las lecciones, una por día del año. Ric prepara el listado con ese criterio.
- Si al final alguna sí coincide con el curso, **al pinchar su sol en el diccionario se va a la lección**, no a la carta (ya está así). Las palabras que no son del curso abren su carta y entran al diccionario al abrirlas.
- De las seis de la tanda de prueba, *udazkena* (lección 6) y *euria* (lección 10) sí están en el curso; *gaztaina*, *sagardoa*, *lainoa* y *norabide* no.

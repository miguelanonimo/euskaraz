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

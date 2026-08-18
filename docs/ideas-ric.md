# Ideas de Ric

Notas de revisión de la app (euskaraz.vercel.app), escritas mientras la uso.
Cada idea se comenta con Miguel antes de darla por decidida. Cuando una idea
se implemente o se descarte, se anota aquí para que quede el rastro.

Formato de cada entrada: fecha · qué he visto · qué propongo.

---

## Pendientes de comentar con Miguel

### Audios con pronunciación mal generada (para re-generarlos en tanda)

- **2026-08-18 · `hondartza` (unidad 9, "playa").** En el Diccionario, el
  audio la pronuncia "hondErtza", con E. Revisar también los otros dos
  audios de la unidad 9 que contienen la palabra, por si arrastran el
  mismo error: `unidades/u9/hondartzara-noa.mp3` («Hondartzara noa») y
  `unidades/u9/non-dago-hondartza.mp3` («Non dago hondartza?»).
  El archivo afectado principal es `unidades/u9/hondartza.mp3` (bucket
  `euskaraz-audio` de Supabase Storage); el generador está en
  `scripts/generar-audio/generar.mjs`.

## Acordadas y en marcha

## Implementadas

## Descartadas (y por qué)

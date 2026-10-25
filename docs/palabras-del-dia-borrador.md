# Palabras del día: tanda de prueba (superada)

Este documento recogía las seis palabras de prueba que se redactaron el 20/10/2026 mientras la función se montaba (norabide, hostoa, ekaitza, gaztaina, sagardoa, lainoa). **Ya no sirven:** el 22/10/2026 Ric las sustituyó por su lista de 365 palabras, una por día del año (`data/palabras-del-dia.json`), verificada en Elhuyar.

Para revisar los audios de la lista de Ric:

- Todas las entradas llevan `"revisar": true` hasta que Ric las dé por buenas.
- 101 audios se generaron con `scripts/generar-audio/generar-palabras-del-dia.mjs` (voz Kore y las notas fonéticas de siempre, sin escuchar). Salen en el bucket como `palabras-del-dia/<palabra>.mp3`.
- «Aste Nagusia» y «Urriko azken astelehena» ya tenían audio en el curso y reutilizan ese.
- El generador no repite lo que ya existe: para regenerar una palabra, vacía su campo `audio` y borra o renombra su mp3, y vuelve a lanzarlo.

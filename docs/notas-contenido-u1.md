# Notas de contenido — Unidad 1 (Kaixo!)

Registro de cambios de la Fase 3 (piloto), para poder auditar el criterio
sin saber euskera. Ver metodología en `docs/brief.md` sección 5.

## Qué se cambió

**Esquema de vocabulario ampliado con `registro` + `variantes`** (sección
5.1), aplicado solo donde había una pareja batua/bizkaiera verificable:

- `kaixo` (batua) ↔ `aupa` (bizkaiera). Confirmado por dos fuentes
  independientes: en bizkaiera es raro oír "kaixo", predominan "aupa" y
  variantes (epa, iepa) — [Diccionario de Bilbao](https://diccionario.bilbao.im/i/aupa),
  [Untranslatable](https://untranslatable.co/p/blankarenina/aupa).
- `zer moduz?` (batua) ↔ `zelan zagoz?` (bizkaiera). "Zelan" es el "nola"
  (cómo) bizkaino; "Zelan zagoz?" equivale a "Zer moduz zaude?". Ya estaba
  mencionado en la lectura de gramática de la unidad ("Cómo suena esto en
  Gernika"), pero no como vocabulario activo — ahora se enseña también ahí,
  con su propio audio.

Las dos formas quedan visibles juntas en Vocabulario y en el Diccionario,
etiquetadas por registro (chip "bizkaiera" en naranja), nunca la variante
escondida solo en una nota de texto.

## Qué NO se cambió (y por qué)

- **`gero arte` no se fusionó como variante de `ikusi arte`.** La nota
  original decía "muy usado en Bizkaia", pero no encontré ninguna fuente
  que confirme que sea una forma dialectal bizkaina de "ikusi arte" — son
  dos despedidas batua estándar con matiz distinto ("gero arte" implica
  más cercanía en el tiempo). Se suavizó la nota para no afirmar un
  contraste dialectal sin verificar (sección 5, "verificar que una forma
  bizkaina es reconocida y correcta, no inventada").
- **`eskerrik asko` / `mila esker`** no se tocó: son sinónimos de registro
  batua, no un par batua/bizkaiera.
- **El repaso de vocabulario (`fondoVocabulario`) no incluye las
  variantes** como ítems independientes de repaso espaciado todavía —
  solo las formas de primer nivel. Las variantes son descubribles en
  Vocabulario y Diccionario, pero no entran en el algoritmo `srs`. Es una
  limitación de alcance de este piloto, no una decisión de contenido;
  revisar si merece la pena antes de replicar a las 11 unidades restantes.
- **Los ejercicios (`ejercicios`) no se reescribieron.** Ya usaban "aupa"
  como ítem suelto en `pares` (ejercicio u1-g04), lo cual sigue
  funcionando exactamente igual — son datos independientes del array
  `vocabulario`, no una referencia a él. No se han etiquetado por registro
  dentro de los ejercicios (posible mejora futura, sección 5.1).

## Audio

Las 23 palabras de la Unidad 1 (22 originales + `zelan zagoz?`, nuevo)
tienen mp3 generado con Cloud TTS (voz `eu-ES`) y subido a
`euskaraz-audio/unidades/u1/`.

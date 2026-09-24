# Bloque 1 de audio: elecciones de Ric — para aplicar

Ric revisó `revision-audio/elegir-mejor-bloque1.html` el 24/09/2026 y eligió
versión para 14 de las 16 palabras. Aquí está lo que hace falta para
aplicarlo, que **no es solo sustituir ficheros**.

## El hallazgo: 9 de las 14 ni siquiera tienen audio en el curso

Al buscar dónde vive cada clave en `data/unidades-v2/` aparece que **la
mayoría no tiene campo `audio`**. Existen solo en el bucket de pruebas
(`test/bloque-50/`), generadas para poder revisarlas, pero nunca se
enlazaron. La app no pinta el altavoz cuando falta el campo, así que ahora
mismo esas frases están mudas.

Eso parte el trabajo en dos, y conviene no mezclarlos.

### A · Sustituir (5) — hay audio en producción, y es el malo

| clave | elegida | fichero que hay que sustituir |
|---|---|---|
| `nola-duzu-izena` | **v1** | `unidades/u4/nola-duzu-izena.mp3` **y** `unidades/u3/nola-duzu-izena.mp3` |
| `ni-ere-euskalduna-naiz` | **v3** | `unidades/u4/ni-ere-euskalduna-naiz.mp3` |
| `gu-ere-lagunak-gara` | **v3** | `unidades/u4/gu-ere-lagunak-gara.mp3` |
| `zuek-ikasleak-zarie` | **v2** | `unidades/u4/zuek-ikasleak-zarie.mp3` |
| `hemeretzi` | **v1** | `unidades/u5/hemeretzi.mp3` |

Ojo con `nola-duzu-izena`: la misma frase está en dos sitios del curso
(unidad 2 y unidad 3) apuntando a **dos ficheros distintos**. Hay que
sustituir los dos, o dejar los dos apuntando al mismo.

### B · Enlazar (9) — el audio elegido existe, pero el curso no lo usa

| clave | elegida | dónde vive en el curso | campo `audio` |
|---|---|---|---|
| `barkatu-mesedez` | **v2** | ejemplo de ficha, `01-kaixo.json` | falta |
| `bizkaiera` | **v2** | dos ejemplos de ficha, `01-kaixo.json` | falta en los dos |
| `nire-herria-txikia-da` | **v2** | ejemplos en `02-ni.json` y `08-mugi.json` | falta en los dos |
| `horiek` | **v2** | vocabulario, `03-galderak.json` | falta |
| `horreek` | **v1** | variante bizkaina de `horiek` | falta |
| `ikasle-hori-nongoa-da` | **v3** | ejemplo de ficha, `03-galderak.json` | falta |
| `ha-medikua-da` | **v2** | ejemplo de ficha, `03-galderak.json` | falta |
| `ikasle-horreek-euskaldunak-dira` | **v3** | ejemplo de ficha, `03-galderak.json` | falta |
| `noiz-gaur` | **v1** | ejemplo de ficha, `03-galderak.json` | falta |

Para estas hace falta **decidir la clave del bucket** antes de tocar el
JSON. La convención actual (`unidades/u<N>/<clave>.mp3`) usa la numeración
vieja de 12 unidades y no es deducible: unidad 2 → `u4`, unidad 3 → `u3`,
unidad 4 → `u5`, unidad 5 → `u6`. Mejor que las diga Miguel al subirlas, y
entonces se añaden los campos de una vez.

## Las dos que no arregló ninguna versión

`gipuzkoa` y `gela`. Las dos fallan en lo mismo: el modelo lee la grafía
con fonética que no es la que toca, y **decírselo en la instrucción no ha
bastado tres veces**.

La vía que no se ha probado todavía: **cambiar el texto que se le manda**,
no la instrucción. Al TTS se le puede dar la palabra reescrita como suena,
que es lo que el modelo lee de verdad.

```js
{ unidad: 'u1', clave: 'gipuzkoa', texto: 'Gipuskoa',
  notaRic: 'la "z" debe de ser una s silbante.',
  instruccion: 'Spanish phonetics. Read exactly as spelled: gi-pus-KO-a. The "s" is a plain sibilant s as in Spanish "casa" — never [θ], never "sh".' },

{ unidad: 'u1', clave: 'gela', texto: 'guela',
  notaRic: 'suena como aleman o inglés, debería ser claramente "Guela"',
  instruccion: 'Spanish phonetics. Hard g as in Spanish "guerra": GUE-la. Two clean syllables. Not German, not English.' },
```

La grafía solo va al modelo; en la app se sigue escribiendo *Gipuzkoa* y
*gela*, que es lo correcto.

Plan B si tampoco sale: **cambiar de voz**. Todo el lote va con `Kore`
(`gemini-2.5-flash-tts`), y el problema puede ser de esa voz y no de la
instrucción.

`gela` tiene audio en producción (`unidades/u6/gela.mp3`) y es el que Ric
marcó mal, así que hasta que salga una buena se queda sonando mal.
`gipuzkoa` no tiene audio, así que se queda muda como hasta ahora.

## Lo que no se puede hacer desde el portátil de Ric

Generar audio (no hay `gcloud` instalado) ni subir al bucket (en el repo no
hay nada que suba a Supabase). Las dos cosas son de Miguel.

# -*- coding: utf-8 -*-
"""Marca qué preguntas de opción se pueden hacer SIN opciones.

Cuando una ficha está asentada, la app deja de enseñar las cuatro
opciones y pide escribir la respuesta (ver `pideTeclear` en js/app.js).
No todas las preguntas lo aguantan: «¿cuál de estas está bien escrita?»
no significa nada sin las opciones delante, y «¿qué respondes?» tiene
veinte respuestas buenas. Este script pone `"teclea": true` solo en las
que sí:

  · HUECO          «Gu euskaldunak ____.»      → falta una forma
  · SE DICE        «"el viernes" se dice…»     → se pide una palabra

y además la respuesta y todos los distractores tienen que estar en
euskera y la respuesta no pasar de tres palabras.

Que lo decida el contenido y no la app es a propósito: se puede leer la
lista, y quitar una pregunta concreta poniéndole `"teclea": false`, que
este script respeta y no vuelve a tocar. Se puede correr las veces que
haga falta; tras añadir ejercicios, hay que correrlo.

    python3 scripts/marcar-tecleables.py            # marca y dice cuántas
    python3 scripts/marcar-tecleables.py --lista    # además las enseña
"""
import collections, io, json, os, re, sys

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
indice = json.load(io.open(os.path.join(RAIZ, 'data/curso-v2.json'), encoding='utf-8'))
rutas = [os.path.join(RAIZ, 'data', r) for r in indice['unidades']]
U = [json.load(io.open(r, encoding='utf-8')) for r in rutas]


def palabras(s):
    return re.findall(u"[a-záéíóúüñ]+", s.lower())


# Qué palabras son euskera y cuáles castellano, contando dónde sale cada
# una en el propio curso. No hace falta un diccionario: basta con que la
# respuesta esté hecha de palabras que el curso escribe en euskera.
EU, ES = collections.Counter(), collections.Counter()
for u in U:
    for v in u['vocabulario']:
        EU.update(palabras(v['eu'])); ES.update(palabras(v['es']))
        for x in v.get('variantes', []):
            EU.update(palabras(x['eu']))
    for g in u['gramatica']:
        for e in g.get('ejemplos', []):
            EU.update(palabras(e['eu'])); ES.update(palabras(e['es']))
    for g in u['ejercicios']:
        for v in (g.get('variantes') or [g]):
            if v['tipo'] == 'escribir':
                EU.update(palabras(v['eu'])); ES.update(palabras(v['es']))
            elif v['tipo'] == 'traducir':
                for r in v['respuestas']:
                    EU.update(palabras(r))


def en_euskera(txt):
    ws = palabras(txt)
    return bool(ws) and all(EU[w] and EU[w] >= ES[w] for w in ws)


# Preguntas que solo se entienden mirando las opciones, o que piden la que
# NO vale: sin opciones no hay nada que escribir.
DEPENDE = re.compile(u'cu[aá]l(es)? de|qu[eé] pareja|cu[aá]l est[aá]|cu[aá]l es la|'
                     u'de (las|los) siguientes|estas (frases|palabras|opciones)|una de estas|'
                     u'\\bno es\\b|no significa|\\bno se\\b|sobra|falso|incorrect', re.I)
HUECO = re.compile(u'_{2,}')
SE_DICE = re.compile(u'¿c[oó]mo se dice|se dice(…|\\.\\.\\.|:)?\\s*$', re.I)


def clase(v):
    """'hueco', 'se dice' o None."""
    if v.get('tipo') != 'opcion':
        return None
    q, ops = v['pregunta'], v['opciones']
    buena = ops[v['correcta']]
    if len(buena.split()) > 3 or re.search(u'[·/]', buena):
        return None
    if not all(en_euskera(o) for o in ops):
        return None
    if DEPENDE.search(q):
        return None
    if HUECO.search(q):
        return 'hueco'
    if SE_DICE.search(q):
        return 'se dice'
    return None


cuenta = collections.Counter(); grupos = set(); vetadas = 0; lista = []
for ruta, u in zip(rutas, U):
    for g in u['ejercicios']:
        for v in (g.get('variantes') or [g]):
            if v.get('teclea') is False:          # vetada a mano: no se toca
                vetadas += 1
                continue
            c = clase(v)
            if c:
                v['teclea'] = True
                cuenta[c] += 1; grupos.add(g['id'])
                lista.append((u['numero'], g['id'], c, v['pregunta'], v['opciones'][v['correcta']]))
            else:
                v.pop('teclea', None)
    io.open(ruta, 'w', encoding='utf-8').write(json.dumps(u, ensure_ascii=False, indent=2) + '\n')

total_grupos = sum(len(u['ejercicios']) for u in U)
print('preguntas que se pueden pedir escritas: %d  (%s)'
      % (sum(cuenta.values()), ', '.join('%s %d' % kv for kv in sorted(cuenta.items()))))
print('   en %d de %d grupos · vetadas a mano: %d' % (len(grupos), total_grupos, vetadas))
if '--lista' in sys.argv:
    for n, gid, c, q, b in lista:
        print('  U%-2s %-10s %-8s %s  →  %s' % (n, gid, c, q, b))

# -*- coding: utf-8 -*-
"""AUDITORÍA MANUAL, no es un test. NO lo metas en probar-todo.sh.

    python3 scripts/auditar-enunciados.py

Busca ejercicios de producir (orden / escribir / traducir) donde el euskera
contiene una palabra cuyo significado no aparece en el enunciado español. Son
irresolubles: el alumno no puede adivinar que tiene que ponerla. Es la pega que
puso Ric con «jan»/«jango» — si el enunciado no dice la frase entera, hay más
de una respuesta buena.

Encontró uno real (u2-g08 #3: «su amigo (de ella)» pedía «haren lagun polita»,
con un «bonito» que el español no mencionaba) y 19 falsos positivos, así que se
corre a mano y se leen los candidatos con la cabeza. Los falsos positivos son
de dos clases y no merece la pena arreglarlas:

  · género y morfología: «gorria» se glosa «rojo» y la frase dice «roja»;
    «euria» es «la lluvia» y la frase dice «llueve».
  · colisión de raíz, porque se comparan las cinco primeras letras: «lehen»
    (antes) choca con «lehena» (el primero), y «orduan» (entonces) con
    «ordua» (la hora).

Lo que SÍ es un test automático es scripts/probar_adelantos.js, que vigila las
construcciones gramaticales. Ver la nota de CLAUDE.md sobre por qué el orden
del vocabulario no se vigila.
"""
import json, io, re, unicodedata

def pel(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')

curso = json.load(io.open('data/curso-v2.json', encoding='utf-8'))
uni = [json.load(io.open('data/' + r, encoding='utf-8')) for r in curso['unidades']]

# Solo miramos palabras «con carga»: sustantivos y adjetivos. Los pronombres,
# partículas y verbos no se glosan igual en las dos lenguas y dan ruido.
CLASES = ('sustantivo', 'adjetivo')
dic = {}
for d in uni:
    for v in d.get('vocabulario', []):
        cat = (v.get('categoria') or '').lower()
        if not any(c in cat for c in CLASES): continue
        eu = pel(v['eu'].strip())
        if ' ' in eu or len(eu) < 4: continue
        glosas = re.split(r'[/,;()]', pel(v['es']))
        # Fuera el artículo: la glosa «la casa» daba la raíz «la ca», que no
        # aparece en «mi casa», y el barrido se llenaba de falsos positivos.
        glosas = [re.sub(r'^(el|la|los|las|un|una|unos|unas)\s+', '', g.strip())
                  for g in glosas]
        raices = {g[:5] for g in glosas if len(g) >= 4}
        if raices: dic.setdefault(eu[:5], set()).update(raices)

fallos = []
for d in uni:
    for g in d['ejercicios']:
        for i, v in enumerate(g['variantes']):
            if v.get('tipo') not in ('orden', 'escribir', 'traducir'): continue
            es = pel(v.get('es') or '')
            eu = pel(v.get('eu') or (v.get('respuestas') or [''])[0])
            if not es or not eu: continue
            for pal in re.findall(r'[a-z]+', eu):
                if len(pal) < 4: continue
                raices = dic.get(pal[:5])
                if not raices: continue
                if not any(r in es for r in raices):
                    fallos.append((d['numero'], g.get('subnivel'), g['id'], i,
                                   v.get('es'), v.get('eu') or (v.get('respuestas') or [''])[0],
                                   pal, sorted(raices)))
print('candidatos: %d\n' % len(fallos))
for u, sub, gid, i, es, eu, pal, raices in fallos:
    print('u%-2d %-5s %-9s #%d  «%s»' % (u, sub, gid, i, pal))
    print('        es: %s' % es)
    print('        eu: %s' % eu)


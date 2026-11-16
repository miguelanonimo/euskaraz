#!/usr/bin/env python3
"""
Genera 'euskaraz-standalone.html': un único archivo con todo dentro
(HTML + CSS + JS + las doce unidades). Sirve para probar la app haciendo
doble clic, sin necesidad de servidor.

La app busca el curso ya montado en window.__CURSO__ antes de intentar
pedir nada por red, así que aquí solo hay que dejarlo ahí y ensamblar.

Uso:  python3 construir-standalone.py
"""
import base64
import json
import pathlib
import re

base = pathlib.Path(__file__).parent

html = (base / 'index.html').read_text(encoding='utf-8')
css = (base / 'css/styles.css').read_text(encoding='utf-8')
js = (base / 'js/app.js').read_text(encoding='utf-8')

indice = json.loads((base / 'data/curso.json').read_text(encoding='utf-8'))
unidades = [
    json.loads((base / 'data' / ruta).read_text(encoding='utf-8'))
    for ruta in indice['unidades']
]
curso = {'meta': indice['meta'], 'unidades': unidades}

# Un </script> dentro de una cadena JSON cerraría la etiqueta antes de tiempo
datos = 'window.__CURSO__ = ' + json.dumps(curso, ensure_ascii=False).replace('</', '<\\/') + ';'

html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    '<style>\n' + css + '\n</style>'
)

# Los iconos y el manifest son archivos aparte: aquí no existen.
# Se sustituyen por un único favicon incrustado en base64.
icono = base64.b64encode((base / 'icons/icon-192.png').read_bytes()).decode()
html = re.sub(r'\n *<link rel="(icon|apple-touch-icon|manifest)"[^>]*>', '', html)
html = html.replace(
    '<title>',
    '<link rel="icon" type="image/png" href="data:image/png;base64,' + icono + '">\n<title>'
)
html = html.replace(
    '<script src="js/app.js"></script>',
    '<script>\n' + datos + '\n</script>\n<script>\n' + js + '\n</script>'
)

assert 'href="css/' not in html and 'src="js/' not in html, 'quedan referencias locales'
assert 'window.__CURSO__' in html

salida = base / 'euskaraz-standalone.html'
salida.write_text(html, encoding='utf-8')

n_ej = sum(len(u['ejercicios']) for u in unidades)
n_var = sum(len(g['variantes']) for u in unidades for g in u['ejercicios'])
print(f'Creado: {salida.name}  ({salida.stat().st_size / 1024:.0f} KB)')
print(f'  {len(unidades)} unidades · {n_ej} ejercicios · {n_var} variantes')

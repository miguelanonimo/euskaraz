# -*- coding: utf-8 -*-
"""Servidor para probar la app en local, en vez de `python3 -m http.server`.

La diferencia es una línea: manda Cache-Control: no-store, así que el
navegador nunca sirve una versión vieja de app.js o de los JSON. Con el
servidor de serie hay que acordarse de cambiar el ?v= de index.html en
cada retoque, y si se olvida uno se pasa un rato probando código antiguo
sin saberlo (nos pasó: Ric veía arreglos ya hechos como si no existieran).

Solo para local. No toca index.html, así que lo que ve Miguel en GitHub
Pages sigue con su ?v= de siempre.

    python3 scripts/servidor-local.py [puerto]     # por defecto 8321
"""
import functools, http.server, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    # SimpleHTTPRequestHandler contesta 304 si el navegador manda
    # If-Modified-Since; con no-store no debería preguntarlo, pero por si
    # acaso se desactiva también esa vía.
    def send_head(self):
        self.headers.replace_header("If-Modified-Since", "") \
            if "If-Modified-Since" in self.headers else None
        return super().send_head()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8321
    handler = functools.partial(SinCache, directory=RAIZ)
    print("Sirviendo %s en http://localhost:%d/?v2  (sin caché)" % (RAIZ, puerto))
    http.server.ThreadingHTTPServer(("", puerto), handler).serve_forever()

# -*- coding: utf-8 -*-
import json, io, os, re, sys, unicodedata

# OJO: BASE se calcula desde la ubicación de ESTE archivo, no desde el
# directorio en que lo lances. Si tienes una copia del proyecto en otro
# sitio, cada copia se verifica a sí misma (ya nos costó un rato).
BASE = os.path.dirname(os.path.abspath(__file__))

# Sin argumentos verifica el curso publicado; `v2`, el reestructurado en
# 10 unidades. Antes solo miraba el primero, así que el contenido nuevo
# no lo revisaba nadie — y ahí es donde apareció el fallo de la pista de
# «Me llamo Ane».
CURSOS = {"": "data/curso.json",
          "v1": "data/curso.json",
          "v2": "data/curso-v2.json"}
CURSO = sys.argv[1] if len(sys.argv) > 1 else ""
if CURSO not in CURSOS:
    sys.exit("Cursos: %s" % ", ".join(k for k in CURSOS if k))
INDICE = CURSOS[CURSO]
print("Verificando %s" % INDICE)
idx = json.load(io.open(os.path.join(BASE, INDICE), encoding="utf-8"))
errores, avisos = [], []
ids, enunciados = {}, {}
total_v = 0

TIPOS = {"opcion", "pares", "orden", "traducir"}

# Claves admitidas en una entrada de vocabulario (o en una variante).
# {eu,es,nota} son las del original y siguen siendo obligatorias en la
# entrada principal; el resto las añadió Miguel y son opcionales.
VOC_CLAVES = {"eu", "es", "nota", "audio", "categoria", "registro", "variantes",
              "esAlt", "subnivel"}

# Las pistas y explicaciones a veces cuentan letras o palabras, o dicen por
# dónde empieza la solución. Es fácil escribirlas mal y no enterarse nunca,
# porque la app no las comprueba: solo las enseña.
PALABRAS = {u"un":1, u"una":1, u"dos":2, u"tres":3, u"cuatro":4, u"cinco":5,
            u"seis":6, u"siete":7, u"ocho":8, u"nueve":9, u"diez":10}
RE_CUENTA = re.compile(u"(\\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)"
                       u"\\s+(palabras?|letras?|fichas?)", re.I)
# Solo se acepta la forma con comillas o una letra suelta: «empieza por la
# palabra interrogativa» no es una afirmación comprobable.
RE_EMPIEZA = re.compile(u"[Ee]mpieza por (?:\u00ab([^\u00bb]+)\u00bb|(\\w)\\b)")

# Referencias a otras unidades dentro de una explicación. Se comprueban
# porque al reestructurar el curso se quedaron apuntando al mapa viejo, y
# una que mande hacia adelante es peor que un número mal: le dice al alumno
# que ya sabe algo que aún no ha visto. Coge también las plurales
# («desde las unidades 6 y 8»), que a la primera versión se le escapaban.
RE_UNIDAD = re.compile(u"unidades?\\s+(\\d+)((?:\\s*(?:,|y|o)\\s*\\d+)*)", re.I)

def cifra(t):
    t = t.lower()
    return int(t) if t.isdigit() else PALABRAS.get(t)

# Palabras tan comunes que aparecer en la pista no delata nada.
MENUDAS = {u"eta", u"bat", u"ez", u"da", u"el", u"la", u"de", u"y", u"o",
           u"a", u"en", u"es", u"que", u"un", u"una", u"se", u"no"}


def pista_delata(eid, v, soluciones):
    """¿La pista trae ya hechas todas las piezas de alguna solución?

    Una pista debe estrechar el camino, no recorrerlo: si están todas las
    palabras, el ejercicio se resuelve copiando de la ayuda y no se aprende
    nada. Lo detectó Ric en «Me llamo Ane», cuya pista decía literalmente
    las dos respuestas buenas.
    """
    pista = set(norm(v.get("pista") or "").split())
    if not pista:
        return []
    for sol in soluciones:
        piezas = [w for w in norm(sol).split() if w not in MENUDAS]
        if len(piezas) >= 2 and all(w in pista for w in piezas):
            return [u"%s: la pista ya trae la solución entera («%s»); "
                    u"deja la regla y quita las palabras" % (eid, sol)]
    return []


def revisar_pistas(eid, v, sol):
    """Contrasta lo que promete el texto de ayuda con la solución real."""
    fallos = []
    r = norm(sol)
    for campo in ("pista", "explicacion", "instruccion"):
        txt = v.get(campo)
        if not txt:
            continue
        for m in RE_CUENTA.finditer(txt):
            n = cifra(m.group(1))
            tipo = m.group(2).lower()
            if n is None:
                continue
            if tipo[0] in "pf":   # palabras o fichas
                real = len(r.replace("-", " ").split())
            else:                 # letras
                real = len(r.replace(" ", ""))
            if real != n:
                fallos.append(u"%s: la %s dice %d %s, pero «%s» tiene %d"
                              % (eid, campo, n, tipo, sol, real))
        for m in RE_EMPIEZA.finditer(txt):
            ini = (m.group(1) or m.group(2)).lower()
            if not r.startswith(ini):
                fallos.append(u"%s: la %s dice que empieza por «%s», pero es «%s»"
                              % (eid, campo, ini, sol))
    return fallos

def norm(s):
    s = s.lower()
    for ch in u"¿?¡!.,;:«»\"'()":
        s = s.replace(ch, "")
    return " ".join(s.split())

CASTELLANO = {}   # traducción normalizada -> palabras en euskera que la usan

unidades = []
for ruta in idx["unidades"]:
    f = os.path.join(BASE, "data", ruta)
    if not os.path.exists(f):
        errores.append("falta el archivo %s" % ruta); continue
    unidades.append((ruta, json.load(io.open(f, encoding="utf-8"))))

nums = [u["numero"] for _, u in unidades]
if nums != sorted(nums):
    avisos.append("las unidades no están en orden numérico: %s" % nums)

for ruta, u in unidades:
    # Cada tema lleva su título en euskera además del castellano (`titulo_eu`).
    for s_ in u.get("subniveles") or []:
        if not s_.get("titulo_eu"):
            errores.append(u"%s: el tema %s no tiene título en euskera" % (ruta, s_.get("id")))

    for k in ("id","numero","titulo","subtitulo","objetivo","color","vocabulario","gramatica","ejercicios"):
        if k not in u: errores.append("%s: falta la clave %s" % (ruta, k))
    vistos = set()
    for v in u["vocabulario"]:
        # Esquema ampliado por Miguel: al original {eu,es,nota} se le
        # sumaron `audio` (ruta del mp3 en Supabase Storage), y
        # `registro`/`variantes` para enseñar batua y bizkaiera a la vez
        # (docs/brief.md 5.1). `categoria` alimenta el filtro del
        # diccionario. Ninguna es obligatoria.
        if not {"eu","es","nota"} <= set(v) or not set(v) <= VOC_CLAVES:
            errores.append("%s: entrada de vocabulario con claves raras %s" % (ruta, list(v)))
        for var in v.get("variantes") or []:
            if not {"eu"} <= set(var) or not set(var) <= VOC_CLAVES:
                errores.append("%s: variante de «%s» con claves raras %s"
                               % (ruta, v["eu"], list(var)))
        if norm(v["eu"]) in vistos:
            avisos.append("%s: «%s» repetida dentro de la unidad" % (ruta, v["eu"]))
        vistos.add(norm(v["eu"]))
        CASTELLANO.setdefault(norm(v["es"]), set()).add(v["eu"])
    for gr in u["gramatica"]:
        # `subnivel` es nuestro: reparte la unidad en tramos internos.
        # Es opcional; las unidades sin él se pintan como siempre.
        if not {"titulo","cuerpo","ejemplos"} <= set(gr) or \
           not set(gr) <= {"titulo","cuerpo","ejemplos","subnivel","registro"}:
            errores.append("%s: ficha de gramática con claves raras en «%s»: %s"
                           % (ruta, gr.get("titulo","?"), sorted(gr)))
        # La app convierte cada \n suelto en un <br>. En una lista eso es lo
        # que se quiere, pero si el párrafo se escribió ajustado a mano a ~70
        # caracteres, el lector ve la frase partida a mitad (lo cazó Ric en
        # «Dónde se habla el euskera»). Se avisa cuando dos líneas seguidas
        # parecen las dos prosa corrida en vez de elementos de una lista.
        for parr in gr["cuerpo"].split("\n\n"):
            ls = parr.split("\n")
            if len(ls) < 2:
                continue
            items = sum(1 for l in ls if re.match(r"\s*(<b>|[-\u2013\u2014\u2022]|\d+[.)])", l))
            if items >= len(ls) - 1:
                continue                      # es una lista: correcto
            for a, b in zip(ls, ls[1:]):
                sa = re.sub(r"<[^>]+>", "", a).rstrip()
                sb = re.sub(r"<[^>]+>", "", b).lstrip()
                if sa and sb and sa[-1] not in u".:!?\u00bb" and 45 <= len(sa) <= 92:
                    avisos.append(u"%s: «%s» tiene un salto de línea en mitad "
                                  u"de la frase (…%s / %s…)"
                                  % (ruta, gr["titulo"], sa[-28:], sb[:28]))
                    break
        for m in RE_UNIDAD.finditer(gr["cuerpo"]):
            nums = [int(m.group(1))] + [int(x) for x in re.findall(r"\\d+", m.group(2) or "")]
            futuras = [n for n in nums if n >= u["numero"]]
            if futuras:
                errores.append(u"%s: «%s» remite a la unidad %s, que es esta misma o "
                               u"posterior" % (ruta, gr["titulo"], futuras[0]))

        for tag in re.findall(r"</?(\w+)>", gr["cuerpo"]):
            if tag not in ("b","i","u"):
                avisos.append("%s: etiqueta <%s> en «%s»" % (ruta, tag, gr["titulo"]))
    # Las burbujas de dialecto van AL FINAL de su tema: primero la forma
    # normativa entera, y de remate cómo suena por aquí. En medio cortan la
    # explicación en dos (criterio de Ric).
    porTema = {}
    for gr in u["gramatica"]:
        porTema.setdefault(gr.get("subnivel"), []).append(gr)
    for sub, fichas in porTema.items():
        vistoDialecto = False
        for gr in fichas:
            if gr.get("registro") == "bizkaiera":
                vistoDialecto = True
            elif vistoDialecto:
                errores.append(u"%s: la ficha de dialecto de %s está en medio; "
                               u"detrás va «%s»" % (ruta, sub, gr["titulo"]))
                break

    # El original pedía una ficha de dialecto por unidad. Se reconocen por
    # `registro: "bizkaiera"`; se aceptan también por el título, que es como
    # estaban marcadas antes de que existiera el campo.
    if not any(gr.get("registro") == "bizkaiera" or u"Gernika" in gr["titulo"]
               or u"Bizkaia" in gr["titulo"] for gr in u["gramatica"]):
        avisos.append("%s: no tiene ficha de dialecto" % ruta)

    for gexp in u["ejercicios"]:
        if gexp["id"] in ids:
            errores.append("id duplicado %s (%s y %s)" % (gexp["id"], ids[gexp["id"]], ruta))
        ids[gexp["id"]] = ruta
        # En el curso original el id decía en qué unidad vivía el grupo. Al
        # reestructurar en 10 unidades, los grupos se mudaron conservando su
        # id, y eso es a propósito: así se sabe de dónde salió cada cosa. El
        # código nunca lee el prefijo, solo usa el id como llave. Se avisa
        # para no perderlo de vista, pero no es un fallo.
        if not gexp["id"].startswith(u["id"] + "-"):
            (avisos if u.get("subniveles") else errores).append(
                "%s: el id %s no empieza por %s- (grupo mudado de unidad)"
                % (ruta, gexp["id"], u["id"]))
        vs = gexp["variantes"]
        if len(vs) != 5:
            errores.append("%s: %s tiene %d variantes" % (ruta, gexp["id"], len(vs)))
        total_v += len(vs)
        for n, v in enumerate(vs):
            eid = "%s v%d" % (gexp["id"], n+1)
            t = v.get("tipo")
            if t not in TIPOS:
                errores.append("%s: tipo desconocido %r" % (eid, t)); continue
            if not v.get("instruccion"):
                errores.append("%s: sin instrucción" % eid)
            if t == "opcion":
                ops = v["opciones"]
                if len(ops) < 2: errores.append("%s: menos de dos opciones" % eid)
                if len(set(ops)) != len(ops): errores.append("%s: opciones repetidas %s" % (eid, ops))
                c = v["correcta"]
                if not isinstance(c, int) or not (0 <= c < len(ops)):
                    errores.append("%s: índice correcta fuera de rango (%r)" % (eid, c))
                if not v.get("pregunta"): errores.append("%s: sin pregunta" % eid)
                if isinstance(c, int) and 0 <= c < len(ops):
                    errores.extend(revisar_pistas(eid, v, ops[c]))
                    errores.extend(pista_delata(eid, v, [ops[c]]))
                clave = norm(v["pregunta"])
            elif t == "pares":
                ps = v["pares"]
                if len(ps) != 4: avisos.append("%s: %d parejas (lo normal son 4)" % (eid, len(ps)))
                if len(set(p["eu"] for p in ps)) != len(ps): errores.append("%s: euskera repetido en las parejas" % eid)
                if len(set(p["es"] for p in ps)) != len(ps): errores.append("%s: castellano repetido en las parejas" % eid)
                clave = norm(" ".join(p["eu"] for p in ps))
            elif t == "orden":
                # Los distractores son fichas que NO forman parte de la frase:
                # si alguna se cuela en la solución, el ejercicio es irresoluble
                # o tiene dos respuestas buenas.
                dentro = set(norm(v["eu"]).split())
                for dis in v.get("distractores") or []:
                    if norm(dis) in dentro:
                        errores.append(u"%s: el distractor «%s» está dentro de la "
                                       u"solución" % (eid, dis))
                if norm(" ".join(v["palabras"])) != norm(v["eu"]):
                    errores.append("%s: las palabras no reconstruyen «%s» → %s" % (eid, v["eu"], v["palabras"]))
                if len(v["palabras"]) < 3:
                    avisos.append("%s: solo %d fichas, demasiado fácil" % (eid, len(v["palabras"])))
                errores.extend(revisar_pistas(eid, v, v["eu"]))
                errores.extend(pista_delata(eid, v, [v["eu"]]))
                clave = norm(v["eu"])
            else:
                if not v.get("respuestas"): errores.append("%s: sin respuestas" % eid)
                if v.get("respuestas"):
                    errores.extend(revisar_pistas(eid, v, v["respuestas"][0]))
                    # Todas, no solo la primera: delatar una alternativa
                    # es igual de gratis que delatar la principal.
                    errores.extend(pista_delata(eid, v, v["respuestas"]))
                for r in v["respuestas"]:
                    if r != norm(r):
                        avisos.append("%s: la respuesta «%s» no está normalizada (se compara en minúsculas y sin puntuación, así que da igual, pero conviene)" % (eid, r))
                clave = norm(v["es"])
            if clave in enunciados and enunciados[clave] != gexp["id"]:
                avisos.append("enunciado repetido en %s y %s: «%s»" % (enunciados[clave], gexp["id"], clave[:50]))
            enunciados.setdefault(clave, gexp["id"])

# El repaso de vocabulario pregunta en las dos direcciones. Cuando varias
# palabras en euskera comparten traducción, del castellano al euskera hay
# más de una respuesta buena. La app lo detecta y fuerza la otra dirección,
# así que esto no rompe nada: se lista para poder revisar si son sinónimos
# de verdad o una traducción perezosa que conviene afinar.
sinonimos = sorted((k, sorted(v)) for k, v in CASTELLANO.items() if len(v) > 1)
if sinonimos:
    for es, eus in sinonimos:
        avisos.append(u"«%s» traduce a %s: en el repaso solo se preguntará "
                      u"de euskera a castellano" % (es, u" y ".join(eus)))

print("Unidades: %d   ejercicios: %d   variantes: %d" % (len(unidades), len(ids), total_v))
print("Vocabulario total: %d entradas" % sum(len(u["vocabulario"]) for _, u in unidades))
print()
if errores:
    print("ERRORES (%d):" % len(errores))
    for e in errores: print("  ✕", e)
else:
    print("Sin errores.")
print()
if avisos:
    print("Avisos (%d):" % len(avisos))
    for a in avisos[:40]: print("  ·", a)
    if len(avisos) > 40: print("  … y %d más" % (len(avisos)-40))
sys.exit(1 if errores else 0)

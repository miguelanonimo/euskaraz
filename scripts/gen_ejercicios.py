#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Completa a 5 grupos los subniveles que tienen vocabulario propio, y los
tests de unidad.

Solo genera los dos tipos que NO exigen inventar euskera:
  · pares  — emparejar cuatro palabras con su traducción
  · opcion — «¿qué significa X?» y «"algo" se dice…»

Todo sale de palabras que ya están en el curso y verificadas contra el
Hiztegi Batua. Los subniveles que son de gramática pura (negar, el
imperativo, comparar…) no se tocan aquí: esos se escriben a mano.
"""
import json, os, glob, random, collections, unicodedata

RAIZ = os.path.expanduser("~/Proyectos/euskaraz")
D = os.path.join(RAIZ, "data/unidades-v2")
OBJETIVO = 5
random.seed(20260825)          # reproducible: relanzarlo da lo mismo


def norm(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").strip()


def limpio(v):
    """Palabras que sirven para preguntar por su significado. Se dejan
    fuera las que son sufijos o partículas sueltas: preguntar «¿qué
    significa -ago?» no enseña nada."""
    eu = v["eu"]
    return not eu.startswith("-") and len(eu) > 1


def distractores(correcta, fondo, cuantos=3):
    """Tres señuelos del mismo fondo. Nunca uno que comparta traducción
    con la correcta —sería otra respuesta buena— ni repetido."""
    malos = {norm(correcta["es"])}
    fuera = {norm(correcta["eu"])}
    out = []
    for v in fondo:
        if len(out) == cuantos:
            break
        if norm(v["eu"]) in fuera or norm(v["es"]) in malos:
            continue
        malos.add(norm(v["es"]))
        fuera.add(norm(v["eu"]))
        out.append(v)
    return out if len(out) == cuantos else None


def var_significado(v, fondo):
    d = distractores(v, fondo)
    if not d:
        return None
    ops = [v["es"]] + [x["es"] for x in d]
    return dict(tipo="opcion", instruccion="Elige la opción correcta",
                pregunta="¿Qué significa «" + v["eu"] + "»?",
                opciones=ops, correcta=0,
                explicacion=(v.get("nota") or (v["eu"] + " = " + v["es"] + ".")))


def var_produccion(v, fondo):
    d = distractores(v, fondo)
    if not d:
        return None
    ops = [v["eu"]] + [x["eu"] for x in d]
    return dict(tipo="opcion", instruccion="Elige la opción correcta",
                pregunta="«" + v["es"] + "» se dice…",
                opciones=ops, correcta=0,
                explicacion=(v.get("nota") or (v["es"] + " = " + v["eu"] + ".")))


def var_pares(cuatro, titulo):
    return dict(tipo="pares", instruccion="Empareja " + titulo,
                pares=[dict(eu=v["eu"], es=v["es"]) for v in cuatro])


def construir(vocab, fondo, cuantos, etiqueta, usados):
    """Devuelve `cuantos` grupos de 5 variantes, repartiendo las palabras
    para que ninguna salga tres veces seguidas."""
    grupos = []
    pool = [v for v in vocab if limpio(v)]
    if len(pool) < 4:
        return grupos

    for _ in range(cuantos):
        variantes = []
        random.shuffle(pool)

        # Dos de emparejar. Con pocas palabras propias se completan con
        # otras de la unidad, pero nunca menos de dos propias.
        relleno = [v for v in fondo if limpio(v)
                   and norm(v["eu"]) not in {norm(x["eu"]) for x in pool}]
        for _ in range(2):
            if len(variantes) >= 5:
                break
            if len(pool) >= 4:
                cuatro = random.sample(pool, 4)
            elif len(pool) >= 2 and len(relleno) >= 4 - len(pool):
                cuatro = list(pool) + random.sample(relleno, 4 - len(pool))
            else:
                continue
            if len({norm(v["es"]) for v in cuatro}) == 4:
                variantes.append(var_pares(cuatro, etiqueta))

        # El resto, significado y producción alternados
        intentos = 0
        while len(variantes) < 5 and intentos < 60:
            intentos += 1
            v = pool[intentos % len(pool)]
            otros = [x for x in fondo if norm(x["eu"]) != norm(v["eu"])]
            random.shuffle(otros)
            q = (var_significado(v, otros) if len(variantes) % 2 == 0
                 else var_produccion(v, otros))
            if not q:
                continue
            # No repetir la misma pregunta dentro del grupo
            if any(x.get("pregunta") == q.get("pregunta") for x in variantes):
                continue
            variantes.append(q)

        if len(variantes) == 5:
            grupos.append(variantes)
    return grupos


def main():
    total_g = 0
    for f in sorted(glob.glob(os.path.join(D, "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        ce = collections.Counter(g["subnivel"] for g in d["ejercicios"])
        porsub = collections.defaultdict(list)
        for v in d["vocabulario"]:
            porsub[v["subnivel"]].append(v)
        fondo_unidad = [v for v in d["vocabulario"] if limpio(v)]

        # siguiente número de grupo libre en esta unidad
        usados = set()
        for g in d["ejercicios"]:
            try: usados.add(int(g["id"].rsplit("-g", 1)[1]))
            except Exception: pass
        siguiente = max(usados) + 1 if usados else 1

        nuevos = []

        # ── Subniveles con vocabulario propio ──
        for s in d["subniveles"]:
            faltan = OBJETIVO - ce.get(s["id"], 0)
            propio = porsub.get(s["id"], [])
            propios_ok = [v for v in propio if limpio(v)]
            if faltan <= 0 or len(propios_ok) < 4:
                continue
            etiqueta = s["titulo"][0].lower() + s["titulo"][1:]
            for variantes in construir(propio, fondo_unidad, faltan, etiqueta, usados):
                nuevos.append(dict(id=f"{d['id']}-g{siguiente:02d}",
                                   subnivel=s["id"], variantes=variantes))
                siguiente += 1

        # ── Test de la unidad: mezcla de toda ella ──
        faltan_test = OBJETIVO - ce.get("test", 0)
        if faltan_test > 0 and len(fondo_unidad) >= 8:
            for variantes in construir(fondo_unidad, fondo_unidad, faltan_test,
                                       "lo de esta unidad", usados):
                nuevos.append(dict(id=f"{d['id']}-g{siguiente:02d}",
                                   subnivel="test", variantes=variantes))
                siguiente += 1

        if nuevos:
            d["ejercicios"] += nuevos
            json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            open(f, "a").write("\n")
            total_g += len(nuevos)
            print(f"{os.path.basename(f):20} +{len(nuevos)} grupos")

    print(f"\nTotal: +{total_g} grupos ({total_g*5} variantes)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Añade el subnivel 1.4 «Dónde se habla» a la unidad 1, y quita el 8.6.

YA SE EJECUTÓ, y no hay que volver a lanzarlo: la ficha del botón que
escribe aquí describe el selector Bizkaiera/Gernikera, que se retiró en
agosto de 2026. La versión buena está en data/unidades-v2/01-kaixo.json.
Se conserva como registro de cómo se montó el subnivel.

Idea de Ric y Miguel: la unidad 1 ya explica los dialectos («Cómo suena
esto en Bizkaia», «Un aviso sobre los dialectos») pero da por sabida la
geografía, y además la app tiene un selector Bizkaiera/Gernikera en la
barra que nada explica. Este subnivel cierra las dos cosas.

Nombres de territorios, gentilicios y dialectos verificados contra la
Araua 57 de Euskaltzaindia («Euskal herrialdeen, herritarren eta
euskalkien izenak»); la grafía de «Euskal Herria» en dos palabras y con
las dos mayúsculas, contra la Araua 139.
"""
import json, os

RAIZ = os.path.expanduser("~/Proyectos/euskaraz")
U1 = os.path.join(RAIZ, "data/unidades-v2/01-kaixo.json")
U7 = os.path.join(RAIZ, "data/unidades-v2/07-zer.json")
U8 = os.path.join(RAIZ, "data/unidades-v2/08-mugi.json")

SUB = "1.4"

vocabulario = [
    dict(eu="euskara", es="el euskera", nota="La lengua. Y «euskaraz» es «en euskera».",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="Euskal Herria", es="Euskal Herria, el País Vasco",
         nota="Siempre en dos palabras y las dos con mayúscula.",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="euskalkia", es="el dialecto", nota="Cada forma local de hablar euskera.",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="batua", es="el batua", nota="El euskera unificado, el estándar. Es lo que enseña esta app.",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="Bizkaia", es="Bizkaia", nota="Su capital es Bilbo (Bilbao).",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="Gipuzkoa", es="Gipuzkoa", nota="Su capital es Donostia (San Sebastián).",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="Araba", es="Álava", nota="Su capital es Gasteiz (Vitoria).",
         categoria="sustantivo", subnivel=SUB),
    dict(eu="Nafarroa", es="Navarra", nota="Su capital es Iruñea (Pamplona).",
         categoria="sustantivo", subnivel=SUB),
]

gramatica = [
    dict(subnivel=SUB, titulo="Dónde se habla el euskera", cuerpo=(
        "El euskera no es de un país: es de un territorio repartido entre dos "
        "estados, y que en euskera se llama <b>Euskal Herria</b>.\n\n"
        "Son siete zonas. Cuatro al sur, en España:\n\n"
        "<b>Bizkaia</b> — la de Bilbo (Bilbao)\n"
        "<b>Gipuzkoa</b> — la de Donostia (San Sebastián)\n"
        "<b>Araba</b> — la de Gasteiz (Vitoria)\n"
        "<b>Nafarroa</b> — la de Iruñea (Pamplona)\n\n"
        "Y tres al norte, en Francia, más pequeñas y con menos hablantes:\n\n"
        "<b>Lapurdi</b> · <b>Nafarroa Beherea</b> · <b>Zuberoa</b>\n\n"
        "Un detalle de escritura: <i>Euskal Herria</i> va siempre en dos "
        "palabras y las dos con mayúscula. Así lo fijó la Academia de la "
        "Lengua Vasca."),
        ejemplos=[
            dict(eu="Euskal Herria", es="el País Vasco, las siete zonas"),
            dict(eu="Bizkaia", es="Bizkaia, la de Bilbao"),
        ]),

    dict(subnivel=SUB, titulo="Cada zona tiene su forma de hablar", cuerpo=(
        "Con el territorio así de repartido, y montañas por medio, cada zona "
        "fue haciéndose su manera de hablar. A cada una se le llama "
        "<b>euskalki</b>: dialecto.\n\n"
        "Y se nombran a partir de su zona:\n\n"
        "Bizkaia → <b>bizkaiera</b>\n"
        "Gipuzkoa → <b>gipuzkera</b>\n"
        "Lapurdi → <b>lapurtera</b>\n"
        "Zuberoa → <b>zuberera</b>\n\n"
        "No son lenguas distintas: es la misma lengua con sus acentos y sus "
        "palabras propias, como el castellano de Valladolid y el de Cádiz. "
        "Alguien de Bilbao y alguien de Zuberoa se entienden, aunque al "
        "principio les cueste."),
        ejemplos=[
            dict(eu="euskalkia", es="el dialecto"),
            dict(eu="bizkaiera", es="el dialecto de Bizkaia"),
        ]),

    dict(subnivel=SUB, titulo="Y por eso existe el batua", cuerpo=(
        "Con tantas variantes, hacer un libro de texto o dar clase era un "
        "problema: ¿en cuál de todas?\n\n"
        "En 1968 la Academia de la Lengua Vasca —<i>Euskaltzaindia</i>— "
        "reunió las formas comunes y fijó un estándar: el <b>euskara "
        "batua</b>. Literalmente, «el euskera unido».\n\n"
        "El batua es lo que se enseña en la escuela, lo que sale en los "
        "periódicos y en la tele, y lo que te sirve para entenderte con "
        "cualquiera venga de donde venga.\n\n"
        "No vino a sustituir a los dialectos: convive con ellos. La gente "
        "habla su euskalki en casa y batua en un examen, y mezcla las dos "
        "cosas sin pensarlo.\n\n"
        "<b>Lo que aprendes en esta app es batua.</b>"),
        ejemplos=[
            dict(eu="batua", es="el euskera unificado"),
            dict(eu="euskara batua", es="euskera batua, el estándar"),
        ]),

    dict(subnivel=SUB, titulo="El botón de arriba, explicado", cuerpo=(
        "Habrás visto en la barra de arriba un botón que pone "
        "<b>Bizkaiera / Gernikera</b>. Ahora ya tiene sentido.\n\n"
        "Ese botón no cambia el idioma que aprendes —siempre es batua—, sino "
        "<b>qué sabor local lo acompaña</b>:\n\n"
        "<b>Bizkaiera</b> — las formas que se oyen en Bilbao y alrededores. "
        "Es la opción por defecto.\n"
        "<b>Gernikera</b> — las de la zona de Gernika, en la costa de "
        "Bizkaia, algo más cerradas.\n\n"
        "Elijas la que elijas, la gramática y el vocabulario base son los "
        "mismos. Lo que cambia son las notas de «cómo suena esto por aquí» y "
        "algunas palabras del día a día.\n\n"
        "Si estás empezando y no tienes preferencia, déjalo en bizkaiera."),
        ejemplos=[
            dict(eu="bizkaiera", es="el habla de Bizkaia"),
            dict(eu="batua", es="el estándar, lo que enseña la app"),
        ]),
]

ejercicios = [
    dict(id="u1-g13", subnivel=SUB, variantes=[
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿Qué es «Euskal Herria»?",
             opciones=["Una ciudad", "El territorio donde se habla euskera", "Un dialecto", "La academia de la lengua"],
             correcta=1, explicacion="Siete zonas repartidas entre España y Francia."),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿Cuántas zonas forman Euskal Herria?",
             opciones=["Tres", "Cuatro", "Siete", "Diez"],
             correcta=2, explicacion="Cuatro al sur y tres al norte."),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿En qué zona está Bilbao?",
             opciones=["Bizkaia", "Gipuzkoa", "Araba", "Nafarroa"],
             correcta=0, explicacion="Bilbo es la capital de Bizkaia."),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿Qué significa «euskalki»?",
             opciones=["Lengua", "Dialecto", "Pueblo", "Escuela"],
             correcta=1, explicacion="Cada forma local de hablar euskera."),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿Qué es el «batua»?",
             opciones=["Un dialecto más", "El euskera unificado, el estándar",
                       "El euskera antiguo", "El euskera de Francia"],
             correcta=1, explicacion="Fijado en 1968 para que todos se entendieran por escrito."),
    ]),
    dict(id="u1-g14", subnivel=SUB, variantes=[
        dict(tipo="pares", instruccion="Empareja cada zona con su capital",
             pares=[dict(eu="Bizkaia", es="Bilbao"), dict(eu="Gipuzkoa", es="San Sebastián"),
                    dict(eu="Araba", es="Vitoria"), dict(eu="Nafarroa", es="Pamplona")]),
        dict(tipo="pares", instruccion="Empareja cada zona con su dialecto",
             pares=[dict(eu="Bizkaia", es="bizkaiera"), dict(eu="Gipuzkoa", es="gipuzkera"),
                    dict(eu="Lapurdi", es="lapurtera"), dict(eu="Zuberoa", es="zuberera")]),
        dict(tipo="pares", instruccion="Empareja las palabras de la lengua",
             pares=[dict(eu="euskara", es="el euskera"), dict(eu="euskalkia", es="el dialecto"),
                    dict(eu="batua", es="el estándar"), dict(eu="Euskal Herria", es="el País Vasco")]),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="El botón «Bizkaiera / Gernikera» de la barra de arriba…",
             opciones=["Cambia el idioma de la app", "Elige qué sabor local acompaña al batua",
                       "Cambia el nivel", "Activa el audio"],
             correcta=1, explicacion="El batua es el mismo; cambian las notas locales."),
        dict(tipo="opcion", instruccion="Elige la opción correcta",
             pregunta="¿Qué relación hay entre el batua y los dialectos?",
             opciones=["El batua los sustituyó", "Conviven: batua para escribir, el dialecto en casa",
                       "Son lenguas distintas", "Los dialectos ya no se usan"],
             correcta=1, explicacion="La gente mezcla las dos cosas sin pensarlo."),
    ]),
]


def main():
    # ── Unidad 1: añadir el subnivel ──
    d = json.load(open(U1, encoding="utf-8"))
    if any(s["id"] == SUB for s in d["subniveles"]):
        print("1.4 ya existía; se rehace")
        d["subniveles"] = [s for s in d["subniveles"] if s["id"] != SUB]
        d["gramatica"] = [g for g in d["gramatica"] if g.get("subnivel") != SUB]
        d["vocabulario"] = [v for v in d["vocabulario"] if v.get("subnivel") != SUB]
        d["ejercicios"] = [e for e in d["ejercicios"] if e.get("subnivel") != SUB]

    d["subniveles"].append(dict(
        id=SUB, titulo="Dónde se habla",
        resumen="Euskal Herria, los dialectos y por qué existe el batua."))
    d["gramatica"] += gramatica
    d["vocabulario"] += vocabulario
    d["ejercicios"] += ejercicios
    d["objetivo"] = ("Saludar, despedirte y dar las gracias, y entender dónde se "
                     "habla euskera y por qué hay más de una forma de hablarlo.")
    json.dump(d, open(U1, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(U1, "a").write("\n")
    print(f"u1: +1 subnivel, +{len(gramatica)} fichas, +{len(vocabulario)} palabras, "
          f"+{len(ejercicios)} grupos")

    # ── «euskara» se muda de la unidad 7 a la 1 ──
    d7 = json.load(open(U7, encoding="utf-8"))
    antes = len(d7["vocabulario"])
    d7["vocabulario"] = [v for v in d7["vocabulario"] if v["eu"].lower() != "euskara"]
    if len(d7["vocabulario"]) < antes:
        json.dump(d7, open(U7, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(U7, "a").write("\n")
        print("u7: «euskara» retirada (se ha mudado a 1.4)")

    # ── Unidad 8: quitar el 8.6, que se ha ido a la unidad 1 ──
    d8 = json.load(open(U8, encoding="utf-8"))
    tenia = len(d8["subniveles"])
    d8["subniveles"] = [s for s in d8["subniveles"] if s["id"] != "8.6"]
    for clave in ("gramatica", "vocabulario", "ejercicios"):
        d8[clave] = [x for x in d8[clave] if x.get("subnivel") != "8.6"]
    if len(d8["subniveles"]) < tenia:
        json.dump(d8, open(U8, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(U8, "a").write("\n")
        print(f"u8: 8.6 retirado ({tenia} → {len(d8['subniveles'])} subniveles)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reestructura el curso en 10 unidades con subniveles.

Lee las 17 unidades actuales (12 de Miguel + 5 sub-unidades) y las
redistribuye según docs/propuesta-10-unidades.md. No inventa contenido:
solo lo recoloca y lo etiqueta con su subnivel. Lo nuevo del A1 se
escribe aparte, en una segunda fase.

Salida: data/unidades-v2/*.json + data/curso-v2.json, para poder
comparar con lo actual sin romperlo.
"""
import json, os, re, glob, collections

RAIZ = os.path.expanduser("~/Proyectos/euskaraz")
ORIG = os.path.join(RAIZ, "data/unidades")
DEST = os.path.join(RAIZ, "data/unidades-v2")

# ── Las diez unidades ────────────────────────────────────
UNIDADES = [
    dict(id="u1", numero=1, titulo="Kaixo!", subtitulo="Saludos y primeros sonidos",
         objetivo="Saludar, despedirte y dar las gracias, y hacerte al oído con los sonidos del euskera.",
         color="rojo", subniveles=[
             ("1.1", "Saludos y despedidas", "Kaixo, egun on, agur… y cómo se encadenan."),
             ("1.2", "Cortesía y cómo estás", "Gracias, por favor, perdón. Y responder si estás bien o mal."),
             ("1.3", "Pronunciación y dialectos", "Los sonidos que hay que tener claros desde el primer día."),
         ]),
    dict(id="u2", numero=2, titulo="Ni eta zu", subtitulo="Las personas y presentarse",
         objetivo="Decir quién eres, de dónde y a qué te dedicas, con el verbo «izan».",
         color="azul", subniveles=[
             ("2.1", "Los pronombres", "Seis personas y ninguna con género."),
             ("2.2", "Los posesivos", "Nire, zure, gure… de quién es cada cosa."),
             ("2.3", "El verbo «izan»", "Ser, el verbo al final, y el artículo -a."),
             ("2.4", "Presentarse", "Nombre, origen y profesión."),
         ]),
    dict(id="u3", numero=3, titulo="Galderak", subtitulo="Preguntar y señalar",
         objetivo="Hacer las preguntas básicas y señalar lo que tienes cerca y lejos.",
         color="ocre", subniveles=[
             ("3.1", "Las interrogativas", "Nor, zer, non, noiz… casi todas con n- o z-."),
             ("3.2", "La familia de «non»", "Nora, nondik, nongoa: un anticipo del sistema."),
             ("3.3", "Demostrativos", "Hau, hori, hura y sus plurales."),
             ("3.4", "Exclamativas y apuros", "«Hau hotza!» y las frases que salvan cualquier situación."),
         ]),
    dict(id="u4", numero=4, titulo="Zenbat eta familia", subtitulo="Números, tener y la familia",
         objetivo="Contar, decir tu edad y hablar de los tuyos.",
         color="verde", subniveles=[
             ("4.1", "Números del 1 al 20", "Y por qué el euskera cuenta de veinte en veinte."),
             ("4.2", "Seguir contando", "Berrogei, hirurogei, ehun: el resto de la escalera."),
             ("4.3", "Ordinales", "Lehena, bigarrena, hirugarrena…"),
             ("4.4", "Tener, y decir tu edad", "El verbo «ukan» y la -k del ergativo."),
             ("4.5", "El otro tener: «eduki»", "Daukat, dauka: cuándo se oye cada uno."),
             ("4.6", "La familia cercana", "Los hermanos cambian según quién los tiene."),
             ("4.7", "La familia extendida", "Abuelos, tíos, primos — y las formas de Bizkaia."),
             ("4.8", "Animales", "Los de casa y los de fuera."),
         ]),
    dict(id="u5", numero=5, titulo="Etxea", subtitulo="Estar, la casa y describirla",
         objetivo="Decir dónde estás y describir tu casa con colores y adjetivos.",
         color="ocre", subniveles=[
             ("5.1", "El verbo «egon» y el sitio", "Estar, y el -n de «en»."),
             ("5.2", "La casa por dentro", "Habitaciones y muebles. Y el patrón -gela."),
             ("5.3", "Los colores", "Adjetivos, y van donde van los adjetivos."),
             ("5.4", "«Una» se dice con «bat»", "Etxe gorria frente a etxe gorri bat."),
         ]),
    dict(id="u6", numero=6, titulo="Egutegia", subtitulo="La hora, los días y el año entero",
         objetivo="Decir qué hora es, qué día, en qué mes, y qué tiempo hace.",
         color="azul", subniveles=[
             ("6.1", "La hora", "Va en plural, y media, menos cuarto."),
             ("6.2", "Los días y la costumbre", "La semana, y cada cuánto haces las cosas."),
             ("6.3", "Los meses", "Los doce, y «en mayo»."),
             ("6.4", "Estaciones y tiempo", "Las cuatro estaciones salen de «uda»."),
             ("6.5", "Las fiestas del año", "Gabonak, Olentzero, Inauteriak."),
         ]),
    dict(id="u7", numero=7, titulo="Zer egiten duzu?", subtitulo="El presente de cada día",
         objetivo="Contar lo que haces normalmente, y negarlo. El salto grande del curso.",
         color="rojo", subniveles=[
             ("7.1", "El presente habitual", "El mecanismo de dos piezas: -t(z)en + dut."),
             ("7.2", "Negar", "El salto del auxiliar y el partitivo -(r)ik."),
             ("7.3", "La rutina diaria", "Levantarse, ducharse, las tareas de casa."),
             ("7.4", "«Estoy haciéndolo»", "Ari naiz: ahora mismo frente a normalmente."),
             ("7.5", "Comer y beber", "La comida, la bebida y las tres comidas del día."),
         ]),
    dict(id="u8", numero=8, titulo="Mugi zaitez!", subtitulo="Moverse, mandar y la ciudad",
         objetivo="Ir y venir, dar indicaciones, y moverte por la ciudad.",
         color="verde", subniveles=[
             ("8.1", "Ir y venir", "Joan, etorri, ibili."),
             ("8.2", "En qué vas, y por dónde", "El transporte y la -z de «por medio de»."),
             ("8.3", "Dar indicaciones", "El imperativo, con el camino en la mano."),
             ("8.4", "Poder y deber", "Ahal, ezin, behar: hacer planes."),
             ("8.5", "La ciudad y sus servicios", "Correos, banco, ayuntamiento, bares."),
             ("8.6", "Euskal Herria", "Los territorios y dónde se habla qué."),
         ]),
    dict(id="u9", numero=9, titulo="Gustatzen zait", subtitulo="Gustos, el cuerpo y regalos",
         objetivo="Decir qué te gusta y qué no, hablar del cuerpo y comprar un regalo.",
         color="morado", subniveles=[
             ("9.1", "Me gusta", "Zait y zaizkit: singular y plural."),
             ("9.2", "A quién le gusta", "El dativo, y los verbos que funcionan igual."),
             ("9.3", "El cuerpo", "Aprovechando los gustos, que es donde se ve mejor."),
             ("9.4", "Ocio y medios", "Deporte, música, cine, periódicos y televisión."),
             ("9.5", "De compras", "La ropa, los regalos y para quién son."),
         ]),
    dict(id="u10", numero=10, titulo="Atzo eta bihar", subtitulo="El pasado, el futuro y cerrar el nivel",
         objetivo="Contar lo que hiciste y lo que vas a hacer, comparar, y repasar todo el A1.",
         color="negro", subniveles=[
             ("10.1", "El pasado", "Izan y ukan en pasado: nintzen, nuen."),
             ("10.2", "Cuándo pasó", "Atzo, iaz, duela bi urte, txikitan."),
             ("10.3", "El futuro", "-ko / -go: planes y quedadas."),
             ("10.4", "Comparar", "Baino, -ago, -ena: más, menos, el que más."),
             ("10.5", "Redondear la frase", "La partícula «al» y los conectores."),
             ("10.6", "Dena batera", "Repaso general y el cuadro completo del A1."),
         ]),
]

# ── Mapa de fichas de gramática: (unidad origen, título) → subnivel ──
# None = se descarta (avisos de dialecto repetidos entre unidades).
GRAM = {
  ("u1","El euskera no se parece al castellano, y eso ayuda"):"1.1",
  ("u1","«on» = bueno, y va detrás"):"1.1",
  ("u1","Pronunciación: lo que necesitas hoy"):"1.3",
  ("u1","Cómo suena esto en Bizkaia"):"1.3",
  ("u1","Un aviso sobre los dialectos"):"1.3",

  ("u2","Seis personas, y ni una sola con género"):"2.1",
  ("u2","«zu» es tú y usted a la vez"):"2.1",
  ("u2","«hura» o «bera»: las dos se oyen"):"2.1",
  ("u2","Aviso: estos pronombres van a cambiar de forma"):"2.1",
  ("u2","Y muchas veces ni se dicen"):"2.1",
  ("u2","Los posesivos: nire, zure, gure…"):"2.2",
  ("u2","Las formas reforzadas: neu, zeu, geu"):"2.2",
  ("u2","Cómo suena esto en Bizkaia"):"2.1",
  ("u2","Un aviso sobre los dialectos"):None,

  ("u4","El verbo «izan» (ser) en presente"):"2.3",
  ("u4","El verbo va al final"):"2.3",
  ("u4","El artículo va pegado al final: -a"):"2.3",
  ("u4","Decir de dónde eres: -ko / -go"):"2.4",
  ("u4","Preguntar el nombre"):"2.4",
  ("u4","«ere» significa también, y va detrás"):"2.4",
  ("u4","Cómo suena esto en Bizkaia"):"2.3",
  ("u4","Un aviso sobre los dialectos"):None,

  ("u3","Casi todas empiezan por n- o por z-"):"3.1",
  ("u3","La palabra interrogativa va justo antes del verbo"):"3.1",
  ("u3","La familia de «non»: un anticipo del sistema"):"3.2",
  ("u3","«nondik» y «nongoa» no son lo mismo"):"3.2",
  ("u3","Frases hechas: apréndetelas enteras por ahora"):"3.4",
  ("u3","Cuatro respuestas que salvan cualquier apuro"):"3.4",
  ("u3","Cómo suena esto en Bizkaia"):"3.1",
  ("u3","Un aviso sobre los dialectos"):None,

  ("u5","Del once al diecinueve"):"4.1",
  ("u5","El sistema es de base veinte"):"4.1",
  ("u5","El verbo «ukan» (tener) en presente"):"4.4",
  ("u5","La -k del ergativo"):"4.4",
  ("u5","Cuando tienes varias cosas: dut → ditut"):"4.4",
  ("u5","Decir tu edad"):"4.4",
  ("u5","Hermano y hermana dependen de quién los tiene"):"4.6",
  ("u5","Cómo suena esto en Bizkaia"):"4.4",
  ("u5","Un aviso sobre los dialectos"):None,

  ("u5.1","Seguir contando: de veinte en veinte"):"4.2",
  ("u5.1","«Iloba» es sobrino y nieto a la vez"):"4.7",
  ("u5.1","«Mutil-laguna»: novio, o amigo chico"):"4.7",
  ("u5.1","Los abuelos tienen dos nombres en Bizkaia"):"4.7",
  ("u5.1","Cómo suena esto en Bizkaia"):"4.7",

  ("u6","El verbo «egon» (estar) en presente"):"5.1",
  ("u6","«En» se dice con -n al final"):"5.1",
  ("u6","Las cuatro preguntas de lugar, completas"):"5.1",
  ("u6","Adjetivos: detrás, y con el artículo al final"):"5.3",
  ("u6","Cómo suena esto en Bizkaia"):"5.2",
  ("u6","Un aviso sobre los dialectos"):None,

  ("u6.1","Las habitaciones acaban casi todas en -gela"):"5.2",
  ("u6.1","Los colores van donde van los adjetivos"):"5.3",
  ("u6.1","«Laranja» es la fruta y el color"):"5.3",
  ("u6.1","Para decir «una» hace falta «bat»"):"5.4",
  ("u6.1","Cómo suena esto en Bizkaia"):"5.2",

  ("u7","La hora va en plural"):"6.1",
  ("u7","Y media, y cuarto, menos cuarto"):"6.1",
  ("u7","«A las…» se dice con -etan"):"6.1",
  ("u7","Los días de la semana"):"6.2",
  ("u7","Cuándo: el día, el rato y la costumbre"):"6.2",
  ("u7","Cómo suena esto en Bizkaia"):"6.2",

  ("u7.1","Los doce meses"):"6.3",
  ("u7.1","«En mayo»: el mismo -n de siempre"):"6.3",
  ("u7.1","«Urtebetetzea»: el año que se llena"):"6.3",
  ("u7.1","Dos meses que también son otras cosas"):"6.3",
  ("u7.1","Cómo suena esto en Bizkaia"):"6.3",

  ("u10.1","Las cuatro estaciones salen de dos palabras"):"6.4",
  ("u10.1","El tiempo se «hace», como en castellano"):"6.4",
  ("u10.1","«Gabon» y «Gabonak»: cuidado con la -k"):"6.5",
  ("u10.1","Olentzero, el carbonero que baja del monte"):"6.5",
  ("u10.1","El cuerpo con «gustatzen»: singular y plural de golpe"):"9.3",
  ("u10.1","Cómo suena esto en Bizkaia"):"6.5",

  ("u8","Lo que haces cada día: verbo en -t(z)en + dut"):"7.1",
  ("u8","Cómo se forma el -t(z)en"):"7.1",
  ("u8","Cuando no hay objeto, el auxiliar es izan"):"7.1",
  ("u8","La negación: «ez» y el auxiliar dan un salto"):"7.2",
  ("u8","«Nada de eso»: el partitivo -(r)ik"):"7.2",
  ("u8","Si el objeto es plural: ditut"):"7.2",
  ("u8","Cómo suena esto en Bizkaia"):"7.1",

  ("u8.1","«Gatza» y «azukrea»: dos que se confunden"):"7.5",
  ("u8.1","Cómo suena esto en Bizkaia"):"7.5",
  ("u8.1","La txapela, el campeón y el campeonato"):"9.5",
  ("u8.1","Ropa que va siempre en plural"):"9.5",
  ("u8.1","Comprar y vender, que ya los tienes"):"9.5",

  ("u9","«Joan»: ir, en una sola pieza"):"8.1",
  ("u9","«Etorri» e «ibili»"):"8.1",
  ("u9","Adónde y de dónde, ahora con plurales"):"8.2",
  ("u9","Cómo vas: la -z de «por medio de»"):"8.2",
  ("u9","Dar indicaciones"):"8.3",
  ("u9","Cómo suena esto en Bizkaia"):"8.1",

  ("u10","«Me gusta» no funciona como en castellano… o sí"):"9.1",
  ("u10","Si lo que gusta va en plural: zaizkit"):"9.1",
  ("u10","Cuánto, y cómo negarlo"):"9.1",
  ("u10","Otros verbos que funcionan igual"):"9.2",
  ("u10","A quién: la -(r)i de los nombres"):"9.2",
  ("u10","Cómo suena esto en Bizkaia"):"9.2",

  ("u11","El pasado de «izan»"):"10.1",
  ("u11","El pasado de «ukan» (tener)"):"10.1",
  ("u11","El pasado de «egon»"):"10.1",
  ("u11","«Comí», «he comido» y «comía»"):"10.1",
  ("u11","Cuándo pasó"):"10.2",
  ("u11","Cómo suena esto en Bizkaia"):"10.2",

  ("u12","Más, menos, el que más"):"10.4",
  ("u12","Preguntas de sí o no: la partícula «al»"):"10.5",
  ("u12","Enlazar frases"):"10.5",
  ("u12","Todo el A1 en un cuadro"):"10.6",
  ("u12","Qué viene después"):"10.6",
  ("u12","Cómo suena esto en Bizkaia"):"10.6",
}

# ── Vocabulario: palabras concretas que cambian de sitio ──
# El resto va al subnivel por defecto de su unidad de origen.
VOCAB = {
  # u1
  "kaixo":"1.1","egun on":"1.1","arratsalde on":"1.1","gabon":"1.1","agur":"1.1",
  "ikusi arte":"1.1","gero arte":"1.1","bihar arte":"1.1","eta zu?":"1.2",
  "zer moduz?":"1.2","ondo":"1.2","oso ondo":"1.2","hala-hola":"1.2","gaizki":"1.2",
  "eskerrik asko":"1.2","ez horregatik":"1.2","mesedez":"1.2","barkatu":"1.2",
  "bai":"1.2","ez":"1.2","oso":"1.2",
  # u2 → 2.1 / 2.2
  "ni":"2.1","zu":"2.1","hura":"2.1","gu":"2.1","zuek":"2.1","haiek":"2.1",
  "bera":"2.1","hi":"2.1","neu":"2.2","zeu":"2.2","geu":"2.2",
  "nire":"2.2","zure":"2.2","haren":"2.2","gure":"2.2","zuen":"2.2","haien":"2.2",
  "laguna":"2.4","etxea":"5.2","herria":"2.4","izena":"2.4",
  "handia":"5.3","txikia":"5.3","polita":"5.3",
  # u4 → 2.3 / 2.4
  "naiz":"2.3","zara":"2.3","da":"2.3","gara":"2.3","zarete":"2.3","dira":"2.3",
  "irakaslea":"2.4","ikaslea":"2.4","medikua":"2.4","sukaldaria":"2.4",
  "langilea":"2.4","idazlea":"2.4","euskalduna":"2.4","erdalduna":"2.4",
  "baina":"2.4","ere":"2.4","hau":"3.3",
  # u5 → 4.x
  "urtea":"4.4","dut":"4.4","duzu":"4.4","du":"4.4","ditut":"4.4",
  "anaia":"4.6","arreba":"4.6","neba":"4.6","ahizpa":"4.6",
  "aita":"4.6","ama":"4.6","semea":"4.6","alaba":"4.6",
  "txakurra":"4.8","katua":"4.8",
  # u6 → 5.x
  "nago":"5.1","zaude":"5.1","dago":"5.1","daude":"5.1",
  "hemen":"5.1","hor":"5.1","han":"5.1","bizi naiz":"5.1",
  "kalea":"8.5","eskola":"8.5","lana":"8.5","taberna":"8.5",
  "berria":"5.3","zaharra":"5.3",
  # u7 → 6.x
  "ordua":"6.1","Zer ordu da?":"6.1","eta erdiak":"6.1","eta laurden":"6.1",
  "laurden gutxi":"6.1","goiza":"6.1","eguerdia":"6.1","arratsaldea":"6.1",
  "iluntzea":"6.1","gaua":"6.1",
  # u8 → 7.x
  "ogia":"7.5","ura":"7.5","kafea":"7.5","esnea":"7.5","ardoa":"7.5",
  "garagardoa":"7.5","arraina":"7.5","haragia":"7.5","barazkiak":"7.5",
  "sagarra":"7.5","gosaria":"7.5","bazkaria":"7.5","afaria":"7.5",
  "erosi":"9.5","saldu":"9.5","dirua":"9.5",
  "liburua":"9.4","musika":"9.4",
  # u9 → 8.x
  "geltokia":"8.2","autobusa":"8.2","trena":"8.2","kotxea":"8.2",
  "bizikleta":"8.2","oinez":"8.2",
  "merkatua":"8.5","azoka":"8.5","denda":"8.5","liburutegia":"8.5",
  "ospitalea":"8.5","hiria":"8.5",
  "zuzen":"8.3","ezkerrera":"8.3","eskuinera":"8.3",
  # u10 → 9.x
  "kirola":"9.4","futbola":"9.4","pilota":"9.4","dantza":"9.4",
  "zinema":"9.4","antzerkia":"9.4",
  "euria":"6.4","eguzkia":"6.4","negua":"6.4","uda":"6.4",
  # u11 → 10.x
  "oporrak":"10.2","jaiak":"6.5",
}

# Subnivel por defecto de cada unidad de origen, para lo que no esté arriba.
DEFECTO = {
  "u1":"1.1","u2":"2.1","u3":"3.1","u4":"2.4","u5":"4.4","u5.1":"4.7",
  "u6":"5.2","u6.1":"5.2","u7":"6.2","u7.1":"6.3","u8":"7.1","u8.1":"7.5",
  "u9":"8.1","u10":"9.1","u10.1":"9.3","u11":"10.1","u12":"10.5",
}

# A qué unidad nueva va cada unidad vieja (para los ejercicios).
DESTINO = {
  "u1":"u1","u2":"u2","u4":"u2","u3":"u3","u5":"u4","u5.1":"u4",
  "u6":"u5","u6.1":"u5","u7":"u6","u7.1":"u6","u10.1":"u6",
  "u8":"u7","u8.1":"u7","u9":"u8","u10":"u9","u11":"u10","u12":"u10",
}


def cargar():
    fuentes = {}
    for f in sorted(glob.glob(os.path.join(ORIG, "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        fuentes[d["id"]] = d
    return fuentes


def norm(s):
    return re.sub(r"\s+", " ", str(s or "")).strip().lower()


def main():
    fuentes = cargar()
    nuevas = {u["id"]: dict(u, gramatica=[], vocabulario=[], ejercicios=[]) for u in UNIDADES}
    # subniveles → lista de dicts
    for u in nuevas.values():
        u["subniveles"] = [dict(id=i, titulo=t, resumen=r) for i, t, r in u["subniveles"]]

    subs_validos = {s["id"] for u in nuevas.values() for s in u["subniveles"]}
    de_sub_a_unidad = {s["id"]: u["id"] for u in nuevas.values() for s in u["subniveles"]}

    huerfanas, sin_mapa = [], []

    # ── Gramática ────────────────────────────────────────
    for uid, d in fuentes.items():
        for g in d.get("gramatica", []):
            clave = (uid, g["titulo"])
            if clave not in GRAM:
                sin_mapa.append(f"ficha {uid} · {g['titulo']}")
                continue
            sub = GRAM[clave]
            if sub is None:
                continue
            g2 = dict(g, subnivel=sub)
            nuevas[de_sub_a_unidad[sub]]["gramatica"].append(g2)

    # ── Vocabulario ──────────────────────────────────────
    vistas = {}
    for uid, d in fuentes.items():
        for v in d.get("vocabulario", []):
            sub = VOCAB.get(norm(v["eu"]), DEFECTO.get(uid))
            if sub not in subs_validos:
                huerfanas.append(v["eu"]); continue
            clave = norm(v["eu"])
            if clave in vistas:      # ya colocada desde otra unidad
                continue
            vistas[clave] = sub
            nuevas[de_sub_a_unidad[sub]]["vocabulario"].append(dict(v, subnivel=sub))

    # ── Ejercicios ───────────────────────────────────────
    # Cada grupo va al subnivel cuyo vocabulario usa más. Si no se puede
    # decidir, al subnivel por defecto de su unidad de origen. Un tercio
    # de cada unidad se reserva para el test final.
    palabras_por_sub = collections.defaultdict(set)
    for u in nuevas.values():
        for v in u["vocabulario"]:
            palabras_por_sub[v["subnivel"]].add(norm(v["eu"]))

    # Además del vocabulario, los términos que su ficha destaca en <b>:
    # un subnivel como «Negar» no tiene palabras propias pero sí formas
    # verbales características, y sin esto se quedaba sin ejercicios.
    for u in nuevas.values():
        for g in u["gramatica"]:
            for m in re.findall(r"<b>([^<]{2,22})</b>", g.get("cuerpo", "")):
                t = norm(m).strip(".,;:!?()«»")
                if t and not t.startswith("-"):
                    palabras_por_sub[g["subnivel"]].add(t)

    for uid, d in fuentes.items():
        destino = DESTINO[uid]
        subs_destino = [s["id"] for s in nuevas[destino]["subniveles"]]
        for g in d.get("ejercicios", []):
            texto = norm(json.dumps(g, ensure_ascii=False))
            puntos = {}
            for s in subs_destino:
                n = sum(1 for p in palabras_por_sub[s] if p and p in texto)
                if n: puntos[s] = n
            sub = max(puntos, key=puntos.get) if puntos else DEFECTO.get(uid)
            if sub not in subs_destino:
                sub = subs_destino[0]
            g2 = dict(g, subnivel=sub, id=g["id"])
            nuevas[destino]["ejercicios"].append(g2)

    # Rebalanceo: ningún subnivel con contenido debe quedarse sin
    # ejercicios mientras otro de su unidad acumula varios. Se le pasa el
    # grupo del subnivel más cargado que mejor puntúe contra él.
    for u in nuevas.values():
        subs = [s["id"] for s in u["subniveles"]]
        tiene_algo = {s for s in subs
                      if any(x["subnivel"] == s for x in u["gramatica"])
                      or any(x["subnivel"] == s for x in u["vocabulario"])}
        for _ in range(12):
            porsub = collections.defaultdict(list)
            for g in u["ejercicios"]:
                porsub[g["subnivel"]].append(g)
            faltos = [s for s in subs if s in tiene_algo and not porsub[s]]
            if not faltos: break
            donante = max(subs, key=lambda s: len(porsub[s]))
            if len(porsub[donante]) < 2: break
            destino_s = faltos[0]
            mejor = max(porsub[donante], key=lambda g: sum(
                1 for t in palabras_por_sub[destino_s]
                if t and t in norm(json.dumps(g, ensure_ascii=False))))
            mejor["subnivel"] = destino_s

    # Reservar test: de cada subnivel con 3+ grupos, uno pasa al test.
    for u in nuevas.values():
        porsub = collections.defaultdict(list)
        for g in u["ejercicios"]:
            porsub[g["subnivel"]].append(g)
        for s, gs in porsub.items():
            if len(gs) >= 3:
                gs[-1]["subnivel"] = "test"

    # ── Escribir ─────────────────────────────────────────
    os.makedirs(DEST, exist_ok=True)
    indice = []
    for u in UNIDADES:
        n = nuevas[u["id"]]
        archivo = f"{n['numero']:02d}-{n['titulo'].split()[0].lower().strip('!?¿')}.json"
        with open(os.path.join(DEST, archivo), "w", encoding="utf-8") as f:
            json.dump(n, f, ensure_ascii=False, indent=2); f.write("\n")
        indice.append(f"unidades-v2/{archivo}")
        test = sum(1 for g in n["ejercicios"] if g["subnivel"] == "test")
        print(f"{n['numero']:>2} {n['titulo'][:22]:24} "
              f"{len(n['subniveles'])} subniveles · {len(n['gramatica']):2} fichas · "
              f"{len(n['vocabulario']):3} palabras · {len(n['ejercicios']):2} grupos ({test} de test)")

    meta = json.load(open(os.path.join(RAIZ, "data/curso.json"), encoding="utf-8"))["meta"]
    with open(os.path.join(RAIZ, "data/curso-v2.json"), "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "unidades": indice}, f, ensure_ascii=False, indent=2); f.write("\n")

    if sin_mapa:
        print("\n⚠ fichas sin mapear:", len(sin_mapa))
        for x in sin_mapa[:10]: print("   ", x)
    if huerfanas:
        print("\n⚠ palabras huérfanas:", len(huerfanas), huerfanas[:8])
    print(f"\nTotal: {sum(len(nuevas[u['id']]['vocabulario']) for u in UNIDADES)} palabras, "
          f"{sum(len(nuevas[u['id']]['ejercicios']) for u in UNIDADES)} grupos")


if __name__ == "__main__":
    main()

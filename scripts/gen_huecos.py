#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escribe los seis subniveles que faltaban: el contenido del A1 oficial
que el curso no cubría (ver docs/ideas-ric.md, análisis HEOC).

4.3  Ordinales          10.3 El futuro
4.5  eduki               7.3 La rutina diaria
7.4  ari naiz            8.4 Poder y deber

Todo el vocabulario nuevo está verificado contra el Hiztegi Batua de
Euskaltzaindia. Las frases de ejemplo son NUEVAS y no están verificadas
por hablante nativo: van marcadas en docs para la siguiente ronda.
"""
import json, os

RAIZ = os.path.expanduser("~/Proyectos/euskaraz")
D = os.path.join(RAIZ, "data/unidades-v2")

V = lambda eu, es, cat, sub, nota=None: dict(
    eu=eu, es=es, nota=nota, categoria=cat, subnivel=sub)
F = lambda sub, tit, cuerpo, ej: dict(
    subnivel=sub, titulo=tit, cuerpo=cuerpo,
    ejemplos=[dict(eu=a, es=b) for a, b in ej])


def op(preg, ops, ok, exp, inst="Elige la opción correcta"):
    assert 0 <= ok < len(ops) and len(set(ops)) == len(ops), preg
    return dict(tipo="opcion", instruccion=inst, pregunta=preg,
                opciones=list(ops), correcta=ok, explicacion=exp)


def pares(inst, ps):
    assert len(ps) == 4, inst
    return dict(tipo="pares", instruccion=inst,
                pares=[dict(eu=a, es=b) for a, b in ps])


def orden(es, eu, pal):
    assert " ".join(pal) == eu, eu
    return dict(tipo="orden", instruccion="Ordena las palabras", es=es, eu=eu,
                palabras=list(pal))


def grupo(gid, sub, *vs):
    assert len(vs) == 5, gid
    return dict(id=gid, subnivel=sub, variantes=list(vs))


# ══════════ 4.3 · Ordinales ══════════
ORD_VOC = [
    V("lehena", "el primero", "otros", "4.3", "También «lehenengoa»."),
    V("bigarrena", "el segundo", "otros", "4.3"),
    V("hirugarrena", "el tercero", "otros", "4.3"),
    V("laugarrena", "el cuarto", "otros", "4.3"),
    V("bosgarrena", "el quinto", "otros", "4.3"),
    V("azkena", "el último", "otros", "4.3"),
]
ORD_GRAM = [
    F("4.3", "Los ordinales: el número más «-garren»",
      "Ya sabes contar. Para decir «el primero, el segundo, el tercero» solo "
      "hace falta una pieza que se pega detrás del número: <b>-garren</b>.\n\n"
      "<b>bi</b> (dos) → <b>bigarren</b> → <b>bigarrena</b>, el segundo\n"
      "<b>hiru</b> (tres) → <b>hirugarren</b> → <b>hirugarrena</b>, el tercero\n"
      "<b>lau</b> (cuatro) → <b>laugarrena</b>\n"
      "<b>bost</b> (cinco) → <b>bosgarrena</b>\n\n"
      "Fíjate en que <i>bost</i> pierde la t: <b>bosgarrena</b>, no «bostgarrena».\n\n"
      "Y el primero es la excepción, como en casi todos los idiomas: no es "
      "«batgarrena» sino <b>lehena</b> (o <i>lehenengoa</i>).\n\n"
      "Para «el último» hay palabra propia: <b>azkena</b>.",
      [("lehena", "el primero"), ("bigarrena", "el segundo"),
       ("bosgarrena", "el quinto"), ("azkena", "el último")]),
    F("4.3", "Escribirlos con cifra",
      "Igual que en castellano escribimos «1.º» o «3.ª», en euskera se "
      "escribe la cifra y un punto:\n\n"
      "<b>1.</b> = lehena · <b>2.</b> = bigarrena · <b>3.</b> = hirugarrena\n\n"
      "Ese punto <i>sustituye</i> al «-garren». Así que si ves "
      "<b>3. solairua</b> en un ascensor, es «la tercera planta».\n\n"
      "Lo verás mucho en portales, calles y horarios.",
      [("hirugarrena", "el tercero"), ("laugarrena", "el cuarto")]),
]
ORD_EJ = [
    grupo("u4-g19", "4.3",
        op("«El segundo» se dice…", ["bata", "bigarrena", "bigarra", "bimena"], 1,
           "Bi + garren + a."),
        op("«El tercero» se dice…", ["hirurgarrena", "hirugarrena", "hiruena", "hirena"], 1,
           "Hiru + garren + a."),
        op("¿Cuál es la excepción, la que no lleva «-garren»?",
           ["el segundo", "el primero", "el cuarto", "el quinto"], 1,
           "El primero es «lehena», no «batgarrena»."),
        op("«Bosgarrena» es…", ["el cuarto", "el quinto", "el sexto", "el último"], 1,
           "Bost pierde la t: bosgarrena."),
        op("¿Qué significa «azkena»?", ["el primero", "el siguiente", "el último", "el mejor"], 2,
           "Azkena es el último, con palabra propia.")),
    grupo("u4-g20", "4.3",
        pares("Empareja los ordinales", [("lehena", "el primero"), ("bigarrena", "el segundo"),
                                         ("hirugarrena", "el tercero"), ("laugarrena", "el cuarto")]),
        pares("Empareja los ordinales", [("bosgarrena", "el quinto"), ("azkena", "el último"),
                                         ("lehena", "el primero"), ("hirugarrena", "el tercero")]),
        op("En un ascensor, «3. solairua» es…",
           ["la planta baja", "la tercera planta", "tres plantas", "el tercer edificio"], 1,
           "El punto detrás de la cifra hace de «-garren»."),
        op("¿Qué le pasa a «bost» al añadirle «-garren»?",
           ["No cambia", "Pierde la t", "Pierde la s", "Se dobla la t"], 1,
           "Bost → bosgarrena."),
        op("«Laugarrena» sale de…", ["lau (cuatro)", "lehen (antes)", "lan (trabajo)", "laster (pronto)"], 0,
           "Lau + garren + a.")),
]

# ══════════ 4.5 · eduki ══════════
EDU_VOC = [
    V("daukat", "(yo) tengo", "verbo", "4.5", "Del verbo «eduki». Se oye muchísimo."),
    V("daukazu", "(tú) tienes", "verbo", "4.5"),
    V("dauka", "(él/ella) tiene", "verbo", "4.5"),
    V("eduki", "tener", "verbo", "4.5", "El otro «tener», junto a «ukan»."),
]
EDU_GRAM = [
    F("4.5", "Hay dos maneras de decir «tengo»",
      "Ya tienes <b>dut</b>, de <i>ukan</i>. Pues existe otra, y en la calle "
      "se oye tanto o más:\n\n"
      "<b>daukat</b> — tengo\n"
      "<b>daukazu</b> — tienes\n"
      "<b>dauka</b> — tiene\n\n"
      "Vienen del verbo <b>eduki</b>. Y en la práctica, para las cosas del "
      "día a día, <i>dut</i> y <i>daukat</i> se usan casi indistintamente:\n\n"
      "<b>Kotxe bat dut.</b> = <b>Kotxe bat daukat.</b> — Tengo un coche.\n\n"
      "No tienes que elegir: reconoce las dos y usa la que te salga.",
      [("daukat", "tengo"), ("dauka", "tiene"),
       ("Kotxe bat daukat.", "Tengo un coche.")]),
    F("4.5", "Cuándo se prefiere cada una",
      "Si quieres afinar, hay una tendencia —no una regla— que ayuda:\n\n"
      "<b>eduki</b> (daukat) tira más hacia <i>tener algo en la mano, poseer "
      "algo concreto</i>: un coche, un perro, dinero, tiempo.\n\n"
      "<b>ukan</b> (dut) es más general y es el que aparece pegado a otros "
      "verbos, como ya viste en <i>jaten dut</i>. Ahí <b>no</b> se puede "
      "cambiar por <i>daukat</i>.\n\n"
      "O sea: para cosas, las dos. Para el mecanismo de dos piezas, solo "
      "<i>dut</i>.",
      [("Dirua daukat.", "Tengo dinero."),
       ("Ez daukat astirik.", "No tengo tiempo.")]),
]
EDU_EJ = [
    grupo("u4-g21", "4.5",
        op("«Daukat» significa…", ["tengo", "quiero", "soy", "estoy"], 0,
           "Es «tengo», del verbo eduki."),
        op("¿Cuál es el otro verbo para «tener», junto a «ukan»?",
           ["egon", "eduki", "izan", "joan"], 1, "Eduki: daukat, daukazu, dauka."),
        op("«Kotxe bat daukat» se puede decir también…",
           ["Kotxe bat dut", "Kotxe bat naiz", "Kotxe bat nago", "Kotxe bat da"], 0,
           "Para cosas concretas, dut y daukat se usan casi igual."),
        op("En «jaten dut», ¿se puede cambiar «dut» por «daukat»?",
           ["Sí, siempre", "No: ahí solo vale dut", "Solo en Bizkaia", "Solo en pasado"], 1,
           "Pegado a otro verbo, el auxiliar es siempre «dut»."),
        op("«Dauka» es…", ["tengo", "tienes", "tiene", "tenemos"], 2,
           "Tercera persona: él o ella tiene.")),
    grupo("u4-g22", "4.5",
        pares("Empareja el verbo «eduki»", [("daukat", "tengo"), ("daukazu", "tienes"),
                                            ("dauka", "tiene"), ("eduki", "tener")]),
        pares("Empareja las dos formas de tener", [("dut", "tengo (ukan)"), ("daukat", "tengo (eduki)"),
                                                   ("duzu", "tienes (ukan)"), ("daukazu", "tienes (eduki)")]),
        orden("Tengo dinero.", "Dirua daukat.", ["Dirua", "daukat."]),
        op("¿Cuál de estas suena más natural para «tengo un perro»?",
           ["Txakur bat daukat", "Txakur bat naiz", "Txakur bat nago", "Txakur bat dago"], 0,
           "Una cosa concreta: daukat encaja perfecto."),
        op("«Eduki» tira más hacia…",
           ["poseer algo concreto", "moverse", "estar en un sitio", "gustar"], 0,
           "Un coche, un perro, dinero, tiempo.")),
]

# ══════════ 7.3 · La rutina diaria ══════════
RUT_VOC = [
    V("esnatu", "despertarse", "verbo", "7.3"),
    V("jaiki", "levantarse", "verbo", "7.3", "Salir de la cama."),
    V("dutxatu", "ducharse", "verbo", "7.3"),
    V("jantzi", "vestirse", "verbo", "7.3"),
    V("gosaldu", "desayunar", "verbo", "7.3"),
    V("bazkaldu", "comer (al mediodía)", "verbo", "7.3"),
    V("afaldu", "cenar", "verbo", "7.3"),
    V("garbitu", "limpiar", "verbo", "7.3"),
    V("lo egin", "dormir", "verbo", "7.3", "Literalmente «hacer sueño»."),
    V("etxeko lanak", "las tareas de casa", "sustantivo", "7.3"),
]
RUT_GRAM = [
    F("7.3", "Un día entero, de la cama a la cama",
      "Con el mecanismo que acabas de aprender puedes contar tu día. Estos "
      "son los verbos que hacen falta, en el orden en que pasan:\n\n"
      "<b>esnatu</b> — despertarse\n"
      "<b>jaiki</b> — levantarse (salir de la cama)\n"
      "<b>dutxatu</b> — ducharse\n"
      "<b>jantzi</b> — vestirse\n"
      "<b>gosaldu</b> — desayunar\n"
      "<b>bazkaldu</b> — comer al mediodía\n"
      "<b>afaldu</b> — cenar\n"
      "<b>lo egin</b> — dormir\n\n"
      "Casi todos son de los que no llevan objeto, así que el auxiliar es "
      "<i>izan</i>, no <i>ukan</i>: <b>jaikitzen naiz</b>, no «jaikitzen dut».",
      [("Goizean jaikitzen naiz.", "Por la mañana me levanto."),
       ("Etxean afaltzen dut.", "Ceno en casa.")]),
    F("7.3", "Las tres comidas tienen su verbo propio",
      "Aquí el euskera es más económico que el castellano. Donde nosotros "
      "decimos «tomar el desayuno» o «hacer la cena», el euskera tiene un "
      "verbo para cada comida, sacado del nombre:\n\n"
      "<b>gosaria</b> (el desayuno) → <b>gosaldu</b>, desayunar\n"
      "<b>bazkaria</b> (la comida) → <b>bazkaldu</b>, comer\n"
      "<b>afaria</b> (la cena) → <b>afaldu</b>, cenar\n\n"
      "Los tres nombres ya los tienes de antes. Los verbos son gratis.",
      [("gosaldu", "desayunar"), ("bazkaldu", "comer"), ("afaldu", "cenar")]),
    F("7.3", "«Lo egin»: dormir es «hacer sueño»",
      "Algunas acciones no tienen un verbo propio, sino que se construyen con "
      "<b>egin</b> (hacer) más un nombre. Ya viste <i>lan egin</i> (trabajar) "
      "y <i>hitz egin</i> (hablar). Pues:\n\n"
      "<b>lo</b> (el sueño) + <b>egin</b> → <b>lo egin</b>, dormir\n\n"
      "Y como lleva a <i>egin</i> dentro, el auxiliar sí es <i>ukan</i>: "
      "<b>lo egiten dut</b>.\n\n"
      "Es el mismo patrón de siempre, solo que ahora lo reconoces.",
      [("lo egin", "dormir"), ("Ondo lo egiten dut.", "Duermo bien.")]),
]
RUT_EJ = [
    grupo("u7-g18", "7.3",
        pares("Empareja la rutina", [("esnatu", "despertarse"), ("jaiki", "levantarse"),
                                     ("dutxatu", "ducharse"), ("jantzi", "vestirse")]),
        pares("Empareja las comidas", [("gosaldu", "desayunar"), ("bazkaldu", "comer"),
                                       ("afaldu", "cenar"), ("lo egin", "dormir")]),
        pares("Empareja la casa", [("garbitu", "limpiar"), ("etxeko lanak", "las tareas de casa"),
                                   ("jaiki", "levantarse"), ("afaldu", "cenar")]),
        op("¿Qué significa «jaiki»?", ["dormir", "levantarse", "ducharse", "limpiar"], 1,
           "Salir de la cama."),
        op("¿Qué significa «gosaldu»?", ["cenar", "comer", "desayunar", "cocinar"], 2,
           "De «gosaria», el desayuno.")),
    grupo("u7-g19", "7.3",
        op("«Dormir» se dice…", ["lo egin", "lo izan", "lo hartu", "lo joan"], 0,
           "Lo (sueño) + egin (hacer), como «lan egin»."),
        op("¿De qué palabra sale «afaldu»?", ["afaria (la cena)", "arratsaldea (la tarde)",
                                              "afizioa", "aparta"], 0,
           "Cada comida da su verbo."),
        op("«Me levanto» se dice…", ["jaikitzen dut", "jaikitzen naiz", "jaiki nago", "jaikitzen da"], 1,
           "No lleva objeto, así que el auxiliar es «izan»."),
        op("¿Qué significa «etxeko lanak»?",
           ["los deberes del cole", "las tareas de casa", "el trabajo", "la familia"], 1,
           "Literalmente «los trabajos de casa». Ojo: también valen los deberes escolares."),
        orden("Por la mañana me levanto.", "Goizean jaikitzen naiz.",
              ["Goizean", "jaikitzen", "naiz."])),
]

# ══════════ 7.4 · ari naiz ══════════
ARI_VOC = [
    V("ari naiz", "estoy (haciendo algo)", "verbo", "7.4", "Para lo que pasa ahora mismo."),
    V("ari zara", "estás (haciendo algo)", "verbo", "7.4"),
    V("ari da", "está (haciendo algo)", "verbo", "7.4"),
]
ARI_GRAM = [
    F("7.4", "«Como» frente a «estoy comiendo»",
      "<b>Jaten dut</b> es lo que haces normalmente. Pero para lo que estás "
      "haciendo <i>ahora mismo</i>, el euskera tiene otra construcción:\n\n"
      "<b>jaten ari naiz</b> — estoy comiendo\n"
      "<b>ikasten ari naiz</b> — estoy estudiando\n\n"
      "La receta es la misma de siempre —el verbo en <b>-t(z)en</b>— pero en "
      "vez de <i>dut</i> se pone <b>ari</b> más el verbo <i>izan</i>:\n\n"
      "<b>ari naiz</b> — yo estoy\n"
      "<b>ari zara</b> — tú estás\n"
      "<b>ari da</b> — él o ella está\n\n"
      "Fíjate en un detalle que sorprende: aunque comas algo, aquí el "
      "auxiliar es <i>izan</i> (naiz), nunca <i>dut</i>.",
      [("Jaten ari naiz.", "Estoy comiendo."),
       ("Ikasten ari zara.", "Estás estudiando."),
       ("Euskara ikasten ari naiz.", "Estoy aprendiendo euskera.")]),
    F("7.4", "Cuándo usar una y cuándo la otra",
      "La diferencia es la misma que en castellano, así que te va a salir "
      "sola:\n\n"
      "<b>Kafea edaten dut.</b> — Tomo café. (todos los días, es lo que hago)\n"
      "<b>Kafea edaten ari naiz.</b> — Estoy tomando café. (ahora, en este "
      "momento)\n\n"
      "Si alguien te pregunta <i>zer egiten ari zara?</i> —«¿qué estás "
      "haciendo?»— te está preguntando por ahora mismo, no por tu vida.",
      [("Kafea edaten dut.", "Tomo café."),
       ("Kafea edaten ari naiz.", "Estoy tomando café."),
       ("Zer egiten ari zara?", "¿Qué estás haciendo?")]),
]
ARI_EJ = [
    grupo("u7-g20", "7.4",
        op("«Estoy comiendo» se dice…",
           ["jaten dut", "jaten ari naiz", "jaten naiz", "jaten ari dut"], 1,
           "El verbo en -t(z)en, más «ari» y el verbo izan."),
        op("«Jaten dut» significa…",
           ["estoy comiendo", "como (normalmente)", "comí", "comeré"], 1,
           "Es lo habitual. Para ahora mismo, «jaten ari naiz»."),
        op("Con «ari», el auxiliar es siempre…",
           ["dut", "izan (naiz, zara, da)", "dago", "daukat"], 1,
           "Aunque haya objeto, siempre «naiz»."),
        op("«Ikasten ari zara» significa…",
           ["estudias", "estás estudiando", "estudiaste", "vas a estudiar"], 1,
           "Ahora mismo, en este momento."),
        op("«Zer egiten ari zara?» te pregunta por…",
           ["tu trabajo", "lo que estás haciendo ahora", "tus planes", "tu rutina"], 1,
           "Por este momento, no por tu vida en general.")),
    grupo("u7-g21", "7.4",
        pares("Empareja el presente continuo", [("ari naiz", "estoy"), ("ari zara", "estás"),
                                                ("ari da", "está"), ("jaten ari naiz", "estoy comiendo")]),
        orden("Estoy comiendo.", "Jaten ari naiz.", ["Jaten", "ari", "naiz."]),
        orden("Estoy aprendiendo euskera.", "Euskara ikasten ari naiz.",
              ["Euskara", "ikasten", "ari", "naiz."]),
        op("«Kafea edaten ari naiz» quiere decir…",
           ["Tomo café todos los días", "Estoy tomando café ahora",
            "Tomé café", "Quiero un café"], 1, "Ahora mismo."),
        op("¿Cuál usarías para «trabajo en Bilbao» (tu empleo)?",
           ["Bilbon lan egiten dut", "Bilbon lan egiten ari naiz",
            "Bilbon lan ari naiz", "Bilbon lan naiz"], 0,
           "Es lo habitual, no lo de ahora mismo.")),
]

# ══════════ 8.4 · Poder y deber ══════════
POD_VOC = [
    V("ahal dut", "puedo", "verbo", "8.4", "Tener la posibilidad de hacer algo."),
    V("ezin dut", "no puedo", "verbo", "8.4", "Fíjate: no lleva «ez» delante, ya va dentro."),
    V("behar dut", "tengo que, necesito", "verbo", "8.4"),
    V("nahi dut", "quiero", "verbo", "8.4", "Ya la tenías; aquí se ve en familia."),
]
POD_GRAM = [
    F("8.4", "Poder, querer y tener que",
      "Tres piezas que se montan igual y que abren muchísimo lo que puedes "
      "decir. Todas van con el verbo en su forma de diccionario delante:\n\n"
      "<b>Joan nahi dut.</b> — Quiero ir.\n"
      "<b>Joan behar dut.</b> — Tengo que ir.\n"
      "<b>Joan ahal dut.</b> — Puedo ir.\n\n"
      "El orden es siempre el mismo: <i>verbo + nahi/behar/ahal + auxiliar</i>. "
      "Y <b>nahi</b> ya lo conocías de la unidad de comer: es la misma pieza.",
      [("Joan nahi dut.", "Quiero ir."),
       ("Lan egin behar dut.", "Tengo que trabajar."),
       ("Etorri ahal zara?", "¿Puedes venir?")]),
    F("8.4", "«Ezin» es «no puedo», sin «ez»",
      "Aquí hay una rareza que conviene tener clara desde el principio.\n\n"
      "Para negar casi todo se pone <b>ez</b> delante, como ya sabes. Pero "
      "«no poder» tiene palabra propia:\n\n"
      "<b>ahal dut</b> — puedo\n"
      "<b>ezin dut</b> — no puedo\n\n"
      "<i>Ezin</i> ya lleva la negación dentro, así que <b>no</b> se dice "
      "«ez ezin dut». Y por eso tampoco hace saltar el auxiliar como hace la "
      "negación normal.\n\n"
      "<b>Ezin dut joan.</b> — No puedo ir.",
      [("ahal dut", "puedo"), ("ezin dut", "no puedo"),
       ("Ezin dut joan.", "No puedo ir.")]),
]
POD_EJ = [
    grupo("u8-g13", "8.4",
        op("«Quiero ir» se dice…", ["Joan nahi dut", "Nahi joan dut", "Joan dut nahi", "Nahi dut joan"], 0,
           "Verbo + nahi + auxiliar."),
        op("«Tengo que trabajar» se dice…",
           ["Lan egin behar dut", "Behar lan egin dut", "Lan behar egin dut", "Lan egin dut behar"], 0,
           "Mismo orden que con «nahi»."),
        op("«No puedo» se dice…", ["ez ahal dut", "ezin dut", "ez ezin dut", "ahal ez dut"], 1,
           "«Ezin» ya lleva la negación dentro."),
        op("¿Qué tiene de raro «ezin»?",
           ["Va al final", "Ya lleva la negación dentro", "No lleva auxiliar", "Solo vale en pasado"], 1,
           "Por eso no se le pone «ez» delante."),
        op("«Behar dut» significa…", ["puedo", "quiero", "tengo que", "voy a"], 2,
           "Tener que, o necesitar.")),
    grupo("u8-g14", "8.4",
        pares("Empareja", [("nahi dut", "quiero"), ("behar dut", "tengo que"),
                           ("ahal dut", "puedo"), ("ezin dut", "no puedo")]),
        orden("No puedo ir.", "Ezin dut joan.", ["Ezin", "dut", "joan."]),
        orden("Tengo que trabajar.", "Lan egin behar dut.", ["Lan", "egin", "behar", "dut."]),
        op("«Etorri ahal zara?» significa…",
           ["¿Quieres venir?", "¿Puedes venir?", "¿Vas a venir?", "¿Has venido?"], 1,
           "Ahal: tener la posibilidad."),
        op("¿Dónde va el verbo principal en estas construcciones?",
           ["Al final", "Delante de nahi/behar/ahal", "Detrás del auxiliar", "Da igual"], 1,
           "Joan nahi dut: primero el verbo.")),
]

# ══════════ 10.3 · El futuro ══════════
FUT_VOC = [
    V("etorkizuna", "el futuro", "sustantivo", "10.3"),
    V("asmoa", "la intención, el plan", "sustantivo", "10.3"),
    V("bihar", "mañana", "otros", "10.3", "Ya la tenías; aquí se usa con el futuro."),
]
FUT_GRAM = [
    F("10.3", "El futuro: una «-ko» y ya está",
      "De todas las cosas que has aprendido, esta es de las más baratas. Para "
      "hablar de lo que va a pasar, al verbo se le pega <b>-ko</b> (o "
      "<b>-go</b>) y el auxiliar se queda igual:\n\n"
      "<b>joan</b> → <b>joango naiz</b> — iré, voy a ir\n"
      "<b>egin</b> → <b>egingo dut</b> — haré, voy a hacer\n"
      "<b>ikasi</b> → <b>ikasiko dut</b> — estudiaré\n\n"
      "¿Cuándo <i>-ko</i> y cuándo <i>-go</i>? Por comodidad al hablar: "
      "detrás de <b>n</b> o <b>l</b> se pone <b>-go</b> (joan → joango, "
      "egin → egingo), y en los demás casos <b>-ko</b>.\n\n"
      "Es la misma lógica que hace que digamos «un» y no «uno» delante de "
      "nombre: la lengua busca lo que suena mejor.",
      [("Bihar joango naiz.", "Mañana iré."),
       ("Zer egingo duzu?", "¿Qué vas a hacer?"),
       ("Euskara ikasiko dut.", "Aprenderé euskera.")]),
    F("10.3", "Los tres tiempos, uno al lado del otro",
      "Ahora ya los tienes todos. Mira el mismo verbo en los tres:\n\n"
      "<b>Atzo joan nintzen.</b> — Ayer fui.\n"
      "<b>Gaur joaten naiz.</b> — Hoy voy (habitualmente).\n"
      "<b>Bihar joango naiz.</b> — Mañana iré.\n\n"
      "Fíjate en que el auxiliar es el que carga con casi todo el trabajo, y "
      "el verbo solo cambia de terminación: <i>joan</i>, <i>joaten</i>, "
      "<i>joango</i>.\n\n"
      "Ese es, en una línea, el motor del euskera que llevas todo el curso "
      "montando.",
      [("Atzo joan nintzen.", "Ayer fui."),
       ("Gaur joaten naiz.", "Hoy voy."),
       ("Bihar joango naiz.", "Mañana iré.")]),
]
FUT_EJ = [
    grupo("u10-g25", "10.3",
        op("«Mañana iré» se dice…",
           ["Bihar joan naiz", "Bihar joango naiz", "Bihar joaten naiz", "Bihar joan nintzen"], 1,
           "Joan + go + naiz."),
        op("«Haré» se dice…", ["egiten dut", "egingo dut", "egin dut", "egin nuen"], 1,
           "Egin acaba en n, así que -go."),
        op("¿Cuándo se usa «-go» en vez de «-ko»?",
           ["Siempre", "Detrás de n o l", "Solo con verbos de movimiento", "En pasado"], 1,
           "Joango, egingo: por comodidad al hablar."),
        op("«Ikasiko dut» significa…",
           ["estudio", "estudié", "estudiaré", "estoy estudiando"], 2,
           "Ikasi + ko + dut."),
        op("¿Qué cambia entre «joaten naiz» y «joango naiz»?",
           ["El auxiliar", "La terminación del verbo", "El orden", "Nada"], 1,
           "El auxiliar se queda igual; el verbo pasa de -ten a -go.")),
    grupo("u10-g26", "10.3",
        pares("Empareja los tres tiempos", [("joan nintzen", "fui"), ("joaten naiz", "voy"),
                                            ("joango naiz", "iré"), ("etorkizuna", "el futuro")]),
        orden("Mañana iré a Bilbao.", "Bihar Bilbora joango naiz.",
              ["Bihar", "Bilbora", "joango", "naiz."]),
        orden("¿Qué vas a hacer?", "Zer egingo duzu?", ["Zer", "egingo", "duzu?"]),
        op("«Zer egingo duzu bihar?» pregunta por…",
           ["lo que hiciste", "lo que haces siempre", "lo que vas a hacer", "lo que estás haciendo"], 2,
           "Bihar (mañana) + futuro."),
        op("«Etorkizuna» significa…", ["el pasado", "el futuro", "la costumbre", "el plan"], 1,
           "De «etorri», venir: lo que está por venir.")),
]

# ══════════ Montaje ══════════
BLOQUES = [
    ("01-kaixo.json", [], [], []),  # ya hecho aparte
    ("04-zenbat.json", ORD_GRAM + EDU_GRAM, ORD_VOC + EDU_VOC, ORD_EJ + EDU_EJ),
    ("07-zer.json", RUT_GRAM + ARI_GRAM, RUT_VOC + ARI_VOC, RUT_EJ + ARI_EJ),
    ("08-mugi.json", POD_GRAM, POD_VOC, POD_EJ),
    ("10-atzo.json", FUT_GRAM, FUT_VOC, FUT_EJ),
]


def main():
    for archivo, gram, voc, ejs in BLOQUES:
        if not (gram or voc or ejs):
            continue
        ruta = os.path.join(D, archivo)
        d = json.load(open(ruta, encoding="utf-8"))
        subs = {s["subnivel"] for s in gram} | {v["subnivel"] for v in voc}
        # Si se relanza, limpiar antes
        d["gramatica"] = [g for g in d["gramatica"] if g.get("subnivel") not in subs]
        d["vocabulario"] = [v for v in d["vocabulario"] if v.get("subnivel") not in subs]
        ids = {e["id"] for e in ejs}
        d["ejercicios"] = [e for e in d["ejercicios"] if e["id"] not in ids]

        d["gramatica"] += gram
        d["vocabulario"] += voc
        d["ejercicios"] += ejs
        json.dump(d, open(ruta, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(ruta, "a").write("\n")
        print(f"{archivo}: +{len(gram)} fichas, +{len(voc)} palabras, +{len(ejs)} grupos "
              f"→ subniveles {sorted(subs)}")


if __name__ == "__main__":
    main()

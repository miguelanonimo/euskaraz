// Los 108 audios que Ric marcó mal al revisar los 302 del curso.
//
// POR QUÉ AHORA. El 13/10 se regeneró «seigarrena» —que Ric había marcado
// mal el día anterior— metiéndole sus propias notas fonéticas, y el 18/10
// él mismo confirmó que ahora suena bien. Eso valida el método: las notas
// funcionan. Lo que falta es aplicarlas a los 108 que siguen con su
// fichero original, de entre el 7 y el 10 de octubre.
//
// Miguel generó lo que FALTABA (diccionario 556/556). Esto es lo otro:
// lo que está mal. Son dos trabajos distintos y este no se ha hecho.
//
//   cd scripts/generar-audio && npm install
//   mkdir -p /tmp/audio-trim-work/lote
//   node lote-revision-ric.mjs
//
// Salen a /tmp/audio-trim-work/lote/ con las barras cambiadas por guiones
// bajos. SUSTITUYEN a ficheros que ya existen: las 108 rutas están
// verificadas una a una contra el bucket, todas responden 200 y ninguna
// está repetida.
//
// Cada entrada lleva, en el comentario, lo que dijo Ric con sus palabras,
// y debajo la instrucción en inglés que se le pasa al modelo. Si al
// escuchar la nueva versión sigue fallando, es ese texto lo que hay que
// afinar, no la palabra.

import { GoogleAuth } from 'google-auth-library';
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';



// ── bloque 2 · unidad 5 · 15 audios ─────────────────────────────
const BLOQUE2 = [
  // Ric: se deben escuchar las dos «a» de mahai: ma-ai zuria
  { ruta: 'unidades/u5/mahai-zuria.mp3', texto: 'mahai zuria',
    nota: 'The h is completely silent, as in Spanish. In "mahai" both a sounds must be heard as two syllables: ma-ai. All vowels open and distinct, exactly as written.' },
  // Ric: mahai: deben sonar todas las letras salvo la h, que es muda
  { ruta: 'unidades/u5/mahai-zuri-bat.mp3', texto: 'mahai zuri bat',
    nota: 'The h is completely silent, as in Spanish. Every letter of "mahai" sounds except the h: ma-ai. All vowels open and distinct, exactly as written.' },
  // Ric: no suena la h, es algo como ma-ai
  { ruta: 'unidades/u5/mahai-batzuk.mp3', texto: 'mahai batzuk',
    nota: 'The h is completely silent, as in Spanish. Say "mahai" as ma-ai. The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: suena maiá y debe ser maai bat
  { ruta: 'unidades/u5/mahai-bat-eta-lau-aulki.mp3', texto: 'mahai bat eta lau aulki',
    nota: 'The h is completely silent, as in Spanish. "mahai" is two clear syllables ma-ai, not a diphthong "maiá". Leave a small pause between the words — do not run them together.' },
  // Ric: la i-n debe sonar ñ: baiñuguela
  { ruta: 'unidades/u5/bainugela.mp3', texto: 'bainugela',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "baiñugela". All vowels open and distinct, exactly as written.' },
  // Ric: la i-l debe sonar ll: eskaillerak
  { ruta: 'unidades/u5/eskailerak.mp3', texto: 'eskailerak',
    nota: 'Here the i+l is palatalized: say it with the "ll" of Spanish "llave" in a non-yeista accent — NOT an English y. Say "eskaillerak". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: urdina debe ser urdiña
  { ruta: 'unidades/u5/nire-logela-urdina-da.mp3', texto: 'nire logela urdina da',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "urdiña". The final "da" must be a clear dental d, as in Spanish "dato".' },
  // Ric: suena Grisha; la s es silbante
  { ruta: 'unidades/u5/grisa.mp3', texto: 'grisa',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh".' },
  // Ric: la z es silbante: Saldia
  { ruta: 'unidades/u5/zaldia.mp3', texto: 'zaldia',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: la j no es la castellana, mejor laranlla
  { ruta: 'unidades/u5/laranja.mp3', texto: 'laranja',
    nota: 'The j is NOT the Spanish jota of "jamon": it is a soft y/ll sound. Say "laranlla".' },
  // Ric: la segunda r no se escucha
  { ruta: 'unidades/u5/armairua.mp3', texto: 'armairua',
    nota: 'Both r sounds must be audible: ar-mai-ru-a. All vowels open and distinct, exactly as written.' },
  // Ric: la a suena separada, como txerriha; es seguida
  { ruta: 'unidades/u5/txerria.mp3', texto: 'txerria',
    nota: 'The final a runs straight on from the rr, with no break or h between them. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: no se entiende la k de beltzak; dira suena otra cosa
  { ruta: 'unidades/u5/aulki-batzuk-beltzak-dira.mp3', texto: 'aulki batzuk beltzak dira',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The k of "beltzak" must be clearly heard, and "dira" pronounced letter by letter. The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: dago suena nano; debe sonar con todas las letras
  { ruta: 'unidades/u5/txakurra-etxean-dago.mp3', texto: 'txakurra etxean dago',
    nota: 'Say "dago" with a clear hard g and a clear dental d — it must not sound like "nano". The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: la RR de gorria debe ser clara: Etxe GoRRia
  { ruta: 'unidades/u5/etxe-gorria.mp3', texto: 'etxe gorria',
    nota: 'The rr is a strongly rolled r, as in Spanish "perro".' },
];

// ── bloque 3 · unidad 6 · 14 audios ─────────────────────────────
const BLOQUE3 = [
  // Ric: la RR rodada, marcada, como «perro»
  { ruta: 'unidades/u6/elurra.mp3', texto: 'elurra',
    nota: 'The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: «berri» con RR rodada; aquí suena mal
  { ruta: 'unidades/u6/urte-berri.mp3', texto: 'urte berri',
    nota: 'The rr is a strongly rolled r, as in Spanish "perro". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: la a final abierta y clara: gabonAk
  { ruta: 'unidades/u6/gabonak.mp3', texto: 'gabonak',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The final a is open and clear: gabonAk.' },
  // Ric: la a final abierta y clara: zorionAk
  { ruta: 'unidades/u12/zorionak.mp3', texto: 'zorionak',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The final a is open and clear: zorionAk.' },
  // Ric: dice da como na: la d debe ser clara
  { ruta: 'unidades/u6/negua-hotza-da.mp3', texto: 'negua hotza da',
    nota: 'The d of "da" must be a clear dental d as in Spanish "dato" — it must not sound like an n. The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: la j sí debe ser la castellana; aquí suena como una s
  { ruta: 'unidades/u6/jaieguna.mp3', texto: 'jaieguna',
    nota: 'Here the j IS the Spanish jota of "jamon". It must not sound like an s.' },
  // Ric: hotz debe sonar claramente tz; suena och
  { ruta: 'unidades/u6/neguan-hotz-egiten-du.mp3', texto: 'neguan hotz egiten du',
    nota: 'The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: dicción más plana; parece acentuar varias palabras y «maiatzean da» suena arrastrado
  { ruta: 'unidades/u6/nire-urtebetetzea-maiatzean-da.mp3', texto: 'nire urtebetetzea maiatzean da',
    nota: 'Flat, even delivery: do not stress several words in the sentence, and do not drag "maiatzean da". Leave a small pause between the words — do not run them together.' },
  // Ric: más pausado, y el acento suena extranjero
  { ruta: 'unidades/u6/gaur-eguraldi-ona-dago.mp3', texto: 'gaur eguraldi ona dago',
    nota: 'Leave a small pause between the words — do not run them together. Slower, with a native Basque accent, not a foreign-sounding one.' },
  // Ric: más pausa entre palabras
  { ruta: 'unidades/u6/aste-nagusia.mp3', texto: 'aste nagusia',
    nota: 'Leave a small pause between the words — do not run them together.' },
  // Ric: las palabras sueltas están bien, pero la frase suena extraña
  { ruta: 'unidades/u6/zorionak-zuri.mp3', texto: 'zorionak zuri',
    nota: 'Each word is fine on its own; it is the phrasing that fails. Say it as a natural greeting, Leave a small pause between the words — do not run them together.' },
  // Ric: añade una s o algo en medio
  { ruta: 'unidades/u6/aratusteak.mp3', texto: 'aratusteak',
    nota: 'Four syllables only: a-ra-tus-te-ak. Do not insert any extra s or sound in the middle.' },
  // Ric: astelehena está mal pronunciado: dice otra palabra
  { ruta: 'unidades/u6/urriko-azken-astelehena.mp3', texto: 'urriko azken astelehena',
    nota: 'The h is completely silent, as in Spanish. "astelehena" is as-te-le-e-na, with the h silent and every syllable clear. Leave a small pause between the words — do not run them together.' },
  // Ric: ahora suena «aizer»; se tienen que entender la e y la a, con el acento en la é: haizéa
  { ruta: 'unidades/u6/haizea.mp3', texto: 'haizea',
    nota: 'The h is completely silent, as in Spanish. Three clear vowels at the end: hai-ZE-a, stress on the e. It must not end in an r sound.' },
];

// ── bloque 4 · unidad 7 · 18 audios ─────────────────────────────
const BLOQUE4 = [
  // Ric: más suave la ts, ahora suena como una ch
  { ruta: 'unidades/u7/mahatsa.mp3', texto: 'mahatsa',
    nota: 'The "ts" is a soft ts, NOT a "ch". The h is completely silent, as in Spanish. All vowels open and distinct, exactly as written.' },
  // Ric: el acento es en la primera a: gásta
  { ruta: 'unidades/u7/gazta.mp3', texto: 'gazta',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". Stress the FIRST syllable: GAZ-ta.' },
  // Ric: la z debe ser como una s silbante: arrosa
  { ruta: 'unidades/u7/arroza.mp3', texto: 'arroza',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: debe terminar claramente en -ldu
  { ruta: 'unidades/u7/bazkaldu.mp3', texto: 'bazkaldu',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off. End crisply on "-ldu".' },
  // Ric: tal y como se leería en español, falla el final
  { ruta: 'unidades/u7/afaldu.mp3', texto: 'afaldu',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. End crisply on "-ldu", read as it is written. All vowels open and distinct, exactly as written.' },
  // Ric: la u final debe ser clara, ahora suena como una o
  { ruta: 'unidades/u7/garbitu.mp3', texto: 'garbitu',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The final u is a clear u, never an o.' },
  // Ric: barazkiak con s silbante, ahora suena como si tuviera tz
  { ruta: 'unidades/u7/barazkiak-erosten-ditut.mp3', texto: 'barazkiak erosten ditut',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". "barazkiak" has a whistling s, not a ts. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: ditugu no se escucha claro, se debe pronunciar cada letra
  { ruta: 'unidades/u7/liburuak-irakurtzen-ditugu.mp3', texto: 'liburuak irakurtzen ditugu',
    nota: 'Pronounce "ditugu" letter by letter, every sound audible. The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: necesita pausar un poco entre las palabras
  { ruta: 'unidades/u7/ez-dut-ezer-nahi.mp3', texto: 'ez dut ezer nahi',
    nota: 'Leave a small pause between the words — do not run them together. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: debe ser «iñoiz»; y «jaten» no suena claro, la t
  { ruta: 'unidades/u7/inoiz-ez-dut-ogirik-jaten.mp3', texto: 'inoiz ez dut ogirik jaten',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "iñoiz". The t of "jaten" must be a clear unvoiced t. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: goizean con s silbante; y hartzen tiene la h muda
  { ruta: 'unidades/u7/goizean-kafea-hartzen-dut.mp3', texto: 'goizean kafea hartzen dut',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". "goizean" with a whistling s. The h is completely silent, as in Spanish. "hartzen" starts on the a. The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: arraina es «arraña»
  { ruta: 'unidades/u7/barazkiak-eta-arraina-jaten-ditut.mp3', texto: 'barazkiak eta arraina jaten ditut',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "arraña". The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: está mal acentuada sagarra, mejor sagárra
  { ruta: 'unidades/u7/sagarra-eta-madaria-erosten-ditut.mp3', texto: 'sagarra eta madaria erosten ditut',
    nota: 'Stress the SECOND syllable of "sagarra": sa-GA-rra. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: la z de goizean como s silbante, y naiz no suena claro
  { ruta: 'unidades/u7/goizean-jaikitzen-naiz.mp3', texto: 'goizean jaikitzen naiz',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off. "naiz" must end on a clear whistling s.' },
  // Ric: afaltzen dut no está claro; vocales abiertas y claras
  { ruta: 'unidades/u7/etxean-afaltzen-dut.mp3', texto: 'etxean afaltzen dut',
    nota: 'All vowels open and distinct, exactly as written. Leave a small pause between the words — do not run them together. The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: acentúa jaten en la a: játen
  { ruta: 'unidades/u7/jaten-ari-naiz.mp3', texto: 'jaten ari naiz',
    nota: 'Stress the FIRST syllable of "jaten": JA-ten. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: debe ser más clara la i de naiz
  { ruta: 'unidades/u7/euskara-ikasten-ari-naiz.mp3', texto: 'euskara ikasten ari naiz',
    nota: 'The i of "naiz" must be a clear, distinct i. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: dice DUK, debe sonar claramente la t final, dut
  { ruta: 'unidades/u7/kafea-edaten-dut.mp3', texto: 'kafea edaten dut',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. It must end on a clear t: "dut", never "duk".' },
];

// ── bloque 5 · unidad 8 · 9 audios ─────────────────────────────
const BLOQUE5 = [
  // Ric: debe ser una h muda con dos "a", debe sonar a-al dut
  { ruta: 'unidades/u8/ahal-dut.mp3', texto: 'ahal dut',
    nota: 'The h is completely silent, as in Spanish. Two separate a sounds: a-al. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: la z debe sonar como una s silbante
  { ruta: 'unidades/u8/ezin-dut.mp3', texto: 'ezin dut',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: un poco más lento, para que se entienda bien la n de naiz
  { ruta: 'unidades/u8/berandu-iristen-naiz.mp3', texto: 'berandu iristen naiz',
    nota: 'A little slower. The n of "naiz" must be clearly audible. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: la z debe sonar como una s silbante, aquí suena como una ts
  { ruta: 'unidades/u8/zatoz-hona.mp3', texto: 'zatoz hona',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". Both z sounds are whistling s, not ts. The h is completely silent, as in Spanish.' },
  // Ric: aquí debe ser clara la U de dut
  { ruta: 'unidades/u8/joan-nahi-dut.mp3', texto: 'joan nahi dut',
    nota: 'The h is completely silent, as in Spanish. The final consonant must be clearly audible — do not swallow it or let the word trail off. The u of "dut" is open and clear.' },
  // Ric: más pausa entre palabras, aquí zara no suena claro
  { ruta: 'unidades/u8/etorri-ahal-zara.mp3', texto: 'etorri ahal zara',
    nota: 'Leave a small pause between the words — do not run them together. The h is completely silent, as in Spanish. "zara" must be clearly articulated. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: noa no lo pronuncia bien, liburutegira está ok
  { ruta: 'unidades/u8/liburutegira-noa.mp3', texto: 'liburutegira noa',
    nota: 'Say "noa" as two clear vowels: NO-a. The rest of the sentence is fine.' },
  // Ric: la u de dut debe ser clara y abierta
  { ruta: 'unidades/u8/okindegian-ogia-erosten-dut.mp3', texto: 'okindegian ogia erosten dut',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The u of "dut" is open and clear, and the final t audible.' },
  // Ric: la u de dut debe ser clara y abierta
  { ruta: 'unidades/u8/dendan-erosten-dut.mp3', texto: 'dendan erosten dut',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The u of "dut" is open and clear, and the final t audible.' },
];

// ── bloque 6 · unidad 9 · 21 audios ─────────────────────────────
const BLOQUE6 = [
  // Ric: la O debe ser clara y abierta
  { ruta: 'unidades/u9/alkandora.mp3', texto: 'alkandora',
    nota: 'All vowels open and distinct, exactly as written. Every o is open and clear.' },
  // Ric: la z debe ser una S silbante
  { ruta: 'unidades/u9/zapatak.mp3', texto: 'zapatak',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: acentúa la segunda "e": jertséa
  { ruta: 'unidades/u9/jertsea.mp3', texto: 'jertsea',
    nota: 'Stress the second e: jert-SE-a.' },
  // Ric: la P debe ser clara, y la e abierta
  { ruta: 'unidades/u9/jaka.mp3', texto: 'jaka',
    nota: 'A clear hard k and open vowels: JA-ka.' },
  // Ric: la P debe ser clara, y la e abierta
  { ruta: 'unidades/u9/txapela.mp3', texto: 'txapela',
    nota: 'The p must be a clear unvoiced p and the e open: txa-PE-la.' },
  // Ric: el acento se debe marcar claramente en la primera a: betáurrekoak
  { ruta: 'unidades/u9/betaurrekoak.mp3', texto: 'betaurrekoak',
    nota: 'Stress the first a: be-TA-u-rre-ko-ak. The rr is a strongly rolled r, as in Spanish "perro". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: debería sonar "óña", la i y la n suman una "ñ"
  { ruta: 'unidades/u9/oina.mp3', texto: 'oina',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "oña".' },
  // Ric: debería sonar "illea", como una ll suave
  { ruta: 'unidades/u9/ilea.mp3', texto: 'ilea',
    nota: 'Here the i+l is palatalized: say it with the "ll" of Spanish "llave" in a non-yeista accent — NOT an English y. Say "illea".' },
  // Ric: parece que terminara en r; debe ser clara la A final
  { ruta: 'unidades/u9/bihotza.mp3', texto: 'bihotza',
    nota: 'The h is completely silent, as in Spanish. The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off. It ends on a clear open a, never an r.' },
  // Ric: gustatzen: la S debe ser clara y silbante, ahora suena como una sh
  { ruta: 'unidades/u9/dantza-ez-zait-gustatzen.mp3', texto: 'dantza ez zait gustatzen',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh". "gustatzen" has a clean whistling s, not "sh". The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: la A de zait debe ser abierta y clara
  { ruta: 'unidades/u9/pilota-gustatzen-zait.mp3', texto: 'pilota gustatzen zait',
    nota: 'The a of "zait" is open and clear. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: termina mal, gaude debe ser clara la e final
  { ruta: 'unidades/u9/pilotalekuan-gaude.mp3', texto: 'pilotalekuan gaude',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. "gaude" ends on a clear open e.' },
  // Ric: se debe entender claramente erosi dut, ahora suenan mal las dos palabras
  { ruta: 'unidades/u9/alkandora-zuria-erosi-dut.mp3', texto: 'alkandora zuria erosi dut',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh". "erosi" has a whistling s. The final consonant must be clearly audible — do not swallow it or let the word trail off. Leave a small pause between the words — do not run them together.' },
  // Ric: nahi dut no se entiende, deben ser abiertas y claras las vocales
  { ruta: 'unidades/u9/zukua-edan-nahi-dut.mp3', texto: 'zukua edan nahi dut',
    nota: 'The h is completely silent, as in Spanish. All vowels open and distinct, exactly as written. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: pronuncia janaria como en español, pero con una j suave
  { ruta: 'unidades/u9/janaria-gustatzen-zait.mp3', texto: 'janaria gustatzen zait',
    nota: 'Say "janaria" as in Spanish but with a soft j (a y sound), not the Spanish jota. The s is a clean whistling s — it must NOT drift towards "sh".' },
  // Ric: da no suena claro, ahora parece "ba", debe ser claramente "DA"
  { ruta: 'unidades/u9/edaria-ona-da.mp3', texto: 'edaria ona da',
    nota: 'The d of "da" is a clear dental d as in Spanish "dato" — never a b.' },
  // Ric: se debe pronunciar más claro la palabra gustatzen
  { ruta: 'unidades/u9/guztia-gustatzen-zait.mp3', texto: 'guztia gustatzen zait',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The s is a clean whistling s — it must NOT drift towards "sh". The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: oinez debe sonar "Oñés", como una ñ
  { ruta: 'unidades/u9/oinez-nator.mp3', texto: 'oinez nator',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "oñez". The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: urdinak debe ser urdiñak
  { ruta: 'unidades/u9/nire-begiak-urdinak-dira.mp3', texto: 'nire begiak urdinak dira',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. Say "urdiñak". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: ilea debe sonar con una ll suave "illea"
  { ruta: 'unidades/u9/nire-ilea-beltza-da.mp3', texto: 'nire ilea beltza da',
    nota: 'Here the i+l is palatalized: say it with the "ll" of Spanish "llave" in a non-yeista accent — NOT an English y. Say "illea". The "tz" is a crisp ts as in English "cats", never a "ch".' },
  // Ric: erosi es una s silbante, ahora suena como "eroshi"
  { ruta: 'unidades/u9/opari-bat-erosi-dut.mp3', texto: 'opari bat erosi dut',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
];

// ── bloque 7 · unidad 10 · 8 audios ─────────────────────────────
const BLOQUE7 = [
  // Ric: nintzen debe ser pronunciado claramente, no se escuchan todas las letras
  { ruta: 'unidades/u10/bilbon-jaio-nintzen.mp3', texto: 'bilbon jaio nintzen',
    nota: 'The "tz" is a crisp ts as in English "cats", never a "ch". The final consonant must be clearly audible — do not swallow it or let the word trail off. Every letter of "nintzen" audible.' },
  // Ric: zen no suena claro, la N debe ser clara porque suena igual que zer
  { ruta: 'unidades/u10/zer-gertatu-zen.mp3', texto: 'zer gertatu zen',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off. "zen" must end on a clear n, clearly different from "zer".' },
  // Ric: la H debe ser muda, "a-astu"
  { ruta: 'unidades/u10/ahaztu-zait.mp3', texto: 'ahaztu zait',
    nota: 'The h is completely silent, as in Spanish. Say "a-aztu". The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: errazagoa debe ser claramente una S silbante, suena errantzagoa (escoba)
  { ruta: 'unidades/u11/hau-errazagoa-da.mp3', texto: 'hau errazagoa da',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". "errazagoa" has a whistling s — it must NOT sound like "erratzagoa", which is another word. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: du suena mal, debe ser du claramente, con la U abierta
  { ruta: 'unidades/u12/zerbait-esan-du.mp3', texto: 'zerbait esan du',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off. "du" ends on a clear open u.' },
  // Ric: duzu debe ser claramente con dos U, abiertas y claras
  { ruta: 'unidades/u11/zer-egingo-duzu.mp3', texto: 'zer egingo duzu',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". "duzu" has two clear open u sounds. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: ikasiko debe tener S silbante clara, ahora suena como una sh
  { ruta: 'unidades/u11/euskara-ikasiko-dut.mp3', texto: 'euskara ikasiko dut',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh". "ikasiko" has a clean whistling s. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: bihar debe ser claro
  { ruta: 'unidades/u11/zer-asmo-duzu-bihar.mp3', texto: 'zer asmo duzu bihar',
    nota: 'The h is completely silent, as in Spanish. "bihar" is bi-ar, with the h silent. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
];

// ── bloque 8 · unidades 1 y 4 · 23 audios ─────────────────────────────
const BLOQUE8 = [
  // Ric: debe ser con "n", ahora suena amoña y debe ser amona
  { ruta: 'unidades/u4/amona.mp3', texto: 'amona',
    nota: 'Do NOT palatalize the n: it is a plain n, never a ñ. Say "amona", never "amoña".' },
  // Ric: debería sonar con "ñ" como "leengusiña"
  { ruta: 'unidades/u4/lehengusina.mp3', texto: 'lehengusina',
    nota: 'Here the i+n is palatalized: say it with a Spanish "ñ" sound. The h is completely silent, as in Spanish. Say "leengusiña".' },
  // Ric: el acento es raro, deben ser claras las vocales y abiertas
  { ruta: 'unidades/u4/neska-laguna.mp3', texto: 'neska laguna',
    nota: 'All vowels open and distinct, exactly as written. Leave a small pause between the words — do not run them together.' },
  // Ric: debe oírse bien la e de hogeita, todas las vocales claras
  { ruta: 'unidades/u4/hogeita-hamar.mp3', texto: 'hogeita hamar',
    nota: 'The h is completely silent, as in Spanish. All vowels open and distinct, exactly as written. The e of "hogeita" must be clearly heard.' },
  // Ric: la g aquí suena como una d, debe ser claramente berroGei
  { ruta: 'unidades/u4/berrogei.mp3', texto: 'berrogei',
    nota: 'The g must be a clear hard g as in English "go" — never a d. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: suenan mal ambas palabras, y hamar debe terminar en una r simple clara
  { ruta: 'unidades/u4/berrogeita-hamar.mp3', texto: 'berrogeita hamar',
    nota: 'The rr is a strongly rolled r, as in Spanish "perro". The h is completely silent, as in Spanish. The final consonant must be clearly audible — do not swallow it or let the word trail off. "hamar" ends on a single clear tapped r.' },
  // Ric: garrena claro, la N bien y la a final abierta y clara
  { ruta: 'unidades/u4/zazpigarrena.mp3', texto: 'zazpigarrena',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The rr is a strongly rolled r, as in Spanish "perro". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: garrena debe ser claro, la N debe sonar bien
  { ruta: 'unidades/u4/zortzigarrena.mp3', texto: 'zortzigarrena',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The "tz" is a crisp ts as in English "cats", never a "ch". The rr is a strongly rolled r, as in Spanish "perro". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: garrena claro, la N bien y la a final abierta
  { ruta: 'unidades/u4/bederatzigarrena.mp3', texto: 'bederatzigarrena',
    nota: 'The "tz" is a crisp ts as in English "cats", never a "ch". The rr is a strongly rolled r, as in Spanish "perro". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: la rr rodada, y el acento en la segunda A: hamábigarrena
  { ruta: 'unidades/u4/hamabigarrena.mp3', texto: 'hamabigarrena',
    nota: 'The h is completely silent, as in Spanish. The rr is a strongly rolled r, as in Spanish "perro". Stress the second a: ha-MA-bi-ga-rre-na.' },
  // Ric: acentúa en la última A: daukát
  { ruta: 'unidades/u4/daukat.mp3', texto: 'daukat',
    nota: 'Stress the final syllable: dau-KAT. The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: Da debe ser claro, ahora la D suena como N
  { ruta: 'unidades/u4/amona-bilbokoa-da.mp3', texto: 'amona bilbokoa da',
    nota: 'Do NOT palatalize the n: it is a plain n, never a ñ. The d of "da" is a clear dental d, never an n.' },
  // Ric: la última T de daukat no suena bien
  { ruta: 'unidades/u4/nik-arreba-bat-daukat.mp3', texto: 'nik arreba bat daukat',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. End on a clear t. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: daukat debe ser claro, ahora no suena bien
  { ruta: 'unidades/u4/nik-ahizpa-bat-daukat.mp3', texto: 'nik ahizpa bat daukat',
    nota: 'The h is completely silent, as in Spanish. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: no se entiende bien, debe ser loba, como en español
  { ruta: 'unidades/u4/loba.mp3', texto: 'loba',
    nota: 'Say "loba" exactly as in Spanish: two clear syllables, LO-ba.' },
  // Ric: atención con hamaika, deben ser abiertas todas las vocales
  { ruta: 'unidades/u4/hirurogeita-hamaika.mp3', texto: 'hirurogeita hamaika',
    nota: 'The h is completely silent, as in Spanish. All vowels open and distinct, exactly as written. Every vowel of "hamaika" open and distinct. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: mal las dos palabras, deben ser claras
  { ruta: 'unidades/u4/berrogeita-hamalau.mp3', texto: 'berrogeita hamalau',
    nota: 'The rr is a strongly rolled r, as in Spanish "perro". The h is completely silent, as in Spanish. All vowels open and distinct, exactly as written. Leave a small pause between the words — do not run them together.' },
  // Ric: izeko debe tener un s silbante: "iSeko"
  { ruta: 'unidades/u4/izeko-bat-daukat.mp3', texto: 'izeko bat daukat',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: dodaz debe ser clara cada letra, parece "dobás"
  { ruta: 'unidades/u4/bi-loba-dodaz.mp3', texto: 'bi loba dodaz',
    nota: 'Pronounce "dodaz" letter by letter: both d sounds are clear dental d, never b. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
  // Ric: azkena está mal, las vocales deben ser abiertas y claras
  { ruta: 'unidades/u4/lehena-eta-azkena.mp3', texto: 'lehena eta azkena',
    nota: 'The h is completely silent, as in Spanish. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". All vowels open and distinct, exactly as written.' },
  // Ric: daukat suena mal, debe entenderse cada letra
  { ruta: 'unidades/u4/nik-txakur-bat-daukat.mp3', texto: 'nik txakur bat daukat',
    nota: 'The final consonant must be clearly audible — do not swallow it or let the word trail off. The rr is a strongly rolled r, as in Spanish "perro".' },
  // Ric: dauzkate falla, se debe leer claramente cada letra
  { ruta: 'unidades/u4/haiek-bi-katu-dauzkate.mp3', texto: 'haiek bi katu dauzkate',
    nota: 'The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off.' },
  // Ric: astirik debe tener una S silbante
  { ruta: 'unidades/u4/ez-daukat-astirik.mp3', texto: 'ez daukat astirik',
    nota: 'The s is a clean whistling s — it must NOT drift towards "sh". The final consonant must be clearly audible — do not swallow it or let the word trail off. The z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh".' },
];

const PALABRAS = [...BLOQUE2, ...BLOQUE3, ...BLOQUE4, ...BLOQUE5, ...BLOQUE6, ...BLOQUE7, ...BLOQUE8];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function sintetizar(authClient, texto, nota) {
  const { token } = await authClient.getAccessToken();
  const resp = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'x-goog-user-project': PROJECT_ID,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      input: { prompt: BASE_PROMPT + nota, text: texto },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error('TTS ' + resp.status + ': ' + JSON.stringify(data));
  return data.audioContent;
}

async function conReintentos(authClient, texto, nota, intento = 1) {
  try {
    return await sintetizar(authClient, texto, nota);
  } catch (err) {
    if (String(err.message).includes('429') && intento <= 5) {
      const espera = 8000 * intento;
      console.log('    cuota agotada, esperando ' + (espera / 1000) + 's...');
      await esperar(espera);
      return conReintentos(authClient, texto, nota, intento + 1);
    }
    throw err;
  }
}

async function main() {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const authClient = await auth.getClient();
  let i = 0, fallos = 0;
  for (const p of PALABRAS) {
    i++;
    const nombre = p.ruta.replace(/\//g, '_');
    try {
      const audio = await conReintentos(authClient, p.texto, p.nota);
      await writeFile('/tmp/audio-trim-work/lote/' + nombre, audio, 'base64');
      console.log(i + '/' + PALABRAS.length + ' ok: ' + p.ruta);
    } catch (err) {
      fallos++;
      console.error(i + '/' + PALABRAS.length + ' FALLO: ' + p.ruta, err.message);
    }
    await esperar(1500);
  }
  console.log('');
  console.log('TERMINADO — ' + (PALABRAS.length - fallos) + ' de ' + PALABRAS.length);
  console.log('');
  console.log('Estos SUSTITUYEN a ficheros que ya existen: al subirlos se');
  console.log('pisan los de octubre. No hay que tocar ningún JSON, porque');
  console.log('las rutas no cambian — ya están enlazadas.');
  console.log('Despues, pasarle a Ric la lista para que confirme, como con');
  console.log('los bloques anteriores.');
}

main();

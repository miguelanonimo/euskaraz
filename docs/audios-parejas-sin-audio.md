# Audios que faltaban en «Toca las parejas»

**Estado: generados y subidos el 10/10/2026** (217 mp3, voz Kore, en `euskaraz-audio/unidades/<unidad>/`). Esta lista es la foto de lo que no tenía audio antes de generarlos; sirve de constancia y para repetir el proceso si se añaden parejas nuevas.

## El hallazgo

En «Toca las parejas» el icono de audio se pintaba en **todas** las palabras en euskera, tuvieran mp3 o no. Medido en todo el curso: **550 de las 1.688 palabras de las parejas (33 %)** no tenían audio; eran **217 textos distintos**. El icono estaba, pero al tocarlo no sonaba nada, y por eso un betatester tenía «la sensación de que no todas las frases tienen audio, a pesar de que hay play para todas». Los 715 mp3 que ya referenciaba el curso estaban bien: ninguno vacío ni cortado.

## Qué se ha hecho

- El icono de audio solo se pinta si hay audio (`pintarPares` en `js/app.js`).
- Los 217 audios se han generado con `node scripts/generar-audio/completar-ejemplos.mjs --pares` (Cloud TTS, con la nota de pronunciar la z como una s y la g como una g dura) y se han registrado en `audiosExtra` de cada unidad.
- `verificar.py` da error si una pareja del curso vigente no tiene audio, así que no puede volver a pasar sin que salte.

## Cómo repetirlo

Con parejas nuevas: `node scripts/generar-audio/completar-ejemplos.mjs --pares --seco` lista las que faltan; sin `--seco` las genera, las sube (hace falta `SUPABASE_SECRET` en `~/.config/euskaraz/supabase.env`) y las apunta en el JSON. Se puede relanzar si se corta.

## Los 217 textos (antes de generarlos)

«Araba», «Aste Santua», «Gipuzkoa», «Gu lagunak gara.», «Haiek irakasleak dira.», «Inauteriak», «Lapurdi», «Nafarroa», «Ni ikaslea naiz.», «Urte Berri», «Zu medikua zara.», «Zuberoa», «abuztua», «ahoa», «aitite», «aitona», «alkandora», «altua», «amama», «amona», «apirila», «arana», «ardia», «argia», «ari da», «ari gara», «ari naiz», «ari zara», «armairua», «arropa», «arrosa», «arroza», «asmoa», «azaroa», «azkena», «bainugela», «balkoia», «baserria», «bederatzigarrena», «begiak», «behar dut», «behia», «belarriak», «beltza», «berdea», «beroa», «berrogei», «berrogeita bi», «berrogeita hamar», «besoa», «bigarrena», «bihotza», «bosgarrena», «burua», «dauka», «daukat», «daukazu», «dirua», «dugu», «dute», «dutxa», «dutxatu», «eduki», «egingo dut», «eguraldia», «egutegia», «ehun», «ekaina», «elurra», «emaztea», «eskailerak», «eskua», «esnatu», «eta», «etorkizuna», «etorriko da», «etxe bat», «etxeko lanak», «ez dut», «ez naiz», «galdera hura», «garajea», «garbitu», «gela bat», «gela berria», «gela txikia», «geunden», «geure», «gona», «gorputza», «gorria», «grisa», «guk», «gurasoak», «gure herria», «gure izena», «gure laguna», «h», «haien ikaslea», «haien irakaslea», «haizea», «hamabigarrena», «hamaikagarrena», «hamargarrena», «handik», «hanka», «haren izena», «hark», «hauek», «herri polita», «hilabetea», «hirurogei», «hirurogeita hamar», «hirurogeita hamasei», «hodeia», «hogeita bi», «hogeita hamar», «holan», «hori», «horia», «horma», «hotza», «hozkailua», «igogailua», «ikasiko dut», «ikasle hori», «ikasten ari naiz», «ikasten dut», «ilea», «inor», «iraila», «ispilua», «izeba», «jaieguna», «jaiki», «jaka», «jangela», «jantzi», «jertsea», «joan naiz», «joan nintzen», «joango naiz», «joaten ari naiz», «joaten naiz», «lagun hau», «laurogei», «laurogeita hamaika», «laurogeita hamar», «lehena», «lehengusina», «lehengusua», «letxuga», «lorategia», «madaria», «mahai bat», «mahatsa», «marroia», «marrubia», «martxoa», «mila», «morea», «mugitu», «neure», «ni naiz», «nik», «nire etxea», «nire herria», «nire laguna», «nirekin», «non dago?», «noraino?», «norentzat?», «oilaskoa», «oiloa», «oina», «oparia», «osaba», «otsaila», «patata», «platanoa», «rr», «sagua», «sarrera», «senarra», «sofa», «soinekoa», «sudurra», «teilatua», «telebista», «tipula», «tomatea», «tx», «txerria», «txoria», «untxia», «urdina», «urtebetetzea», «uztaila», «z», «zaie», «zaio», «zait», «zaizu», «zaldia», «zazpigarrena», «zelan», «zenbat da?», «zeuden», «zeuek», «zeure», «zortzigarrena», «zuk», «zukua», «zure izena», «zure laguna», «zurekin», «zuria»

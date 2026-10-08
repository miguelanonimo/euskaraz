// Edge Function «enviar-avisos»: la llama el cron cada 15 minutos (ver
// ../02-programar.sql) y manda el recordatorio a quien le toque ahora.
//
// Le toca a quien: tiene el aviso activo, hoy es uno de sus días, es su
// hora (en SU zona horaria) y todavía no ha practicado hoy. Un aviso por día.
//
// Despliegue (panel de Supabase → Edge Functions → Deploy a new function →
// «Via Editor», pegar este archivo, nombre «enviar-avisos», con «Verify JWT»
// DESACTIVADO: la protege el secreto CRON_SECRET de abajo).
//
// Secretos (Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY   la clave pública de avisos (la misma que va en js/app.js)
//   VAPID_PRIVATE_KEY  la privada (solo aquí, nunca en el repo)
//   CRON_SECRET        una cadena larga al azar, la misma que en 02-programar.sql
//   SB_SECRET_KEY      una clave «secret» (sb_secret_…) del proyecto
//   VAPID_SUBJECT      opcional; por defecto https://euskaraz.vercel.app
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "https://euskaraz.vercel.app",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const VENTANA_MIN = 15; // el cron corre cada 15 minutos

// La hora de una persona en su zona. `dia` es el mismo número de día que
// calcula hoy() en js/app.js, así que sirve para mirar progreso.dias.
function ahoraEn(zona: string) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  const dia = Math.floor(Date.UTC(+partes.year, +partes.month - 1, +partes.day) / 86400000);
  return {
    dia,
    minutos: +partes.hour * 60 + +partes.minute,
    semana: (dia + 3) % 7, // 0 = lunes (el 1/1/1970 fue jueves)
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
  };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("no", { status: 401 });
  }
  const { data: filas, error } = await sb
    .from("euskaraz_avisos").select("user_id,dias,hora,zona,ultimo_aviso").eq("activo", true);
  if (error) return new Response(error.message, { status: 500 });

  let enviados = 0, yaPractico = 0, caducados = 0;
  for (const f of filas ?? []) {
    let t;
    try { t = ahoraEn(f.zona); } catch { continue; } // zona horaria inválida
    if (!f.dias.includes(t.semana)) continue;
    const [h, m] = f.hora.split(":").map(Number);
    const objetivo = h * 60 + m;
    if (t.minutos < objetivo || t.minutos >= objetivo + VENTANA_MIN) continue;
    if (f.ultimo_aviso === t.fecha) continue;

    // ¿Ya ha practicado hoy? dias[día] = [aciertos, respuestas]
    const { data: prog } = await sb
      .from("euskaraz_progreso").select("data").eq("user_id", f.user_id).maybeSingle();
    const dias = prog?.data?.dias ?? {};
    const hecho = (d: number) => (dias[d]?.[1] ?? 0) > 0;
    if (hecho(t.dia)) { yaPractico++; continue; }

    let racha = 0;
    for (let d = t.dia - 1; hecho(d); d--) racha++;
    const cuerpo = racha > 0
      ? `Llevas ${racha} ${racha === 1 ? "día" : "días"} de racha: no la pierdas hoy.`
      : "¿Euskaraz pixka bat?";

    const { data: dispositivos } = await sb
      .from("euskaraz_dispositivos").select("endpoint,suscripcion").eq("user_id", f.user_id);
    let alguno = false;
    for (const d of dispositivos ?? []) {
      try {
        await webpush.sendNotification(d.suscripcion, JSON.stringify({ titulo: "Euskaraz", cuerpo, url: "./" }));
        alguno = true; enviados++;
      } catch (e) {
        // 404/410: el navegador ya no existe o se dio de baja; se borra.
        if (e.statusCode === 404 || e.statusCode === 410) {
          await sb.from("euskaraz_dispositivos").delete().eq("endpoint", d.endpoint);
          caducados++;
        }
      }
    }
    if (alguno) await sb.from("euskaraz_avisos").update({ ultimo_aviso: t.fecha }).eq("user_id", f.user_id);
  }
  return Response.json({ enviados, yaPractico, caducados });
});

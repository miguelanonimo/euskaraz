// Edge Function «solicitar-acceso»: la llama la pantalla de entrada cuando
// alguien pide cuenta. Guarda la solicitud y te manda un correo con el botón
// para aprobarla. Responde siempre lo mismo, exista o no ya la cuenta, para
// no filtrar qué correos están registrados.
//
// Despliegue: supabase functions deploy solicitar-acceso --no-verify-jwt
// (no lleva JWT: la llama quien aún no tiene cuenta).
//
// Secretos: RESEND_API_KEY, ADMIN_EMAIL (a quién avisar), APP_URL
// (https://euskaraz.vercel.app), FROM_EMAIL (opcional).
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "método no permitido" }, 405);

  let email = "";
  try { email = String((await req.json()).email ?? "").trim().toLowerCase(); } catch { /* vacío */ }
  if (email.length > 120 || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email)) {
    return json({ error: "Escribe un correo válido." }, 400);
  }
  const ok = json({ ok: true });

  // Frenos contra abuso: una solicitud pendiente por correo y día, y un
  // máximo de avisos por hora entre todos.
  const hace24h = new Date(Date.now() - 86400000).toISOString();
  const haceUnaHora = new Date(Date.now() - 3600000).toISOString();
  const { count: repetidas } = await sb.from("solicitudes_acceso").select("id", { count: "exact", head: true })
    .eq("email", email).eq("estado", "pendiente").gte("creada", hace24h);
  if (repetidas) return ok;
  const { count: ultimaHora } = await sb.from("solicitudes_acceso").select("id", { count: "exact", head: true })
    .gte("creada", haceUnaHora);
  if ((ultimaHora ?? 0) >= 15) return ok;

  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const { error } = await sb.from("solicitudes_acceso").insert({ email, token });
  if (error) return json({ error: "No se pudo registrar la solicitud." }, 500);

  const enlace = `${Deno.env.get("APP_URL") ?? "https://euskaraz.vercel.app"}/aprobar.html?t=${token}`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("FROM_EMAIL") ?? "Euskaraz <onboarding@resend.dev>",
      to: [Deno.env.get("ADMIN_EMAIL")],
      subject: `Euskaraz: ${email} pide acceso`,
      html: `<p><b>${esc(email)}</b> ha pedido una cuenta en Euskaraz.</p>` +
        `<p><a href="${enlace}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#141314;color:#fff;text-decoration:none">Revisar la solicitud</a></p>` +
        `<p style="color:#666">Si no la conoces, ignora este correo: no pasa nada sin tu aprobación.</p>`,
    }),
  });
  if (!r.ok) console.error("Resend", r.status, await r.text());
  return ok;
});

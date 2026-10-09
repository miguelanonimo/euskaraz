// Edge Function «aprobar-acceso»: la usa la página aprobar.html (que abres
// desde el correo). GET ?t=<token> → datos de la solicitud. POST {token,
// accion: "aprobar" | "rechazar"} → la resuelve. Aprobar crea la cuenta con
// la contraseña inicial (marcada para cambiarla al entrar) y avisa a la
// persona por correo.
//
// Despliegue: supabase functions deploy aprobar-acceso --no-verify-jwt
// Secretos: RESEND_API_KEY, CLAVE_INICIAL, APP_URL, FROM_EMAIL (opcional).
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

async function buscar(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const { data } = await sb.from("solicitudes_acceso").select("id,email,estado,creada").eq("token", token).maybeSingle();
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (req.method === "GET") {
    const s = await buscar(new URL(req.url).searchParams.get("t") ?? "");
    return s ? json({ email: s.email, estado: s.estado, creada: s.creada }) : json({ error: "Solicitud no encontrada." }, 404);
  }
  if (req.method !== "POST") return json({ error: "método no permitido" }, 405);

  let cuerpo: { token?: string; accion?: string } = {};
  try { cuerpo = await req.json(); } catch { /* vacío */ }
  const s = await buscar(String(cuerpo.token ?? ""));
  if (!s) return json({ error: "Solicitud no encontrada." }, 404);
  if (s.estado !== "pendiente") return json({ estado: s.estado, email: s.email });

  if (cuerpo.accion === "rechazar") {
    await sb.from("solicitudes_acceso").update({ estado: "rechazada", resuelta: new Date().toISOString() }).eq("id", s.id);
    return json({ estado: "rechazada", email: s.email });
  }
  if (cuerpo.accion !== "aprobar") return json({ error: "acción no válida" }, 400);

  const clave = Deno.env.get("CLAVE_INICIAL")!;
  const { error } = await sb.auth.admin.createUser({
    email: s.email, password: clave, email_confirm: true, user_metadata: { debe_cambiar_clave: true },
  });
  const yaExistia = !!error && /already|registered|exists/i.test(error.message);
  if (error && !yaExistia) return json({ error: "No se pudo crear la cuenta: " + error.message }, 500);

  await sb.from("solicitudes_acceso").update({ estado: "aprobada", resuelta: new Date().toISOString() }).eq("id", s.id);

  // Aviso a la persona. Si falla (p. ej. Resend sin dominio verificado solo
  // entrega a la cuenta dueña), la página lo dice y se lo cuentas tú.
  let avisado = false;
  if (!yaExistia) {
    const app = Deno.env.get("APP_URL") ?? "https://euskaraz.vercel.app";
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") ?? "Euskaraz <onboarding@resend.dev>",
        to: [s.email],
        subject: "Ya tienes acceso a Euskaraz",
        html: `<p>Tu cuenta está lista.</p><p>Entra en <a href="${app}">${app}</a> con este correo y la contraseña provisional <b>${clave}</b>. La primera vez te pediremos elegir la tuya.</p>`,
      }),
    });
    avisado = r.ok;
    if (!r.ok) console.error("Resend", r.status, await r.text());
  }
  return json({ estado: "aprobada", email: s.email, avisado, yaExistia, clave });
});

import { verifyAdminToken } from "./_lib/auth";
import { getSupabaseAdmin } from "./_lib/supabase";

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }
  return authHeader.slice("Bearer ".length);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Missing admin token." });
    }

    await verifyAdminToken(token);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({ messages: data || [] });
  } catch (error) {
    return res.status(401).json({ error: error.message || "Unauthorized." });
  }
}

import { Resend } from "resend";
import { getSupabaseAdmin } from "./_lib/supabase";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { name, email, subject = "", message } = req.body || {};

  if (!name || !email || !message) {
    return badRequest(res, "Name, email, and message are required.");
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject).trim(),
        message: String(message).trim(),
        status: "new",
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Photic Photo <onboarding@resend.dev>",
        to: process.env.NOTIFY_EMAIL,
        replyTo: String(email).trim(),
        subject: `New contact message${subject ? `: ${String(subject).trim()}` : ""}`,
        text: [
          `Name: ${String(name).trim()}`,
          `Email: ${String(email).trim()}`,
          `Subject: ${String(subject).trim() || "General enquiry"}`,
          "",
          String(message).trim(),
        ].join("\n"),
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Message stored successfully.",
      id: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to save contact message." });
  }
}

import { Resend } from "resend";
import { getSupabaseAdmin } from "./_lib/supabase";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function isValidEmail(value) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { name, email, subject = "", message } = req.body || {};

  if (!name || !email || !message) {
    return badRequest(res, "Name, email, and message are required.");
  }

  const nameValue = String(name).trim();
  const emailValue = String(email).trim().toLowerCase();
  const subjectValue = String(subject).trim();
  const messageValue = String(message).trim();

  if (!isValidEmail(emailValue)) {
    return badRequest(res, "Please enter a valid email address.");
  }
  if (nameValue.length > 80) {
    return badRequest(res, "Name is too long.");
  }
  if (emailValue.length > 254) {
    return badRequest(res, "Email is too long.");
  }
  if (subjectValue.length > 120) {
    return badRequest(res, "Subject is too long.");
  }
  if (messageValue.length > 5000) {
    return badRequest(res, "Message is too long.");
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: nameValue,
        email: emailValue,
        subject: subjectValue,
        message: messageValue,
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
        replyTo: emailValue,
        subject: `New contact message${subjectValue ? `: ${subjectValue}` : ""}`,
        text: [
          `Name: ${nameValue}`,
          `Email: ${emailValue}`,
          `Subject: ${subjectValue || "General enquiry"}`,
          "",
          messageValue,
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

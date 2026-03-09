import { getSupabaseAdmin } from "./_lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select(
        "id, title, description, media_type, category_slug, media_url, thumbnail_url, featured, status, sort_order, created_at",
      )
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({ items: data || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load portfolio items." });
  }
}

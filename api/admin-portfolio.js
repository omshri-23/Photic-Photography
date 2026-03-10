import { verifyAdminToken } from "./_lib/auth";
import { getSupabaseAdmin } from "./_lib/supabase";

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }
  return authHeader.slice("Bearer ".length);
}

async function authorize(req) {
  const token = extractToken(req);
  if (!token) {
    throw new Error("Missing admin token.");
  }
  await verifyAdminToken(token);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req, res) {
  try {
    await authorize(req);
  } catch (error) {
    return res.status(401).json({ error: error.message || "Unauthorized." });
  }

  const supabase = getSupabaseAdmin();

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select(
          "id, title, description, media_type, category_slug, media_url, thumbnail_url, featured, status, sort_order, created_at",
        )
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return res.status(200).json({ items: data || [] });
    }

    if (req.method === "POST") {
      const {
        title,
        description = "",
        mediaType,
        categorySlug,
        mediaUrl,
        thumbnailUrl = "",
        featured = false,
        status = "published",
        sortOrder = 0,
      } = req.body || {};

      if (!title || !mediaType || !categorySlug || !mediaUrl) {
        return res.status(400).json({ error: "Title, media type, category, and media URL are required." });
      }

      const normalizedMediaType = String(mediaType).trim();
      if (!["image", "video"].includes(normalizedMediaType)) {
        return res.status(400).json({ error: "Media type must be image or video." });
      }

      const normalizedStatus = String(status).trim();
      if (!["draft", "published"].includes(normalizedStatus)) {
        return res.status(400).json({ error: "Status must be draft or published." });
      }

      const normalizedCategory = slugify(categorySlug);
      if (!normalizedCategory) {
        return res.status(400).json({ error: "Category slug is invalid." });
      }

      const titleValue = String(title).trim();
      if (titleValue.length > 120) {
        return res.status(400).json({ error: "Title is too long." });
      }

      const descriptionValue = String(description).trim();
      if (descriptionValue.length > 1000) {
        return res.status(400).json({ error: "Description is too long." });
      }

      const { data, error } = await supabase
        .from("portfolio_items")
        .insert({
          title: titleValue,
          description: descriptionValue,
          media_type: normalizedMediaType,
          category_slug: normalizedCategory,
          media_url: String(mediaUrl).trim(),
          thumbnail_url: String(thumbnailUrl).trim(),
          featured: Boolean(featured),
          status: normalizedStatus,
          sort_order: Number(sortOrder) || 0,
        })
        .select(
          "id, title, description, media_type, category_slug, media_url, thumbnail_url, featured, status, sort_order, created_at",
        )
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({ item: data });
    }

    if (req.method === "DELETE") {
      const { id } = req.query || {};
      if (!id) {
        return res.status(400).json({ error: "Portfolio item id is required." });
      }
      if (!isUuid(id)) {
        return res.status(400).json({ error: "Portfolio item id is invalid." });
      }

      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) {
        throw error;
      }

      return res.status(200).json({ ok: true });
    }

    if (req.method === "PATCH") {
      const { id } = req.query || {};
      const {
        status,
        featured,
        sortOrder,
      } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: "Portfolio item id is required." });
      }
      if (!isUuid(id)) {
        return res.status(400).json({ error: "Portfolio item id is invalid." });
      }

      const updates = {};
      if (typeof status === "string" && status.trim()) {
        const normalizedStatus = status.trim();
        if (!["draft", "published"].includes(normalizedStatus)) {
          return res.status(400).json({ error: "Status must be draft or published." });
        }
        updates.status = normalizedStatus;
      }
      if (typeof featured === "boolean") {
        updates.featured = featured;
      }
      if (typeof sortOrder !== "undefined") {
        updates.sort_order = Number(sortOrder) || 0;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided." });
      }

      const { data, error } = await supabase
        .from("portfolio_items")
        .update(updates)
        .eq("id", id)
        .select(
          "id, title, description, media_type, category_slug, media_url, thumbnail_url, featured, status, sort_order, created_at",
        )
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({ item: data });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error." });
  }
}

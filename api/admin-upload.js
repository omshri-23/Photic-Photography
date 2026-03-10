import { verifyAdminToken } from "./_lib/auth";
import { getSupabaseAdmin } from "./_lib/supabase";

const DEFAULT_BUCKET = "portfolio-media";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);

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

function slugify(value) {
  return String(value || "file")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
}

export default async function handler(req, res) {
  try {
    await authorize(req);
  } catch (error) {
    return res.status(401).json({ error: error.message || "Unauthorized." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const {
      base64,
      fileName,
      contentType = "application/octet-stream",
      folder = "images",
      title = "",
    } = req.body || {};

    if (!base64 || !fileName) {
      return res.status(400).json({ error: "Missing file payload." });
    }

    const normalizedType = String(contentType || "").toLowerCase();
    const kind = normalizedType.startsWith("image/")
      ? "image"
      : normalizedType.startsWith("video/")
        ? "video"
        : "";
    if (!kind) {
      return res.status(400).json({ error: "Only image and video uploads are supported." });
    }

    const extension = String(fileName).includes(".")
      ? String(fileName).split(".").pop().toLowerCase()
      : "bin";
    if (kind === "image" && !IMAGE_EXTENSIONS.has(extension)) {
      return res.status(400).json({ error: "Unsupported image format." });
    }
    if (kind === "video" && !VIDEO_EXTENSIONS.has(extension)) {
      return res.status(400).json({ error: "Unsupported video format." });
    }

    const buffer = Buffer.from(String(base64), "base64");
    if (!buffer.length) {
      return res.status(400).json({ error: "Uploaded file is empty." });
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return res.status(400).json({ error: "File is too large. Keep uploads under 25 MB." });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    const cleanFolder = slugify(folder);
    const safeTitle = slugify(title || fileName.replace(/\.[^.]+$/, ""));
    const objectPath = `${cleanFolder}/${Date.now()}-${safeTitle}.${extension}`;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: normalizedType,
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return res.status(200).json({ url: data.publicUrl, path: objectPath });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to upload media." });
  }
}

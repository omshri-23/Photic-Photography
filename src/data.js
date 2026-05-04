import { useState, useEffect } from "react";
import { generatedLocalMedia } from "./generated-local-media";
import { sanityClient, urlFor, videoUrlFor } from "./sanityClient";

// ─── Static local fallbacks (always available) ───────────────────────────────

export const profile = {
  brand: "Photic Photo",
  name: "Omshri",
  title: "Mobile Photographer and Visual Storyteller",
  heroImage: "media/uploads/portrait/portrait-12.jpg",
  location: "Kolhapur, Maharashtra, India",
  email: "omshri.2311@gmail.com",
  backupEmail: "omshrisingh93056@gmail.com",
  phone: "+91 7387517570",
  tagline: "Capturing moments. Framing stories. One deliberate click at a time.",
  intro:
    "A visual space for portraits, atmosphere, emotion, and carefully crafted edits shaped by mood, light, and detail.",
  shortBio:
    "Portraits, reels, and atmosphere-led frames crafted around light, timing, and clean edits.",
  about: [
    "I work through mobile photography, cinematic edits, and visual storytelling to turn simple moments into deliberate frames.",
    "My style moves between portraits, atmosphere, street observations, night scenes, and mood-led visual studies.",
    "Photic Photo is the space where those frames, edits, and creative experiments come together as one evolving archive.",
  ],
  links: {
    instagram: "https://www.instagram.com/photic.photo",
    linkedin: "https://www.linkedin.com/in/omshri23/",
    youtube: "https://www.youtube.com/@PHOTIC_PHOTO",
    github: "https://github.com/omshri-23",
    whatsapp: "https://wa.me/917387517570",
  },
};

export const highlights = [
  { value: "8", label: "Curated collections" },
  { value: "2", label: "Before/after edits" },
  { value: "5", label: "Featured video reels" },
  { value: "100%", label: "Shot and edited with intent" },
];

export const categoryMeta = [
  {
    slug: "nature",
    title: "Nature",
    cover: "media/boat.jpg",
    description: "Greens, light breaks, skies, stillness, and natural geometry.",
  },
  {
    slug: "portrait",
    title: "Portrait",
    cover: "media/portrait.jpg",
    description: "Faces, expressions, mood-led compositions, and close human detail.",
  },
  {
    slug: "street",
    title: "Street",
    cover: "media/man-portrait.jpg",
    description: "Unscripted city moments, candid frames, and movement in public space.",
  },
  {
    slug: "random",
    title: "Random",
    cover: "media/random.jpg",
    description: "Creative experiments, observations, and images that resist one label.",
  },
  {
    slug: "night",
    title: "Night",
    cover: "media/night.jpg",
    description: "Dark tones, neon mood, long shadows, and after-hours atmosphere.",
  },
  {
    slug: "others",
    title: "Others",
    cover: "media/others.jpg",
    description: "Everything that sits outside the core sets but still belongs in the archive.",
  },
  {
    slug: "animal",
    title: "Animal",
    cover: "media/uploads/animal/animal-2.jpg",
    description: "Animal studies, close observations, and frames shaped by instinct, texture, and timing.",
  },
  {
    slug: "monochrome",
    title: "Black & White",
    cover: "media/uploads/monochrome/monochrome-2.jpg",
    description: "Monochrome frames focused on contrast, structure, and atmosphere over color.",
  },
];

export const portfolioItems = [...generatedLocalMedia].sort((left, right) => {
  return (
    Number(right.featured) - Number(left.featured) ||
    (left.sort_order ?? 0) - (right.sort_order ?? 0) ||
    new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
  );
});

export const comparisons = [
  {
    title: "Color reconstruction",
    before: "media/before02.jpg",
    after: "media/after02.jpg",
  },
  {
    title: "Mood shift",
    before: "media/before01.jpg",
    after: "media/after01.jpg",
  },
];

export const reels = [
  { id: "reel-1", title: "Reel 01", media_url: "media/reels/reel1.mp4" },
  { id: "reel-2", title: "Reel 02", media_url: "media/reels/reel2.mp4" },
  { id: "reel-3", title: "Reel 03", media_url: "media/reels/reel3.mp4" },
  { id: "reel-4", title: "Reel 04", media_url: "media/reels/reel4.mp4" },
  { id: "reel-5", title: "Reel 05", media_url: "media/reels/reel5.mp4" },
  { id: "reel-6", title: "Reel 06", media_url: "media/reels/reel6.mp4" },
  { id: "reel-7", title: "Reel 07", media_url: "media/reels/reel7.mp4" },
  { id: "reel-8", title: "Reel 08", media_url: "media/reels/reel8.mp4" },
];

// ─── Sanity data shape normalizers ───────────────────────────────────────────

function normalizeProfile(doc) {
  if (!doc) return null;
  return {
    brand: doc.brand || profile.brand,
    name: doc.name || profile.name,
    title: doc.title || profile.title,
    heroImage: doc.heroImage ? urlFor(doc.heroImage, 1200) : profile.heroImage,
    location: doc.location || profile.location,
    email: doc.email || profile.email,
    backupEmail: doc.backupEmail || profile.backupEmail,
    phone: doc.phone || profile.phone,
    tagline: doc.tagline || profile.tagline,
    intro: doc.intro || profile.intro,
    shortBio: doc.shortBio || profile.shortBio,
    about: doc.about || profile.about,
    links: {
      instagram: doc.links?.instagram || profile.links.instagram,
      linkedin: doc.links?.linkedin || profile.links.linkedin,
      youtube: doc.links?.youtube || profile.links.youtube,
      github: doc.links?.github || profile.links.github,
      whatsapp: doc.links?.whatsapp || profile.links.whatsapp,
    },
  };
}

function normalizeCategory(doc) {
  return {
    slug: doc.slug?.current || doc.slug || "",
    title: doc.title || "",
    cover: doc.cover ? urlFor(doc.cover, 800) : "",
    description: doc.description || "",
    order: doc.order ?? 999,
  };
}

function normalizePhoto(doc) {
  return {
    id: doc._id,
    title: doc.title || "",
    media_url: doc.image ? urlFor(doc.image, 1200) : "",
    thumbnail_url: doc.image ? urlFor(doc.image, 600) : "",
    media_type: "image",
    category_slug: doc.category || "others",
    featured: doc.featured || false,
    sort_order: doc.sort_order ?? 0,
    alt: doc.alt || doc.title || "",
    description: doc.caption || "",
    created_at: doc.created_at || null,
  };
}

function normalizeReel(doc) {
  return {
    id: doc._id,
    title: doc.title || "",
    media_url: doc.video?.asset ? videoUrlFor(doc.video.asset) : "",
    thumbnail_url: doc.thumbnail ? urlFor(doc.thumbnail, 600) : "",
    media_type: "video",
    order: doc.order ?? 999,
  };
}

function normalizeComparison(doc) {
  return {
    title: doc.title || "",
    before: doc.before ? urlFor(doc.before, 1000) : "",
    after: doc.after ? urlFor(doc.after, 1000) : "",
    order: doc.order ?? 999,
  };
}

function normalizeHighlight(doc) {
  return {
    value: doc.value || "",
    label: doc.label || "",
    order: doc.order ?? 999,
  };
}

// ─── useSanityData hook ───────────────────────────────────────────────────────
// Fetches all content from Sanity, falls back to local data if unavailable.
// App.jsx doesn't need to change — just swap imports.

export function useSanityData() {
  const [data, setData] = useState({
    profile,
    highlights,
    categoryMeta,
    portfolioItems,
    comparisons,
    reels,
    loading: true,
    source: "local",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [
          profileDoc,
          categoryDocs,
          photoDocs,
          reelDocs,
          comparisonDocs,
          highlightDocs,
        ] = await Promise.all([
          sanityClient.fetch(`*[_type == "profile"][0]`),
          sanityClient.fetch(`*[_type == "category"] | order(order asc)`),
          sanityClient.fetch(`*[_type == "photo"] | order(featured desc, sort_order asc, _createdAt desc)`),
          sanityClient.fetch(`*[_type == "reel"] | order(order asc)`),
          sanityClient.fetch(`*[_type == "comparison"] | order(order asc)`),
          sanityClient.fetch(`*[_type == "highlight"] | order(order asc)`),
        ]);

        if (cancelled) return;

        const sanityPhotos = photoDocs?.length > 0
          ? photoDocs.map(normalizePhoto)
          : null;

        const sanityReels = reelDocs?.length > 0
          ? reelDocs.map(normalizeReel)
          : null;

        const sanityCategories = categoryDocs?.length > 0
          ? categoryDocs.map(normalizeCategory)
          : null;

        const sanityComparisons = comparisonDocs?.length > 0
          ? comparisonDocs.map(normalizeComparison)
          : null;

        const sanityHighlights = highlightDocs?.length > 0
          ? highlightDocs.map(normalizeHighlight)
          : null;

        setData({
          profile: normalizeProfile(profileDoc) || profile,
          highlights: sanityHighlights || highlights,
          categoryMeta: sanityCategories || categoryMeta,
          // Merge: Sanity photos first, then local-only items not in Sanity
          portfolioItems: sanityPhotos
            ? [...sanityPhotos, ...portfolioItems].reduce((acc, item) => {
                if (!acc.find((x) => x.id === item.id)) acc.push(item);
                return acc;
              }, [])
            : portfolioItems,
          comparisons: sanityComparisons || comparisons,
          reels: sanityReels || reels,
          loading: false,
          source: "sanity",
        });
      } catch (error) {
        if (cancelled) return;
        console.warn("[Sanity] Failed to fetch, using local data.", error);
        setData((prev) => ({ ...prev, loading: false, source: "local" }));
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

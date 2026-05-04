import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 't7njuud6',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

// Image URL builder helper
const builder = imageUrlBuilder(sanityClient)

/**
 * Get optimized image URL from a Sanity image reference
 * @param {object} source - Sanity image object
 * @param {number} width - Optional width
 * @returns {string} image URL
 */
export function urlFor(source, width = 800) {
  if (!source?.asset) return ''
  return builder.image(source).width(width).auto('format').quality(85).url()
}

/**
 * Get video asset URL from a Sanity file reference
 * @param {object} asset - Sanity file asset object {_ref}
 * @returns {string} video URL
 */
export function videoUrlFor(asset) {
  if (!asset?._ref) return ''
  const ref = asset._ref
  // ref format: file-<id>-<ext>
  const [, id, ext] = ref.match(/^file-(.+)-([^-]+)$/) || []
  if (!id || !ext) return ''
  return `https://cdn.sanity.io/files/t7njuud6/production/${id}.${ext}`
}

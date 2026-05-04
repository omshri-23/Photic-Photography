import { defineType, defineField } from 'sanity'

export const profileType = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({ name: 'brand', title: 'Brand Name', type: 'string' }),
    defineField({ name: 'name', title: 'Your Name', type: 'string' }),
    defineField({ name: 'title', title: 'Title / Role', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'backupEmail', title: 'Backup Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'text', rows: 2 }),
    defineField({ name: 'intro', title: 'Intro Text', type: 'text', rows: 3 }),
    defineField({ name: 'shortBio', title: 'Short Bio', type: 'text', rows: 2 }),
    defineField({
      name: 'about',
      title: 'About Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'links',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'youtube', title: 'YouTube URL', type: 'url' },
        { name: 'github', title: 'GitHub URL', type: 'url' },
        { name: 'whatsapp', title: 'WhatsApp URL', type: 'url' },
      ],
    }),
  ],
})

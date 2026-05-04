import { defineType, defineField } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Nature', value: 'nature' },
          { title: 'Portrait', value: 'portrait' },
          { title: 'Street', value: 'street' },
          { title: 'Random', value: 'random' },
          { title: 'Night', value: 'night' },
          { title: 'Others', value: 'others' },
          { title: 'Animal', value: 'animal' },
          { title: 'Black & White', value: 'monochrome' },
        ],
      },
    }),
    defineField({ name: 'featured', title: 'Featured?', type: 'boolean', initialValue: false }),
    defineField({ name: 'sort_order', title: 'Sort Order', type: 'number' }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
    defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
    defineField({ name: 'created_at', title: 'Shot Date', type: 'date' }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
})

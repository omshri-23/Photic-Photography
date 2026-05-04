import { defineType, defineField } from 'sanity'

export const comparisonType = defineType({
  name: 'comparison',
  title: 'Before/After Comparison',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'before',
      title: 'Before Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'after',
      title: 'After Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', media: 'after' },
  },
})

import { defineType, defineField } from 'sanity'

export const highlightType = defineType({
  name: 'highlight',
  title: 'Highlight Stat',
  type: 'document',
  fields: [
    defineField({ name: 'value', title: 'Value (e.g. "8")', type: 'string' }),
    defineField({ name: 'label', title: 'Label (e.g. "Curated collections")', type: 'string' }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
  },
})

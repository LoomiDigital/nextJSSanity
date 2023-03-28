import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'comment',
      type: 'text',
      title: 'Comment',
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Has this comment been approved?',
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export const match = defineType({
    name: 'match',
    title: 'Match',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Match Title',
            type: 'string',
            description: 'e.g., Koç University vs. ITU',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Date & Time',
            type: 'datetime',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'venue',
            title: 'Venue',
            type: 'string',
        }),
        defineField({
            name: 'opponent',
            title: 'Opponent',
            type: 'string',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Upcoming', value: 'upcoming' },
                    { title: 'Live', value: 'live' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
            initialValue: 'upcoming',
        }),
        defineField({
            name: 'result',
            title: 'Result',
            type: 'string',
            hidden: ({ document }) => document?.status !== 'completed',
            description: 'e.g., Koç University won by 5 wickets',
        }),
        defineField({
            name: 'scorecard',
            title: 'Scorecard Link',
            type: 'url',
        }),
    ],
})

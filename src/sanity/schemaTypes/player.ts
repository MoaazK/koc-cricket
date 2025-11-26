import { defineField, defineType } from 'sanity'

export const player = defineType({
    name: 'player',
    title: 'Player',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Batsman', value: 'Batsman' },
                    { title: 'Bowler', value: 'Bowler' },
                    { title: 'All-Rounder', value: 'All-Rounder' },
                    { title: 'Wicket Keeper', value: 'Wicket Keeper' },
                ],
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'jerseyNumber',
            title: 'Jersey Number',
            type: 'number',
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
        }),
        defineField({
            name: 'stats',
            title: 'Stats (Manual Override)',
            type: 'object',
            fields: [
                defineField({ name: 'matches', type: 'number', title: 'Matches' }),
                defineField({ name: 'runs', type: 'number', title: 'Runs' }),
                defineField({ name: 'wickets', type: 'number', title: 'Wickets' }),
                defineField({ name: 'average', type: 'number', title: 'Batting Average' }),
            ],
        }),
    ],
})

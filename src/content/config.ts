import { defineCollection, z } from 'astro:content';

const news = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		summary: z.string().max(240),
		date: z.date(),
		coverImage: z.string().optional(),
		youtube: z.string().url().optional(),
		instagram: z.string().url().optional(),
	}),
});

const matches = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		matchDate: z.date(),
		competition: z.string(),
		location: z.string(),
		status: z.string().default('Upcoming'),
		description: z.string().optional(),
		ctaLabel: z.string().default('Add to Calendar'),
		ctaUrl: z.string().url(),
	}),
});

const gallery = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		type: z.enum(['instagram', 'youtube', 'photo']),
		url: z.string().url(),
		description: z.string().optional(),
	}),
});

export const collections = { news, matches, gallery };

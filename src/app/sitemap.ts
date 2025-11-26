import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cricket.ku.edu.tr'

    // Static routes
    const routes = [
        '',
        '/about',
        '/fixtures',
        '/contact',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic routes (Matches)
    const { data: matches } = await supabase
        .from('matches')
        .select('id, updated_at')
        .limit(50) // Limit to recent 50 matches for sitemap

    const matchRoutes = matches?.map((match) => ({
        url: `${baseUrl}/matches/${match.id}`,
        lastModified: new Date(match.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })) || []

    return [...routes, ...matchRoutes]
}

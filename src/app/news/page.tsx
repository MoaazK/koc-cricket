import { PageHeader } from "@/components/ui/PageHeader";
import { NewsCard } from "@/components/ui/NewsCard";
import { client } from "@/sanity/lib/client";
import { projectId } from "@/sanity/env";

// Mock Data for Demo if Sanity is not connected
const MOCK_NEWS = [
    {
        _id: "1",
        title: "Koç University Cricket Team Wins Season Opener",
        slug: { current: "season-opener-win" },
        publishedAt: "2024-03-15T10:00:00Z",
        excerpt: "A fantastic performance by the batting lineup secured a comfortable victory against ITU in the first match of the season.",
    },
    {
        _id: "2",
        title: "New Training Schedule Announced for Spring Semester",
        slug: { current: "spring-training-schedule" },
        publishedAt: "2024-02-20T09:00:00Z",
        excerpt: "Training sessions will now be held on Tuesdays and Thursdays at the main sports hall. All interested students are welcome.",
    },
    {
        _id: "3",
        title: "Club President Interview: Vision for 2024",
        slug: { current: "president-interview-2024" },
        publishedAt: "2024-01-10T14:00:00Z",
        excerpt: "We sat down with the club president to discuss the goals for the upcoming year and the expansion of the cricket program.",
    },
];

async function getNews(): Promise<NewsItem[]> {
    if (!projectId) {
        return MOCK_NEWS;
    }
    try {
        const query = `*[_type == "news"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      "excerpt": array::join(string::split((pt::text(body)), "")[0..200], "") + "..."
    }`;
        const data = await client.fetch<NewsItem[]>(query);
        return data.length > 0 ? data : MOCK_NEWS;
    } catch (error) {
        console.error("Error fetching news:", error);
        return MOCK_NEWS;
    }
}

interface NewsItem {
    _id: string;
    title: string;
    slug: { current: string };
    publishedAt: string;
    mainImage?: any;
    excerpt: string;
}

export default async function NewsPage() {
    const news = await getNews();

    return (
        <div>
            <PageHeader
                title="Latest News"
                description="Updates, match reports, and announcements from the club."
                backgroundImage="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
            />

            <section className="py-16 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item: NewsItem) => (
                            <NewsCard
                                key={item._id}
                                title={item.title}
                                slug={item.slug.current}
                                publishedAt={item.publishedAt}
                                mainImage={item.mainImage}
                                excerpt={item.excerpt}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

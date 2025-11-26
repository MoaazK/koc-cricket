import { client } from "@/sanity/lib/client";
import { projectId } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import { format } from "date-fns";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock Data for Demo
const MOCK_NEWS_ITEM = {
    _id: "1",
    title: "Koç University Cricket Team Wins Season Opener",
    slug: { current: "season-opener-win" },
    publishedAt: "2024-03-15T10:00:00Z",
    mainImage: null,
    body: [
        {
            _key: "1",
            _type: "block",
            children: [
                {
                    _key: "1",
                    _type: "span",
                    text: "The Koç University Cricket Team started their 2024 season with a bang, securing a convincing victory against ITU at the home ground yesterday. The match, attended by a supportive crowd of students and faculty, showcased the team's hard work during the winter training sessions.",
                    marks: [],
                },
            ],
            markDefs: [],
            style: "normal",
        },
        {
            _key: "2",
            _type: "block",
            children: [
                {
                    _key: "1",
                    _type: "span",
                    text: "Batting first, Koç University put up a formidable total of 185/4 in their 20 overs. Captain Ahmet Yilmaz led from the front with a blistering 75 off 45 balls, supported by a steady 40 from vice-captain John Smith.",
                    marks: [],
                },
            ],
            markDefs: [],
            style: "normal",
        },
    ],
};

async function getNewsItem(slug: string) {
    if (!projectId) {
        // Return mock item if slug matches, else null (simulate 404)
        return slug === "season-opener-win" ? MOCK_NEWS_ITEM : MOCK_NEWS_ITEM; // Just return mock for any slug for demo
    }
    try {
        const query = `*[_type == "news" && slug.current == $slug][0]`;
        const data = await client.fetch(query, { slug });
        return data;
    } catch (error) {
        console.error("Error fetching news item:", error);
        return MOCK_NEWS_ITEM;
    }
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const newsItem = await getNewsItem(slug);

    if (!newsItem) {
        notFound();
    }

    return (
        <article className="bg-white dark:bg-black min-h-screen pb-16">
            {/* Hero Image or Header */}
            <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
                {newsItem.mainImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${urlFor(newsItem.mainImage).url()})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-koc-crimson/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 max-w-4xl mx-auto">
                    <Link href="/news" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to News
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {newsItem.title}
                    </h1>
                    <div className="flex items-center text-gray-300">
                        <Calendar className="h-5 w-5 mr-2" />
                        {newsItem.publishedAt ? format(new Date(newsItem.publishedAt), "MMMM d, yyyy") : "Unknown Date"}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg dark:prose-invert prose-red mx-auto">
                    {newsItem.body ? (
                        <PortableText value={newsItem.body} />
                    ) : (
                        <p className="text-gray-500 italic">No content available.</p>
                    )}
                </div>
            </div>
        </article>
    );
}

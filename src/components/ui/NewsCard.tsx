import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { urlFor } from "@/sanity/lib/image";

import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface NewsCardProps {
    title: string;
    slug: string;
    publishedAt: string;
    mainImage?: SanityImageSource;
    excerpt?: string;
}

export function NewsCard({ title, slug, publishedAt, mainImage, excerpt }: NewsCardProps) {
    return (
        <Link href={`/news/${slug}`} className="group flex flex-col bg-white dark:bg-black rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 h-full">
            {/* Image */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                {mainImage ? (
                    <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${urlFor(mainImage).width(800).url()})` }}
                    />
                ) : (
                    <div className="w-full h-full bg-koc-crimson/10 flex items-center justify-center text-koc-crimson">
                        <span className="font-bold">KU Cricket</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {publishedAt ? format(new Date(publishedAt), "MMMM d, yyyy") : "Unknown Date"}
                </div>
                <h3 className="text-xl font-bold text-koc-dark dark:text-white mb-3 group-hover:text-koc-crimson transition-colors line-clamp-2">
                    {title}
                </h3>
                {excerpt && (
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3 flex-grow">
                        {excerpt}
                    </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-koc-crimson font-medium text-sm group-hover:underline">Read Article &rarr;</span>
                </div>
            </div>
        </Link>
    );
}

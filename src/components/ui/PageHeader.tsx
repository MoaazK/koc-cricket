import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
    backgroundImage?: string;
}

export function PageHeader({ title, description, className, backgroundImage }: PageHeaderProps) {
    return (
        <div className={cn("relative bg-koc-dark text-white py-24", className)}>
            {backgroundImage && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                </div>
            )}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{title}</h1>
                {description && (
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">{description}</p>
                )}
            </div>
        </div>
    );
}

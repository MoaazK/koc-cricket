import { User } from "lucide-react";

interface PlayerCardProps {
    name: string;
    role: string;
    image?: string;
    number?: number;
}

export function PlayerCard({ name, role, image, number }: PlayerCardProps) {
    return (
        <div className="group relative bg-white dark:bg-black rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            {/* Image Container */}
            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                {image ? (
                    <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="h-20 w-20" />
                    </div>
                )}

                {/* Jersey Number Overlay */}
                {number && (
                    <div className="absolute top-4 right-4 bg-koc-crimson text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        {number}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-koc-dark dark:text-white mb-1">{name}</h3>
                <p className="text-sm font-medium text-koc-crimson uppercase tracking-wider">{role}</p>
            </div>
        </div>
    );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { Shield, Target, Users } from "lucide-react";

export default function AboutPage() {
    return (
        <div>
            <PageHeader
                title="About Us"
                description="The history, mission, and values of the Koç University Cricket Club."
                backgroundImage="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
            />

            <section className="py-16 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-koc-dark dark:text-white mb-6">Our History</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                Established in 2019, the Koç University Cricket Club was founded by a group of passionate students who wanted to bring the gentleman's game to one of Turkey's most prestigious universities.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Starting with just a handful of members and a single bat, the club has grown into a competitive team that competes in local leagues and university tournaments. We are proud to represent Koç University on the cricket field and foster a community of sportsmanship and excellence.
                            </p>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                            {/* Placeholder for Club Photo */}
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-400">Club Team Photo Placeholder</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-koc-grey dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-koc-dark dark:text-white">Our Values</h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">The core principles that guide our team.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-black p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-koc-dark dark:text-white">Integrity</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We play hard but fair. Upholding the spirit of cricket is paramount in everything we do, both on and off the field.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-black p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-koc-dark dark:text-white">Inclusivity</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Cricket is for everyone. We welcome players of all skill levels, backgrounds, and nationalities to join our family.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-black p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-koc-dark dark:text-white">Excellence</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We strive for excellence in training and competition, constantly pushing ourselves to improve and achieve new heights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div>
            <PageHeader
                title="Contact Us"
                description="Get in touch with the Koç University Cricket Club."
                backgroundImage="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
            />

            <section className="py-16 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-bold text-koc-dark dark:text-white mb-6">Get in Touch</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">Have questions or want to join the club? We&apos;d love to hear from you. Reach out to us using the contact information below or fill out the form and we&apos;ll get back to you as soon as possible.</p>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-koc-dark dark:text-white">Email</h3>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            <a href="mailto:koccricketofficial@gmail.com" className="hover:text-koc-crimson transition-colors">
                                                koccricketofficial@gmail.com
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-koc-dark dark:text-white">Location</h3>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            Koç University, Rumelifeneri Yolu,<br />
                                            Sarıyer, Istanbul, Turkey
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-koc-crimson/10 text-koc-crimson rounded-full flex items-center justify-center">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-koc-dark dark:text-white">Phone</h3>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            +90 (212) 338 5000 (University Main Line)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-koc-grey dark:bg-gray-900 p-8 rounded-2xl shadow-sm">
                            <h3 className="text-2xl font-bold text-koc-dark dark:text-white mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-koc-crimson focus:ring-koc-crimson sm:text-sm p-3 bg-white dark:bg-black dark:border-gray-800"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-koc-crimson focus:ring-koc-crimson sm:text-sm p-3 bg-white dark:bg-black dark:border-gray-800"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-koc-crimson focus:ring-koc-crimson sm:text-sm p-3 bg-white dark:bg-black dark:border-gray-800"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-koc-crimson hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koc-crimson transition-colors"
                                >
                                    Send Message <Send className="ml-2 h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

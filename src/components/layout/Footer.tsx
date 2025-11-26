import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-koc-dark text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Club Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Koç University Cricket Club</h3>
                        <p className="text-gray-400 mb-4">
                            Established in 2019, promoting the spirit of cricket at Koç University and beyond.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-koc-crimson transition-colors">
                                <Instagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-koc-crimson transition-colors">
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-koc-crimson transition-colors">
                                <Facebook className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/team" className="text-gray-400 hover:text-white transition-colors">
                                    Team Roster
                                </Link>
                            </li>
                            <li>
                                <Link href="/fixtures" className="text-gray-400 hover:text-white transition-colors">
                                    Fixtures & Results
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-koc-crimson mr-2 mt-1" />
                                <span className="text-gray-400">
                                    Koç University, Rumelifeneri Yolu,<br />
                                    Sarıyer, Istanbul, Turkey
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-koc-crimson mr-2" />
                                <a href="mailto:koccricketofficial@gmail.com" className="text-gray-400 hover:text-white">
                                    koccricketofficial@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Koç University Cricket Club. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

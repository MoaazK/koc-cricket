import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Koç University Cricket Club",
    template: "%s | KUCC"
  },
  description: "Official website of the Koç University Cricket Club (KUCC). Follow live scores, fixtures, news, and player stats from Turkey's premier university cricket team.",
  keywords: ["Cricket", "Koç University", "KUCC", "Turkey Cricket", "University Sports", "Istanbul Cricket"],
  authors: [{ name: "Koç University Cricket Club" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cricket.ku.edu.tr",
    siteName: "Koç University Cricket Club",
    title: "Koç University Cricket Club",
    description: "Official website of the Koç University Cricket Club. Est. 2019.",
    images: [
      {
        url: "/og-image.jpg", // We should ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "Koç University Cricket Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Koç University Cricket Club",
    description: "Official website of the Koç University Cricket Club. Est. 2019.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}


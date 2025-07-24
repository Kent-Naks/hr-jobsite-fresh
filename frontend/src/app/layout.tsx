import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR Jobsite",
  description: "Find and apply for jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Translucent, fixed Header */}
        <header className="fixed inset-x-0 top-0 z-50 bg-gray-700/75 backdrop-blur-sm text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">HR Jobsite</h1>
            <nav>
              <Link href="/" className="ml-4 hover:underline">
                Home
              </Link>
            </nav>
          </div>
        </header>

        {/* Spacer to push content below fixed header */}
        <div className="h-16" />

        {/* Main */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white p-4 text-center text-sm">
          <p>© {new Date().getFullYear()} HR Jobsite | All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

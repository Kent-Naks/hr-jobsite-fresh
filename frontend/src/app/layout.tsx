import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Header */}
        <header className="bg-blue-700 text-white p-4 shadow">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">HR Jobsite</h1>
            <nav>
              <a href="/" className="ml-4 hover:underline">Home</a>
            </nav>
          </div>
        </header>

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

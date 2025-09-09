import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import LogoutButton from "./components/LogoutButton";

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
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const authed = !!session && !!expected && session === expected;

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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <header className="fixed inset-x-0 top-0 z-50 bg-gray-700/75 backdrop-blur-sm text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">HR Jobsite</h1>
            <nav className="flex items-center gap-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
              {authed ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded border border-white/20"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="h-16" />
        <main className="flex-grow">{children}</main>

        <footer className="bg-gray-900 text-white p-4 text-center text-sm">
          <p>© {new Date().getFullYear()} HR Jobsite | All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

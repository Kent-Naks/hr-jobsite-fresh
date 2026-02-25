// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import LogoutButton from "./components/LogoutButton";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import SiteAnalytics from "../components/Analytics";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Talent Africa",
  description: "Transparent hiring. Real opportunities. East Africa's premier talent platform.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const authed = !!session && !!expected && session === expected;

  return (
    <html lang="en">
      <head>
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* ── PREMIUM HEADER ─────────────────────────────────────────── */}
        <header className="fixed inset-x-0 top-0 z-50 text-white shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(10,10,14,0.92) 0%, rgba(20,20,30,0.88) 50%, rgba(10,10,14,0.92) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-1 select-none">
              <span
                className="text-xl font-black tracking-tight transition-all duration-300"
                style={{
                  background: "linear-gradient(90deg, #ffffff 0%, #d1d5db 60%, #9ca3af 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                The
              </span>
              <span
                className="text-xl font-black tracking-tight ml-1 transition-all duration-300"
                style={{
                  background: "linear-gradient(90deg, #f9fafb 0%, #e5e7eb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Talent Africa
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="nav-link text-gray-300 hover:text-white transition-colors duration-200">
                Home
              </Link>
              <Link href="/about" className="nav-link text-gray-300 hover:text-white transition-colors duration-200">
                About
              </Link>
              <Link href="/contact" className="nav-link text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </Link>
              <Link href="/admin" className="nav-link text-gray-300 hover:text-white transition-colors duration-200">
                Admin
              </Link>
              {authed ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="text-sm px-4 py-1.5 rounded-full border border-white/20 bg-white/8 hover:bg-white/15 hover:border-white/35 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="h-16" />
        <main className="flex-grow">{children}</main>

        <SiteAnalytics />

        {/* ── PREMIUM FOOTER ─────────────────────────────────────────── */}
        <footer
          className="text-white py-8 px-6"
          style={{
            background: "rgba(8, 8, 12, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Top accent line */}
          <div
            className="w-24 h-px mx-auto mb-6"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
          />

          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span
                className="font-bold text-base tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #ffffff, #9ca3af)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                The Talent Africa
              </span>
              <span className="hidden sm:block text-gray-600">·</span>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>

            <a
              href="mailto:thetalentafrica@zohomail.com"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              thetalentafrica@zohomail.com
            </a>
          </div>
        </footer>

        <VercelAnalytics />
      </body>
    </html>
  );
}

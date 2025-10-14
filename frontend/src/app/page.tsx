import React from "react";
import Link from "next/link";
import AdSlot from "./components/AdSlot";
import FlashBanner from "./components/FlashBanner"; // ⟵ NEW
import { headers } from "next/headers";

type Category = { slug: string; label: string; count: number };

export default async function HomePage() {
  // Build absolute URL that works locally and behind proxies (Render/Vercel)
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host")  ?? h.get("host");
  const base  = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  const categories: Category[] = res.ok ? await res.json() : [];

  return (
    <>
      {/* FULL-WIDTH HERO */}
      <div
        className="relative w-full h-96 bg-cover bg-center rounded-b-3xl"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/04/29/95/04299542ecddde63a7ffbd10f24990f8.jpg')",
        }}
      >
        <div className="hero-text text-white text-2xl font-bold">
          Browse Jobs by Category
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Flash banner (shows for ~4s if set in sessionStorage) */}
        <FlashBanner /> {/* ⟵ NEW */}

        {/* TOP AD */}
        <div className="mb-4">
          <AdSlot slot="1234567890" />
        </div>

        {/* CATEGORY GRID */}
        <h2 className="text-2xl font-semibold mb-4">Job Categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 mb-8">No categories yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="block p-4 border rounded-lg hover:shadow transition"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{cat.label}</span>
                    
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* BOTTOM AD */}
        <div className="mt-6">
          <AdSlot slot="0987654321" />
        </div>
      </div>
    </>
  );
}

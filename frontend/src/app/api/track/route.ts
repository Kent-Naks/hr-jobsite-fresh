// src/app/api/track/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";
import { enqueueEvent } from "@/lib/analyticsBuffer";

// --- cached geoip loader (module-scope) ---
let _geoip: any = null;
let _geoipTried = false;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, type, path, referrer } = body;

    // prisma model sanity check
    try {
      console.debug("prisma keys:", Object.keys(prisma as any).slice(0, 80));
    } catch (e) {
      console.warn("prisma debug failed", e);
    }

    if (!(prisma as any).analyticsEvent) {
      console.error("prisma.analyticsEvent is missing — generated client may be stale.");
      return NextResponse.json(
        { ok: false, error: "Prisma client missing analyticsEvent model." },
        { status: 500 }
      );
    }

    // IP extraction
    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ip = ipHeader.split(",")[0]?.trim() || null;

    // User-Agent parsing
    const ua = req.headers.get("user-agent") ?? body.userAgent ?? "";
    const parser = new UAParser(ua);
    const device = parser.getDevice() as { type?: string };

    let deviceType = "desktop";
    if (device?.type === "mobile") deviceType = "mobile";
    if (device?.type === "tablet") deviceType = "tablet";
    if (/bot|crawl|spider|slurp|bing/i.test(ua)) deviceType = "bot";

    // geoip lookup (cached)
    let country: string | null = null;

    try {
      if (!_geoipTried) {
        _geoipTried = true;
        try {
          const mod = await import("geoip-lite");
          _geoip = (mod as any).default ?? mod;
        } catch (importErr) {
          console.warn("geoip-lite import failed — skipping geo lookups.");
          _geoip = null;
        }
      }

      if (_geoip && ip) {
        const g = _geoip.lookup(ip);
        if (g?.country) country = g.country;
      }
    } catch {
      // ignore geoip failures completely
    }

    // event payload to enqueue
    const data = {
      sessionId: sessionId || `s_${Math.random().toString(36).slice(2, 9)}`,
      type: type || "pageview",
      path: path ?? "/",
      referrer: referrer ?? null,
      userAgent: ua,
      ip,
      country,
      deviceType,
    };

    // enqueue event for background processing
    enqueueEvent(data);

    // respond immediately
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("track POST error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

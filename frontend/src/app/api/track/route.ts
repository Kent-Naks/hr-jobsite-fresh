// src/app/api/track/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

// --- cached geoip loader (module-scope) ---
let _geoip: any = null;
let _geoipTried = false;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, type, path, referrer } = body;

    // quick debug: ensure prisma client is loaded and list top-level keys
    try {
      // this will show which models / methods exist on the client
      console.debug("prisma keys:", Object.keys(prisma as any).slice(0, 80));
    } catch (e) {
      console.warn("prisma debug failed", e);
    }

    // if analyticsEvent model is not present, return a graceful error
    if (!(prisma as any).analyticsEvent) {
      console.error("prisma.analyticsEvent is missing — generated client may be stale or not loaded.");
      console.error("prisma available keys:", Object.keys(prisma as any));
      return NextResponse.json(
        { ok: false, error: "Prisma client missing analyticsEvent model. See server logs." },
        { status: 500 }
      );
    }

    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ip = ipHeader.split(",")[0]?.trim() || null;

    const ua = req.headers.get("user-agent") ?? body.userAgent ?? "";
    const parser = new UAParser(ua);
    const device = parser.getDevice() as { type?: string | undefined };

    let deviceType = "desktop";
    if (device?.type === "mobile") deviceType = "mobile";
    if (device?.type === "tablet") deviceType = "tablet";
    if (/bot|crawl|spider|slurp|bing/i.test(ua)) deviceType = "bot";

    // dynamic import geoip (best-effort) — try once per server process and cache result
    let country: string | null = null;
    try {
      if (!_geoipTried) {
        _geoipTried = true;
        try {
          const mod = await import("geoip-lite");
          // module may export default or top-level; handle both
          _geoip = (mod as any).default ?? mod;
          // Note: even if import succeeds, lookup may still return null if data missing
        } catch (importErr) {
          // Single log the failure — do not spam per-request
          console.warn(
            "geoip lookup failed (geoip-lite import). Country lookups will be skipped. —",
            importErr && (importErr as Error).message ? (importErr as Error).message : importErr
          );
          _geoip = null;
        }
      }
      if (_geoip && ip) {
        try {
          const g = _geoip.lookup(ip);
          if (g?.country) country = g.country;
        } catch (lookupErr) {
          // don't let geoip errors break analytics; debug log only
          console.debug("geoip.lookup error (ignored):", (lookupErr as Error).message ?? lookupErr);
        }
      }
    } catch (outerErr) {
      // ultimate safety net — ignore geoip problems
      console.debug("geoip outer error (ignored):", (outerErr as Error).message ?? outerErr);
    }

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

    // create event (guarded earlier, so this should exist)
    const event = await (prisma as any).analyticsEvent.create({ data });
    return NextResponse.json({ ok: true, id: event.id });
  } catch (err) {
    console.error("track POST error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

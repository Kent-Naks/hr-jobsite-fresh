import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, type, path, referrer, duration } = body;

    const ua = req.headers.get("user-agent") ?? body.userAgent ?? "";
    const parser = new UAParser(ua);
    const device = parser.getDevice() as { type?: string };

    let deviceType = "desktop";
    if (device?.type === "mobile") deviceType = "mobile";
    if (device?.type === "tablet") deviceType = "tablet";
    if (/bot|crawl|spider|slurp|bing/i.test(ua)) deviceType = "bot";

    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ip = ipHeader.split(",")[0]?.trim() || null;

    await prisma.analyticsEvent.create({
      data: {
        sessionId: sessionId || `s_${Math.random().toString(36).slice(2, 9)}`,
        type: type || "pageview",
        path: path ?? "/",
        referrer: referrer ?? null,
        userAgent: ua,
        ip,
        deviceType,
        duration: duration != null ? Number(duration) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("track POST error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

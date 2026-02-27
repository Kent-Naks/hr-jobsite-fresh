// src/components/Analytics.tsx
"use client";

import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";

export default function Analytics() {
  const path = usePathname();
  const sidRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const HEARTBEAT_MS = 2 * 60 * 1000; // 2 minutes

  // ensure sid is stable across renders
  useEffect(() => {
    const sessionKey = "analytics_sid";
    let sid = sessionStorage.getItem(sessionKey);
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem(sessionKey, sid);
    }
    sidRef.current = sid;
  }, []);

  // helper to send a payload (fire-and-forget)
  const send = async (type: string) => {
    const sid = sidRef.current;
    if (!sid) return;
    const payload: Record<string, unknown> = {
      sessionId: sid,
      type,
      path: typeof window !== "undefined" ? window.location.pathname : path || "/",
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };
    if (type === "unload") {
      payload.duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    }

    if (type === "unload" && typeof navigator !== "undefined" && (navigator as any).sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        (navigator as any).sendBeacon("/api/track", blob);
      } catch {
        // ignore
      }
    } else {
      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
  };

  // send pageview on mount and whenever pathname changes (captures client-side navigation)
  useEffect(() => {
    send("pageview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // heartbeat + unload handling
  useEffect(() => {
    const interval = setInterval(() => send("ping"), HEARTBEAT_MS);
    const onUnload = () => send("unload");
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// lib/analyticsBuffer.ts
import { prisma } from "./prisma";

type EventRow = {
  sessionId: string;
  type: string;

  path?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  country?: string | null;
  deviceType?: string | null;
  duration?: number | null;
};

const buffer: EventRow[] = [];
const FLUSH_INTERVAL_MS = 3000;
const FLUSH_BATCH_SIZE = 200;

let flushing = false;

export function enqueueEvent(row: EventRow) {
  buffer.push(row);

  // Always attempt an immediate flush (fire-and-forget) so events are
  // persisted on serverless platforms where the setInterval may never fire.
  flush().catch((e) => console.error("analytics flush error", e));
}

export async function flush() {
  if (flushing) return;
  if (buffer.length === 0) return;

  flushing = true;
  try {
    const items = buffer.splice(0, FLUSH_BATCH_SIZE);

    if (items.length > 0) {
      await prisma.analyticsEvent.createMany({
        data: items,
        skipDuplicates: true,
      });
    }
  } catch (err) {
    console.error("analytics flush error:", (err as Error).message ?? err);
  } finally {
    flushing = false;
  }
}

setInterval(() => {
  flush().catch((e) => console.error("scheduled flush error", e));
}, FLUSH_INTERVAL_MS);

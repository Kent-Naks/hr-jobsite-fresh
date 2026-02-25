"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "!@#$%^&*<>?/|ABCDEFabcdef0123456789";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface Props {
  text: string;
}

export default function ScrambleText({ text }: Props) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scramble() {
    let lockedCount = 0;

    function tick() {
      // Build the current display string: locked prefix + scrambled suffix
      const locked = text.slice(0, lockedCount);
      const scrambled = text
        .slice(lockedCount)
        .split("")
        .map((ch) => (ch === " " ? " " : randomChar()))
        .join("");
      setDisplay(locked + scrambled);

      if (lockedCount < text.length) {
        lockedCount++;
        frameRef.current = setTimeout(tick, 60);
      } else {
        // Full text revealed — hold for 3 s then scramble again
        loopRef.current = setTimeout(scramble, 3000);
      }
    }

    tick();
  }

  useEffect(() => {
    // Small initial delay so it doesn't fire before the page paints
    loopRef.current = setTimeout(scramble, 400);

    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span
      aria-label={text}
      style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "inherit" }}
    >
      {display}
    </span>
  );
}

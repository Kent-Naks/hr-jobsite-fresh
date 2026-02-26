"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────

const CHARS = "!@#$%^&*<>?/|ABCDEFabcdef0123456789";
const N_STYLES = 7;
const STAGGER = 80;      // ms delay between consecutive letters (styles 1, 3)
const LETTER_DUR = 700;  // CSS transition duration per letter (ms)
const SCRAMBLE_MS = 120; // ms per locked-in char (style 4)

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function scrambleStr(text: string, locked = 0) {
  return text
    .split("")
    .map((ch, i) => (i < locked || ch === " " ? ch : randChar()))
    .join("");
}

// ─── types ────────────────────────────────────────────────────────────────────

type Phase = "pre-in" | "in" | "hold" | "out";

interface Props {
  text: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ScrambleText({ text }: Props) {
  const chars = text.split("");
  const n = chars.length;

  const [styleIdx, setStyleIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("pre-in");
  // mutable display text used only by style 4 (scramble)
  const [scDisplay, setScDisplay] = useState(text);

  const tids = useRef<ReturnType<typeof setTimeout>[]>([]);

  function addT(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    tids.current.push(id);
  }

  function clearT() {
    tids.current.forEach(clearTimeout);
    tids.current = [];
  }

  function advance() {
    setStyleIdx((i) => (i + 1) % N_STYLES);
    setPhase("pre-in");
    setScDisplay(text);
  }

  // Total time for each phase per style (ms)
  const letterTotal = n * STAGGER + LETTER_DUR + 60;
  const inMs  = [1200, letterTotal, 1200, letterTotal, n * SCRAMBLE_MS + 160, 1600, 1600];
  const holdMs = [5000, 4000, 4000, 4000, 5000, 5000, 4000];
  const outMs  = [1200, letterTotal, 1200, letterTotal, 400, 1600, 1600];

  // ── scramble helpers ───────────────────────────────────────────────────────

  function runScrambleIn() {
    setScDisplay(scrambleStr(text, 0)); // start fully scrambled
    let locked = 0;
    function tick() {
      locked++;
      setScDisplay(scrambleStr(text, locked));
      if (locked < n) addT(tick, SCRAMBLE_MS);
      else addT(() => setPhase("hold"), 160);
    }
    addT(tick, SCRAMBLE_MS);
  }

  function runScrambleOut() {
    let steps = 0;
    function tick() {
      setScDisplay(scrambleStr(text, 0));
      if (++steps < 6) addT(tick, 120);
      else advance();
    }
    addT(tick, 120);
  }

  // ── phase state machine ────────────────────────────────────────────────────

  useEffect(() => {
    clearT();
    if (phase === "pre-in") {
      // For scramble: pre-scramble immediately so there's no flash of correct text
      if (styleIdx === 4) setScDisplay(scrambleStr(text, 0));
      addT(() => setPhase("in"), 150);
    } else if (phase === "in") {
      if (styleIdx === 4) runScrambleIn();
      else addT(() => setPhase("hold"), inMs[styleIdx]);
    } else if (phase === "hold") {
      addT(() => setPhase("out"), holdMs[styleIdx]);
    } else if (phase === "out") {
      if (styleIdx === 4) runScrambleOut();
      else addT(advance, outMs[styleIdx]);
    }
    return clearT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, styleIdx]);

  // ── per-letter style helpers ───────────────────────────────────────────────

  // Style 1: drop in from above, rise out upward
  function letterDropStyle(i: number): React.CSSProperties {
    const visible = phase === "in" || phase === "hold";
    const isPre = phase === "pre-in";
    return {
      display: "inline-block",
      transform: visible ? "translateY(0)" : "translateY(-110%)",
      opacity: visible ? 1 : 0,
      transition: isPre
        ? "none"
        : phase === "out"
        ? `transform ${LETTER_DUR}ms ease-in, opacity 400ms ease`
        : `transform ${LETTER_DUR}ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease`,
      transitionDelay: isPre
        ? "0ms"
        : phase === "in"
        ? `${i * STAGGER}ms`
        : phase === "out"
        ? `${(n - 1 - i) * STAGGER}ms`
        : "0ms",
    };
  }

  // Style 3: slide in from right with scaleX stretch, exit left
  function letterMorphStyle(i: number): React.CSSProperties {
    const visible = phase === "in" || phase === "hold";
    const isPre = phase === "pre-in";
    const exiting = phase === "out";
    return {
      display: "inline-block",
      transformOrigin: "center center",
      transform: visible
        ? "translateX(0) scaleX(1)"
        : exiting
        ? "translateX(-50px) scaleX(1.8)"
        : "translateX(50px) scaleX(1.8)",
      opacity: visible ? 1 : 0,
      transition: isPre
        ? "none"
        : phase === "out"
        ? `transform ${LETTER_DUR}ms ease-in, opacity 400ms ease`
        : `transform ${LETTER_DUR}ms cubic-bezier(0.34,1.56,0.64,1), opacity 400ms ease`,
      transitionDelay: isPre
        ? "0ms"
        : phase === "in"
        ? `${i * STAGGER}ms`
        : phase === "out"
        ? `${(n - 1 - i) * STAGGER}ms`
        : "0ms",
    };
  }

  // ── base wrapper style ─────────────────────────────────────────────────────

  const base: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "nowrap",
    position: "relative",
  };

  // ── render ─────────────────────────────────────────────────────────────────

  // 0 ─ Slide loop
  if (styleIdx === 0) {
    const tx =
      phase === "pre-in" ? "120%" :
      phase === "out"    ? "-120%" : "0%";
    return (
      <span style={{ ...base, overflow: "hidden" }} aria-label={text}>
        <span style={{
          display: "inline-block",
          transform: `translateX(${tx})`,
          transition: phase === "pre-in"
            ? "none"
            : `transform 1.2s ${phase === "out" ? "ease-in" : "cubic-bezier(0.22,1,0.36,1)"}`,
        }}>
          {text}
        </span>
      </span>
    );
  }

  // 1 ─ Letter cascade (drop in, rise out)
  if (styleIdx === 1) {
    return (
      <span style={base} aria-label={text}>
        {chars.map((ch, i) =>
          ch === " " ? (
            <span key={i} style={{ display: "inline-block", width: "0.3em" }} />
          ) : (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                lineHeight: 1.25,
              }}
            >
              <span style={letterDropStyle(i)}>{ch}</span>
            </span>
          )
        )}
      </span>
    );
  }

  // 2 ─ Split reveal (top half from above, bottom half from below)
  if (styleIdx === 2) {
    const sep = phase === "pre-in" || phase === "out";
    const trans = phase === "pre-in"
      ? "none"
      : "transform 1.2s cubic-bezier(0.22,1,0.36,1)";
    return (
      <span style={{ ...base, overflow: "hidden" }} aria-label={text}>
        {/* invisible spacer keeps dimensions stable */}
        <span style={{ visibility: "hidden" }}>{text}</span>
        {/* top half slides down from above */}
        <span style={{
          position: "absolute", inset: 0,
          clipPath: "inset(0 0 50% 0)",
          transform: sep ? "translateY(-120%)" : "translateY(0)",
          transition: trans,
        }}>
          {text}
        </span>
        {/* bottom half slides up from below */}
        <span style={{
          position: "absolute", inset: 0,
          clipPath: "inset(50% 0 0 0)",
          transform: sep ? "translateY(120%)" : "translateY(0)",
          transition: trans,
        }}>
          {text}
        </span>
      </span>
    );
  }

  // 3 ─ Liquid morph (letters stretch in from right, exit left)
  if (styleIdx === 3) {
    return (
      <span style={base} aria-label={text}>
        {chars.map((ch, i) =>
          ch === " " ? (
            <span key={i} style={{ display: "inline-block", width: "0.3em" }} />
          ) : (
            <span key={i} style={letterMorphStyle(i)}>{ch}</span>
          )
        )}
      </span>
    );
  }

  // 4 ─ Scramble reveal
  if (styleIdx === 4) {
    return (
      <span style={base} aria-label={text}>
        {/* spacer keeps width stable while chars swap */}
        <span style={{ visibility: "hidden" }}>{text}</span>
        <span style={{
          position: "absolute", top: 0, left: 0,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}>
          {scDisplay}
        </span>
      </span>
    );
  }

  // 5 ─ Cinematic fade (scale 0.92→1 in, 1→1.08 out)
  if (styleIdx === 5) {
    const scale =
      phase === "pre-in" ? 0.92 :
      phase === "out"    ? 1.08 : 1;
    const opacity = phase === "in" || phase === "hold" ? 1 : 0;
    return (
      <span
        style={{
          ...base,
          transform: `scale(${scale})`,
          opacity,
          transition: phase === "pre-in"
            ? "none"
            : "transform 1.6s cubic-bezier(0.22,1,0.36,1), opacity 1.6s ease",
        }}
        aria-label={text}
      >
        {text}
      </span>
    );
  }

  // 6 ─ Stacked layers (indigo + white + emerald converge to center)
  if (styleIdx === 6) {
    const sep = phase === "pre-in" || phase === "out";
    const converged = phase === "in" || phase === "hold";
    const layerTrans = phase === "pre-in"
      ? "none"
      : "transform 1.6s cubic-bezier(0.22,1,0.36,1), opacity 1.6s ease";
    return (
      <span style={{ ...base, overflow: "visible" }} aria-label={text}>
        {/* spacer keeps layout width stable */}
        <span style={{ visibility: "hidden" }}>{text}</span>
        {/* indigo layer — offset top-left, converges to center */}
        <span style={{
          position: "absolute", top: 0, left: 0,
          whiteSpace: "nowrap", userSelect: "none",
          color: "#6366f1",
          transform: sep ? "translate(-8px, -8px)" : "translate(0,0)",
          opacity: converged ? 0.7 : 0,
          transition: layerTrans,
        }}>
          {text}
        </span>
        {/* emerald layer — offset bottom-right, converges to center */}
        <span style={{
          position: "absolute", top: 0, left: 0,
          whiteSpace: "nowrap", userSelect: "none",
          color: "#10b981",
          transform: sep ? "translate(8px, 8px)" : "translate(0,0)",
          opacity: converged ? 0.7 : 0,
          transition: layerTrans,
        }}>
          {text}
        </span>
        {/* white main layer — centered, full opacity */}
        <span style={{
          position: "absolute", top: 0, left: 0,
          whiteSpace: "nowrap",
          color: "white",
          opacity: converged ? 1 : 0,
          transition: layerTrans,
        }}>
          {text}
        </span>
      </span>
    );
  }

  return <span aria-label={text}>{text}</span>;
}

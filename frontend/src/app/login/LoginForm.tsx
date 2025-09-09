"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error || "Login failed");
      setLoading(false);
      return;
    }

    // Go to intended page
    router.push(next);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm w-full">
      <div>
        <label className="block text-sm font-medium mb-1">Admin Password</label>
        <input
          type="password"
          className="w-full border rounded p-2"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full border rounded p-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

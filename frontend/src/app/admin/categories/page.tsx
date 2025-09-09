"use client";

import { useEffect, useState } from "react";

type Category = { id: number; label: string };

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    const data = await res.json();
    setCats(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createCat() {
    if (!newLabel.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    if (!res.ok) { alert("Create failed: " + (await res.text())); return; }
    setNewLabel("");
    load();
  }

  async function renameCat(id: number, current: string) {
    const name = prompt("New category name:", current);
    if (!name) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: name }),
    });
    if (!res.ok) { alert("Rename failed: " + (await res.text())); return; }
    load();
  }

  async function deleteCat(id: number) {
    if (!confirm("Delete this category? (Only possible when no jobs use it)")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Delete failed: " + (await res.text())); return; }
    load();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin · Categories</h1>
        <a href="/admin" className="underline">← Back to Jobs</a>
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="New category name"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button className="border rounded px-3 py-2" onClick={createCat}>Add</button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Label</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.label}</td>
                <td className="p-2 space-x-3">
                  <button className="underline" onClick={() => renameCat(c.id, c.label)}>Rename</button>
                  <button className="underline text-red-600" onClick={() => deleteCat(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

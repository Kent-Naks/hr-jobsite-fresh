"use client";

export default function LogoutButton() {
  async function doLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button onClick={doLogout} className="border rounded px-3 py-1">
      Logout
    </button>
  );
}

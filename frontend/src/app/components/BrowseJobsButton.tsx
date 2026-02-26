"use client";

export default function BrowseJobsButton() {
  const handleClick = () => {
    const el = document.getElementById("categories");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      onClick={handleClick}
      className="inline-block px-8 py-3 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105 shadow-2xl cursor-pointer"
      style={{ background: "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)" }}
    >
      Browse Jobs
    </button>
  );
}

"use client";

export default function BrowseJobsButton() {
  const handleClick = () => {
    const el = document.getElementById("categories");
    if (!el) return;

    const startY = window.scrollY;
    const targetY = el.getBoundingClientRect().top + window.scrollY;
    const distance = targetY - startY;
    const duration = 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * progress);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
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

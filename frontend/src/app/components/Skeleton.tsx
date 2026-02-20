"use client";

import React from "react";

type Props = {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: string;
  count?: number;
};

export default function Skeleton({ className = "", height = "1rem", width = "100%", rounded = "rounded", count = 1 }: Props) {
  const items = Array.from({ length: count });

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-700 ${rounded} animate-pulse`}
          style={{ height, width }}
        />
      ))}
    </div>
  );
}

// Example compound skeleton exported as named helper
export function SkeletonCard({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md ${className}`}>
      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

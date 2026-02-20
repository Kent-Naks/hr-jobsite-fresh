"use client";

import React from "react";
import { SkeletonCard } from "./components/Skeleton";

export default function Loading() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  );
}

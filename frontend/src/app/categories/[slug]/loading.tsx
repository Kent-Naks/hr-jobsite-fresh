"use client";

import React from "react";
import { SkeletonCard } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SkeletonCard lines={4} />
      <div className="mt-4 space-y-3">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
}

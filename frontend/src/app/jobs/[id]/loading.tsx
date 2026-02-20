"use client";

import React from "react";
import { SkeletonCard } from "@/app/components/Skeleton";

export default function JobLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <SkeletonCard lines={3} />
      <div className="mt-6">
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
}

// src/types.ts
export interface Job {
    id: string;
    title: string;
    location: string;
    description: string;
    keywords: string[];
    company?: string;
  }
  
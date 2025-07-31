// src/types.ts
export interface Job {
  id: string;
  title: string;
  location: string;
  salaryKES: string;
  description: string;
  keywords: string[];
  benefits: string[];      // ← NEW, mandatory in the sample above
}
  
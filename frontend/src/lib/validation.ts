import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["yes_no", "text"]),
  prompt: z.string().min(3),
  required: z.boolean().optional().default(false),
  order: z.number().int().nonnegative().optional().default(0),
});

export const JobInputSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.number().int(),
  salaryMin: z.number().int().nullable().optional(),
  salaryMax: z.number().int().nullable().optional(),
  currency: z.string().optional().default("KES"),
  requireCV: z.boolean().optional().default(false),
  requireCoverLetter: z.boolean().optional().default(false),
  questions: z.array(QuestionSchema).optional(),
  // accept string | null | undefined; we convert to Date server-side
  expiresAt: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  publish: z.boolean().optional(),
});

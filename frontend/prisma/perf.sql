-- Fast fuzzy matches on titles
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Helpful order-by index
CREATE INDEX IF NOT EXISTS "Job_createdAt_idx" ON "Job" ("createdAt" DESC);

-- Trigram index: speeds up ILIKE / contains searches on title
CREATE INDEX IF NOT EXISTS "Job_title_trgm_idx"
  ON "Job" USING GIN ("title" gin_trgm_ops);

-- Full-text search on title+description (no unaccent)
CREATE INDEX IF NOT EXISTS "Job_search_idx"
  ON "Job" USING GIN (
    to_tsvector('english', coalesce("title",'') || ' ' || coalesce("description",''))
  );

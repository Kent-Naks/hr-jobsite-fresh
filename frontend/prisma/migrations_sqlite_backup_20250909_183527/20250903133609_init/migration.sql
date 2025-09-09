-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'KES',
    "requireCV" BOOLEAN NOT NULL DEFAULT false,
    "requireCoverLetter" BOOLEAN NOT NULL DEFAULT false,
    "questions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Job_categoryId_idx" ON "Job"("categoryId");

-- CreateIndex
CREATE INDEX "Job_status_publishedAt_idx" ON "Job"("status", "publishedAt");

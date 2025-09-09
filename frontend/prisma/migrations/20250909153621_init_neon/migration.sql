-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'KES',
    "requireCV" BOOLEAN NOT NULL DEFAULT false,
    "requireCoverLetter" BOOLEAN NOT NULL DEFAULT false,
    "questions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Job_categoryId_idx" ON "public"."Job"("categoryId");

-- CreateIndex
CREATE INDEX "Job_status_publishedAt_idx" ON "public"."Job"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Job_status_expiresAt_idx" ON "public"."Job"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

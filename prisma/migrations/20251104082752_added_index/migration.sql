-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CompanyOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyOwners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompanyOwners_B_index" ON "public"."_CompanyOwners"("B");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "public"."clients"("status");

-- CreateIndex
CREATE INDEX "clients_clerkId_idx" ON "public"."clients"("clerkId");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "public"."clients"("createdAt");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_clientId_idx" ON "public"."invoices"("clientId");

-- CreateIndex
CREATE INDEX "invoices_projectId_idx" ON "public"."invoices"("projectId");

-- CreateIndex
CREATE INDEX "invoices_issueDate_idx" ON "public"."invoices"("issueDate");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "public"."invoices"("dueDate");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_clientId_idx" ON "public"."payments"("clientId");

-- CreateIndex
CREATE INDEX "payments_projectId_idx" ON "public"."payments"("projectId");

-- CreateIndex
CREATE INDEX "payments_date_idx" ON "public"."payments"("date");

-- CreateIndex
CREATE INDEX "payments_dueDate_idx" ON "public"."payments"("dueDate");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "public"."projects"("status");

-- CreateIndex
CREATE INDEX "projects_clientId_idx" ON "public"."projects"("clientId");

-- CreateIndex
CREATE INDEX "projects_clerkId_idx" ON "public"."projects"("clerkId");

-- CreateIndex
CREATE INDEX "projects_startDate_idx" ON "public"."projects"("startDate");

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompanyOwners" ADD CONSTRAINT "_CompanyOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompanyOwners" ADD CONSTRAINT "_CompanyOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."RetainerStatus" AS ENUM ('ACTIVE', 'DEPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."retainers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" MONEY NOT NULL,
    "usedAmount" MONEY NOT NULL DEFAULT 0,
    "remainingAmount" MONEY NOT NULL,
    "hourlyRate" MONEY,
    "status" "public"."RetainerStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retainers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."retainers" ADD CONSTRAINT "retainers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."retainers" ADD CONSTRAINT "retainers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

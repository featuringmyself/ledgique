/*
  Warnings:

  - You are about to drop the column `clientFrom` on the `clients` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('OFFICE_SUPPLIES', 'TRAVEL', 'MEALS', 'SOFTWARE', 'EQUIPMENT', 'MARKETING', 'UTILITIES', 'RENT', 'OTHER');

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "clientFrom",
ADD COLUMN     "clientSourceId" TEXT;

-- CreateTable
CREATE TABLE "public"."client_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" MONEY NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,
    "clerkId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_sources_name_clerkId_key" ON "public"."client_sources"("name", "clerkId");

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_clientSourceId_fkey" FOREIGN KEY ("clientSourceId") REFERENCES "public"."client_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

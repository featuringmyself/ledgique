/*
  Warnings:

  - You are about to drop the column `notes` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `remainingAmount` on the `retainers` table. All the data in the column will be lost.
  - You are about to drop the column `usedAmount` on the `retainers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NoteType" AS ENUM ('GENERAL', 'TODO', 'DELIVERABLE', 'MEETING_NOTES', 'CLIENT_COMMUNICATION', 'PROJECT_NOTES', 'PERSONAL');

-- CreateEnum
CREATE TYPE "public"."NotePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."NoteStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "notes",
ADD COLUMN     "clientNotes" TEXT;

-- AlterTable
ALTER TABLE "public"."expenses" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "public"."retainers" DROP COLUMN "remainingAmount",
DROP COLUMN "usedAmount";

-- CreateTable
CREATE TABLE "public"."notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."NoteType" NOT NULL DEFAULT 'GENERAL',
    "priority" "public"."NotePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."NoteStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "clerkId" TEXT NOT NULL,
    "projectId" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

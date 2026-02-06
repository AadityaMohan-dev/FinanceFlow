/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Budget` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,period]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropIndex
DROP INDEX "Budget_userId_categoryId_period_key";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "categoryId",
DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- CreateIndex
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_period_key" ON "Budget"("userId", "period");

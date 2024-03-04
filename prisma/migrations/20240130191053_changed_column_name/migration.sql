/*
  Warnings:

  - You are about to drop the column `hashed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashed",
ADD COLUMN     "hashedRt" TEXT;

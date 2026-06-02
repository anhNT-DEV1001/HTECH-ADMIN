/*
  Warnings:

  - You are about to drop the column `client_name` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "client_name",
ADD COLUMN     "url" TEXT;

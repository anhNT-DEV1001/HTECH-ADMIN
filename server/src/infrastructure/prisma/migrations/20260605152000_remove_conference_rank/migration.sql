-- DropForeignKey
ALTER TABLE "conferences" DROP CONSTRAINT IF EXISTS "conferences_rankId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "conferences_rankId_idx";

-- AlterTable
ALTER TABLE "conferences" DROP COLUMN IF EXISTS "rankId";

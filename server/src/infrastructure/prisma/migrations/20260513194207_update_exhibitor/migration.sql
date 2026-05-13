-- AlterTable
ALTER TABLE "agenda" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "agenda_date" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "agenda_timeline" ALTER COLUMN "locate_en" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "booths" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "exhibitions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "exhibitor_ranks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "exhibitors" ADD COLUMN     "img" TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "zones" ALTER COLUMN "updated_at" DROP DEFAULT;

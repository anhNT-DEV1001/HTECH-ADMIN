-- CreateTable
CREATE TABLE IF NOT EXISTS "webs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "webs_pkey" PRIMARY KEY ("id")
);

-- Seed default web for existing rows that will be backfilled with web_id = 1
INSERT INTO "webs" ("id", "name", "alias", "url")
VALUES (1, 'Default Web', 'default-web', '/')
ON CONFLICT ("id") DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('"webs"', 'id'),
    GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "webs"), 1),
    true
);

-- AlterTable
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "web_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "web_id" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE IF NOT EXISTS "agenda" (
    "id" SERIAL NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "file_url" TEXT NOT NULL,
    "web_id" INTEGER NOT NULL,
    "SDate" DATE NOT NULL,
    "EDate" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agenda_date" (
    "id" SERIAL NOT NULL,
    "agenda_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "agenda_date_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agenda_timeline" (
    "id" SERIAL NOT NULL,
    "agenda_date_id" INTEGER NOT NULL,
    "STime" TIME NOT NULL,
    "ETime" TIME NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "short_name_vn" TEXT NOT NULL,
    "short_name_en" TEXT,
    "locate_vn" TEXT NOT NULL,
    "locate_en" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "agenda_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "exhibitor_ranks" (
    "id" SERIAL NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "web_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "exhibitor_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "booths" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "web_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "exhibitors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sumary_vn" TEXT NOT NULL,
    "sumary_en" TEXT,
    "content_vn" TEXT NOT NULL,
    "content_en" TEXT,
    "rankId" INTEGER NOT NULL,
    "boothId" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "exhibitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "exhibitions" (
    "id" SERIAL NOT NULL,
    "logo" TEXT,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "title_vn" TEXT NOT NULL,
    "title_en" TEXT,
    "sumary_vn" TEXT,
    "sumary_en" TEXT,
    "content_vn" TEXT,
    "content_en" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "web_id" INTEGER NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "exhibitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "zones" (
    "id" SERIAL NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "web_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_ExhibitionToExhibitor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExhibitionToExhibitor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agenda_web_id_idx" ON "agenda"("web_id");
CREATE INDEX IF NOT EXISTS "agenda_date_agenda_id_idx" ON "agenda_date"("agenda_id");
CREATE INDEX IF NOT EXISTS "agenda_timeline_agenda_date_id_idx" ON "agenda_timeline"("agenda_date_id");
CREATE INDEX IF NOT EXISTS "exhibitor_ranks_web_id_idx" ON "exhibitor_ranks"("web_id");
CREATE INDEX IF NOT EXISTS "booths_web_id_idx" ON "booths"("web_id");
CREATE UNIQUE INDEX IF NOT EXISTS "booths_web_id_name_key" ON "booths"("web_id", "name");
CREATE INDEX IF NOT EXISTS "exhibitors_web_id_idx" ON "exhibitors"("web_id");
CREATE INDEX IF NOT EXISTS "exhibitors_rankId_idx" ON "exhibitors"("rankId");
CREATE INDEX IF NOT EXISTS "exhibitors_boothId_idx" ON "exhibitors"("boothId");
CREATE INDEX IF NOT EXISTS "exhibitions_web_id_idx" ON "exhibitions"("web_id");
CREATE INDEX IF NOT EXISTS "exhibitions_zone_id_idx" ON "exhibitions"("zone_id");
CREATE INDEX IF NOT EXISTS "zones_web_id_idx" ON "zones"("web_id");
CREATE UNIQUE INDEX IF NOT EXISTS "webs_alias_key" ON "webs"("alias");
CREATE INDEX IF NOT EXISTS "_ExhibitionToExhibitor_B_index" ON "_ExhibitionToExhibitor"("B");
CREATE INDEX IF NOT EXISTS "news_web_id_idx" ON "news"("web_id");
CREATE INDEX IF NOT EXISTS "projects_web_id_idx" ON "projects"("web_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_web_id_fkey') THEN
        ALTER TABLE "agenda" ADD CONSTRAINT "agenda_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_date_agenda_id_fkey') THEN
        ALTER TABLE "agenda_date" ADD CONSTRAINT "agenda_date_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_timeline_agenda_date_id_fkey') THEN
        ALTER TABLE "agenda_timeline" ADD CONSTRAINT "agenda_timeline_agenda_date_id_fkey" FOREIGN KEY ("agenda_date_id") REFERENCES "agenda_date"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitor_ranks_web_id_fkey') THEN
        ALTER TABLE "exhibitor_ranks" ADD CONSTRAINT "exhibitor_ranks_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booths_web_id_fkey') THEN
        ALTER TABLE "booths" ADD CONSTRAINT "booths_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitors_rankId_fkey') THEN
        ALTER TABLE "exhibitors" ADD CONSTRAINT "exhibitors_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "exhibitor_ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitors_boothId_fkey') THEN
        ALTER TABLE "exhibitors" ADD CONSTRAINT "exhibitors_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "booths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitors_web_id_fkey') THEN
        ALTER TABLE "exhibitors" ADD CONSTRAINT "exhibitors_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitions_web_id_fkey') THEN
        ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exhibitions_zone_id_fkey') THEN
        ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'zones_web_id_fkey') THEN
        ALTER TABLE "zones" ADD CONSTRAINT "zones_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_web_id_fkey') THEN
        ALTER TABLE "news" ADD CONSTRAINT "news_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_web_id_fkey') THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToExhibitor_A_fkey') THEN
        ALTER TABLE "_ExhibitionToExhibitor" ADD CONSTRAINT "_ExhibitionToExhibitor_A_fkey" FOREIGN KEY ("A") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToExhibitor_B_fkey') THEN
        ALTER TABLE "_ExhibitionToExhibitor" ADD CONSTRAINT "_ExhibitionToExhibitor_B_fkey" FOREIGN KEY ("B") REFERENCES "exhibitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
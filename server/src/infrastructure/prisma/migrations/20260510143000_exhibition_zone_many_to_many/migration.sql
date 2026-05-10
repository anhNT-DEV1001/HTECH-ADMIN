-- CreateTable
CREATE TABLE IF NOT EXISTS "_ExhibitionToZone" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExhibitionToZone_AB_pkey" PRIMARY KEY ("A","B")
);

-- Backfill existing 1-n data into the new join table before removing zone_id.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'exhibitions'
          AND column_name = 'zone_id'
    ) THEN
        INSERT INTO "_ExhibitionToZone" ("A", "B")
        SELECT "id", "zone_id"
        FROM "exhibitions"
        WHERE "zone_id" IS NOT NULL
        ON CONFLICT ("A", "B") DO NOTHING;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_ExhibitionToZone_B_index" ON "_ExhibitionToZone"("B");

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exhibitions')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToZone_A_fkey') THEN
        ALTER TABLE "_ExhibitionToZone" ADD CONSTRAINT "_ExhibitionToZone_A_fkey" FOREIGN KEY ("A") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'zones')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToZone_B_fkey') THEN
        ALTER TABLE "_ExhibitionToZone" ADD CONSTRAINT "_ExhibitionToZone_B_fkey" FOREIGN KEY ("B") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Drop old 1-n relation artifacts after the backfill.
ALTER TABLE IF EXISTS "exhibitions" DROP CONSTRAINT IF EXISTS "exhibitions_zone_id_fkey";
DROP INDEX IF EXISTS "exhibitions_zone_id_idx";
ALTER TABLE IF EXISTS "exhibitions" DROP COLUMN IF EXISTS "zone_id";

-- Manual refresh for changing Exhibition-Zone from 1-n to n-n without
-- using Prisma migrate reset. This preserves existing exhibition.zone_id
-- links by copying them into Prisma's implicit many-to-many join table.

CREATE TABLE IF NOT EXISTS "_ExhibitionToZone" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ExhibitionToZone_AB_pkey" PRIMARY KEY ("A", "B")
);

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

CREATE INDEX IF NOT EXISTS "_ExhibitionToZone_B_index" ON "_ExhibitionToZone"("B");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToZone_A_fkey') THEN
        ALTER TABLE "_ExhibitionToZone"
            ADD CONSTRAINT "_ExhibitionToZone_A_fkey"
            FOREIGN KEY ("A") REFERENCES "exhibitions"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ExhibitionToZone_B_fkey') THEN
        ALTER TABLE "_ExhibitionToZone"
            ADD CONSTRAINT "_ExhibitionToZone_B_fkey"
            FOREIGN KEY ("B") REFERENCES "zones"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "exhibitions" DROP CONSTRAINT IF EXISTS "exhibitions_zone_id_fkey";
DROP INDEX IF EXISTS "exhibitions_zone_id_idx";
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "zone_id";

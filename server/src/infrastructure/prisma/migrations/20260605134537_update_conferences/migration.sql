-- CreateTable
CREATE TABLE "conferences" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sumary_vn" TEXT NOT NULL,
    "sumary_en" TEXT,
    "content_vn" TEXT NOT NULL,
    "content_en" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "rankId" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "img" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConferencesToExhibition" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConferencesToExhibition_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "conferences_web_id_idx" ON "conferences"("web_id");

-- CreateIndex
CREATE INDEX "conferences_rankId_idx" ON "conferences"("rankId");

-- CreateIndex
CREATE INDEX "_ConferencesToExhibition_B_index" ON "_ConferencesToExhibition"("B");

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "exhibitor_ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferencesToExhibition" ADD CONSTRAINT "_ConferencesToExhibition_A_fkey" FOREIGN KEY ("A") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferencesToExhibition" ADD CONSTRAINT "_ConferencesToExhibition_B_fkey" FOREIGN KEY ("B") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

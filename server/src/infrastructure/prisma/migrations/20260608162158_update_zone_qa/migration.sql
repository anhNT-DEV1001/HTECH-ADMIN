-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_vn" TEXT;

-- CreateTable
CREATE TABLE "question_ans" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "question_vn" TEXT NOT NULL,
    "ans_vn" TEXT,
    "question_en" TEXT,
    "ans_en" TEXT,

    CONSTRAINT "question_ans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_ans_categories" (
    "id" SERIAL NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "web_id" INTEGER NOT NULL,

    CONSTRAINT "question_ans_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_ans_category_id_idx" ON "question_ans"("category_id");

-- CreateIndex
CREATE INDEX "question_ans_categories_web_id_idx" ON "question_ans_categories"("web_id");

-- AddForeignKey
ALTER TABLE "question_ans" ADD CONSTRAINT "question_ans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "question_ans_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_ans_categories" ADD CONSTRAINT "question_ans_categories_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "webs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "project_category" (
    "id" SERIAL NOT NULL,
    "name_vn" TEXT NOT NULL,
    "name_en" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "project_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title_vn" TEXT NOT NULL,
    "title_en" TEXT,
    "slug" TEXT NOT NULL,
    "summary_vn" TEXT NOT NULL,
    "summary_en" TEXT,
    "description_vn" TEXT NOT NULL,
    "description_en" TEXT,
    "thumbnail_url" TEXT,
    "client_name" TEXT,
    "venue_vn" TEXT,
    "venue_en" TEXT,
    "location_url" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "scale" TEXT,
    "industry_vn" TEXT,
    "industry_en" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'UPCOMING',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "category_id" INTEGER,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT NOT NULL DEFAULT 'project_image',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_category_slug_key" ON "project_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "project_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

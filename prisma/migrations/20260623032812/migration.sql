/*
  Warnings:

  - You are about to drop the column `language` on the `policy` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `policy` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `popup_basic` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `popup_basic` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `popup_main` table. All the data in the column will be lost.
  - You are about to drop the column `end_at` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `is_new_tab` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `start_at` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `popup_main_image` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `popup_main_image` table. All the data in the column will be lost.
  - Added the required column `policyCategoryId` to the `policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `popup_basic_category_id` to the `popup_basic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_at` to the `popup_main` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `popup_main` table without a default value. This is not possible if the table is not empty.
  - Added the required column `popup_main_category_id` to the `popup_main` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_at` to the `popup_main` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `popup_main` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `popup_main` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PopupType" AS ENUM ('pc', 'mobile');

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "policy" DROP COLUMN "language",
DROP COLUMN "type",
ADD COLUMN     "policyCategoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "popup_basic" DROP COLUMN "language",
DROP COLUMN "type",
ADD COLUMN     "popup_basic_category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "popup_main" DROP COLUMN "language",
ADD COLUMN     "end_at" TEXT NOT NULL,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "is_new_tab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "link" VARCHAR(500),
ADD COLUMN     "popup_main_category_id" INTEGER NOT NULL,
ADD COLUMN     "start_at" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "title" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "popup_main_image" DROP COLUMN "end_at",
DROP COLUMN "end_time",
DROP COLUMN "is_new_tab",
DROP COLUMN "link",
DROP COLUMN "start_at",
DROP COLUMN "start_time",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

-- DropEnum
DROP TYPE "PopupBasicType";

-- CreateTable
CREATE TABLE "policy_category" (
    "id" SERIAL NOT NULL,
    "language" "Language" NOT NULL,
    "type" "PolicyType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "policy_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_basic_category" (
    "id" SERIAL NOT NULL,
    "language" "Language" NOT NULL,
    "type" "PopupType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_basic_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_main_category" (
    "id" SERIAL NOT NULL,
    "language" "Language" NOT NULL,
    "type" "PopupType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_main_category_pkey" PRIMARY KEY ("id")
);

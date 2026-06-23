/*
  Warnings:

  - You are about to drop the column `order` on the `popup_main_image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "popup_main" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "popup_main_image" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

/*
  Warnings:

  - You are about to drop the column `event_price` on the `product_to_product_category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_category_translation" ADD COLUMN     "is_view" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

-- AlterTable
ALTER TABLE "product_to_product_category" DROP COLUMN "event_price",
ADD COLUMN     "promotion_price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

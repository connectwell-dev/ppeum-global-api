-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "product_group_id" INTEGER,
ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

-- CreateIndex
CREATE INDEX "product_product_group_id_idx" ON "product"("product_group_id");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_product_group_id_fkey" FOREIGN KEY ("product_group_id") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "product_to_product_category" DROP CONSTRAINT "product_to_product_category_product_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_to_product_category" DROP CONSTRAINT "product_to_product_category_product_id_fkey";

-- DropIndex
DROP INDEX "product_category_parent_id_idx";

-- AlterTable
ALTER TABLE "product_category" DROP COLUMN "depth",
DROP COLUMN "parent_id";

-- DropTable
DROP TABLE "product_to_product_category";

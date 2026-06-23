-- 도메인 리네이밍: product_category 삭제, product_event→product_category, operation_info→product_detail_info

-- ==============================
-- 0) 코드 기본값 보정
-- ==============================
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- ==============================
-- 1) 기존 product_category 삭제
-- ==============================
DROP TABLE IF EXISTS "product_category_translation" CASCADE;
DROP TABLE IF EXISTS "product_category" CASCADE;
DROP INDEX IF EXISTS "product_product_category_id_idx";
ALTER TABLE "product" DROP COLUMN IF EXISTS "product_category_id";

-- ==============================
-- 2) ProductEventType enum → ProductCategoryType
-- ==============================
ALTER TYPE "ProductEventType" RENAME TO "ProductCategoryType";

-- ==============================
-- 3) product_event → product_category (테이블/컬럼)
-- ==============================
ALTER TABLE "product_event" RENAME TO "product_category";
ALTER TABLE "product_event_translation" RENAME TO "product_category_translation";
ALTER TABLE "product_to_product_event" RENAME TO "product_to_product_category";

ALTER TABLE "product_category" RENAME COLUMN "event_type" TO "category_type";
ALTER TABLE "product_category_translation" RENAME COLUMN "productEventId" TO "productCategoryId";
ALTER TABLE "product_to_product_category" RENAME COLUMN "product_event_id" TO "product_category_id";

ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- 제약조건 리네이밍
ALTER TABLE "product_category" RENAME CONSTRAINT "product_event_pkey" TO "product_category_pkey";
ALTER TABLE "product_to_product_category" RENAME CONSTRAINT "product_to_product_event_pkey" TO "product_to_product_category_pkey";

-- FK 리네이밍
ALTER TABLE "product_category_translation" RENAME CONSTRAINT "product_event_translation_image_code_fkey" TO "product_category_translation_image_code_fkey";
ALTER TABLE "product_category_translation" RENAME CONSTRAINT "product_event_translation_productEventId_fkey" TO "product_category_translation_productCategoryId_fkey";
ALTER TABLE "product_to_product_category" RENAME CONSTRAINT "product_to_product_event_product_event_id_fkey" TO "product_to_product_category_product_category_id_fkey";
ALTER TABLE "product_to_product_category" RENAME CONSTRAINT "product_to_product_event_product_id_fkey" TO "product_to_product_category_product_id_fkey";

-- 인덱스 리네이밍
ALTER INDEX "product_event_code_key" RENAME TO "product_category_code_key";
ALTER INDEX "product_event_order_idx" RENAME TO "product_category_order_idx";
ALTER INDEX "product_event_translation_language_idx" RENAME TO "product_category_translation_language_idx";
ALTER INDEX "product_event_translation_productEventId_language_key" RENAME TO "product_category_translation_productCategoryId_language_key";

-- ==============================
-- 4) operation_info → product_detail_info (테이블/컬럼)
-- ==============================
ALTER TABLE "operation_info" RENAME TO "product_detail_info";
ALTER TABLE "operation_info_translation" RENAME TO "product_detail_info_translation";

ALTER TABLE "product_detail_info_translation" RENAME COLUMN "operation_info_id" TO "product_detail_info_id";
ALTER TABLE "product" RENAME COLUMN "operation_info_id" TO "product_detail_info_id";

ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

-- 제약조건 리네이밍
ALTER TABLE "product_detail_info" RENAME CONSTRAINT "operation_info_pkey" TO "product_detail_info_pkey";
ALTER TABLE "product_detail_info_translation" RENAME CONSTRAINT "operation_info_translation_pkey" TO "product_detail_info_translation_pkey";

-- FK 리네이밍
ALTER TABLE "product" RENAME CONSTRAINT "product_operation_info_id_fkey" TO "product_product_detail_info_id_fkey";
ALTER TABLE "product_detail_info_translation" RENAME CONSTRAINT "operation_info_translation_image_code_fkey" TO "product_detail_info_translation_image_code_fkey";
ALTER TABLE "product_detail_info_translation" RENAME CONSTRAINT "operation_info_translation_operation_info_id_fkey" TO "product_detail_info_translation_product_detail_info_id_fkey";

-- 인덱스 리네이밍
ALTER INDEX "product_operation_info_id_idx" RENAME TO "product_product_detail_info_id_idx";
ALTER INDEX "operation_info_code_key" RENAME TO "product_detail_info_code_key";
ALTER INDEX "operation_info_translation_language_idx" RENAME TO "product_detail_info_translation_language_idx";

-- ==============================
-- 5) GeneralImageType enum 값 변경
-- ==============================
ALTER TYPE "GeneralImageType" RENAME VALUE 'operation_info' TO 'product_detail_info';

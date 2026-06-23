-- 상품 번역에서 이미지(image_code) 제거

ALTER TABLE "product_translation" DROP CONSTRAINT IF EXISTS "product_translation_image_code_fkey";
ALTER TABLE "product_translation" DROP COLUMN "image_code";

-- 상품 번역에 이미지(image_code) 재도입 (언어별, 없으면 기준언어 폴백)

ALTER TABLE "product_translation" ADD COLUMN "image_code" TEXT;

ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_image_code_fkey" FOREIGN KEY ("image_code") REFERENCES "general_image"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- 상품 모델 슬림화: 불필요 컬럼 제거, 노출 시작/종료일 추가, 번역 언어권별 노출 여부(isView) 추가

-- 1) Product 불필요 컬럼 제거
ALTER TABLE "product"
  DROP COLUMN "is_display",
  DROP COLUMN "product_type",
  DROP COLUMN "product_note",
  DROP COLUMN "active_target",
  DROP COLUMN "is_tax_included",
  DROP COLUMN "is_vat_view",
  DROP COLUMN "is_sleep",
  DROP COLUMN "membership_period",
  DROP COLUMN "membership_prepayment",
  DROP COLUMN "membership_add_prepayment",
  DROP COLUMN "membership_start_grade_id",
  DROP COLUMN "membership_end_grade_id";

-- 2) Product 노출 시작/종료일 추가
ALTER TABLE "product"
  ADD COLUMN "start_date" VARCHAR(20),
  ADD COLUMN "end_date" VARCHAR(20);

-- 3) ProductTranslation 언어권별 노출 여부 추가
ALTER TABLE "product_translation" ADD COLUMN "is_view" BOOLEAN NOT NULL DEFAULT true;

-- 4) 더 이상 사용하지 않는 enum 타입 제거
DROP TYPE "ProductType";
DROP TYPE "ActiveTarget";

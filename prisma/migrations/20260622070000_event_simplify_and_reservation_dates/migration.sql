-- AlterEnum: ProductEventType (general, first, once, weekday) -> (general, promotion)
BEGIN;
CREATE TYPE "ProductEventType_new" AS ENUM ('general', 'promotion');
-- 제거되는 유형(first/once/weekday)을 가진 기존 데이터는 'general'로 변환
UPDATE "product_event" SET "event_type" = 'general' WHERE "event_type" IN ('first', 'once', 'weekday');
ALTER TABLE "product_event" ALTER COLUMN "event_type" DROP DEFAULT;
ALTER TABLE "product_event" ALTER COLUMN "event_type" TYPE "ProductEventType_new" USING ("event_type"::text::"ProductEventType_new");
ALTER TYPE "ProductEventType" RENAME TO "ProductEventType_old";
ALTER TYPE "ProductEventType_new" RENAME TO "ProductEventType";
DROP TYPE "ProductEventType_old";
ALTER TABLE "product_event" ALTER COLUMN "event_type" SET DEFAULT 'general';
COMMIT;

-- AlterTable: 라벨/색상 컬럼 제거, 예약가능 시작/종료일 추가
ALTER TABLE "product_event" DROP COLUMN "color_bg",
DROP COLUMN "color_line",
DROP COLUMN "color_text",
DROP COLUMN "label",
ADD COLUMN     "reservation_end_date" VARCHAR(20),
ADD COLUMN     "reservation_start_date" VARCHAR(20);

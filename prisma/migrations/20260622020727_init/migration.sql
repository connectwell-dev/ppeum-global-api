-- Custom ID generator function (used by columns with @default(dbgenerated("generate_custom_id('...')")))
CREATE OR REPLACE FUNCTION generate_custom_id(prefix TEXT, random_length INT DEFAULT 5)
RETURNS TEXT AS $$
DECLARE
  timestamp_hex TEXT;
  random_hex TEXT;
BEGIN
  -- 유닉스 타임스탬프(초)를 16진수로 (약 8자리)
  timestamp_hex := UPPER(TO_HEX(FLOOR(EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()))::BIGINT));
  -- 랜덤 5자리 추가
  random_hex := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR random_length));
  -- prefix + 타임스탬프 + 랜덤
  RETURN prefix || timestamp_hex || random_hex;
END;
$$ LANGUAGE plpgsql;

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ja', 'ko', 'zhCN', 'zhTW', 'en', 'th', 'vi', 'ru');

-- CreateEnum
CREATE TYPE "WeekDayType" AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

-- CreateEnum
CREATE TYPE "GeneralImageType" AS ENUM ('operation_info', 'event', 'product');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('single', 'package', 'goods', 'membership', 'etc', 'force_create');

-- CreateEnum
CREATE TYPE "ProductEventType" AS ENUM ('general', 'first', 'once', 'weekday');

-- CreateTable
CREATE TABLE "general_image_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" "GeneralImageType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "general_image_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_image" (
    "code" TEXT NOT NULL DEFAULT generate_custom_id('IMG'),
    "image_category_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "general_image_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category_translation" (
    "product_category_id" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL DEFAULT generate_custom_id('PRD'),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_display" BOOLEAN NOT NULL DEFAULT true,
    "product_category_id" INTEGER,
    "product_type" "ProductType" NOT NULL DEFAULT 'single',
    "product_price" INTEGER NOT NULL,
    "product_note" TEXT,
    "is_tax_included" BOOLEAN NOT NULL DEFAULT true,
    "is_vat_view" BOOLEAN NOT NULL DEFAULT true,
    "is_sleep" BOOLEAN NOT NULL DEFAULT false,
    "membership_period" INTEGER,
    "membership_prepayment" INTEGER,
    "membership_add_prepayment" INTEGER,
    "membership_start_grade_id" INTEGER,
    "membership_end_grade_id" INTEGER,
    "changed_keys" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translation" (
    "product_id" INTEGER NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ja',
    "name" VARCHAR(512),
    "description" TEXT,
    "image_code" TEXT,
    "is_match" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "product_to_product_category" (
    "product_id" INTEGER NOT NULL,
    "product_category_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_to_product_category_pkey" PRIMARY KEY ("product_id","product_category_id")
);

-- CreateTable
CREATE TABLE "product_event" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL DEFAULT generate_custom_id('EVT'),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "label" VARCHAR(10) NOT NULL,
    "color_bg" VARCHAR(20) NOT NULL,
    "color_line" VARCHAR(20) NOT NULL,
    "color_text" VARCHAR(20) NOT NULL,
    "event_type" "ProductEventType" NOT NULL DEFAULT 'general',
    "start_date" VARCHAR(20),
    "end_date" VARCHAR(20),
    "week_day" "WeekDayType"[] DEFAULT ARRAY[]::"WeekDayType"[],
    "changed_keys" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_event_translation" (
    "productEventId" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "name" VARCHAR(512),
    "image_code" TEXT,
    "is_match" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "product_to_product_event" (
    "product_id" INTEGER NOT NULL,
    "product_event_id" INTEGER NOT NULL,
    "event_price" INTEGER NOT NULL DEFAULT 0,
    "event_discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_to_product_event_pkey" PRIMARY KEY ("product_id","product_event_id")
);

-- CreateIndex
CREATE INDEX "product_category_parent_id_idx" ON "product_category"("parent_id");

-- CreateIndex
CREATE INDEX "product_category_order_idx" ON "product_category"("order");

-- CreateIndex
CREATE INDEX "product_category_is_active_idx" ON "product_category"("is_active");

-- CreateIndex
CREATE INDEX "product_category_translation_language_idx" ON "product_category_translation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_translation_product_category_id_language_key" ON "product_category_translation"("product_category_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "product_code_key" ON "product"("code");

-- CreateIndex
CREATE INDEX "product_product_category_id_idx" ON "product"("product_category_id");

-- CreateIndex
CREATE INDEX "product_translation_language_idx" ON "product_translation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "product_translation_product_id_language_key" ON "product_translation"("product_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "product_event_code_key" ON "product_event"("code");

-- CreateIndex
CREATE INDEX "product_event_order_idx" ON "product_event"("order");

-- CreateIndex
CREATE INDEX "product_event_translation_language_idx" ON "product_event_translation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "product_event_translation_productEventId_language_key" ON "product_event_translation"("productEventId", "language");

-- AddForeignKey
ALTER TABLE "general_image" ADD CONSTRAINT "general_image_image_category_id_fkey" FOREIGN KEY ("image_category_id") REFERENCES "general_image_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_translation" ADD CONSTRAINT "product_category_translation_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_image_code_fkey" FOREIGN KEY ("image_code") REFERENCES "general_image"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_to_product_category" ADD CONSTRAINT "product_to_product_category_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_to_product_category" ADD CONSTRAINT "product_to_product_category_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_event_translation" ADD CONSTRAINT "product_event_translation_productEventId_fkey" FOREIGN KEY ("productEventId") REFERENCES "product_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_event_translation" ADD CONSTRAINT "product_event_translation_image_code_fkey" FOREIGN KEY ("image_code") REFERENCES "general_image"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_to_product_event" ADD CONSTRAINT "product_to_product_event_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_to_product_event" ADD CONSTRAINT "product_to_product_event_product_event_id_fkey" FOREIGN KEY ("product_event_id") REFERENCES "product_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

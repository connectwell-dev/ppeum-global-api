-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('visual', 'main', 'side');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('terms', 'privacy');

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_event" ALTER COLUMN "code" SET DEFAULT generate_custom_id('EVT');

-- CreateTable
CREATE TABLE "banner" (
    "id" SERIAL NOT NULL,
    "use_language" JSONB NOT NULL DEFAULT '{"ja": false, "ko": false, "en": false, "zhCn": false, "zhTw": false, "vi": false, "th": false, "ru": false}',
    "type" "BannerType" NOT NULL,
    "title" VARCHAR(300),
    "is_hipass" BOOLEAN NOT NULL DEFAULT false,
    "is_sunday" BOOLEAN NOT NULL DEFAULT false,
    "is_treatment" BOOLEAN NOT NULL DEFAULT false,
    "start_at" TEXT,
    "start_time" TEXT,
    "end_at" TEXT,
    "end_time" TEXT,
    "link" VARCHAR(300),
    "is_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_image" (
    "id" SERIAL NOT NULL,
    "banner_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "path" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "banner_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy" (
    "id" SERIAL NOT NULL,
    "use_language" JSONB NOT NULL DEFAULT '{"ja": false, "ko": false, "en": false, "zhCn": false, "zhTw": false, "vi": false, "th": false, "ru": false}',
    "policy_type" "PolicyType" NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_basic" (
    "id" SERIAL NOT NULL,
    "use_language" JSONB NOT NULL DEFAULT '{"ja": false, "ko": false, "en": false, "zhCn": false, "zhTw": false, "vi": false, "th": false, "ru": false}',
    "start_at" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_basic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_main" (
    "id" SERIAL NOT NULL,
    "use_language" JSONB NOT NULL DEFAULT '{"ja": false, "ko": false, "en": false, "zhCn": false, "zhTw": false, "vi": false, "th": false, "ru": false}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_main_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_main_image" (
    "id" SERIAL NOT NULL,
    "popup_main_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "path" VARCHAR(255) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "link" VARCHAR(500),
    "is_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "start_at" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_main_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_basic_image" (
    "id" SERIAL NOT NULL,
    "popup_basic_id" INTEGER NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popup_basic_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "banner_image" ADD CONSTRAINT "banner_image_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popup_main_image" ADD CONSTRAINT "popup_main_image_popup_main_id_fkey" FOREIGN KEY ("popup_main_id") REFERENCES "popup_main"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popup_basic_image" ADD CONSTRAINT "popup_basic_image_popup_basic_id_fkey" FOREIGN KEY ("popup_basic_id") REFERENCES "popup_basic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

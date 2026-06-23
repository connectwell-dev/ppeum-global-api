-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "code" SET DEFAULT generate_custom_id('CAT');

-- AlterTable
ALTER TABLE "product_detail_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('DTL');

-- AlterTable
ALTER TABLE "product_to_product_category" ALTER COLUMN "promotion_price" DROP NOT NULL,
ALTER COLUMN "promotion_price" DROP DEFAULT;

-- CreateTable
CREATE TABLE "hospital_weekly_work_time" (
    "id" SERIAL NOT NULL,
    "week_day_type" "WeekDayType" NOT NULL,
    "weekly_time" JSONB,
    "lunch_time" JSONB,
    "is_treatment" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hospital_weekly_work_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_date_closed_time" (
    "id" SERIAL NOT NULL,
    "date" VARCHAR(20) NOT NULL,
    "closed_time" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hospital_date_closed_time_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hospital_weekly_work_time_week_day_type_idx" ON "hospital_weekly_work_time"("week_day_type");

-- CreateIndex
CREATE INDEX "hospital_date_closed_time_date_idx" ON "hospital_date_closed_time"("date");

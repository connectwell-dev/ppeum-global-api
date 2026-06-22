-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('doctor', 'manager', 'nurse', 'consultant', 'coordinator', 'staff', 'super_admin');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('working', 'leave', 'resigned');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('Admin', 'CRM');

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "operation_info_id" INTEGER,
ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_event" ALTER COLUMN "code" SET DEFAULT generate_custom_id('EVT');

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "login_id" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rank_id" INTEGER,
    "email" VARCHAR(100),
    "phone_number" VARCHAR(100),
    "employment_status" "EmploymentStatus" NOT NULL,
    "admin_permission" JSONB DEFAULT '{}',
    "user_permission" JSONB DEFAULT '{}',
    "is_reset_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_dept_rank" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "parent_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_dept_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_info" (
    "id" SERIAL NOT NULL,
    "use_language" JSONB NOT NULL DEFAULT '{"ja": false, "ko": false, "en": false, "zhCn": false, "zhTw": false, "vi": false, "th": false, "ru": false}',
    "default_language" VARCHAR(10) NOT NULL,
    "public_language" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_login" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "platform" "Platform" NOT NULL,
    "is_success" BOOLEAN NOT NULL,
    "connection_ip" VARCHAR(100),
    "connection_browser" VARCHAR(100),
    "connection_os" VARCHAR(100),
    "connection_url" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_info" (
    "id" SERIAL NOT NULL,
    "changed_keys" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "operation_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_info_translation" (
    "operation_info_id" INTEGER NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ja',
    "title" VARCHAR(512),
    "description" TEXT,
    "shortDescription" JSON[] DEFAULT ARRAY[]::JSON[],
    "image_code" TEXT,
    "hashtag" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "caution" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_match" BOOLEAN NOT NULL DEFAULT false,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_info_translation_pkey" PRIMARY KEY ("operation_info_id","language")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_login_id_key" ON "employee"("login_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE INDEX "employee_dept_rank_is_active_idx" ON "employee_dept_rank"("is_active");

-- CreateIndex
CREATE INDEX "employee_dept_rank_order_idx" ON "employee_dept_rank"("order");

-- CreateIndex
CREATE INDEX "employee_dept_rank_depth_idx" ON "employee_dept_rank"("depth");

-- CreateIndex
CREATE INDEX "employee_dept_rank_parent_id_idx" ON "employee_dept_rank"("parent_id");

-- CreateIndex
CREATE INDEX "operation_info_translation_language_idx" ON "operation_info_translation"("language");

-- CreateIndex
CREATE INDEX "product_operation_info_id_idx" ON "product"("operation_info_id");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "employee_dept_rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_dept_rank" ADD CONSTRAINT "employee_dept_rank_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "employee_dept_rank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_login" ADD CONSTRAINT "history_login_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_info_translation" ADD CONSTRAINT "operation_info_translation_operation_info_id_fkey" FOREIGN KEY ("operation_info_id") REFERENCES "operation_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_info_translation" ADD CONSTRAINT "operation_info_translation_image_code_fkey" FOREIGN KEY ("image_code") REFERENCES "general_image"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_operation_info_id_fkey" FOREIGN KEY ("operation_info_id") REFERENCES "operation_info"("id") ON DELETE SET NULL ON UPDATE CASCADE;

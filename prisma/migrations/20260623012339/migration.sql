/*
  Warnings:

  - Added the required column `type` to the `popup_basic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PopupBasicType" AS ENUM ('pc', 'mobile');

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "operation_info" ALTER COLUMN "code" SET DEFAULT generate_custom_id('INFO');

-- AlterTable
ALTER TABLE "popup_basic" ADD COLUMN     "type" "PopupBasicType" NOT NULL;

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_event" ALTER COLUMN "code" SET DEFAULT generate_custom_id('EVT');

-- CreateEnum
CREATE TYPE "ActiveTarget" AS ENUM ('crm', 'web');

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "active_target" "ActiveTarget"[] DEFAULT ARRAY[]::"ActiveTarget"[],
ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_event" ALTER COLUMN "code" SET DEFAULT generate_custom_id('EVT');

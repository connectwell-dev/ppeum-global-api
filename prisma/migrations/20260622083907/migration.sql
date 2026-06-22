/*
  Warnings:

  - You are about to drop the column `use_language` on the `banner` table. All the data in the column will be lost.
  - You are about to drop the column `policy_type` on the `policy` table. All the data in the column will be lost.
  - You are about to drop the column `use_language` on the `policy` table. All the data in the column will be lost.
  - You are about to drop the column `use_language` on the `popup_basic` table. All the data in the column will be lost.
  - You are about to drop the column `use_language` on the `popup_main` table. All the data in the column will be lost.
  - Added the required column `language` to the `banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `popup_basic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `popup_main` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banner" DROP COLUMN "use_language",
ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "general_image" ALTER COLUMN "code" SET DEFAULT generate_custom_id('IMG');

-- AlterTable
ALTER TABLE "policy" DROP COLUMN "policy_type",
DROP COLUMN "use_language",
ADD COLUMN     "language" "Language" NOT NULL,
ADD COLUMN     "type" "PolicyType" NOT NULL;

-- AlterTable
ALTER TABLE "popup_basic" DROP COLUMN "use_language",
ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "popup_main" DROP COLUMN "use_language",
ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "code" SET DEFAULT generate_custom_id('PRD');

-- AlterTable
ALTER TABLE "product_event" ALTER COLUMN "code" SET DEFAULT generate_custom_id('EVT');

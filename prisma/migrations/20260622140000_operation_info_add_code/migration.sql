-- 시술설명(operation_info)에 고유 code 추가 (INFO 프리픽스로 자동 생성)

ALTER TABLE "operation_info" ADD COLUMN "code" TEXT NOT NULL DEFAULT generate_custom_id('INFO');

-- CreateIndex
CREATE UNIQUE INDEX "operation_info_code_key" ON "operation_info"("code");

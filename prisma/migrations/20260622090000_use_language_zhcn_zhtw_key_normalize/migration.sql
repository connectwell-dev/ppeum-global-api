-- use_language JSON 키를 Prisma Language enum과 동일하게 통일 (zhCn -> zhCN, zhTw -> zhTW)
-- use_language 컬럼은 general_info 테이블에만 존재

-- 1) 컬럼 DEFAULT 값 갱신
ALTER TABLE "general_info" ALTER COLUMN "use_language" SET DEFAULT '{"ja": false, "ko": false, "en": false, "zhCN": false, "zhTW": false, "vi": false, "th": false, "ru": false}';

-- 2) 기존 row 데이터의 키 변환 (zhCn -> zhCN, zhTw -> zhTW)
UPDATE "general_info"
SET "use_language" = ("use_language" - 'zhCn' - 'zhTw')
  || jsonb_build_object(
       'zhCN', COALESCE("use_language" -> 'zhCn', "use_language" -> 'zhCN', 'false'::jsonb),
       'zhTW', COALESCE("use_language" -> 'zhTw', "use_language" -> 'zhTW', 'false'::jsonb)
     )
WHERE "use_language" ? 'zhCn' OR "use_language" ? 'zhTw';

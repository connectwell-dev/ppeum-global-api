export const GENERAL_ERROR_MESSAGE = {
  // 공통
  'general.not_found.id': {
    ko: '해당 ID를 찾을 수 없습니다',
    ja: '該当基本情報が見つかりません。',
    zhCN: '找不到该基本信息。',
    zhTW: '找不到該基本資訊。',
    en: 'General info not found.',
  },

  'general.not_found.visitorGradeId': {
    ko: '해당 신규 고객 등급 ID를 찾을 수 없습니다.',
    ja: '該当新規顧客等級IDが見つかりません。',
    zhCN: '找不到该新客户等级ID。',
    zhTW: '找不到該新客戶等級ID。',
    en: 'Visitor grade ID not found.',
  },

  'general.not_found.localType': {
    ko: '해당 신규 고객 구분 값을 찾을 수 없습니다.',
    ja: '該当新規顧客区分の値が見つかりません。',
    zhCN: '找不到该新客户分类值。',
    zhTW: '找不到該新客戶分類值。',
    en: 'Visitor local type value not found.',
  },

  'general.not_found.consultantId': {
    ko: '해당 상담 담당자 ID를 찾을 수 없습니다.',
    ja: '該当相談担当者IDが見つかりません。',
    zhCN: '找不到该咨询负责人ID。',
    zhTW: '找不到該諮詢負責人ID。',
    en: 'Consultant ID not found.',
  },


  'general.not_found.imageCategory.name': {
    ko: '해당 이미지 분류 명을 찾을 수 없습니다.',
    ja: '該当画像分類名が見つかりません。',
    zhCN: '找不到该图片分类名称。',
    zhTW: '找不到該圖片分類名稱。',
    en: 'Image category name not found.',
  },

  'general.duplicate.imageCategory.name': {
    ko: '이미 동일한 이미지 분류명이 존재합니다.',
    ja: '既に同じ画像分類名が存在します。',
    zhCN: '已存在相同图片分类名称。',
    zhTW: '已存在相同圖片分類名稱。',
    en: 'Image category name already exists.',
  },

  'general.duplicate.image.name': {
    ko: '이미 동일한 이미지 명이 존재합니다.',
    ja: '既に同じ画像名が存在します。',
    zhCN: '已存在相同图片名称。',
    zhTW: '已存在相同圖片名稱。',
    en: 'Image name already exists.',
  },
  'general.not_found.image.code': {
    ko: '해당 이미지 code를 찾을 수 없습니다.',
    ja: '該当画像codeが見つかりません。',
    zhCN: '找不到该图片code。',
    zhTW: '找不到該圖片code。',
    en: 'Image code not found.',
  },

  'general.hasImages.imageCategory': {
    ko: '해당 분류에 등록된 이미지가 있습니다. 분류에서 이미지를 삭제하고 삭제해주세요.',
    ja: '該当分類に登録された画像があります。分類から画像を削除してから削除してください。',
    zhCN: '该分类中已登记图片。请先删除分类中的图片后再删除。',
    zhTW: '該分類中已登記圖片。請先刪除分類中的圖片後再刪除。',
    en: 'There are images registered in this category. Please delete the images from the category first.',
  },

  // 필수 항목 (required)
  'general.visitorGradeId.required': {
    ko: '신규 고객 등급 ID는 필수 입력 값입니다.',
    ja: '新規顧客等級IDは必須入力です。',
    zhCN: '新客户等级ID是必填输入值。',
    zhTW: '新客戶等級ID是必填輸入值。',
    en: 'Visitor grade ID is required.',
  },

  'general.localType.required': {
    ko: '신규 고객 구분 값은 필수 입력 값입니다.',
    ja: '新規顧客区分の値は必須入力です。',
    zhCN: '新客户分类值为必填输入值。',
    zhTW: '新客戶分類值為必填輸入值。',
    en: 'Visitor local type (domestic/foreign) is required.',
  },

  'general.localType.invalid': {
    ko: '유효하지 않은 신규 고객 구분 값입니다. (domestic 또는 foreign)',
    ja: '無効な新規顧客区分の値です。(domestic または foreign)',
    zhCN: '无效的新客户分类值。(domestic 或 foreign)',
    zhTW: '無效的新客戶分類值。(domestic 或 foreign)',
    en: 'Invalid visitor local type. Expected domestic or foreign.',
  },

  'general.consultantId.required': {
    ko: '상담 담당자 ID는 필수 입력 값입니다.',
    ja: '相談担当者IDは必須入力です。',
    zhCN: '咨询负责人ID是必填输入值。',
    zhTW: '諮詢負責人ID是必填輸入值。',
    en: 'Consultant ID is required.',
  },

  'general.defaultLanguage.required': {
    ko: '기준 언어는 필수 입력 값입니다.',
    ja: '基準言語は必須入力です。',
    zhCN: '基准语言是必填输入值。',
    zhTW: '基準語言是必填輸入值。',
    en: 'Default language is required.',
  },

  'general.publicLanguage.required': {
    ko: '공용 언어는 필수 입력 값입니다.',
    ja: '共用言語は必須入力です。',
    zhCN: '公用语言是必填输入值。',
    zhTW: '公用語言是必填輸入值。',
    en: 'Public language is required.',
  },

  'general.useLanguage.required': {
    ko: '사용 언어 설정은 필수 입력 값입니다.',
    ja: '使用言語設定は必須入力です。',
    zhCN: '使用语言设置是必填输入值。',
    zhTW: '使用語言設定是必填輸入值。',
    en: 'Use language setting is required.',
  },

  'generalMileage.name.required': {
    ko: '마일리지 항목명은 필수 입력 값입니다.',
    ja: 'マイル項目名は必須入力です。',
    zhCN: '里程项目名称是必填输入值。',
    zhTW: '里程項目名稱是必填輸入值。',
    en: 'Mileage item name is required.',
  },

  'generalMileage.not_found.id': {
    ko: '마일리지 항목을 찾을 수 없습니다.',
    ja: 'マイル項目が見つかりません。',
    zhCN: '找不到里程项目。',
    zhTW: '找不到里程項目。',
    en: 'Mileage item not found.',
  },

  'general.isActive.required': {
    ko: '사용 여부는 필수 입력 값입니다.',
    ja: '使用可否は必須入力です。',
    zhCN: '使用状态是必填输入值。',
    zhTW: '使用狀態是必填輸入值。',
    en: 'Active status is required.',
  },

  'generalRemainType.name.required': {
    ko: '잔여 시술 항목명은 필수 입력 값입니다.',
    ja: '残り施術項目名は必須入力です。',
    zhCN: '剩余手术项目名称是必填输入值。',
    zhTW: '剩餘手術項目名稱是必填輸入值。',
    en: 'Remain type item name is required.',
  },

  'generalRemainType.required': {
    ko: '등록 유형은 필수 입력 값입니다.',
    ja: '登録タイプは必須入力です。',
    zhCN: '登记类型为必填输入值。',
    zhTW: '登記類型為必填輸入值。',
    en: 'Registration type is required.',
  },

  'generalRemainType.not_found.id': {
    ko: '등록 유형을 찾을 수 없습니다.',
    ja: '登録タイプが見つかりません。',
    zhCN: '找不到登记类型。',
    zhTW: '找不到登記類型。',
    en: 'Registration type not found.',
  },

  // 중복 검사
  'generalMileage.name.duplicate': {
    ko: '이미 동일한 마일리지 항목명이 존재합니다.',
    ja: '既に同じマイル項目名が存在します。',
    zhCN: '已存在相同里程项目名称。',
    zhTW: '已存在相同里程項目名稱。',
    en: 'Mileage item name already exists.',
  },

  'generalRemainType.name.duplicate': {
    ko: '이미 동일한 잔여 시술 항목명이 존재합니다.',
    ja: '既に同じ残り施術項目名が存在します。',
    zhCN: '已存在相同剩余手术项目名称。',
    zhTW: '已存在相同剩餘手術項目名稱。',
    en: 'Remain type item name already exists.',
  },

  // 유효성 검사 (invalid)
  'general.defaultLanguage.invalid': {
    ko: '유효하지 않은 기준 언어입니다.',
    ja: '無効な基準言語です。',
    zhCN: '无效的基准语言。',
    zhTW: '無效的基準語言。',
    en: 'Invalid default language.',
  },

  'general.publicLanguage.invalid': {
    ko: '유효하지 않은 공용 언어입니다.',
    ja: '無効な共用言語です。',
    zhCN: '无效的公用语言。',
    zhTW: '無效的公用語言。',
    en: 'Invalid public language.',
  },

  'general.useLanguage.invalid': {
    ko: '유효하지 않은 사용 언어 설정입니다.',
    ja: '無効な使用言語設定です。',
    zhCN: '无效的使用语言设置。',
    zhTW: '無效的使用語言設定。',
    en: 'Invalid use language setting.',
  },

  // useLanguage 개별 필드 (ja, ko, en, zhCn, zhTw, vi, th, ru)
  'general.useLanguage.ja.invalid': {
    ko: '일본어 사용 여부는 true 또는 false여야 합니다.',
    ja: '日本語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '日语使用状态必须为true或false。',
    zhTW: '日語使用狀態必須為true或false。',
    en: 'Japanese use status must be true or false.',
  },
  'general.useLanguage.ko.invalid': {
    ko: '한국어 사용 여부는 true 또는 false여야 합니다.',
    ja: '韓国語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '韩语使用状态必须为true或false。',
    zhTW: '韓語使用狀態必須為true或false。',
    en: 'Korean use status must be true or false.',
  },
  'general.useLanguage.en.invalid': {
    ko: '영어 사용 여부는 true 또는 false여야 합니다.',
    ja: '英語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '英语使用状态必须为true或false。',
    zhTW: '英語使用狀態必須為true或false。',
    en: 'English use status must be true or false.',
  },
  'general.useLanguage.zhCn.invalid': {
    ko: '중국어(간체) 사용 여부는 true 또는 false여야 합니다.',
    ja: '中国語(簡体)使用可否はtrueまたはfalseである必要があります。',
    zhCN: '简体中文使用状态必须为true或false。',
    zhTW: '簡體中文使用狀態必須為true或false。',
    en: 'Simplified Chinese use status must be true or false.',
  },
  'general.useLanguage.zhTw.invalid': {
    ko: '중국어(번체) 사용 여부는 true 또는 false여야 합니다.',
    ja: '中国語(繁体)使用可否はtrueまたはfalseである必要があります。',
    zhCN: '繁体中文使用状态必须为true或false。',
    zhTW: '繁體中文使用狀態必須為true或false。',
    en: 'Traditional Chinese use status must be true or false.',
  },
  'general.useLanguage.vi.invalid': {
    ko: '베트남어 사용 여부는 true 또는 false여야 합니다.',
    ja: 'ベトナム語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '越南语使用状态必须为true或false。',
    zhTW: '越南語使用狀態必須為true或false。',
    en: 'Vietnamese use status must be true or false.',
  },
  'general.useLanguage.th.invalid': {
    ko: '태국어 사용 여부는 true 또는 false여야 합니다.',
    ja: 'タイ語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '泰语使用状态必须为true或false。',
    zhTW: '泰語使用狀態必須為true或false。',
    en: 'Thai use status must be true or false.',
  },
  'general.useLanguage.ru.invalid': {
    ko: '러시아어 사용 여부는 true 또는 false여야 합니다.',
    ja: 'ロシア語使用可否はtrueまたはfalseである必要があります。',
    zhCN: '俄语使用状态必须为true或false。',
    zhTW: '俄語使用狀態必須為true或false。',
    en: 'Russian use status must be true or false.',
  },

  'general.not_found.imageCategory.id': {
    ko: '해당 이미지 분류 ID를 찾을 수 없습니다.',
    ja: '該当画像分類IDが見つかりません。',
    zhCN: '找不到该图片分类ID。',
    zhTW: '找不到該圖片分類ID。',
    en: 'Image category ID not found.',
  },
  'general.required.imageCategory.name': {
    ko: '이미지 분류 명은 필수 입력 값입니다.',
    ja: '画像分類名は必須入力です。',
    zhCN: '图片分类名称是必填输入值。',
    zhTW: '圖片分類名稱是必填輸入值。',
    en: 'Image category name is required.',
  },


  // Image 파일
  'general.required.image': {
    ko: '이미지 파일은 필수입니다.',
    ja: '画像ファイルは必須です。',
    zhCN: '图片文件是必填项。',
    zhTW: '圖片文件是必填項。',
    en: 'Image file is required.',
  },

  /** multipart 필드명 `files` 다중 업로드 시 최소 1개 */
  'general.required.imageFiles': {
    ko: 'files는 필수 입력 값입니다.',
    ja: 'filesは必須入力です。',
    zhCN: 'files为必填项。',
    zhTW: 'files為必填項。',
    en: 'files field is required (at least one file).',
  },

  'general.invalidType.image': {
    ko: '허용되지 않는 파일 형식입니다. (jpeg, png, gif, webp만 허용)',
    ja: '許可されていないファイル形式です。(jpeg, png, gif, webpのみ許可)',
    zhCN: '不允许的文件格式。(仅允许jpeg, png, gif, webp)',
    zhTW: '不允許的文件格式。(僅允許jpeg, png, gif, webp)',
    en: 'Invalid file type. Only jpeg, png, gif, webp are allowed.',
  },

  'general.tooLarge.image': {
    ko: '파일 크기는 10MB를 초과할 수 없습니다.',
    ja: 'ファイルサイズは10MBを超えることはできません。',
    zhCN: '文件大小不能超过10MB。',
    zhTW: '文件大小不能超過10MB。',
    en: 'File size cannot exceed 10MB.',
  },
};

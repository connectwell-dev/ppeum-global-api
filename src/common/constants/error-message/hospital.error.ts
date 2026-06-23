export const HOSPITAL_ERROR_MESSAGE = {
  // not found
  'hospitalClosedDay.not_found.id': {
    ko: '해당 휴무일 ID를 찾을 수 없습니다.',
    ja: '該当休業日IDが見つかりません。',
    zhCN: '找不到该休业日ID。',
    zhTW: '找不到該休業日ID。',
    en: 'Hospital closed day ID not found.',
  },
  'hospitalDateClosedTime.not_found.id': {
    ko: '해당 날짜별 휴무 시간 ID를 찾을 수 없습니다.',
    ja: '該当日付別休業時間IDが見つかりません。',
    zhCN: '找不到该日期别休业时间ID。',
    zhTW: '找不到該日期別休業時間ID。',
    en: 'Hospital date closed time ID not found.',
  },

  // duplicate
  'hospitalClosedDay.solarDate.duplicate': {
    ko: '이미 동일한 날짜가 등록되어 있습니다.',
    ja: '既に同じ太陽暦の日付が登録されています。',
    zhCN: '已存在相同阳历日期。',
    zhTW: '已存在相同陽曆日期。',
    en: 'date already exists.',
  },
  'hospitalClosedDay.name.duplicate': {
    ko: '이미 동일한 휴무일명이 존재합니다.',
    ja: '既に同じ休業日名が存在します。',
    zhCN: '已存在相同休业日名称。',
    zhTW: '已存在相同休業日名稱。',
    en: 'Hospital closed day name already exists.',
  },

  'hospitalDateClosedTime.dateRange.duplicate': {
    ko: '해당 기간에 이미 등록된 휴무 시간이 있습니다.',
    ja: '該当期間に既に登録された休業時間があります。',
    zhCN: '该期间已存在已登记的休业时间。',
    zhTW: '該期間已存在已登記的休業時間。',
    en: 'Closed time for this date range already exists.',
  },
  'hospitalDateClosedTime.dateRange.invalid': {
    ko: '시작일은 종료일보다 이전이어야 합니다.',
    ja: '開始日は終了日より前である必要があります。',
    zhCN: '开始日期必须早于结束日期。',
    zhTW: '開始日期必須早於結束日期。',
    en: 'Start date must be before or equal to end date.',
  },

  // required (hospital-closed-setting)
  'hospitalClosedDay.name.required': {
    ko: '휴무일 명은 필수 입력 값입니다.',
    ja: '休業日名は必須入力です。',
    zhCN: '休业日名称是必填输入值。',
    zhTW: '休業日名稱是必填輸入值。',
    en: 'Closed day name is required.',
  },
  'hospitalClosedDay.solarDate.required': {
    ko: '날짜는 필수 입력 값입니다.',
    ja: '日付は必須入力です。',
    zhCN: '日期是必填输入值。',
    zhTW: '日期是必填輸入值。',
    en: 'Date is required.',
  },
  'hospitalClosedDay.isReservation.required': {
    ko: '예약 가능 여부는 필수 입력 값입니다.',
    ja: '予約可否は必須入力です。',
    zhCN: '预约可能状态是必填输入值。',
    zhTW: '預約可能狀態是必填輸入值。',
    en: 'Reservation status is required.',
  },

  // required (hospital-online-closed-setting - weekly)
  'hospitalWeeklyClosedTime.startTime.required': {
    ko: '시작 시간은 필수 입력 값입니다.',
    ja: '開始時間は必須入力です。',
    zhCN: '开始时间是必填输入值。',
    zhTW: '開始時間是必填輸入值。',
    en: 'Start time is required.',
  },
  'hospitalWeeklyClosedTime.endTime.required': {
    ko: '종료 시간은 필수 입력 값입니다.',
    ja: '終了時間は必須入力です。',
    zhCN: '结束时间是必填输入值。',
    zhTW: '結束時間是必填輸入值。',
    en: 'End time is required.',
  },
  'hospitalWeeklyClosedTime.isTreatment.required': {
    ko: '진료체크유무는 필수 입력 값입니다.',
    ja: '診療チェック可否は必須入力です。',
    zhCN: '诊疗勾选状态是必填输入值。',
    zhTW: '診療勾選狀態是必填輸入值。',
    en: 'Treatment check status is required.',
  },
  'hospitalWeeklyClosedTime.weekDayType.required': {
    ko: '요일은 필수 입력 값입니다.',
    ja: '曜日は必須入力です。',
    zhCN: '星期是必填输入值。',
    zhTW: '星期是必填輸入值。',
    en: 'Week day is required.',
  },
  'hospitalWeeklyClosedTime.weekDayType.invalid': {
    ko: '유효하지 않은 요일입니다.',
    ja: '無効な曜日です。',
    zhCN: '无效的星期。',
    zhTW: '無效的星期。',
    en: 'Invalid week day.',
  },
  'hospitalWeeklyClosedTime.slots.required': {
    ko: '휴무 시간대 리스트는 필수 입력 값입니다.',
    ja: '休業時間帯リストは必須入力です。',
    zhCN: '休业时间段列表是必填输入值。',
    zhTW: '休業時間段列表是必填輸入值。',
    en: 'Closed time slots are required.',
  },
  'hospitalWeeklyClosedTime.data.required': {
    ko: '요일별 휴무 시간 리스트는 필수 입력 값입니다.',
    ja: '曜日別休業時間リストは必須入力です。',
    zhCN: '按星期休业时间列表是必填输入值。',
    zhTW: '按星期休業時間列表是必填輸入值。',
    en: 'Weekly closed time list is required.',
  },

  // required (hospital-online-closed-setting - date)
  'hospitalDateClosedTime.id.required': {
    ko: '날짜별 휴무 시간 ID는 필수 입력 값입니다.',
    ja: '日付別休業時間IDは必須入力です。',
    zhCN: '日期别休业时间ID是必填输入值。',
    zhTW: '日期別休業時間ID是必填輸入值。',
    en: 'Date closed time ID is required.',
  },
  'hospitalDateClosedTime.startDate.required': {
    ko: '시작 날짜는 필수 입력 값입니다.',
    ja: '開始日は必須入力です。',
    zhCN: '开始日期是必填输入值。',
    zhTW: '開始日期是必填輸入值。',
    en: 'Start date is required.',
  },
  'hospitalDateClosedTime.endDate.required': {
    ko: '종료 날짜는 필수 입력 값입니다.',
    ja: '終了日は必須入力です。',
    zhCN: '结束日期是必填输入值。',
    zhTW: '結束日期是必填輸入值。',
    en: 'End date is required.',
  },
  'hospitalDateClosedTime.closedTime.required': {
    ko: '휴무 시간 설정은 필수 입력 값입니다.',
    ja: '休業時間設定は必須入力です。',
    zhCN: '休业时间设置是必填输入值。',
    zhTW: '休業時間設定是必填輸入值。',
    en: 'Closed time setting is required.',
  },

  // required (closedSlotItem)
  'closedSlot.time.required': {
    ko: '시간은 필수 입력 값입니다.',
    ja: '時間は必須入力です。',
    zhCN: '时间是必填输入值。',
    zhTW: '時間是必填輸入值。',
    en: 'Time is required.',
  },
  'closedSlot.closed.required': {
    ko: '체크유무는 필수 입력 값입니다.',
    ja: 'チェック可否は必須入力です。',
    zhCN: '勾选状态是必填输入值。',
    zhTW: '勾選狀態是必填輸入值。',
    en: 'Closed status is required.',
  },
  'hospitalWeeklyWorkTime.startTimeMustBeBeforeEndTime': {
    ko: '진료 시작 시간은 종료 시간보다 작아야 합니다.',
    ja: '診療開始時間は終了時間より前である必要があります。',
    zhCN: '诊疗开始时间必须早于结束时间。',
    zhTW: '診療開始時間必須早於結束時間。',
    en: 'Work start time must be before end time.',
  },
  'hospitalWeeklyWorkTime.lunchStartTimeMustBeBeforeEndTime': {
    ko: '점심시간 시작은 종료 시간보다 작아야 합니다.',
    ja: '昼休み開始時間は終了時間より前である必要があります。',
    zhCN: '午休开始时间必须早于结束时间。',
    zhTW: '午休開始時間必須早於結束時間。',
    en: 'Lunch start time must be before end time.',
  },
};

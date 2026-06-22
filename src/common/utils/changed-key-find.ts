export interface ChangedKey {
  key: string;
  changedAt: string;
  message?: string;
  [key: string]: any;  // Prisma InputJsonObject 호환을 위한 index signature
}

const changePrefix = '@__CHANGED__@';

// 배열인지, 객체인지, 객체배열인지, 문자열인지, 숫자인지, 불리언인지 확인
const typeCheck = (value: any): string => {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') return 'objectArray';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'unknown'; // null, undefined 등
};


// 기준에 값에 맞춰서 번역 값 빼기 및 채우기
// 뮤테이션시 변경되는 오브젝트 : changedKeys 파라메터로 전달한 경우 빈 배열이 있어서 당겼을경우 수정내역도 있으면 이후 데이터들 한칸 당김 처리
export const fillTranslationValue = (defaultObj: any, validateObj: any, findKeys: { key: string, defaultValue: any }[] = [], changedKeys?: ChangedKey[]): any => {
  if (findKeys.length === 0) return validateObj;
  // FindKeyOption 기준으로 확인하되, 기준이 되는 값도 빈값이면 통과시킨다.
  for (const findKey of findKeys) {
    if (!defaultObj[findKey.key]) defaultObj[findKey.key] = findKey.defaultValue;
    // string, number, boolean 인 경우 기준이 되는 값이 빈값인데 있거나 있으면 기준값 처리
    if (typeCheck(defaultObj[findKey.key]) === 'string' || typeCheck(defaultObj[findKey.key]) === 'number' || typeCheck(defaultObj[findKey.key]) === 'boolean') {
      if (!defaultObj[findKey.key] && validateObj[findKey.key]) validateObj[findKey.key] = defaultObj[findKey.key];
    } else if (typeCheck(defaultObj[findKey.key]) === 'objectArray' && Array.isArray(validateObj[findKey.key])) {
      // 비교값에는 있고, 기준값에는 아예 데이터가 없는경우 해당 객체 자체를 삭제
      validateObj[findKey.key]?.forEach?.((item: any, index: number) => {
        if (index >= defaultObj[findKey.key]?.length) validateObj[findKey.key][index] = null;
      });
      if (changedKeys) {
        // 원본 index 기준으로 제거될 위치들을 먼저 수집한 뒤 각 changedKey의 실제 shift 량을 계산
        const removedOriginalIndices: number[] = defaultObj[findKey.key]
          .map((item: any, i: number) => (Object.values(item).every(v => v === null || v === '') ? i : -1))
          .filter((i: number) => i !== -1);
        if (removedOriginalIndices.length > 0) {
          changedKeys.forEach((changedKey: ChangedKey) => {
            if (changedKey.key.includes(`${findKey.key}.`)) {
              const keyIndex = Number(changedKey.key.split('.')[1]);
              const offset = removedOriginalIndices.filter((ri: number) => ri < keyIndex).length;
              if (offset > 0) changedKey.key = changedKey.key.replace(`${findKey.key}.${keyIndex}`, `${findKey.key}.${keyIndex - offset}`);
            }
          });
        }
      }
      defaultObj[findKey.key].forEach((item: any, index: number) => {
        if (Object.values(item).every(value => value === null || value === '')) { // 기준값의 모든 객체 벨류가 빈값이면 비교값 null처리 추후 제거
          validateObj[findKey.key][index] = null;
        } else {
          for (const objKey of Object.keys(item)) { // 기준값이 ''이거나 없으면 비교값에 값이 있더라도 기준값과 같은 값으로 처리
            if (!item[objKey] && validateObj[findKey.key]?.[index]?.[objKey]) validateObj[findKey.key][index][objKey] = item[objKey];
          }
        }
      });
      validateObj[findKey.key] = validateObj[findKey.key]?.filter?.((item: any) => item !== null) as any;
    } else if (typeCheck(defaultObj[findKey.key]) === 'array' && Array.isArray(validateObj[findKey.key])) { // 배열인 경우
      validateObj[findKey.key]?.forEach((item: any, index: number) => { // 비교값에는 있고, 기준값에는 아예 데이터가 없는경우 해당 값 자체를 삭제
        if (index >= defaultObj[findKey.key].length) validateObj[findKey.key][index] = null;
      });
      if (changedKeys) {
        // 원본 index 기준으로 제거될 위치들을 먼저 수집한 뒤 각 changedKey의 실제 shift 량을 계산
        const removedOriginalIndices: number[] = defaultObj[findKey.key]
          .map((item: any, i: number) => (!item ? i : -1))
          .filter((i: number) => i !== -1);
        if (removedOriginalIndices.length > 0) {
          changedKeys.forEach((changedKey: ChangedKey) => {
            if (changedKey.key.includes(`${findKey.key}.`)) {
              const keyIndex = Number(changedKey.key.split('.')[1]);
              const offset = removedOriginalIndices.filter((ri: number) => ri < keyIndex).length;
              if (offset > 0) changedKey.key = changedKey.key.replace(`${findKey.key}.${keyIndex}`, `${findKey.key}.${keyIndex - offset}`);
            }
          });
        }
      }
      defaultObj[findKey.key].forEach((item: any, index: number) => {
        if (!item) validateObj[findKey.key][index] = null; // 기준값이 빈값이면 비교값 null처리 추후 제거
      });
      validateObj[findKey.key] = validateObj[findKey.key]?.filter?.((item: any) => item !== null) as any;
    }
  }
  return validateObj;
}


// 기준에 값이 있는데 확인값은 값이 없는 키 찾기
export const notMatchKeyFind = (defaultObj: any, validateObj: any, findKeys: { key: string, defaultValue: any }[] = []): { key: string, message: string }[] => {
  if (findKeys.length === 0) return [];
  // FindKeyOption 기준으로 확인하되, 기준이 되는 값도 빈값이면 통과시킨다.
  const notMatchKeys: { key: string, message: string }[] = [];
  for (const findKey of findKeys) {
    if (!defaultObj[findKey.key]) defaultObj[findKey.key] = findKey.defaultValue;
    // 기준이 되는 값이 빈값인데 있거나, 기준값이 있는데 확인값이 빈값이면 부족한 키로 추가
    if (typeCheck(defaultObj[findKey.key]) === 'string' || typeCheck(defaultObj[findKey.key]) === 'number' || typeCheck(defaultObj[findKey.key]) === 'boolean') {
      if (defaultObj[findKey.key] && !validateObj[findKey.key]) notMatchKeys.push({ key: findKey.key, message: 'common.translation_not_filled' });
      else if (!defaultObj[findKey.key] && validateObj[findKey.key]) notMatchKeys.push({ key: findKey.key, message: 'common.translation_not_used' });
    } else if (typeCheck(defaultObj[findKey.key]) === 'objectArray') { // 기준이 되는 값이 배열이면 갯수와 값 비교 만약 객체 배열이면 각각의 모든 값 유형이 같아야 한다.
      if (typeof defaultObj[findKey.key][0] == 'object') { // 객체인경우 기준 객체의 값이 있으면 비교객체의 값도 있어야 하며 기준값이 '' 이면 비교객체의 같은 벨류값도 '' 이어야 한다.
        defaultObj[findKey.key].forEach((item: any, index: number) => {
          for (const objKey of Object.keys(item)) {
            if (item[objKey] && !validateObj[findKey.key]?.[index]?.[objKey]) notMatchKeys.push({ key: `${findKey.key}.${index}.${objKey}`, message: 'common.translation_not_filled' });
            else if (!item[objKey] && validateObj[findKey.key]?.[index]?.[objKey]) notMatchKeys.push({ key: `${findKey.key}.${index}.${objKey}`, message: 'common.translation_not_used' });
          }
        });
        // 아예 객체 행이 없는 경우
        validateObj[findKey.key]?.forEach((item: any, index: number) => {
          if (index >= defaultObj[findKey.key].length) notMatchKeys.push({ key: `${findKey.key}.${index}`, message: 'common.translation_not_used' });
        });
      }
    } else if (typeCheck(defaultObj[findKey.key]) === 'array') { // 배열인경우 갯수와 값 비교
      defaultObj[findKey.key].forEach((item: any, index: number) => {
        if (item && !validateObj[findKey.key]?.[index]) notMatchKeys.push({ key: `${findKey.key}.${index}`, message: 'common.translation_not_filled' });
      });
      validateObj[findKey.key]?.forEach((item: any, index: number) => {
        if (index >= defaultObj[findKey.key].length) notMatchKeys.push({ key: `${findKey.key}.${index}`, message: 'common.translation_not_used' });
      });
    }
  }
  return notMatchKeys;
}

// 두개의 객체 비교하여 변경된 키에 changePrefix 붙히기
export const changedKeyFind = (defaultObj: any, validateObj: any, findKeys: { key: string, defaultValue: any }[] = [], isUpdated: boolean = false) => {
  if (findKeys.length === 0) return [];

  for (const findKey of findKeys) {
    if (!defaultObj[findKey.key]) {
      if (isUpdated) defaultObj[findKey.key] = undefined;
      else defaultObj[findKey.key] = findKey.defaultValue;
    }

    // const originalVal = defaultObj?.[findKey.key] === null ? undefined : defaultObj?.[findKey.key];
    if (typeCheck(defaultObj[findKey.key]) === 'string') { // 번역 수정에 대한 changePrefix 붙히는거라 불리언이나 숫자는 비교할 필요가 없다.
      // 둘다 값이 있는 상태로 변경됐을때만 changePrefix 붙히기
      if (defaultObj[findKey.key] && validateObj[findKey.key] && defaultObj[findKey.key] !== validateObj[findKey.key]) {
        validateObj[findKey.key] = validateObj[findKey.key] + changePrefix;
      }
    } else if (typeCheck(defaultObj[findKey.key]) === 'objectArray') {
      if (defaultObj?.[findKey.key]?.length == 0 && validateObj?.[findKey.key]?.length == 0) continue;
      validateObj[findKey.key].forEach((item: any, index: number) => {
        for (const objKey of Object.keys(item)) {// 객체 배열인경우 각각의 값 비교 
          // 기준값과 비교값 모두 값이 있는 상태로 변경됐을때만 changePrefix 붙히기
          if (defaultObj[findKey.key][index]?.[objKey] && validateObj[findKey.key][index]?.[objKey] && defaultObj[findKey.key][index]?.[objKey] !== validateObj[findKey.key][index]?.[objKey]) {
            validateObj[findKey.key][index][objKey] = validateObj[findKey.key][index][objKey] + changePrefix;
          }
        }
      });
    } else if (typeCheck(defaultObj[findKey.key]) === 'array') {
      if (defaultObj?.[findKey.key]?.length == 0 && validateObj?.[findKey.key]?.length == 0) continue;
      validateObj[findKey.key].forEach((item: any, index: number) => {
        // 기준값과 비교값 모두 값이 있는 상태로 변경됐을때만 changePrefix 붙히기
        if (defaultObj[findKey.key][index] && validateObj[findKey.key][index] && defaultObj[findKey.key][index] !== validateObj[findKey.key][index]) {
          validateObj[findKey.key][index] = validateObj[findKey.key][index] + changePrefix;
        }
      });
    }

    // 업데이트일경우 원본데이터가 없을경우 무조건 수정된 값으로 추가 ( 공용언어 업데이트일경우 )
    if (isUpdated && !defaultObj[findKey.key] && validateObj[findKey.key]) {
      if (typeCheck(validateObj[findKey.key]) === 'string') {
        validateObj[findKey.key] = validateObj[findKey.key] + changePrefix;
      } else if (typeCheck(validateObj[findKey.key]) === 'objectArray') {
        validateObj[findKey.key].forEach((item: any, index: number) => {
          for (const objKey of Object.keys(item)) {
            validateObj[findKey.key][index][objKey] = validateObj[findKey.key][index][objKey] + changePrefix;
          }
        });
      } else if (typeCheck(validateObj[findKey.key]) === 'array') {
        validateObj[findKey.key].forEach((item: any, index: number) => {
          validateObj[findKey.key][index] = validateObj[findKey.key][index] + changePrefix;
        });
      } else if (typeCheck(validateObj[findKey.key]) === 'object') {
        Object.keys(validateObj[findKey.key]).forEach((objKey) => {
          validateObj[findKey.key][objKey] = validateObj[findKey.key][objKey] + changePrefix;
        });
      }
    }
  }
  return validateObj;
}

// changePrefix 있는 값 찾아서 제거하고 변경된 키 추가
export const changeWordFind = (data: any): { newData: any, addChangedKeys: ChangedKey[] } => {
  // 배열이면 내부 전부, 객체면 각각의 키, 객체배열이면 각각의 키 값들 확인해서 changePrefix 라는 단어가 있으면 변경된 키로 추가, 해당 단어 제거
  const newData: any = {};
  const addChangedKeys: ChangedKey[] = [];
  const changedDate = new Date();
  Object.keys(data).forEach(key => {
    if (typeCheck(data[key]) === 'objectArray') {
      newData[key] = data[key].map((item: any, index: number) => {
        const newItem: any = {};
        Object.keys(item).forEach(objKey => {
          if (typeof item[objKey] === 'string' && item[objKey].includes(changePrefix)) {
            addChangedKeys.push({ key: `${key}.${index}.${objKey}`, changedAt: changedDate.toISOString() });
            newItem[objKey] = item[objKey].replace(changePrefix, '');
          } else {
            newItem[objKey] = item[objKey];
          }
        });
        return newItem;
      });
    } else if (typeCheck(data[key]) === 'array') {
      newData[key] = data[key].map((item: any, index: number) => {
        if (typeof item === 'string' && item.includes(changePrefix)) {
          addChangedKeys.push({ key: `${key}.${index}`, changedAt: changedDate.toISOString() });
          return item.replace(changePrefix, '');
        }
        return item;
      });
    } else if (typeCheck(data[key]) === 'object') {
      newData[key] = {};
      Object.keys(data[key]).forEach(objKey => {
        if (typeof data[key][objKey] === 'string' && data[key][objKey].includes(changePrefix)) {
          addChangedKeys.push({ key: `${key}.${objKey}`, changedAt: changedDate.toISOString() });
          newData[key][objKey] = data[key][objKey].replace(changePrefix, '');
        } else {
          newData[key][objKey] = data[key][objKey];
        }
      });
    } else if (typeCheck(data[key]) === 'string' && data[key].includes(changePrefix)) {
      addChangedKeys.push({ key, changedAt: changedDate.toISOString() });
      newData[key] = data[key].replace(changePrefix, '');
    } else {
      newData[key] = data[key];
    }
  });
  return { newData, addChangedKeys };
}

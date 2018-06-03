const sortValues = (sortType, valueGetter, ascending) => (a, b) => {
  let compareResult;
  switch (sortType) {
    case 'number': {
      const aVal = valueGetter(a);
      const bVal = valueGetter(b);
      if (aVal < bVal) {
        compareResult = -1;
      } else if (aVal > bVal) {
        compareResult = 1;
      } else {
        compareResult = 0;
      }
      break;
    }
    case 'boolean': {
      const aVal = valueGetter(a);
      const bVal = valueGetter(b);
      if (aVal === bVal) {
        compareResult = 0;
      } else if (aVal) {
        // true > false
        compareResult = 1;
      } else {
        compareResult = -1;
      }
      break;
    }
    case 'string':
      compareResult = valueGetter(a).localeCompare(valueGetter(b));
      break;
    case 'date': {
      const aVal = valueGetter(a) ? valueGetter(a).getTime() : 0;
      const bVal = valueGetter(b) ? valueGetter(b).getTime() : 0;
      if (aVal < bVal) {
        compareResult = -1;
      } else if (aVal > bVal) {
        compareResult = 1;
      } else {
        compareResult = 0;
      }
      break;
    }
    default:
      if (valueGetter(a) < valueGetter(b)) {
        compareResult = -1;
      } else if (valueGetter(a) > valueGetter(b)) {
        compareResult = 1;
      } else {
        compareResult = 0;
      }
  }
  if (!ascending) {
    compareResult = -compareResult;
  }
  return compareResult;
};

function computeType(dataList, valueGetter) {
  if (!dataList.length) {
    return 'none';
  }

  let index = 0;
  let firstValue = valueGetter(dataList[index]);
  while (
    (typeof firstValue === 'undefined' || firstValue === null) &&
    index < dataList.length - 1
  ) {
    index += 1;
    firstValue = valueGetter(dataList[index]);
  }
  const realSortType = typeof firstValue;
  if (realSortType === 'object') {
    if (firstValue instanceof Date) {
      return 'date';
    }
  }
  return realSortType;
}

export function computeValueGetter(rowKey) {
  const keyParts = rowKey.split('.');
  if (keyParts.length === 1) {
    const prop = keyParts[0];
    return row => row[prop];
  }
  return row =>
    keyParts.reduce(
      (obj, prop) => (!obj || typeof obj[prop] === 'undefined' ? null : obj[prop]),
      row
    );
}

export function sortList(dataList, key, ascending, sortType) {
  const valueGetter = computeValueGetter(key);
  let realSortType = sortType;
  if (!sortType) {
    realSortType = computeType(dataList, valueGetter);
  }
  return dataList.sort(sortValues(realSortType, valueGetter, ascending));
}

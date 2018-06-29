// @flow
import { FileProps, FilePropsDbDuplicates } from '../../api/filesystem';
import { findDb } from '../../api/database';
import { Action } from '../actionType';

import {
  CONST_SCAN_TYPE_DUPLICATE,
  CONST_SCAN_TYPE_MODIFIED,
  CONST_SCAN_TYPE_IDENTICAL,
  CONST_SCAN_TYPE_NEW
} from '../scan/scanAction';

export const RESULT_LOAD_START = 'RESULT_LOAD_START';
export const RESULT_LOAD_SUCCESS = 'RESULT_LOAD_SUCCESS';
export const RESULT_LOAD_ERROR = 'RESULT_LOAD_ERROR';
export const RESULT_SET_ACTIVETAB = 'RESULT_SET_ACTIVETAB';

function loadResultStart() {
  return {
    type: RESULT_LOAD_START
  };
}
function loadResultError() {
  return {
    type: RESULT_LOAD_ERROR
  };
}

function loadResultSuccess(
  identicals: Array<FileProps>,
  newFiles: Array<FileProps>,
  modified: Array<FileProps>,
  duplicates: Array<FileProps>,
  dbFilesRef: Array<FilePropsDbDuplicates>,
  filesProps: Map<string, FileProps>
) {
  return {
    type: RESULT_LOAD_SUCCESS,
    identicals,
    newFiles,
    modified,
    duplicates,
    dbFilesRef,
    filesProps
  };
}

export function resultSetTabActive(activeTab: string) {
  return {
    type: RESULT_SET_ACTIVETAB,
    activeTab
  };
}

export function loadResult() {
  return async (dispatch: (action: Action) => void) => {
    try {
      dispatch(loadResultStart());
      const filesProps = new Map();
      const insertIntoMap = fileProps => {
        filesProps.set(fileProps.id, fileProps);
      };
      const identicals = await findDb('scan', { scanType: CONST_SCAN_TYPE_IDENTICAL }, FileProps);
      identicals.forEach(insertIntoMap);
      const newFiles = await findDb('scan', { scanType: CONST_SCAN_TYPE_NEW }, FileProps);
      newFiles.forEach(insertIntoMap);
      const modified = await findDb('scan', { scanType: CONST_SCAN_TYPE_MODIFIED }, FileProps);
      modified.forEach(insertIntoMap);
      const duplicates = await findDb('scan', { scanType: CONST_SCAN_TYPE_DUPLICATE }, FileProps);
      duplicates.forEach(insertIntoMap);
      const dbFilesRef = await findDb(
        'scan',
        { type: 'FILEPROPSDB', $not: { filesMatching: { $size: 1 } } },
        FilePropsDbDuplicates
      );
      dispatch(
        loadResultSuccess(identicals, newFiles, modified, duplicates, dbFilesRef, filesProps)
      );
    } catch (error) {
      console.log(error);
      dispatch(loadResultError());
    }
  };
}

// @flow
import path from 'path';
import fs from 'fs';
import { findDb, deleteDb } from '../../api/database';
import { Action } from '../actionType';
import { FilePropsDb } from '../../api/filesystem';
import { fullStateType } from '../reducers';

export const ANALYSE_START = 'ANALYSE_START';
export const ANALYSE_END = 'ANALYSE_END';
export const ANALYSE_PROGRESS = 'ANALYSE_PROGRESS';
export const ANALYSE_MISSING_ADD = 'ANALYSE_MISSING_ADD';
export const ANALYSE_MISSING_REMOVE = 'ANALYSE_MISSING_REMOVE';
export const ANALYSE_DUPLICATES_SET = 'ANALYSE_DUPLICATES_SET';
export const ANALYSE_DUPLICATE_REMOVE = 'ANALYSE_DUPLICATE_REMOVE';

export type analyseActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +dbFile: ?FilePropsDb,
  +duplicateList: Map<string, Array<FilePropsDb>>
};

function startAnalyse() {
  return {
    type: ANALYSE_START
  };
}
function endAnalyse() {
  return {
    type: ANALYSE_END
  };
}
function analyseProgress(step: string, progress: number) {
  return {
    type: ANALYSE_PROGRESS,
    step,
    progress
  };
}
function analyseMissingAdd(dbFile: FilePropsDb) {
  return {
    type: ANALYSE_MISSING_ADD,
    dbFile
  };
}
function analyseDuplicate(duplicateList: Map<string, Array<FilePropsDb>>) {
  return {
    type: ANALYSE_DUPLICATES_SET,
    duplicateList
  };
}
function analyseMissingRemove(dbFile: FilePropsDb) {
  return {
    type: ANALYSE_MISSING_REMOVE,
    dbFile
  };
}
function analyseDuplicateRemove(dbFile: FilePropsDb) {
  return {
    type: ANALYSE_DUPLICATE_REMOVE,
    dbFile
  };
}

export function removeMissing(dbFile: FilePropsDb) {
  return async (dispatch: (action: Action) => void, getState: void => fullStateType) => {
    deleteDb(getState().foldersState.masterPath, dbFile);
    dispatch(analyseMissingRemove(dbFile));
  };
}
export function removeDuplicate(dbFile: FilePropsDb) {
  return async (dispatch: (action: Action) => void, getState: void => fullStateType) => {
    deleteDb(getState().foldersState.masterPath, dbFile);
    dispatch(analyseDuplicateRemove(dbFile));
  };
}
export function doAnalyse(folder: string) {
  return async (dispatch: (action: Action) => void) => {
    dispatch(startAnalyse());

    const files = await findDb(folder, {});
    const duplicateList = new Map();
    const filesHash = new Map();
    files.forEach((file, index) => {
      dispatch(analyseProgress('INDEXING', index / files.length));
      const filePath = path.resolve(folder, file.relpath);
      if (!fs.existsSync(filePath)) {
        dispatch(analyseMissingAdd(file));
      } else {
        const otherFileSameHash = filesHash.get(file.hash);
        if (otherFileSameHash) {
          const fileDuplicates = duplicateList.get(file.hash);
          if (fileDuplicates) {
            fileDuplicates.push(file);
          } else {
            duplicateList.set(file.hash, [otherFileSameHash, file]);
          }
        } else {
          filesHash.set(file.hash, file);
        }
      }
    });

    dispatch(analyseDuplicate(duplicateList));

    dispatch(endAnalyse());
  };
}

// @flow
import { FileProps, FilePropsDb } from '../../api/filesystem';
import { findDb } from '../../api/database';
import { Action } from '../actionType';

export const SCAN_START = 'SCAN_START';
export const SCAN_END = 'SCAN_END';
export const SCAN_PROGRESS = 'SCAN_PROGRESS';
export const SCAN_EXISTS_ADD = 'SCAN_EXISTS_ADD';
export const SCAN_EXISTS_REMOVE = 'SCAN_EXISTS_REMOVE';
export const SCAN_NEW_ADD = 'SCAN_NEW_ADD';
export const SCAN_NEW_REMOVE = 'SCAN_NEW_REMOVE';
export const SCAN_MODIFIED_ADD = 'SCAN_MODIFIED_ADD';
export const SCAN_MODIFIED_REMOVE = 'SCAN_MODIFIED_REMOVE';
export const SCAN_DUPLICATE_ADD = 'SCAN_DUPLICATE_ADD';
export const SCAN_DUPLICATE_REMOVE = 'SCAN_DUPLICATE_REMOVE';
export const SCAN_DBREF_ADD = 'SCAN_DBREF_ADD';
export const SCAN_DBREF_UPDATE = 'SCAN_DBREF_UPDATE';
export const CONST_SCAN_TYPE_DUPLICATE = 'duplicate';
export const CONST_SCAN_TYPE_MODIFIED = 'modified';
export const CONST_SCAN_TYPE_IDENTICAL = 'identical';
export const CONST_SCAN_TYPE_NEW = 'new';

export type ConstScanType =
  | CONST_SCAN_TYPE_DUPLICATE
  | CONST_SCAN_TYPE_MODIFIED
  | CONST_SCAN_TYPE_IDENTICAL
  | CONST_SCAN_TYPE_NEW;

export type scanActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +file: ?FileProps,
  +diff: ?Map<string, Array<string | number | Date>>,
  +matches: ?Array<FilePropsDb>,
  +dbFile: ?FilePropsDb,
  +scanType: ?ConstScanType,
  +oldDbFile: ?(Array<FilePropsDb> | FilePropsDb),
  +newDbFile: ?FilePropsDb
};

export function startScan() {
  return {
    type: SCAN_START
  };
}

export function endScan() {
  return {
    type: SCAN_END
  };
}

export function scanProgress(step: string, progress: number) {
  return {
    type: SCAN_PROGRESS,
    step,
    progress
  };
}

export function scanExistsAdd(file: FileProps, dbFile: FilePropsDb) {
  return {
    type: SCAN_EXISTS_ADD,
    file,
    dbFile
  };
}
export function scanExistsRemove(file: FileProps) {
  return {
    type: SCAN_EXISTS_REMOVE,
    file
  };
}

export function scanNewAdd(file: FileProps) {
  return {
    type: SCAN_NEW_ADD,
    file
  };
}
export function scanNewRemove(file: FileProps) {
  return {
    type: SCAN_NEW_REMOVE,
    file
  };
}

export function scanModifiedAdd(
  file: FileProps,
  diff: Map<string, Array<string | number | Date>>,
  dbFile: FilePropsDb
) {
  return {
    type: SCAN_MODIFIED_ADD,
    file,
    diff,
    dbFile
  };
}
export function scanModifiedRemove(file: FileProps) {
  return {
    type: SCAN_MODIFIED_REMOVE,
    file
  };
}

export function scanDuplicateAdd(file: FileProps, matches: Array<FilePropsDb>) {
  return {
    type: SCAN_DUPLICATE_ADD,
    file,
    matches
  };
}
export function scanDuplicateRemove(file: FileProps) {
  return {
    type: SCAN_DUPLICATE_REMOVE,
    file
  };
}

export function scanRefAdd(file: FileProps, dbFile: FilePropsDb, scanType: string) {
  return {
    type: SCAN_DBREF_ADD,
    file,
    dbFile,
    scanType
  };
}

export function scanRefUpdate(
  file: FileProps,
  oldDbFile: Array<FilePropsDb> | FilePropsDb | void,
  newDbFile: FilePropsDb | void,
  scanType: ConstScanType
) {
  return {
    type: SCAN_DBREF_UPDATE,
    file,
    oldDbFile,
    newDbFile,
    scanType
  };
}

export function scanProcessFile(fileProps: FileProps, oldDbFile: FilePropsDb | void) {
  return async (dispatch: (action: Action) => void, getState) => {
    const { masterPath } = getState().foldersState;

    let occurences = await findDb(masterPath, { hash: fileProps.hash });
    if (occurences.length === 0) {
      // File not found in db... Search for files with similar properties
      occurences = await findDb(masterPath, {
        name: fileProps.name
      });
      if (occurences.length === 0) {
        await dispatch(scanNewAdd(fileProps));
      } else {
        await dispatch(scanDuplicateAdd(fileProps, occurences));
        await Promise.all(
          occurences.map(async elt => {
            await dispatch(scanRefUpdate(fileProps, oldDbFile, elt, CONST_SCAN_TYPE_DUPLICATE));
          })
        );
      }
    } else {
      if (occurences.length > 1) {
        console.error(occurences);
        throw Error(`Multiple occurences from hash ${fileProps.hash}!!`);
      }
      const inDb = occurences[0];
      const compared: Map<string, Array<string | number | Date>> = fileProps.compareSameHash(inDb);
      if (compared.size > 0) {
        await dispatch(scanModifiedAdd(fileProps, compared, inDb));
        await dispatch(scanRefUpdate(fileProps, oldDbFile, inDb, CONST_SCAN_TYPE_MODIFIED));
      } else {
        await dispatch(scanExistsAdd(fileProps, inDb));
        await dispatch(scanRefUpdate(fileProps, oldDbFile, inDb, CONST_SCAN_TYPE_IDENTICAL));
      }
    }
  };
}

// @flow
import { FileProps, FilePropsDb } from '../../api/filesystem';
import { findDb } from '../../api/database';
import { Action } from '../actionType';

export const SCAN_START = 'SCAN_START';
export const SCAN_END = 'SCAN_END';
export const SCAN_PROGRESS = 'SCAN_PROGRESS';
export const SCAN_SET_ACTIVETAB = 'SCAN_SET_ACTIVETAB';
export const SCAN_EXISTS_ADD = 'SCAN_EXISTS_ADD';
export const SCAN_EXISTS_REMOVE = 'SCAN_EXISTS_REMOVE';
export const SCAN_NEW_ADD = 'SCAN_NEW_ADD';
export const SCAN_NEW_REMOVE = 'SCAN_NEW_REMOVE';
export const SCAN_MODIFIED_ADD = 'SCAN_MODIFIED_ADD';
export const SCAN_MODIFIED_REMOVE = 'SCAN_MODIFIED_REMOVE';
export const SCAN_DUPLICATE_ADD = 'SCAN_DUPLICATE_ADD';
export const SCAN_DUPLICATE_REMOVE = 'SCAN_DUPLICATE_REMOVE';
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

export function scanSetTabActive(activeTab: string) {
  return {
    type: SCAN_SET_ACTIVETAB,
    activeTab
  };
}

function scanExistsAdd(file: FileProps) {
  return {
    type: SCAN_EXISTS_ADD,
    file
  };
}
export function scanExistsRemove(file: FileProps) {
  return {
    type: SCAN_EXISTS_REMOVE,
    file
  };
}

function scanNewAdd(file: FileProps) {
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

function scanModifiedAdd(file: FileProps, diff: Map<string, Array<string | number | Date>>) {
  return {
    type: SCAN_MODIFIED_ADD,
    file,
    diff
  };
}
export function scanModifiedRemove(file: FileProps) {
  return {
    type: SCAN_MODIFIED_REMOVE,
    file
  };
}

function scanDuplicateAdd(file: FileProps) {
  return {
    type: SCAN_DUPLICATE_ADD,
    file
  };
}
export function scanDuplicateRemove(file: FileProps) {
  return {
    type: SCAN_DUPLICATE_REMOVE,
    file
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

    const newFileProps = fileProps.clone();
    let occurences = await findDb(masterPath, { hash: newFileProps.hash });
    if (occurences.length === 0) {
      // File not found in db... Search for files with similar properties
      occurences = await findDb(masterPath, {
        name: newFileProps.name
      });
      if (occurences.length === 0) {
        newFileProps.setCompareType(CONST_SCAN_TYPE_NEW);
        await dispatch(scanNewAdd(newFileProps));
      } else {
        newFileProps.setCompareType(CONST_SCAN_TYPE_DUPLICATE);
        newFileProps.setDbMatches(occurences);
        await dispatch(scanDuplicateAdd(newFileProps));
        await Promise.all(
          occurences.map(async elt => {
            await dispatch(scanRefUpdate(newFileProps, oldDbFile, elt, CONST_SCAN_TYPE_DUPLICATE));
          })
        );
      }
    } else {
      if (occurences.length > 1) {
        console.error(occurences);
        throw Error(`Multiple occurences from hash ${newFileProps.hash}!!`);
      }
      const inDb = occurences[0];
      newFileProps.setDbMatches(inDb);
      const compared: Map<string, Array<string | number | Date>> = newFileProps.compareSameHash(
        inDb
      );
      if (compared.size > 0) {
        newFileProps.setCompareType(CONST_SCAN_TYPE_MODIFIED);
        await dispatch(scanModifiedAdd(newFileProps, compared));
        await dispatch(scanRefUpdate(newFileProps, oldDbFile, inDb, CONST_SCAN_TYPE_MODIFIED));
      } else {
        newFileProps.setCompareType(CONST_SCAN_TYPE_IDENTICAL);
        await dispatch(scanExistsAdd(newFileProps));
        await dispatch(scanRefUpdate(newFileProps, oldDbFile, inDb, CONST_SCAN_TYPE_IDENTICAL));
      }
    }
  };
}

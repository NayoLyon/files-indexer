// @flow
import { FileProps, FilePropsDb } from '../../api/filesystem';

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
export const CONST_SCAN_TYPE_EXISTS = 'exists';

export type scanActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +file: ?FileProps,
  +diff: ?Map<string, Array<string | number | Date>>,
  +matches: ?Array<FilePropsDb>,
  +dbFile: ?FilePropsDb,
  +scanType: ?string,
  +oldDbFile: ?FilePropsDb,
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

export function scanExistsAdd(file: FileProps) {
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

export function scanDuplicateAdd(file: FileProps, matches: Arrays<FilePropsDb>) {
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
  oldDbFile: FilePropsDb,
  newDbFile: FilePropsDb,
  scanType: string
) {
  return {
    type: SCAN_DBREF_UPDATE,
    file,
    oldDbFile,
    newDbFile,
    scanType
  };
}

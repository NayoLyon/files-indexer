// @flow
import { FileProps, FilePropsDb } from '../../api/filesystem';

export const SCAN_START = 'SCAN_START';
export const SCAN_END = 'SCAN_END';
export const SCAN_PROGRESS = 'SCAN_PROGRESS';
export const SCAN_EXISTS = 'SCAN_EXISTS';
export const SCAN_NEW = 'SCAN_NEW';
export const SCAN_MODIFIED = 'SCAN_MODIFIED';
export const SCAN_DUPLICATE = 'SCAN_DUPLICATE';
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

export function scanExists(file: FileProps) {
  return {
    type: SCAN_EXISTS,
    file
  };
}

export function scanNew(file: FileProps) {
  return {
    type: SCAN_NEW,
    file
  };
}

export function scanModified(
  file: FileProps,
  diff: Map<string, Array<string | number | Date>>,
  dbFile: FilePropsDb
) {
  return {
    type: SCAN_MODIFIED,
    file,
    diff,
    dbFile
  };
}

export function scanDuplicate(file: FileProps, matches: Arrays<FilePropsDb>) {
  return {
    type: SCAN_DUPLICATE,
    file,
    matches
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

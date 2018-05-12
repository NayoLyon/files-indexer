// @flow
import { FileProps } from '../../api/filesystem';

export const SCAN_START = 'SCAN_START';
export const SCAN_END = 'SCAN_END';
export const SCAN_PROGRESS = 'SCAN_PROGRESS';
export const SCAN_EXISTS = 'SCAN_EXISTS';
export const SCAN_NEW = 'SCAN_NEW';
export const SCAN_MODIFIED = 'SCAN_MODIFIED';
export const SCAN_DUPLICATE = 'SCAN_DUPLICATE';

export type scanActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +file: ?FileProps,
  +diff: ?Map<string, Array<string | number | Date>>,
  +matches: ?Array<FileProps>
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
  dbFile: FilePropsType
) {
  return {
    type: SCAN_MODIFIED,
    file,
    diff,
    dbFile
  };
}

export function scanDuplicate(file: FileProps, matches: Arrays<FileProps>) {
  return {
    type: SCAN_DUPLICATE,
    file,
    matches
  };
}

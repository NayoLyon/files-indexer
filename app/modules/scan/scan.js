// @flow
import {
  SCAN_START,
  SCAN_END,
  SCAN_PROGRESS,
  SCAN_EXISTS,
  SCAN_NEW,
  SCAN_MODIFIED,
  SCAN_DUPLICATE,
  SCAN_ADD_DBREF
} from './scanAction';
import { SELECT_TOSCAN_FOLDER } from '../folders/foldersAction';
import type { Action } from '../actionType';
import { FileProps, FilePropsDb } from '../../api/filesystem';

export type scanDbRef = {
  dbFile: FilePropsDb,
  files: Map<FileProps, string>
};
export type scanStateType = {
  +indexing: boolean,
  +isScanned: boolean,
  +step: string,
  +progress: number,
  +identicals: Array<FileProps>,
  +newFiles: Array<FileProps>,
  +modified: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>,
    dbFile: FilePropsDb
  }>,
  +duplicates: Array<{ file: FileProps, matches: Arrays<FilePropsDb> }>,
  +dbFilesRef: Map<string, scanDbRef>
};

const defaultValue: scanStateType = {
  indexing: false,
  isScanned: false,
  step: '',
  progress: 0,
  identicals: [],
  newFiles: [],
  modified: [],
  duplicates: [],
  dbFilesRef: new Map()
};

export default function scan(state: scanStateType = defaultValue, action: Action) {
  switch (action.type) {
    case SELECT_TOSCAN_FOLDER:
      // When we change the folder, we re-initialize scan state...
      return { ...defaultValue };
    case SCAN_START:
      return Object.assign({}, state, { indexing: true });
    case SCAN_END:
      return Object.assign({}, state, { indexing: false, isScanned: true });
    case SCAN_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    case SCAN_EXISTS:
      return Object.assign({}, state, { identicals: [...state.identicals, action.file] });
    case SCAN_NEW:
      return Object.assign({}, state, { newFiles: [...state.newFiles, action.file] });
    case SCAN_MODIFIED:
      return Object.assign({}, state, {
        modified: [
          ...state.modified,
          { file: action.file, diff: action.diff, dbFile: action.dbFile }
        ]
      });
    case SCAN_DUPLICATE:
      return Object.assign({}, state, {
        duplicates: [...state.duplicates, { file: action.file, matches: action.matches }]
      });
    case SCAN_ADD_DBREF: {
      const newDbRef = new Map(state.dbFilesRef);
      const oldDbRef = state.dbFilesRef.get(action.dbFile.id);
      let newFileMap = new Map();
      if (oldDbRef) {
        newFileMap = new Map(oldDbRef.files);
      }
      newFileMap.set(action.file, action.scanType);
      newDbRef.set(action.dbFile.id, {
        dbFile: action.dbFile,
        files: newFileMap
      });
      return Object.assign({}, state, { dbFilesRef: newDbRef });
    }
    default:
      return state;
  }
}

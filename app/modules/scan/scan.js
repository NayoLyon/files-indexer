// @flow
import {
  SCAN_START,
  SCAN_END,
  SCAN_PROGRESS,
  SCAN_EXISTS_ADD,
  SCAN_EXISTS_REMOVE,
  SCAN_NEW_ADD,
  SCAN_NEW_REMOVE,
  SCAN_MODIFIED_ADD,
  SCAN_MODIFIED_REMOVE,
  SCAN_DUPLICATE_ADD,
  SCAN_DUPLICATE_REMOVE,
  SCAN_DBREF_ADD,
  SCAN_DBREF_UPDATE
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
    case SCAN_EXISTS_ADD:
      return Object.assign({}, state, { identicals: [...state.identicals, action.file] });
    case SCAN_EXISTS_REMOVE: {
      const newIdenticals = state.identicals.filter(elt => elt !== action.file);
      return Object.assign({}, state, { identicals: newIdenticals });
    }
    case SCAN_NEW_ADD:
      return Object.assign({}, state, { newFiles: [...state.newFiles, action.file] });
    case SCAN_NEW_REMOVE: {
      const newNewFiles = state.newFiles.filter(elt => elt !== action.file);
      return Object.assign({}, state, { newFiles: newNewFiles });
    }
    case SCAN_MODIFIED_ADD:
      return Object.assign({}, state, {
        modified: [
          ...state.modified,
          { file: action.file, diff: action.diff, dbFile: action.dbFile }
        ]
      });
    case SCAN_MODIFIED_REMOVE: {
      const newModified = state.modified.filter(elt => elt.file !== action.file);
      return Object.assign({}, state, { modified: newModified });
    }
    case SCAN_DUPLICATE_ADD:
      return Object.assign({}, state, {
        duplicates: [...state.duplicates, { file: action.file, matches: action.matches }]
      });
    case SCAN_DUPLICATE_REMOVE: {
      const newDuplicates = state.duplicates.filter(elt => elt.file !== action.file);
      return Object.assign({}, state, { duplicates: newDuplicates });
    }
    case SCAN_DBREF_ADD: {
      const nextDbRef = new Map(state.dbFilesRef);
      const prevScanDbRef = nextDbRef.get(action.dbFile.id);
      let newFileMap = new Map();
      if (prevScanDbRef) {
        newFileMap = new Map(prevScanDbRef.files);
      }
      newFileMap.set(action.file, action.scanType);
      nextDbRef.set(action.dbFile.id, {
        dbFile: action.dbFile,
        files: newFileMap
      });
      return Object.assign({}, state, { dbFilesRef: nextDbRef });
    }
    case SCAN_DBREF_UPDATE: {
      const nextDbRef = new Map(state.dbFilesRef);
      const prevOldScanDbRef = nextDbRef.get(action.oldDbFile.id);
      if (prevOldScanDbRef) {
        if (prevOldScanDbRef.files.size === 1 && prevOldScanDbRef.files.get(action.file)) {
          // We have only the file, and we remove it, so remove the entire dbRef...
          nextDbRef.delete(action.oldDbFile.id);
        } else {
          // We should not have only 1 entry here...
          if (prevOldScanDbRef.files.size <= 1) {
            console.error('Corrupted scanDbRef map!!', action.file, prevOldScanDbRef);
          }
          const nextOldScanDbRef = {
            dbFile: prevOldScanDbRef.dbFile,
            files: new Map(prevOldScanDbRef.files)
          };
          nextOldScanDbRef.files.delete(action.file);
          nextDbRef.set(action.oldDbFile.id, nextOldScanDbRef);
        }
      }
      const prevNewScanDbRef = nextDbRef.get(action.newDbFile.id);
      let nextNewScanDbRef;
      if (prevNewScanDbRef) {
        // Copy the previous one, to append this new ref
        nextNewScanDbRef = {
          dbFile: prevNewScanDbRef.dbFile,
          files: new Map(prevNewScanDbRef.files)
        };
      } else {
        // Entirely new, create from scratch...
        nextNewScanDbRef = {
          dbFile: action.newDbFile,
          files: new Map()
        };
      }
      nextNewScanDbRef.files.set(action.file, action.scanType);
      nextDbRef.set(action.dbFile.id, nextNewScanDbRef);
      return Object.assign({}, state, { dbFilesRef: nextDbRef });
    }
    default:
      return state;
  }
}

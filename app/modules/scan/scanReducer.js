// @flow
import {
  SCAN_START,
  SCAN_END,
  SCAN_PROGRESS,
  SCAN_SET_ACTIVETAB,
  SCAN_EXISTS_ADD,
  SCAN_EXISTS_REMOVE,
  SCAN_NEW_ADD,
  SCAN_NEW_REMOVE,
  SCAN_MODIFIED_ADD,
  SCAN_MODIFIED_REMOVE,
  SCAN_DUPLICATE_ADD,
  SCAN_DUPLICATE_REMOVE,
  SCAN_DBREF_UPDATE
} from './scanAction';
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from '../folders/foldersAction';
import type { Action } from '../actionType';
import { FileProps, FilePropsDb } from '../../api/filesystem';

export type scanDbRef = {
  dbFile: FilePropsDb,
  filesMatching: Map<string, FileProps>
};
export type scanStateType = {
  +indexing: boolean,
  +isScanned: boolean,
  +step: string,
  +progress: number,
  +activeTab: string,
  +identicals: Array<FileProps>,
  +newFiles: Array<FileProps>,
  +modified: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>
  }>,
  +duplicates: Array<FileProps>,
  +dbFilesRef: Map<string, scanDbRef>
};

const defaultValue: scanStateType = {
  indexing: false,
  isScanned: false,
  step: '',
  progress: 0,
  activeTab: '',
  identicals: [],
  newFiles: [],
  modified: [],
  duplicates: [],
  dbFilesRef: new Map()
};

export default function scanReducer(state: scanStateType = defaultValue, action: Action) {
  switch (action.type) {
    case SELECT_MASTER_FOLDER:
    case SELECT_TOSCAN_FOLDER:
      // When we change the folder, we re-initialize scan state...
      return { ...defaultValue };
    case SCAN_START:
      return Object.assign({}, state, { indexing: true });
    case SCAN_END:
      return Object.assign({}, state, { indexing: false, isScanned: true });
    case SCAN_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    case SCAN_SET_ACTIVETAB:
      return { ...state, activeTab: action.activeTab };
    case SCAN_EXISTS_ADD:
      return Object.assign({}, state, {
        identicals: [...state.identicals, action.file]
      });
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
        modified: [...state.modified, { file: action.file, diff: action.diff }]
      });
    case SCAN_MODIFIED_REMOVE: {
      const newModified = state.modified.filter(elt => elt.file !== action.file);
      return Object.assign({}, state, { modified: newModified });
    }
    case SCAN_DUPLICATE_ADD:
      return Object.assign({}, state, {
        duplicates: [...state.duplicates, action.file]
      });
    case SCAN_DUPLICATE_REMOVE: {
      const newDuplicates = state.duplicates.filter(elt => elt !== action.file);
      return Object.assign({}, state, { duplicates: newDuplicates });
    }
    case SCAN_DBREF_UPDATE: {
      const dbFilesRef = new Map(state.dbFilesRef);
      if (action.oldDbFile) {
        if (action.oldDbFile instanceof Array) {
          action.oldDbFile.forEach(dbFile => {
            removeOldDbFile(action.file, dbFile, dbFilesRef);
          });
        } else {
          removeOldDbFile(action.file, action.oldDbFile, dbFilesRef);
        }
      }
      if (action.newDbFile) {
        const prevNewScanDbRef = dbFilesRef.get(action.newDbFile.id);
        let nextNewScanDbRef;
        if (prevNewScanDbRef) {
          // Copy the previous one, to append this new ref
          nextNewScanDbRef = {
            dbFile: prevNewScanDbRef.dbFile,
            filesMatching: new Map(prevNewScanDbRef.filesMatching)
          };
        } else {
          // Entirely new, create from scratch...
          nextNewScanDbRef = {
            dbFile: action.newDbFile,
            filesMatching: new Map()
          };
        }
        nextNewScanDbRef.filesMatching.set(action.file.id, action.file);
        dbFilesRef.set(action.newDbFile.id, nextNewScanDbRef);
      }
      return Object.assign({}, state, { dbFilesRef });
    }
    default:
      return state;
  }
}

function removeOldDbFile(file: FileProps, dbFile: FilePropsDb, mapDbRef: Map<string, scanDbRef>) {
  const prevOldScanDbRef = mapDbRef.get(dbFile.id);
  if (prevOldScanDbRef) {
    if (prevOldScanDbRef.filesMatching.size === 1 && prevOldScanDbRef.filesMatching.get(file.id)) {
      // We have only the file, and we remove it, so remove the entire dbRef...
      mapDbRef.delete(dbFile.id);
    } else {
      // We should not have only 1 entry here...
      if (prevOldScanDbRef.filesMatching.size <= 1) {
        console.error('Corrupted scanDbRef map!!', file, prevOldScanDbRef);
      }
      const nextOldScanDbRef = {
        dbFile: prevOldScanDbRef.dbFile,
        filesMatching: new Map(prevOldScanDbRef.filesMatching)
      };
      nextOldScanDbRef.filesMatching.delete(file.id);
      mapDbRef.set(dbFile.id, nextOldScanDbRef);
    }
  }
}

// @flow
import {
  INDEXATION_LOAD_DATABASE,
  INDEXATION_START,
  INDEXATION_END,
  INDEXATION_PROGRESS,
  INDEXATION_DUPLICATE
} from './indexationAction';
import type { Action } from '../actionType';
import { FilePropsDb, FileProps } from '../../api/filesystem';

export type indexationStateType = {
  +dbLoaded: boolean,
  +indexing: boolean,
  +isIndexed: boolean,
  +dbSize: number,
  +step: string,
  +progress: number,
  +duplicates: Map<string, { dbFile: FilePropsDb | void, file: FileProps, diff: Set<string> }>
};

const defaultValue: indexationStateType = {
  dbLoaded: false,
  indexing: false,
  isIndexed: false,
  dbSize: -1,
  step: '',
  progress: 0,
  duplicates: new Map()
};

export default function indexationReducer(
  state: indexationStateType = defaultValue,
  action: Action
) {
  switch (action.type) {
    case INDEXATION_LOAD_DATABASE:
      return {
        ...state,
        dbSize: action.dbSize,
        dbLoaded: true,
        isIndexed: action.isIndexed
      };
    // return { ...state, { isIndexed: true } };
    case INDEXATION_START:
      return {
        ...state,
        indexing: true,
        duplicates: new Map()
      };
    case INDEXATION_END:
      return Object.assign({}, state, { indexing: false, isIndexed: true });
    case INDEXATION_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    case INDEXATION_DUPLICATE: {
      const duplicates = new Map(state.duplicates);
      duplicates.set(action.newFile.relpath, {
        dbFile: action.dbFile,
        file: action.newFile,
        diff: action.diff
      });
      return { ...state, duplicates };
    }
    default:
      return state;
  }
}

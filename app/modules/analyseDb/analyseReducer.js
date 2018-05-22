// @flow
import {
  ANALYSE_START,
  ANALYSE_END,
  ANALYSE_PROGRESS,
  ANALYSE_MISSING_ADD,
  ANALYSE_DUPLICATES_SET,
  ANALYSE_MISSING_REMOVE,
  ANALYSE_DUPLICATE_REMOVE
} from './analyseAction';
import type { Action } from '../actionType';
import { FilePropsDb } from '../../api/filesystem';

export type analyseStateType = {
  +loading: boolean,
  +isAnalysed: boolean,
  +step: string,
  +progress: number,
  +missingList: Array<FilePropsDb>,
  +duplicateList: Map<string, Array<FilePropsDb>>
};

const defaultValue: analyseStateType = {
  loading: false,
  isAnalysed: false,
  step: '',
  progress: 0,
  missingList: [],
  duplicateList: new Map()
};

export default function analyseReducer(state: analyseStateType = defaultValue, action: Action) {
  switch (action.type) {
    case ANALYSE_START:
      return {
        ...state,
        loading: true,
        missingList: []
      };
    case ANALYSE_END:
      return Object.assign({}, state, { loading: false, isAnalysed: true });
    case ANALYSE_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    case ANALYSE_MISSING_ADD:
      return { ...state, missingList: state.missingList.concat([action.dbFile]) };
    case ANALYSE_DUPLICATES_SET:
      return { ...state, duplicateList: action.duplicateList };
    case ANALYSE_MISSING_REMOVE: {
      return { ...state, missingList: state.missingList.filter(file => file !== action.dbFile) };
    }
    case ANALYSE_DUPLICATE_REMOVE: {
      const duplicateList = new Map(state.duplicateList);
      let filesList = duplicateList.get(action.dbFile.hash);
      if (filesList) {
        filesList = filesList.filter(file => file !== action.dbFile);
        if (filesList.length === 1) {
          duplicateList.delete(action.dbFile.hash);
        } else {
          duplicateList.set(action.dbFile.hash, filesList);
        }
      }
      return { ...state, duplicateList };
    }
    default:
      return state;
  }
}

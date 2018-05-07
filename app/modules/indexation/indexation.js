// @flow
import { INDEXATION_LOAD_DATABASE, INDEXATION_START, INDEXATION_END, INDEXATION_PROGRESS } from './indexationAction';
import { SELECT_MASTER_FOLDER } from '../folders/foldersAction';
import type { Action } from '../actionType';

export type indexationStateType = {
  +dbLoaded: boolean,
  +indexing: boolean,
  +isIndexed: boolean,
  +dbSize: number,
  +step: string,
  +progress: number
};

const defaultValue: indexationStateType = {
  dbLoaded: false,
  indexing: false,
  isIndexed: false,
  dbSize: -1,
  step: '',
  progress: 0
};

// export default function folders(state: foldersStateType = { masterPath: '', toScanPath: '' },
// action: actionType) {
export default function folders(state: indexationStateType = defaultValue, action: Action) {
  switch (action.type) {
    case SELECT_MASTER_FOLDER:
      return Object.assign(
        {}, state,
        {
          folder: action.path
        }
      );
    case INDEXATION_LOAD_DATABASE:
      return Object.assign(
        {},
        state,
        { dbSize: action.dbSize, dbLoaded: true, isIndexed: action.isIndexed }
      );
      // return { ...state, { isIndexed: true } };
    case INDEXATION_START:
      return Object.assign({}, state, { indexing: true });
    case INDEXATION_END:
      return Object.assign({}, state, { indexing: false, isIndexed: true });
    case INDEXATION_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    default:
      return state;
  }
}

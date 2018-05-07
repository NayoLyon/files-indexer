// @flow
import { INDEXATION_LOAD_DATABASE } from './indexationAction';
import { SELECT_MASTER_FOLDER } from '../folders/foldersAction';
import type { Action } from '../actionType';

export type indexationStateType = {
  +dbLoaded: boolean,
  +dbSize: number
};

const defaultValue: indexationStateType = {
  dbLoaded: false,
  dbSize: -1
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
      return Object.assign({}, state, { dbSize: action.dbSize, dbLoaded: true });
      // return { ...state, { isIndexed: true } };
    default:
      return state;
  }
}

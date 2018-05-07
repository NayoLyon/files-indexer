// @flow
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from './foldersAction';
import type { Action } from '../actionType';

export type foldersStateType = {
  +masterPath: string,
  +toScanPath: string
};

const defaultValue: foldersStateType = {
  masterPath: '',
  toScanPath: ''
};

// export default function folders(state: foldersStateType = { masterPath: '', toScanPath: '' },
// action: actionType) {
export default function folders(state: foldersStateType = defaultValue, action: Action) {
  switch (action.type) {
    case SELECT_MASTER_FOLDER:
      return Object.assign({}, state, { masterPath: action.path });
    // return { ...state, { path: action.path } };
    case SELECT_TOSCAN_FOLDER:
      return Object.assign({}, state, { toScanPath: action.path });
    default:
      return state;
  }
}

// @flow
import { SCAN_START, SCAN_END, SCAN_PROGRESS } from './scanAction';
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from '../folders/foldersAction';
import type { Action } from '../actionType';

export type scanStateType = {
  +indexing: boolean,
  +isScanned: boolean,
  +step: string,
  +progress: number
};

const defaultValue: scanStateType = {
  indexing: false,
  isScanned: false,
  step: '',
  progress: 0
};

export default function scanReducer(state: scanStateType = defaultValue, action: Action) {
  switch (action.type) {
    case SELECT_MASTER_FOLDER:
    case SELECT_TOSCAN_FOLDER:
      // When we change the folder, we re-initialize scan state...
      return { ...defaultValue };
    case SCAN_START:
      return Object.assign({}, state, { indexing: true, isScanned: false });
    case SCAN_END:
      return Object.assign({}, state, { indexing: false, isScanned: true });
    case SCAN_PROGRESS:
      return Object.assign({}, state, { step: action.step, progress: action.progress });
    default:
      return state;
  }
}

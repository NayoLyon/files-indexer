// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import folders, { foldersStateType } from './folders/folders';
import indexation, { indexationStateType } from './indexation/indexation';
import scan, { scanStateType } from './scan/scan';

export type fullStateType = {
  +scan: scanStateType,
  +indexation: indexationStateType,
  +folders: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  scan,
  indexation,
  folders,
  routing: router
});

export default rootReducer;

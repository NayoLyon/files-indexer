// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import foldersReducer, { foldersStateType } from './folders/foldersReducer';
import indexationReducer, { indexationStateType } from './indexation/indexationReducer';
import scanReducer, { scanStateType } from './scan/scanReducer';

export type fullStateType = {
  +scan: scanStateType,
  +indexation: indexationStateType,
  +folders: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  scan: scanReducer,
  indexation: indexationReducer,
  folders: foldersReducer,
  routing: router
});

export default rootReducer;

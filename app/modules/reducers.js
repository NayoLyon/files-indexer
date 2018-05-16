// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import foldersReducer, { foldersStateType } from './folders/foldersReducer';
import indexationReducer, { indexationStateType } from './indexation/indexationReducer';
import scanReducer, { scanStateType } from './scan/scanReducer';

export type fullStateType = {
  +scanState: scanStateType,
  +indexationState: indexationStateType,
  +foldersState: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  scanState: scanReducer,
  indexationState: indexationReducer,
  foldersState: foldersReducer,
  routing: router
});

export default rootReducer;

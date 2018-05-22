// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import foldersReducer, { foldersStateType } from './folders/foldersReducer';
import indexationReducer, { indexationStateType } from './indexation/indexationReducer';
import scanReducer, { scanStateType } from './scan/scanReducer';
import analyseReducer, { analyseStateType } from './analyseDb/analyseReducer';

export type fullStateType = {
  +analyseState: analyseStateType,
  +scanState: scanStateType,
  +indexationState: indexationStateType,
  +foldersState: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  analyseState: analyseReducer,
  scanState: scanReducer,
  indexationState: indexationReducer,
  foldersState: foldersReducer,
  routing: router
});

export default rootReducer;

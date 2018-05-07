// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import folders, { foldersStateType } from './folders/folders';
import indexation, { indexationStateType } from './indexation/indexation';

export type fullStateType = {
  +indexation: indexationStateType,
  +folders: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  indexation,
  folders,
  routing: router,
});

export default rootReducer;

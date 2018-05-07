// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import folders, { foldersStateType } from './folders/folders';

export type fullStateType = {
  +folders: foldersStateType,
  +router: object
};

const rootReducer = combineReducers({
  folders,
  routing: router,
});

export default rootReducer;

// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';

export type fullStateType = {
  +router: object
};

const rootReducer = combineReducers({
  routing: router,
});

export default rootReducer;

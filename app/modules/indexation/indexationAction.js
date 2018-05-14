// @flow
import { getDatabaseSize } from '../../api/database';
import { Action } from '../actionType';

export const INDEXATION_LOAD_DATABASE = 'INDEXATION_LOAD_DATABASE';
export const INDEXATION_START = 'INDEXATION_START';
export const INDEXATION_END = 'INDEXATION_END';
export const INDEXATION_PROGRESS = 'INDEXATION_PROGRESS';

export type indexationActionType = {
  +type: string,
  +dbSize: ?number,
  +isIndexed: ?boolean,
  +step: ?string,
  +progress: ?number
};

function databaseLoaded(dbSize: number, isIndexed: boolean) {
  return {
    type: INDEXATION_LOAD_DATABASE,
    dbSize,
    isIndexed
  };
}

export function startIndexation() {
  return {
    type: INDEXATION_START
  };
}

export function endIndexation() {
  return {
    type: INDEXATION_END
  };
}

export function indexProgress(step: string, progress: number) {
  return {
    type: INDEXATION_PROGRESS,
    step,
    progress
  };
}

export function loadDatabase(folder: string) {
  return async (dispatch: (action: Action) => void) => {
    const dbSize = await getDatabaseSize(folder);

    dispatch(databaseLoaded(dbSize, dbSize > 0));
  };
}

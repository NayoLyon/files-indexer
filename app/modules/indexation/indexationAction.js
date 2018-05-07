// @flow
import { getDatabaseSize } from '../../api/database';

export const INDEXATION_LOAD_DATABASE = 'INDEXATION_LOAD_DATABASE';

export type indexationActionType = {
  +type: string,
  +dbSize: ?number
};

function databaseLoaded(dbSize: number) {
  return {
    type: INDEXATION_LOAD_DATABASE,
    dbSize
  };
}

export function loadDatabase(folder: string) {
  return async (dispatch: (action: Action) => void) => {
    const dbSize = await getDatabaseSize(folder);

    dispatch(databaseLoaded(dbSize));
  };
}

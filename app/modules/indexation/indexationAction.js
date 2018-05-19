// @flow
import { getDatabaseSize } from '../../api/database';
import { Action } from '../actionType';
import { FilePropsDb, FileProps } from '../../api/filesystem';

export const INDEXATION_LOAD_DATABASE = 'INDEXATION_LOAD_DATABASE';
export const INDEXATION_START = 'INDEXATION_START';
export const INDEXATION_END = 'INDEXATION_END';
export const INDEXATION_PROGRESS = 'INDEXATION_PROGRESS';
export const INDEXATION_DUPLICATE = 'INDEXATION_DUPLICATE';

export type indexationActionType = {
  +type: string,
  +dbSize: ?number,
  +isIndexed: ?boolean,
  +step: ?string,
  +progress: ?number,
  +dbFile: FilePropsDb,
  +newFile: FileProps,
  +diff: Set<string>
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

export function indexDuplicate(dbFile: FilePropsDb, newFile: FileProps, diff: Set<string>) {
  return {
    type: INDEXATION_DUPLICATE,
    dbFile,
    newFile,
    diff
  };
}

export function loadDatabase(folder: string) {
  return async (dispatch: (action: Action) => void) => {
    const dbSize = await getDatabaseSize(folder);

    dispatch(databaseLoaded(dbSize, dbSize > 0));
  };
}

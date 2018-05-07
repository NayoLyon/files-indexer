// @flow
export const SELECT_MASTER_FOLDER = 'SELECT_MASTER_FOLDER';
export const SELECT_TOSCAN_FOLDER = 'SELECT_TOSCAN_FOLDER';

export type foldersActionType = {
  +type: string,
  +path: string
};

export function selectMaster(folderPath: string) {
  return {
    type: SELECT_MASTER_FOLDER,
    path: folderPath
  };
}

export function selectToScan(folderPath: string) {
  return {
    type: SELECT_TOSCAN_FOLDER,
    path: folderPath
  };
}

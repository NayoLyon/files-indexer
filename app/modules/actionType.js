// @Flow
type foldersActionType = {
  +type: string,
  +path: string
};

type indexationActionType = {
  +type: string,
  +dbSize: ?number,
  +isIndexed: ?boolean,
  +step: ?string,
  +progress: ?number,
  +dbFile: FilePropsDb,
  +newFile: FileProps,
  +diff: Set<string>
};

type scanActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +file: ?FileProps,
  +diff: ?Map<string, Array<string | number | Date>>,
  +scanType: ?ConstScanType,
  +oldDbFile: ?(Array<FilePropsDb> | FilePropsDb),
  +newDbFile: ?FilePropsDb
};

type analyseActionType = {
  +type: string,
  +step: ?string,
  +progress: ?number,
  +dbFile: ?FilePropsDb,
  +duplicateList: Map<string, Array<FilePropsDb>>
};

type resultActionType = {
  +type: string,
  +identicals: ?Array<FileProps>,
  +newFiles: ?Array<FileProps>,
  +modified: ?Array<FileProps>,
  +duplicates: ?Array<FileProps>,
  +dbFilesRef: ?Array<FilePropsDbDuplicates>
};

type actionType = {
  +type: string
};

export type Action =
  | actionType
  | foldersActionType
  | indexationActionType
  | scanActionType
  | analyseActionType
  | resultActionType;

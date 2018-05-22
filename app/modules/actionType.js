// @Flow
import type { foldersActionType } from './folders/foldersAction';
import type { indexationActionType } from './indexation/indexationAction';
import type { scanActionType } from './scan/scanAction';
import type { analyseActionType } from './analyseDb/analyseAction';

type actionType = {
  +type: string
};

export type Action =
  | actionType
  | foldersActionType
  | indexationActionType
  | scanActionType
  | analyseActionType;

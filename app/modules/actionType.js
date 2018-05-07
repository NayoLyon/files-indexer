// @Flow
import type { foldersActionType } from './folders/foldersAction';
import type { indexationActionType } from './indexation/indexationAction';

type actionType = {
  +type: string
};

export type Action =
  | actionType
  | foldersActionType
  | indexationActionType;

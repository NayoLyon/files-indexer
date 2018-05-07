// @Flow
import type { foldersActionType } from './folders/foldersAction';

type actionType = {
  +type: string
};

export type Action =
  | actionType
  | foldersActionType;

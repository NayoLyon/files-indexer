// @Flow
import type { foldersActionType } from './folders/foldersAction';
import type { indexationActionType } from './indexation/indexationAction';
import type { scanActionType } from './scan/scanAction';

type actionType = {
  +type: string
};

export type Action = actionType | foldersActionType | indexationActionType | scanActionType;

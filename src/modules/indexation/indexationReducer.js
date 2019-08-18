import {
	INDEXATION_LOAD_DATABASE,
	INDEXATION_START,
	INDEXATION_END,
	INDEXATION_PROGRESS,
	INDEXATION_DUPLICATE
} from "./indexationAction";
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from "../folders/foldersAction";

const defaultValue = {
	dbLoaded: false,
	indexing: false,
	isIndexed: false,
	dbSize: -1,
	step: "",
	progress: 0,
	duplicates: new Map()
};

export default function indexationReducer(state = defaultValue, action) {
	switch (action.type) {
		case SELECT_MASTER_FOLDER:
		case SELECT_TOSCAN_FOLDER:
			return defaultValue;
		case INDEXATION_LOAD_DATABASE:
			return {
				...state,
				dbSize: action.dbSize,
				dbLoaded: true,
				isIndexed: action.isIndexed
			};
		case INDEXATION_START:
			return {
				...state,
				indexing: true,
				duplicates: new Map()
			};
		case INDEXATION_END:
			return { ...state, indexing: false, isIndexed: true };
		case INDEXATION_PROGRESS:
			return { ...state, step: action.step, progress: action.progress };
		case INDEXATION_DUPLICATE: {
			const duplicates = new Map(state.duplicates);
			duplicates.set(action.newFile.relpath, {
				dbFile: action.dbFile,
				file: action.newFile,
				diff: action.diff
			});
			return { ...state, duplicates };
		}
		default:
			return state;
	}
}

import {
	RESULT_LOAD_START,
	RESULT_LOAD_SUCCESS,
	RESULT_LOAD_ERROR,
	RESULT_SET_ACTIVETAB
} from "./resultAction";
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from "../folders/foldersAction";

const defaultValue = {
	loading: false,
	activeTab: "",
	filesProps: new Map(),
	identicals: [],
	newFiles: [],
	modified: [],
	duplicates: [],
	dbFilesRef: [],
	dbFiles: []
};

export default function resultReducer(state = defaultValue, action) {
	switch (action.type) {
		case SELECT_MASTER_FOLDER:
		case SELECT_TOSCAN_FOLDER:
			// When we change the folder, we re-initialize result state...
			return { ...defaultValue };
		case RESULT_LOAD_START:
			return { ...state, loading: true };
		case RESULT_LOAD_SUCCESS: {
			return {
				...state,
				loading: false,
				identicals: action.identicals,
				newFiles: action.newFiles,
				modified: action.modified,
				duplicates: action.duplicates,
				dbFilesRef: action.dbFilesRef,
				dbFiles: action.dbFiles,
				filesProps: action.filesProps
			};
		}
		case RESULT_LOAD_ERROR:
			return { ...state, loading: false };
		case RESULT_SET_ACTIVETAB:
			return { ...state, activeTab: action.activeTab };
		default:
			return state;
	}
}

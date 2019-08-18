import {
	ANALYZE_START,
	ANALYZE_END,
	ANALYZE_PROGRESS,
	ANALYZE_MISSING_ADD,
	ANALYZE_DUPLICATES_SET,
	ANALYZE_MISSING_REMOVE,
	ANALYZE_DUPLICATE_REMOVE
} from "./analyzeAction";

const defaultValue = {
	loading: false,
	isAnalyzed: false,
	step: "",
	progress: 0,
	missingList: [],
	duplicateList: new Map()
};

export default function analyzeReducer(state = defaultValue, action) {
	switch (action.type) {
		case ANALYZE_START:
			return {
				...state,
				loading: true,
				missingList: []
			};
		case ANALYZE_END:
			return { ...state, loading: false, isAnalyzed: true };
		case ANALYZE_PROGRESS:
			return { ...state, step: action.step, progress: action.progress };
		case ANALYZE_MISSING_ADD:
			return { ...state, missingList: state.missingList.concat([action.dbFile]) };
		case ANALYZE_DUPLICATES_SET:
			return { ...state, duplicateList: action.duplicateList };
		case ANALYZE_MISSING_REMOVE: {
			return {
				...state,
				missingList: state.missingList.filter(file => file !== action.dbFile)
			};
		}
		case ANALYZE_DUPLICATE_REMOVE: {
			const duplicateList = new Map(state.duplicateList);
			let filesList = duplicateList.get(action.dbFile.hash);
			if (filesList) {
				filesList = filesList.filter(file => file !== action.dbFile);
				if (filesList.length === 1) {
					duplicateList.delete(action.dbFile.hash);
				} else {
					duplicateList.set(action.dbFile.hash, filesList);
				}
			}
			return { ...state, duplicateList };
		}
		default:
			return state;
	}
}

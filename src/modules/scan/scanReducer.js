import { SCAN_START, SCAN_END, SCAN_PROGRESS, SCAN_RESET } from "./scanAction";
import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from "../folders/foldersAction";

const defaultValue = {
	indexing: false,
	isScanned: false,
	step: "",
	progress: { percent: 0 },
	fileProgress: ""
};

export default function scanReducer(state = defaultValue, action) {
	switch (action.type) {
		case SELECT_MASTER_FOLDER:
		case SELECT_TOSCAN_FOLDER:
		case SCAN_RESET:
			// When we change the folder, we re-initialize scan state...
			return defaultValue;
		case SCAN_START:
			return { ...state, indexing: true, isScanned: false };
		case SCAN_END:
			return { ...state, indexing: false, isScanned: true };
		case SCAN_PROGRESS:
			if (state.step === action.step) {
				const stateProgress = state.progress.total
					? (state.progress.value / state.progress.total) * 100
					: state.progress.percent;
				const actionProgress = action.progress.total
					? (action.progress.value / action.progress.total) * 100
					: action.progress.percent;
				if (Math.round(100 * stateProgress) === Math.round(100 * actionProgress)) {
					return state;
				}
			}
			return {
				...state,
				step: action.step,
				progress: action.progress,
				fileProgress: action.file
			};
		default:
			return state;
	}
}

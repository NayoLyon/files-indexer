import { SELECT_MASTER_FOLDER, SELECT_TOSCAN_FOLDER } from "./foldersAction";

const defaultValue = {
	masterPath: "",
	toScanPath: ""
};

export default function foldersReducer(state = defaultValue, action) {
	switch (action.type) {
		case SELECT_MASTER_FOLDER:
			return { ...state, masterPath: action.path || "" };
		case SELECT_TOSCAN_FOLDER:
			return { ...state, toScanPath: action.path || "" };
		default:
			return state;
	}
}

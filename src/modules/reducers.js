import { combineReducers } from "redux";

import foldersReducer from "./folders/foldersReducer";
import analyzeReducer from "./analyzeDb/analyzeReducer";
import scanReducer from "./scan/scanReducer";
import resultReducer from "./result/resultReducer";

// Combine Reducers
const reducers = combineReducers({
	resultState: resultReducer,
	scanState: scanReducer,
	analyzeState: analyzeReducer,
	foldersState: foldersReducer
});

export default reducers;

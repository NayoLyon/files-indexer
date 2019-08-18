import { combineReducers } from "redux";

import foldersReducer from "./folders/foldersReducer";
import indexationReducer from "./indexation/indexationReducer";
import analyzeReducer from "./analyzeDb/analyzeReducer";
import scanReducer from "./scan/scanReducer";
import resultReducer from "./result/resultReducer";

// Combine Reducers
const reducers = combineReducers({
	resultState: resultReducer,
	scanState: scanReducer,
	analyzeState: analyzeReducer,
	indexationState: indexationReducer,
	foldersState: foldersReducer
});

export default reducers;

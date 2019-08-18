import { getDatabaseSize, initDatabase } from "../../api/database";

export const INDEXATION_LOAD_DATABASE = "INDEXATION_LOAD_DATABASE";
export const INDEXATION_START = "INDEXATION_START";
export const INDEXATION_END = "INDEXATION_END";
export const INDEXATION_PROGRESS = "INDEXATION_PROGRESS";
export const INDEXATION_DUPLICATE = "INDEXATION_DUPLICATE";

function databaseLoaded(dbSize, isIndexed) {
	return {
		type: INDEXATION_LOAD_DATABASE,
		dbSize,
		isIndexed
	};
}

export function startIndexation() {
	return {
		type: INDEXATION_START
	};
}

export function endIndexation() {
	return {
		type: INDEXATION_END
	};
}

export function indexProgress(step, progress) {
	return {
		type: INDEXATION_PROGRESS,
		step,
		progress
	};
}

export function indexDuplicate(dbFile, newFile, diff) {
	return {
		type: INDEXATION_DUPLICATE,
		dbFile,
		newFile,
		diff
	};
}

export function createDatabase(folder) {
	return async dispatch => {
		await initDatabase(folder);

		dispatch(loadDatabase(folder));
	};
}

export function loadDatabase(folder) {
	return async dispatch => {
		const dbSize = await getDatabaseSize(folder);

		dispatch(databaseLoaded(dbSize, dbSize > 0));
	};
}

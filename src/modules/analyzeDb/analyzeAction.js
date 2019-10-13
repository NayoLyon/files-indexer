const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

const fsExists = path =>
	new Promise(resolve => {
		fs.access(path, fs.constants.F_OK, err => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});

export const ANALYZE_START = "ANALYZE_START";
export const ANALYZE_END = "ANALYZE_END";
export const ANALYZE_PROGRESS = "ANALYZE_PROGRESS";
export const ANALYZE_MISSING_ADD = "ANALYZE_MISSING_ADD";
export const ANALYZE_MISSING_REMOVE = "ANALYZE_MISSING_REMOVE";
export const ANALYZE_DUPLICATES_SET = "ANALYZE_DUPLICATES_SET";
export const ANALYZE_DUPLICATE_REMOVE = "ANALYZE_DUPLICATE_REMOVE";

function startAnalyze() {
	return {
		type: ANALYZE_START
	};
}
function endAnalyze() {
	return {
		type: ANALYZE_END
	};
}
function analyzeProgress(step, progress) {
	return {
		type: ANALYZE_PROGRESS,
		step,
		progress
	};
}
function analyzeMissingAdd(dbFile) {
	return {
		type: ANALYZE_MISSING_ADD,
		dbFile
	};
}
function analyzeDuplicate(duplicateList) {
	return {
		type: ANALYZE_DUPLICATES_SET,
		duplicateList
	};
}
function analyzeMissingRemove(dbFile) {
	return {
		type: ANALYZE_MISSING_REMOVE,
		dbFile
	};
}
function analyzeDuplicateRemove(dbFile) {
	return {
		type: ANALYZE_DUPLICATE_REMOVE,
		dbFile
	};
}

export function removeMissing(sourceDb, dbFile) {
	return async (dispatch, getState) => {
		sourceDb.deleteFile(dbFile);
		dispatch(analyzeMissingRemove(dbFile));
	};
}
export function removeDuplicate(sourceDb, dbFile) {
	return async (dispatch, getState) => {
		sourceDb.deleteFile(dbFile);
		dispatch(analyzeDuplicateRemove(dbFile));
	};
}
export function doAnalyze(sourceDb) {
	return async dispatch => {
		dispatch(startAnalyze());

		const files = await sourceDb.getAll();
		const duplicateList = new Map();
		const filesHash = new Map();
		dispatch(analyzeProgress("INDEXING", { value: 0, total: files.length }));
		for (let index = 0; index < files.length; index++) {
			const file = files[index];
			dispatch(analyzeProgress("INDEXING", { value: index, total: files.length }));
			const filePath = path.resolve(sourceDb.folder, file.relpath);
			const fileExists = await fsExists(filePath);
			if (!fileExists) {
				dispatch(analyzeMissingAdd(file));
			} else {
				const otherFileSameHash = filesHash.get(file.hash);
				if (otherFileSameHash) {
					const fileDuplicates = duplicateList.get(file.hash);
					if (fileDuplicates) {
						fileDuplicates.push(file);
					} else {
						duplicateList.set(file.hash, [otherFileSameHash, file]);
					}
				} else {
					filesHash.set(file.hash, file);
				}
			}
		}

		dispatch(analyzeDuplicate(duplicateList));

		dispatch(endAnalyze());
	};
}

export const RESULT_LOAD_START = "RESULT_LOAD_START";
export const RESULT_LOAD_SUCCESS = "RESULT_LOAD_SUCCESS";
export const RESULT_LOAD_ERROR = "RESULT_LOAD_ERROR";
export const RESULT_SET_ACTIVETAB = "RESULT_SET_ACTIVETAB";

function loadResultStart() {
	return {
		type: RESULT_LOAD_START
	};
}
function loadResultError() {
	return {
		type: RESULT_LOAD_ERROR
	};
}

function loadResultSuccess(identicals, newFiles, modified, duplicates, dbFilesRef, filesProps) {
	return {
		type: RESULT_LOAD_SUCCESS,
		identicals,
		newFiles,
		modified,
		duplicates,
		dbFilesRef,
		filesProps
	};
}

export function resultSetTabActive(activeTab) {
	return {
		type: RESULT_SET_ACTIVETAB,
		activeTab
	};
}

export function loadResult(dbScan) {
	return async dispatch => {
		try {
			dispatch(loadResultStart());
			const filesProps = new Map();
			const insertIntoMap = fileProps => {
				filesProps.set(fileProps.id, fileProps);
			};
			const identicals = await dbScan.getIdenticals();
			identicals.forEach(insertIntoMap);
			const newFiles = await dbScan.getNewFiles();
			newFiles.forEach(insertIntoMap);
			const modified = await dbScan.getModifiedFiles();
			modified.forEach(insertIntoMap);
			const duplicates = await dbScan.getDuplicates();
			duplicates.forEach(insertIntoMap);
			const dbFilesRef = await dbScan.getDbFilesRefs();
			console.log("dbFilesRef: ", dbFilesRef);
			dispatch(
				loadResultSuccess(
					identicals,
					newFiles,
					modified,
					duplicates,
					dbFilesRef,
					filesProps
				)
			);
		} catch (error) {
			console.log(error);
			dispatch(loadResultError());
		}
	};
}

import { FileProps, FilePropsDb, FilePropsDbDuplicates } from "../../api/filesystem";
import {
	initDatabase,
	closeDatabase,
	findDb,
	insertDb,
	deleteDb,
	updateDbQuery,
	deleteDbQuery
} from "../../api/database";
import { deleteFile } from "../../utils/filesystem";

export const SCAN_START = "SCAN_START";
export const SCAN_END = "SCAN_END";
export const SCAN_PROGRESS = "SCAN_PROGRESS";
export const CONST_SCAN_TYPE_DUPLICATE = "duplicate";
export const CONST_SCAN_TYPE_MODIFIED = "modified";
export const CONST_SCAN_TYPE_IDENTICAL = "identical";
export const CONST_SCAN_TYPE_NEW = "new";

function startScanAction() {
	return {
		type: SCAN_START
	};
}

export function endScan() {
	return {
		type: SCAN_END
	};
}

export function scanProgress(step, progress) {
	return {
		type: SCAN_PROGRESS,
		step,
		progress
	};
}

export function startScan() {
	return async dispatch => {
		dispatch(startScanAction());
		// Close a previous database
		await closeDatabase("scan");

		// Initialize database
		await initDatabase("scan", true);
	};
}

async function scanAdd(fileProps) {
	await insertDb("scan", fileProps);

	await Promise.all(
		fileProps.dbFiles.map(async filePropsDb => {
			const updatedDoc = await updateDbQuery(
				"scan",
				{ type: "FILEPROPSDB", _id: filePropsDb.id },
				{ $push: { filesMatching: fileProps.id } }
			);
			if (updatedDoc[0] === 0) {
				const newFilePropsDbDuplicate = new FilePropsDbDuplicates(filePropsDb);
				newFilePropsDbDuplicate.addFileRef(fileProps);
				await insertDb("scan", newFilePropsDbDuplicate);
			}
		})
	);
}
async function scanRemove(fileProps) {
	const occurence = await findDb("scan", { _id: fileProps.id }, FileProps);
	if (occurence.length !== 1) {
		console.error(
			`Invalid number of scan found [${occurence.length}] for`,
			fileProps,
			occurence
		);
		return;
	}
	const deleteFileProps = await deleteDb("scan", fileProps);
	if (deleteFileProps !== 1) {
		console.error(`Could not delete fileProps ??? (${deleteFileProps})`, fileProps);
	}

	const updatedDoc = await updateDbQuery(
		"scan",
		{ type: "FILEPROPSDB", filesMatching: fileProps.id },
		{ $pull: { filesMatching: fileProps.id } }
	);
	if (updatedDoc[0] !== occurence[0].dbFiles.length) {
		console.error(
			`Incorrect dbFilesRef updated (${updatedDoc[0]}), expected (${
				occurence[0].dbFiles.length
			})`,
			occurence[0],
			updatedDoc[1]
		);
	}
	/* const deleteQuery = */
	await deleteDbQuery(
		"scan",
		{ type: "FILEPROPSDB", filesMatching: { $size: 0 } },
		{ multi: true }
	);
	// console.log(`'${deleteQuery}' dbFilesRef removed...`);
}
export function scanProcessFile(fileProps) {
	return async (dispatch, getState) => {
		const { masterPath } = getState().foldersState;

		const newFileProps = fileProps.clone();
		let occurences = await findDb(masterPath, { hash: newFileProps.hash }, FilePropsDb);
		if (occurences.length === 0) {
			// File not found in db... Search for files with similar properties
			occurences = await findDb(
				masterPath,
				{
					name: newFileProps.name
				},
				FilePropsDb
			);
			if (occurences.length === 0) {
				newFileProps.setCompareType(CONST_SCAN_TYPE_NEW);
			} else {
				newFileProps.setCompareType(CONST_SCAN_TYPE_DUPLICATE);
				newFileProps.setDbMatches(occurences);
			}
		} else {
			if (occurences.length > 1) {
				console.error(`Multiple occurences from hash ${newFileProps.hash}!!`, occurences);
				console.warn(
					"We will only compare to the one with less differences in properties..."
				);
				// throw Error(`Multiple occurences from hash ${newFileProps.hash}!!`);
			}
			newFileProps.setDbMatches(occurences);
			const compared = newFileProps.compareSameHash();
			if (compared.length > 0) {
				newFileProps.setCompareType(CONST_SCAN_TYPE_MODIFIED);
			} else {
				newFileProps.setCompareType(CONST_SCAN_TYPE_IDENTICAL);
			}
		}
		await scanAdd(newFileProps);
	};
}

export function removeAllFiles(scanType) {
	return async (dispatch, getState) => {
		dispatch(startScanAction());
		if (scanType === CONST_SCAN_TYPE_IDENTICAL) {
			const identicals = await findDb("scan", { scanType }, FileProps);
			for (let i = 0; i < identicals.length; i += 1) {
				dispatch(scanProgress("REMOVING", { value: i, total: identicals.length }));
				const file = identicals[i];
				deleteFile(getState().foldersState.toScanPath, file.relpath);
				/* eslint-disable-next-line no-await-in-loop */
				await scanRemove(file);
			}
		} else {
			console.error(`Unexpected scanType '${scanType}' for removeAllFiles. Skip action...`);
		}
		dispatch(endScan());
	};
}
export function removeFile(file) {
	return async (dispatch, getState) => {
		dispatch(startScanAction());
		deleteFile(getState().foldersState.toScanPath, file.relpath);
		await scanRemove(file);
		dispatch(endScan());
	};
}
export function dbFilePropUpdated(dbFile) {
	return async dispatch => {
		dispatch(startScanAction());

		const filesToRescan = await findDb(
			"scan",
			{
				$or: [
					{ scanType: CONST_SCAN_TYPE_NEW },
					{ scanType: CONST_SCAN_TYPE_DUPLICATE },
					{ matches: { $elemMatch: { _id: dbFile.id } } }
				]
			},
			FileProps
		);
		const nbFilesToRescan = filesToRescan.length;
		for (let i = 0; i < nbFilesToRescan; i += 1) {
			const fileProps = filesToRescan[i];
			dispatch(scanProgress("LISTING", { value: i, total: nbFilesToRescan }));
			/* eslint-disable-next-line no-await-in-loop */
			await scanRemove(fileProps);
		}

		// Rescan them all
		for (let index = 0; index < filesToRescan.length; index += 1) {
			const elt = filesToRescan[index];
			dispatch(scanProgress("INDEXING", { value: index, total: filesToRescan.length }));
			/* eslint-disable-next-line no-await-in-loop */
			await dispatch(scanProcessFile(elt));
		}

		dispatch(endScan());
	};
}

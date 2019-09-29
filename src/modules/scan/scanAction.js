import { FileProps, FilePropsDb, FilePropsDbDuplicates } from "../../api/filesystem";
import { deleteFile } from "../../utils/filesystem";

export const SCAN_START = "SCAN_START";
export const SCAN_END = "SCAN_END";
export const SCAN_PROGRESS = "SCAN_PROGRESS";
export const SCAN_RESET = "SCAN_RESET";
export const CONST_SCAN_TYPE_DUPLICATE = "duplicate";
export const CONST_SCAN_TYPE_MODIFIED = "modified";
export const CONST_SCAN_TYPE_IDENTICAL = "identical";
export const CONST_SCAN_TYPE_NEW = "new";

export function startScan() {
	return {
		type: SCAN_START
	};
}

export function endScan() {
	return {
		type: SCAN_END
	};
}

export function resetScan() {
	return {
		type: SCAN_RESET
	};
}

export function scanProgress(step, progress, file) {
	return {
		type: SCAN_PROGRESS,
		step,
		progress,
		file
	};
}

async function scanAdd(dbScan, fileProps) {
	await dbScan.insertDb(fileProps);

	await Promise.all(
		fileProps.dbFiles.map(async filePropsDb => {
			const existingDoc = await dbScan.get(filePropsDb.id, FilePropsDbDuplicates);
			if (!existingDoc) {
				const newFilePropsDbDuplicate = new FilePropsDbDuplicates(filePropsDb);
				newFilePropsDbDuplicate.addFileRef(fileProps);
				await dbScan.insertDb(newFilePropsDbDuplicate);
			} else {
				existingDoc.addFileRef(fileProps);
				await dbScan.updateDb(existingDoc);
			}
		})
	);
}
async function scanRemove(dbScan, fileProps) {
	const occurence = await dbScan.get(fileProps.id, FileProps);
	if (!occurence) {
		console.error(`Scan not found for`, fileProps, occurence);
		return;
	}
	const deleteFileProps = await dbScan.deleteDb(fileProps);
	if (deleteFileProps !== 1) {
		console.error(`Could not delete fileProps ??? (${deleteFileProps})`, fileProps);
	}

	const updatedDoc = await dbScan.updateDbQuery(
		{ type: "FILEPROPSDB", filesMatching: fileProps.id },
		{ $pull: { filesMatching: fileProps.id } }
	);
	if (updatedDoc[0] !== occurence.dbFiles.length) {
		console.error(
			`Incorrect dbFilesRef updated (${updatedDoc[0]}), expected (${
				occurence.dbFiles.length
			})`,
			occurence,
			updatedDoc[1]
		);
	}
	/* const deleteQuery = */
	await dbScan.deleteDbQuery(
		{ type: "FILEPROPSDB", filesMatching: { $size: 0 } },
		{ multi: true }
	);
	// console.log(`'${deleteQuery}' dbFilesRef removed...`);
}
export function scanProcessFile(db, dbScan, fileProps) {
	return async (dispatch, getState) => {
		if (!db) return; // Should not happen, protected on call

		const newFileProps = fileProps.clone();
		let occurences = await db.find({ hash: newFileProps.hash }, FilePropsDb);
		if (occurences.length === 0) {
			// File not found in db... Search for files with similar properties
			occurences = await db.find({ name: newFileProps.name }, FilePropsDb);
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
		await scanAdd(dbScan, newFileProps);
	};
}

export function removeAllFiles(dbScan, scanType) {
	return async (dispatch, getState) => {
		dispatch(startScan());
		if (scanType === CONST_SCAN_TYPE_IDENTICAL) {
			const identicals = await dbScan.find({ scanType }, FileProps);
			for (let i = 0; i < identicals.length; i += 1) {
				const file = identicals[i];
				dispatch(
					scanProgress("REMOVING", { value: i, total: identicals.length }, file.relpath)
				);
				deleteFile(dbScan.folder, file.relpath);
				/* eslint-disable-next-line no-await-in-loop */
				await scanRemove(dbScan, file);
			}
		} else {
			console.error(`Unexpected scanType '${scanType}' for removeAllFiles. Skip action...`);
		}
		dispatch(endScan());
	};
}
export function removeFile(dbScan, file) {
	return async (dispatch, getState) => {
		dispatch(startScan());
		deleteFile(dbScan.folder, file.relpath);
		await scanRemove(dbScan, file);
		dispatch(endScan());
	};
}
export function dbFilePropUpdated(db, dbScan, dbFile) {
	return async dispatch => {
		dispatch(startScan());

		const filesToRescan = await dbScan.find(
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
			dispatch(
				scanProgress("LISTING", { value: i, total: nbFilesToRescan }, fileProps.relpath)
			);
			/* eslint-disable-next-line no-await-in-loop */
			await scanRemove(dbScan, fileProps);
		}

		// Rescan them all
		for (let index = 0; index < filesToRescan.length; index += 1) {
			const elt = filesToRescan[index];
			dispatch(
				scanProgress("INDEXING", { value: index, total: filesToRescan.length }, elt.relpath)
			);
			/* eslint-disable-next-line no-await-in-loop */
			await dispatch(scanProcessFile(db, dbScan, elt));
		}

		dispatch(endScan());
	};
}

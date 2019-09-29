import { Db } from "../../api/database";
import { FileProps, FilePropsDb } from "../../api/filesystem";
import { openExplorerOn, deleteFile } from "../../utils/filesystem";

export const CONST_SCAN_TYPE_DUPLICATE = "duplicate";
const CONST_SCAN_TYPE_MODIFIED = "modified";
const CONST_SCAN_TYPE_IDENTICAL = "identical";
const CONST_SCAN_TYPE_NEW = "new";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

class FilePropsScan extends FileProps {
	constructor(fileProps) {
		super(fileProps);
		this.scanType = fileProps.scanType || null;
		this.matches = fileProps.matches || [];
		this.diff = fileProps.diff || []; // Array of differences in props (name, size, ...)
	}
	static fromDb(file) {
		return new FilePropsScan(file);
	}
	_setCompareType(scanType) {
		this.scanType = scanType;
	}
	get dbMatches() {
		return this.matches;
	}
	setDbMatches(dbMatches) {
		this.matches = dbMatches.map(({ _id }) => _id);
		if (dbMatches.length === 0) {
			this._setCompareType(CONST_SCAN_TYPE_NEW);
		} else {
			this._setCompareType(CONST_SCAN_TYPE_DUPLICATE);
		}
	}
	compareSameHashAndSetDbMatches(dbMatches) {
		let resultMin = this._compareSameHashFile(dbMatches[0]);
		for (let i = 1; i < dbMatches.length; i += 1) {
			const result = this._compareSameHashFile(dbMatches[i]);
			if (result.length < resultMin.length) {
				resultMin = result;
				dbMatches.splice(0, 0, dbMatches.splice(i, 1)[0]);
			}
		}
		this.diff = resultMin;
		this.matches = dbMatches.map(({ _id }) => _id);

		if (this.diff.length > 0) {
			this._setCompareType(CONST_SCAN_TYPE_MODIFIED);
		} else {
			this._setCompareType(CONST_SCAN_TYPE_IDENTICAL);
		}
	}
	_compareSameHashFile(dbFile) {
		const result = [];
		if (dbFile.name !== this.name) {
			result.push("name");
		}
		if (dbFile.size !== this.size) {
			result.push("size");
		}
		if (dbFile.modifiedMs !== this.modifiedMs) {
			result.push("modifiedMs");
		}
		// Ignore changedMs and createdMs... They only depend on when the file was copied.
		// The correct date to check is the modifiedMs data.
		// if (dbFile.changedMs !== this.changedMs) {
		//   result.push('changedMs');
		// }
		// if (dbFile.createdMs !== this.createdMs) {
		//   result.push('createdMs');
		// }
		return result;
	}
}
class Scanner {
	constructor(sourceDb, { startScan, scanProgress, endScan }) {
		this._sourceDb = sourceDb;
		this._dbScan = undefined;
		this._folder = undefined;
		this._startScan = startScan;
		this._scanProgress = scanProgress;
		this._endScan = endScan;
		this._dbDuplicates = new Map();
	}

	load = async scanFolder => {
		this._dbScan = await Db.load(scanFolder, true);
		this._folder = scanFolder;
	};
	close = async () => {
		if (this._dbScan) {
			await this._dbScan.close();
		}
	};
	get folder() {
		return this._folder ? this._folder : "";
	}
	assertLoaded = () => {
		if (!this._folder) {
			throw new Error("Scanner is not initialized!!");
		}
	};

	// Scan:
	scanProcessFile = async fileProps => {
		this.assertLoaded();

		const newFileProps = new FilePropsScan(fileProps);
		let occurences = await this._sourceDb.find({ hash: fileProps.hash }, FilePropsDb);
		if (occurences.length === 0) {
			// File not found in db... Search for files with similar properties
			occurences = await this._sourceDb.find({ name: fileProps.name }, FilePropsDb);
			newFileProps.setDbMatches(occurences);
		} else {
			if (occurences.length > 1) {
				console.error(`Multiple occurences from hash ${fileProps.hash}!!`, occurences);
				console.warn(
					"We will only compare to the one with less differences in properties..."
				);
				// throw Error(`Multiple occurences from hash ${fileProps.hash}!!`);
			}
			newFileProps.compareSameHashAndSetDbMatches(occurences);
		}
		await this._dbScan.insertDb(newFileProps);

		occurences.map(async filePropsDb => {
			const existingDoc = this._dbDuplicates.get(filePropsDb.id);
			if (!existingDoc) {
				this._dbDuplicates.set(filePropsDb.id, {
					filePropsDb,
					filesMatching: new Set([newFileProps.id])
				});
			} else {
				existingDoc.filesMatching.add(newFileProps.id);
			}
		});
	};
	_scanRemove = async fileProps => {
		this.assertLoaded();
		const occurence = await this._dbScan.get(fileProps.id, FilePropsScan);
		if (!occurence) {
			console.error(`Scan not found for`, fileProps, occurence);
			return;
		}
		const deleteFileProps = await this._dbScan.deleteDb(fileProps);
		if (deleteFileProps !== 1) {
			console.error(`Could not delete fileProps ??? (${deleteFileProps})`, fileProps);
		}

		const affected = [];
		this._dbDuplicates.forEach(({ filesMatching, filePropsDb }, id, currentMap) => {
			if (filesMatching.delete(fileProps.id)) {
				// Delete filePropsDb not having any matching files...
				if (filesMatching.size === 0) {
					currentMap.delete(id);
				}
				affected.push({ filesMatching, filePropsDb, deleted: filesMatching.size === 0 });
			}
		});
		if (affected.length !== occurence.matches.length) {
			console.error(
				`Incorrect dbFilesRef updated (${affected.length}), expected (${occurence.matches.length})`,
				occurence,
				affected
			);
		}
	};

	// Results:
	async getIdenticals() {
		this.assertLoaded();
		return await this._dbScan.find({ scanType: CONST_SCAN_TYPE_IDENTICAL }, FilePropsScan);
	}
	async getNewFiles() {
		this.assertLoaded();
		return await this._dbScan.find({ scanType: CONST_SCAN_TYPE_NEW }, FilePropsScan);
	}
	async getModifiedFiles() {
		this.assertLoaded();
		return await this._dbScan.find({ scanType: CONST_SCAN_TYPE_MODIFIED }, FilePropsScan);
	}
	async getDuplicates() {
		this.assertLoaded();
		return await this._dbScan.find({ scanType: CONST_SCAN_TYPE_DUPLICATE }, FilePropsScan);
	}
	// We have filesProps which is a Map of all the above files (having scanType...)
	getDbFilesRefs() {
		this.assertLoaded();
		const res = [];
		this._dbDuplicates.forEach(({ filesMatching, filePropsDb }) => {
			if (filesMatching.size > 1) {
				res.push({ ...filePropsDb, filesMatching });
			}
		});
		return res;
	}
	getDbFilesMap() {
		const res = new Map();
		this._dbDuplicates.forEach(({ filesMatching, filePropsDb }, filePropsDbId) => {
			res.set(filePropsDbId, { ...filePropsDb, filesMatching });
		});
		return res;
	}
	// Results actions:
	openDbFolderFor = file => {
		this.assertLoaded();
		return openExplorerOn(path.resolve(this._sourceDb.folder, file.relpath));
	};
	openFolderFor = file => {
		this.assertLoaded();
		return openExplorerOn(path.resolve(this.folder, file.relpath));
	};
	copyModifiedAttributeTo = async (file, dbFile) => {
		this.assertLoaded();
		const dbFilePath = path.resolve(this._sourceDb.folder, dbFile.relpath);
		const newDbFile = FilePropsDb.fromDb(dbFile);
		newDbFile.modifiedMs = file.modifiedMs;
		fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, new Date(newDbFile.modifiedMs));
		try {
			const updatedDoc = await this._sourceDb.updateDb(newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			this._dbFilePropUpdated(newDbFile.id);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	};
	copyNameAttributeTo = async (file, dbFile) => {
		this.assertLoaded();
		const dbFilePath = path.resolve(this._sourceDb.folder, dbFile.relpath);
		const newDbFile = FilePropsDb.fromDb(dbFile);
		newDbFile.setNewName(file.name);
		const dbFileNewPath = path.resolve(this._sourceDb.folder, newDbFile.relpath);
		if (fs.existsSync(dbFileNewPath)) {
			const err = new Error(`File '${newDbFile.relpath}' already exists!`);
			console.log(err);
			throw err;
		}
		fs.renameSync(dbFilePath, dbFileNewPath);
		try {
			const updatedDoc = await this._sourceDb.updateDb(newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			this._dbFilePropUpdated(newDbFile.id);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	};
	removeFile = async file => {
		this.assertLoaded();

		const reloadedFile = FilePropsScan.fromDb(file);
		this._startScan();
		deleteFile(this.folder, reloadedFile.relpath);
		await this._scanRemove(reloadedFile);
		this._endScan();
	};
	removeAllIdenticals = async () => {
		this.assertLoaded();

		this._startScan();
		const identicals = await this.getIdenticals();
		for (let i = 0; i < identicals.length; i += 1) {
			const file = identicals[i];
			this._scanProgress("REMOVING", { value: i, total: identicals.length }, file.relpath);
			deleteFile(this.folder, file.relpath);
			/* eslint-disable-next-line no-await-in-loop */
			await this._scanRemove(file);
		}
		this._endScan();
	};
	_dbFilePropUpdated = async dbFileId => {
		this._startScan();

		const filesToRescan = await this._findFilesToRescan(dbFileId);
		const nbFilesToRescan = filesToRescan.length;
		for (let i = 0; i < nbFilesToRescan; i += 1) {
			const fileProps = filesToRescan[i];
			this._scanProgress("LISTING", { value: i, total: nbFilesToRescan }, fileProps.relpath);
			/* eslint-disable-next-line no-await-in-loop */
			await this._scanRemove(fileProps);
		}

		// Rescan them all
		for (let index = 0; index < filesToRescan.length; index += 1) {
			const elt = filesToRescan[index];
			this._scanProgress(
				"INDEXING",
				{ value: index, total: filesToRescan.length },
				elt.relpath
			);
			/* eslint-disable-next-line no-await-in-loop */
			await this.scanProcessFile(elt);
		}

		this._endScan();
	};
	_findFilesToRescan = async dbFileId => {
		return await this._dbScan.find(
			{
				$or: [
					{ scanType: CONST_SCAN_TYPE_NEW },
					{ scanType: CONST_SCAN_TYPE_DUPLICATE },
					{ matches: dbFileId }
				]
			},
			FilePropsScan
		);
	};
}
export const newScanner = (sourceDb, reducerCallbacks) => new Scanner(sourceDb, reducerCallbacks);

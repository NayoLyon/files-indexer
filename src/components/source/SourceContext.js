import { createContext } from "react";
import uuid from "uuid/v4";

import { FilePropsDb } from "../../api/filesystem";
import { readNDJsonFile, writeNDJsonFile } from "../../api/ndjson";
import { makeAsync } from "../../utils/funcUtils";

const { remote } = window.require("electron");
const { setSync } = remote.require("winattr");
const path = remote.require("path");
const fs = remote.require("fs");

export default createContext(null);

export async function initializeDatabase(folder) {
	if (!folder) {
		throw Error("Missing mandatory parameter folder");
	}
	try {
		console.log("Loading database", folder);

		// Reserve file ~, to avoid several concurrent modifications on the db...
		// Do it first, so in case of error we have nothing to cleanup...
		const dbFile = path.join(folder, ".index.idb");
		// TODO check perm access on file. Should be read and write.

		// Load from existing db file
		let db = null;
		if (fs.existsSync(dbFile)) {
			console.log("Load existing database", dbFile);
			const loadedDb = await readNDJsonFile(dbFile);
			console.log("Database file loaded");
			db = new Db(folder, dbFile, loadedDb);
		} else {
			const oldDbFile = path.join(folder, ".index.db");
			if (fs.existsSync(oldDbFile)) {
				// Read and convert...
				console.log("Load and convert from existing old database NeDB", oldDbFile);
				const loadedDb = [];
				const fileContent = await readNDJsonFile(oldDbFile);
				fileContent.forEach(doc => {
					if (doc._id && !doc.relpath.match(/.*(\\|\/)\.svn(\\|\/).*/)) {
						loadedDb.push(
							FilePropsDb.fromDb({
								...doc,
								hash: doc.size > 0 ? doc.hash : null,
								relpath: doc.relpath.replace(/\\/g, "/"),
								modifiedMs: doc.modified["$$date"],
								changedMs: doc.changed["$$date"],
								createdMs: doc.created["$$date"]
							})
						);
					}
				});
				console.log("Database file loaded");
				db = new Db(folder, dbFile, loadedDb);
				db._modified = true;
			} else {
				db = new Db(folder, dbFile, []);
			}
		}
		return db;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

class Index {
	constructor(propName) {
		this._index = new Map();
		this._propName = propName;
	}

	add(file) {
		const prop = file[this._propName];
		const id = file._id;
		const objs = this._index.get(prop);
		if (objs) {
			objs.push(id);
		} else {
			this._index.set(prop, [id]);
		}
	}

	delete(file) {
		const prop = file[this._propName];
		const id = file._id;
		const objs = this._index.get(prop);
		const index = objs ? objs.indexOf(id) : -1;
		if (index >= 0) {
			objs.splice(index, 1);
		} else {
			throw new Error(`Corrupted index! "${prop}" is not registered for id [${id}]`);
		}
	}

	get(prop) {
		return this._index.get(prop);
	}
}
class Db {
	constructor(folder, dbFile, loadedDb) {
		this._folder = folder;
		this._dbFile = dbFile;
		this.closed = false;

		// Create the target tmp database.
		// Will throw an error if it cannot do it (already in use or no write perm on folder)
		this._ws = fs.openSync(dbFile + "~", "wx");

		this._data = new Map();
		this._indexName = new Index("name");
		this._indexRelpath = new Index("relpath");
		this._indexHash = new Index("hash");
		loadedDb.forEach(obj => {
			this.insertFile(obj);
		});
		this._modified = false; // Set after load since insertFile internally sets it to true
	}
	get folder() {
		return this._folder;
	}
	async close() {
		return await makeAsync(() => {
			if (this.closed) return; // Already closed
			if (!this._folder) {
				throw new Error("Missing mandatory parameter db or folder");
			}
			const dbFile = this._dbFile;
			try {
				if (!this._modified) {
					console.log("DB not modified, close without saving...");

					// Now close reserved file
					console.log("Closing reserved file");
					fs.unlinkSync(dbFile + "~");
					return;
				}

				// Get all rows
				console.log("Exporting data");

				// Now save to file
				if (this._data.size > 0) {
					console.log("Saving data to file");
					const dataToSave = [];
					this._data.forEach(({ _id, ...props }) => {
						dataToSave.push({ ...props });
					});
					writeNDJsonFile(dataToSave, this._ws);
					console.log("Write complete!");

					// Now, move to final file
					let dbFileBak = null;
					if (fs.existsSync(dbFile)) {
						dbFileBak = dbFile + ".";
						let bakIncr = 1;
						while (fs.existsSync(dbFileBak + bakIncr)) {
							bakIncr++;
						}
						dbFileBak += bakIncr;
						fs.renameSync(dbFile, dbFileBak);
					}
					fs.renameSync(dbFile + "~", dbFile);
					if (dbFileBak) {
						fs.unlinkSync(dbFileBak);
					}
					// Force this file to hidden, for windows...
					setSync(dbFile, { hidden: true });
					console.log("Save complete!");
				} else {
					console.log("Nothing to save...");
					fs.unlinkSync(dbFile + "~");
				}
			} finally {
				if (this._ws) {
					fs.closeSync(this._ws);
					delete this._ws;
				}
			}
		});
	}
	_assertNotClosed() {
		if (this.closed) {
			throw Error("Database is closed");
		}
	}

	getSize() {
		this._assertNotClosed();
		return this._data.size;
	}

	_getMatching(index, prop) {
		this._assertNotClosed();

		const matchingObjects = index.get(prop);
		let result = [];
		if (matchingObjects) {
			matchingObjects.forEach(id => {
				const obj = this._data.get(id);
				if (obj) {
					result.push(FilePropsDb.fromDb(obj));
				} else {
					throw new Error(
						`DB internal inconsistency. Obj [${id}] could not be found but exists in index...`
					);
				}
			});
		}
		return result;
	}
	get(relpath) {
		return this._data.get(relpath);
	}
	getMatchingRelpath(relpath) {
		return this._getMatching(this._indexRelpath, relpath);
	}
	getMatchingHash(hash) {
		return this._getMatching(this._indexHash, hash);
	}
	getMatchingName(name) {
		return this._getMatching(this._indexName, name);
	}
	async getAll() {
		this._assertNotClosed();

		return await makeAsync(() => Array.from(this._data.values()).map(FilePropsDb.fromDb));
	}

	_addFile(file) {
		const { _id, name, relpath, hash, size, modifiedMs, changedMs, createdMs } = file;
		const id = _id || uuid();

		if (!_id) {
			const existingObject = this._data.get(id);
			if (existingObject) {
				throw new Error(`DB inconsistency: File '${id}' already exists in Db!`);
			}
		}

		this._modified = true;
		const rawObj = { _id: id, name, relpath, hash, size, modifiedMs, changedMs, createdMs };
		this._data.set(rawObj._id, rawObj);
		this._indexName.add(rawObj);
		this._indexRelpath.add(rawObj);
		this._indexHash.add(rawObj);
		return rawObj;
	}
	_removeFile(file) {
		const existingFile = this._data.get(file._id);
		if (!existingFile) {
			return false;
		}

		this._modified = true;
		this._indexName.delete(existingFile);
		this._indexRelpath.delete(existingFile);
		this._indexHash.delete(existingFile);
		this._data.delete(file._id);
		return true;
	}

	insertFile(file) {
		this._assertNotClosed();

		if (!file.relpath) {
			throw new Error(`Invalid object path '${file.relpath}'`);
		}

		return FilePropsDb.fromDb(this._addFile(file));
	}

	updateFile(file) {
		this._assertNotClosed();

		if (!file._id) {
			throw new Error(`Invalid file id '${file._id}'`);
		}

		if (!this._removeFile(file)) {
			return 0;
		}

		this._addFile(file);

		return 1;
	}

	deleteFile(file) {
		this._assertNotClosed();

		if (!file._id) {
			throw new Error(`Invalid file id '${file._id}'`);
		}

		if (!this._removeFile(file)) {
			return 0;
		}

		return 1;
	}
}

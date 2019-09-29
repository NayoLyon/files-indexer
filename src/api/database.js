const { remote } = window.require("electron");

const PouchDB = require("pouchdb-browser").default;
PouchDB.plugin(require("pouchdb-adapter-memory").default);
PouchDB.plugin(require("pouchdb-find").default);
const ndjson = remote.require("ndjson");
const { setSync } = remote.require("winattr");
const path = remote.require("path");
const fs = remote.require("fs");
// const { setSync } = app.__utils;

const dbStore = new Map();

function getDbFile(folder) {
	return path.join(folder, ".index.idb");
}

export class Db {
	constructor(folder, isInMemory) {
		this._folder = folder;
		this._inMemory = isInMemory;
		this._db = null;
		this.closed = false;
	}
	static async load(folder, isInMemory = false) {
		if (!folder) {
			throw Error("Missing mandatory parameter folder");
		}
		try {
			let db = new Db(folder, isInMemory);
			db._nbIndexes = 0;
			const createIndex = (fields, name) =>
				++db._nbIndexes && db._db.createIndex({ index: { fields, name } });
			if (isInMemory) {
				// For scan only
				db._db = new PouchDB(folder, { adapter: "memory" });
				await createIndex(["relpath"], "relpath");
				await createIndex(["scanType"], "scanType");
				await createIndex(["type", "filesMatching"], "duplicates");
				await createIndex(["hash"], "hash");
				await createIndex(["name"], "name");
			} else {
				// Reserve file ~, to avoid several concurrent modifications on the db...
				// Do it first, so in case of error we have nothing to cleanup...
				const dbFile = getDbFile(folder);
				// TODO check perm access on file. Should be read and write.

				// Create the target tmp database.
				// Will throw an error if it cannot do it (already in use or no write perm on folder)
				db._ws = fs.createWriteStream(dbFile + "~", { flags: "wx" });

				// For source only
				db._db = new PouchDB(folder);
				await createIndex(["relpath"], "relpath"); // TODO Should be unique...
				await createIndex(["hash"], "hash");
				await createIndex(["name"], "name");

				// Load from existing db file
				if (fs.existsSync(dbFile)) {
					console.log("Load existing database", dbFile);
					const doLoadDb = new Promise((resolve, reject) => {
						const rows = [];
						const rs = fs.createReadStream(dbFile).on("error", reject);
						const through = remote.require("through2").obj;

						rs.pipe(ndjson.parse())
							.on("error", reject)
							.pipe(
								through(
									function(doc, _, next) {
										rows.push(doc);
										next();
									},
									function(next) {
										resolve(rows);
										next();
									}
								)
							);
					});
					const rows = await doLoadDb;
					db._db.bulkDocs(rows, { new_edits: false });
				}
			}
			return db;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	get folder() {
		return this._folder;
	}
	async close() {
		if (this.closed) return; // Already closed
		if (!this._db || !this._folder) {
			throw new Error("Missing mandatory parameter db or folder");
		}
		if (this._inMemory) {
			this.closed = true;
			try {
				await this._db.destroy();
			} catch (error) {
				console.error(
					"Could not destroy db... Ignore the error as the db is in memor",
					error
				);
			}
		} else {
			try {
				await this._db.viewCleanup();
			} catch (error) {
				console.error("Compaction of indexes failed.", error);
			}
			try {
				await this._db.compact();
			} catch (error) {
				console.error("Compaction of database failed.", error);
			}

			// Get all rows
			console.log("Exporting data");
			const rows = await this.allDocs();

			// Close db
			console.log("Closing db", rows);
			this.closed = true;
			try {
				await this._db.destroy();
			} catch (error) {
				console.error(
					"Could not destroy db... Ignore the error as the db is in memor",
					error
				);
			}

			// Now save to file
			const dbFile = getDbFile(this._folder);
			if (rows.length > 0) {
				console.log("Saving data to file");
				const doSaveToFile = new Promise((resolve, reject) => {
					const transformStream = ndjson.serialize();
					transformStream
						.pipe(this._ws)
						.on("error", reject)
						.on(
							"finish",
							// Once ndjson has flushed all data to the output stream, let's indicate done.
							resolve
						);

					rows.forEach(doc => transformStream.write(doc.doc));

					// Once we've written each record in the record-set, we have to end the stream so that
					// the TRANSFORM stream knows to flush and close the file output stream.
					transformStream.end();
				});

				await doSaveToFile;
				console.log("Save complete!");

				// Now, move to final file
				let dbFileBak = null;
				if (fs.existsSync(dbFile)) {
					dbFileBak = dbFile + ".";
					let bakIncr = 1;
					while (fs.existsSync(dbFileBak + bakIncr)) {
						bakIncr++;
					}
					fs.renameSync(dbFile, dbFileBak);
				}
				fs.renameSync(dbFile + "~", dbFile);
				if (dbFileBak) {
					fs.unlinkSync(dbFileBak);
				}
				// Force this file to hidden, for windows...
				setSync(dbFile, { hidden: true });
			} else {
				console.log("Nothing to save...");
				this._ws.end();
				fs.unlinkSync(dbFile + "~");
			}
		}
	}

	async getSize() {
		if (this.closed) {
			throw Error("Database is closed");
		}
		try {
			const result = await this._db.info();
			return result.doc_count - this._nbIndexes;
		} catch (error) {
			console.error(error);
			return -1;
		}
	}

	async get(id, toClass) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		try {
			const result = await this._db.get(id, { latest: true });
			if (result && toClass != null) {
				return toClass.fromDb(result);
			}
			return result;
		} catch (err) {
			if (err.status === 404) {
				return null;
			}
			throw err;
		}
	}
	async allDocs(toClass) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		try {
			const { rows: occurences1 } = await this._db.allDocs({
				include_docs: true,
				attachments: true,
				startkey: "_design\uffff"
			});
			const { rows: occurences2 } = await this._db.allDocs({
				include_docs: true,
				attachments: true,
				endkey: "_design"
			});
			const occurences = occurences1.concat(occurences2);

			if (toClass != null) {
				return occurences.map(({ doc: elt }) => toClass.fromDb(elt));
			}
			return occurences;
		} catch (err) {
			console.error("Error in DB allDocs", err);
			throw err;
		}
	}
	async find(what, toClass) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		try {
			const { docs: occurences } = await this._db.find({
				selector: what
			});

			if (toClass != null) {
				return occurences.map(toClass.fromDb);
			}
			return occurences;
		} catch (err) {
			console.error("Error in DB find", err);
			throw err;
		}
	}

	async insertDb(obj) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		if (obj._id) {
			return await this._db.put(obj);
		}
		return await this._db.post(obj);
	}

	async updateDb(obj) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		var doc = await this._db.get(obj._id);
		if (!doc) {
			console.error("Could not update object", obj);
			throw new Error("Unknown obj " + obj._id);
		}
		const res = await this._db.put({
			...obj,
			_rev: doc._rev
		});
		return [res.ok && res.id === obj._id ? 1 : 0, { ...obj, _rev: res.rev }, res];
	}
	async updateBulk(objList) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		const result = await this._db.bulkDocs(objList);
		let error = 0;
		result.forEach((res, index) => {
			if (!res.ok) {
				console.error("Error updating document", objList[index], "Cause is ", res);
				error++;
			}
		});

		if (error === objList.length) {
			throw new Error("Could not update the documents");
		} else if (error > 0) {
			throw new Error("Some documents were not updated");
		}
	}

	async deleteDb(obj) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		const res = await this._db.remove(obj);
		return res.ok && res.id === obj._id ? 1 : 0;
	}
}

export function onClose() {
	// On close, set all dbFiles to hidden on Windows...
	// We cannot do it on the fly as NeDB always create a new file and does not allow callback on write...
	// Force this file to hidden, for windows...
	dbStore.forEach(db => {
		if (!db._inMemory) {
			db.close();
		}
	});
}
function getDb(folder) {
	const db = dbStore.get(folder);
	if (typeof db === "undefined") {
		throw new Error(`No database opened for ${folder}.`);
	}
	return db;
}

export async function closeDatabase(folder) {
	const db = dbStore.get(folder);
	if (typeof db !== "undefined") {
		dbStore.delete(folder);
		db.close();
	}
}
export async function initDatabase(folder, isInMemory) {
	try {
		if (folder === "") {
			return;
		}
		let db = null;
		try {
			db = getDb(folder);
		} catch (err) {
			db = await Db.load(folder, isInMemory);
			dbStore.set(folder, db);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function get(folder, id, toClass) {
	const db = getDb(folder);
	return await db.get(id, toClass);
}
export async function allDocs(folder, toClass) {
	const db = getDb(folder);
	return await db.allDocs(toClass);
}
export async function findDb(folder, what, toClass) {
	const db = getDb(folder);
	return await db.find(what, toClass);
}

export async function insertDb(folder, obj) {
	const db = getDb(folder);
	return await db.insertDb(obj);
}

export async function updateDb(folder, obj) {
	const db = getDb(folder);
	return await db.updateDb(obj);
}
export async function updateBulk(folder, objList) {
	const db = getDb(folder);
	return await db.updateBulk(objList);
}

export async function deleteDb(folder, obj) {
	const db = getDb(folder);
	return await db.deleteDb(obj);
}

const { remote } = window.require("electron");

const Datastore = remote.require("nedb-promise");
const { setSync } = remote.require("winattr");
const path = remote.require("path");
// const { setSync } = app.__utils;

const dbStore = new Map();

function getDbFile(folder) {
	return path.join(folder, ".index.db");
}

export class Db {
	constructor(folder, isInMemory) {
		this._folder = folder;
		this._inMemory = isInMemory;
		this._db = null;
	}
	static async load(folder, isInMemory = false) {
		if (!folder) {
			throw Error("Missing mandatory parameter folder");
		}
		try {
			let db = new Db(folder, isInMemory);
			if (isInMemory) {
				db._db = new Datastore({ inMemoryOnly: true, autoload: true });
				await this._db.ensureIndex({ fieldName: "relpath" });
			} else {
				db._db = new Datastore({ filename: getDbFile(folder), autoload: true });
				await db._db.ensureIndex({ fieldName: "relpath", unique: true });
				await db._db.ensureIndex({ fieldName: "hash" });
			}
			// Load the db
			// await db.getSize();
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
		if (!this._db || !this._folder) {
			throw new Error("Missing mandatory parameter db or folder");
		}
		const { nedb } = this._db;
		if (!nedb.inMemoryOnly) {
			const dbPath = getDbFile(this._folder);
			const doCompactAsync = new Promise(resolve => {
				nedb.on("compaction.done", () => {
					setSync(dbPath, { hidden: true });
					resolve();
				});
				nedb.persistence.compactDatafile();
			});
			await doCompactAsync;
		}
	}

	async getSize() {
		try {
			return await this._db.count({});
		} catch (error) {
			console.error(error);
			return -1;
		}
	}

	async findDb(what, toClass) {
		try {
			const occurences = await this._db.find(what);
			if (toClass != null) {
				const res = [];
				occurences.forEach(elt => {
					res.push(toClass.fromDb(elt));
				});
				return res;
			}
			return occurences;
		} catch (err) {
			console.error("Error in DB find", err);
			throw err;
		}
	}

	insertDb(obj) {
		return this._db.insert(obj);
	}

	updateDb(obj) {
		return this._db.update({ _id: obj.id }, obj, { returnUpdatedDocs: true });
	}
	updateDbQuery(query, obj) {
		return this._db.update(query, obj, { returnUpdatedDocs: true });
	}

	deleteDb(obj) {
		return this._db.remove({ _id: obj.id }, {});
	}
	deleteDbQuery(query, options) {
		return this._db.remove(query, options);
	}
}

export function onClose() {
	// On close, set all dbFiles to hidden on Windows...
	// We cannot do it on the fly as NeDB always create a new file and does not allow callback on write...
	// Force this file to hidden, for windows...
	dbStore.forEach((db, folder) => {
		if (!db.nedb.inMemoryOnly) {
			const dbPath = getDbFile(folder);
			setSync(dbPath, { hidden: true });
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
		if (!db.nedb.inMemoryOnly) {
			db.on("compaction.done", () => {
				const dbPath = getDbFile(folder);
				setSync(dbPath, { hidden: true });
			});
			db.persistence.compactDatafile();
		}
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
			if (isInMemory) {
				db = new Datastore({ inMemoryOnly: true, autoload: true });
				await db.ensureIndex({ fieldName: "relpath" });
			} else {
				db = new Datastore({ filename: getDbFile(folder), autoload: true });
				await db.ensureIndex({ fieldName: "relpath", unique: true });
				await db.ensureIndex({ fieldName: "hash" });
			}
			dbStore.set(folder, db);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function findDb(folder, what, toClass) {
	const db = getDb(folder);
	try {
		const occurences = await db.find(what);
		if (toClass != null) {
			const res = [];
			occurences.forEach(elt => {
				res.push(toClass.fromDb(elt));
			});
			return res;
		}
		return occurences;
	} catch (err) {
		console.error("Error in DB find", err);
		throw err;
	}
}

export function insertDb(folder, obj) {
	const db = getDb(folder);
	return db.insert(obj);
}

export function updateDb(folder, obj) {
	const db = getDb(folder);
	return db.update({ _id: obj.id }, obj, { returnUpdatedDocs: true });
}
export function updateDbQuery(folder, query, obj) {
	const db = getDb(folder);
	return db.update(query, obj, { returnUpdatedDocs: true });
}

export function deleteDb(folder, obj) {
	const db = getDb(folder);
	return db.remove({ _id: obj.id }, {});
}
export function deleteDbQuery(folder, query, options) {
	const db = getDb(folder);
	return db.remove(query, options);
}

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
				await db._db.ensureIndex({ fieldName: "relpath" });
			} else {
				db._db = new Datastore({ filename: getDbFile(folder), autoload: true });
				await db._db.ensureIndex({ fieldName: "relpath", unique: true });
				await db._db.ensureIndex({ fieldName: "hash" });
				await db._db.ensureIndex({ fieldName: "name" });
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
		if (!this._inMemory) {
			const { nedb } = this._db;
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

	async get(id, toClass) {
		try {
			const result = await this._db.findOne({ _id: id });
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
		try {
			const occurences = await this._db.find({});

			if (toClass != null) {
				return occurences.map(toClass.fromDb);
			}
			return occurences;
		} catch (err) {
			console.error("Error in DB allDocs", err);
			throw err;
		}
	}
	async find(what, toClass) {
		try {
			const occurences = await this._db.find(what);

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
		return await this._db.insert(obj);
	}

	async updateDb(obj) {
		return await this._db.update({ _id: obj.id }, obj, { returnUpdatedDocs: true });
	}
	async updateDbQuery(query, obj) {
		return await this._db.update(query, obj, { returnUpdatedDocs: true });
	}

	async deleteDb(obj) {
		return await this._db.remove({ _id: obj.id }, {});
	}
	async deleteDbQuery(query, options) {
		return await this._db.remove(query, options);
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
export async function updateDbQuery(folder, query, obj) {
	const db = getDb(folder);
	return await db.updateDbQuery(query, obj);
}

export async function deleteDb(folder, obj) {
	const db = getDb(folder);
	return await db.deleteDb(obj);
}
export async function deleteDbQuery(folder, query, options) {
	const db = getDb(folder);
	return await db.deleteDbQuery(query, options);
}

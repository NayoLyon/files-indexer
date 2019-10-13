const PouchDB = require("pouchdb-browser").default;
PouchDB.plugin(require("pouchdb-adapter-memory").default);
PouchDB.plugin(require("pouchdb-find").default);

export class Db {
	constructor(folder) {
		this._folder = folder;
		this._db = null;
		this.closed = false;
	}
	static async load(folder) {
		if (!folder) {
			throw Error("Missing mandatory parameter folder");
		}
		try {
			console.log("Loading database", folder);
			let db = new Db(folder);
			db._nbIndexes = 0;
			const createIndex = (fields, name) =>
				++db._nbIndexes && db._db.createIndex({ index: { fields, name } });

			// For scan only
			console.log("Init PouchDB", folder);
			db._db = new PouchDB(folder, { adapter: "memory" });
			await createIndex(["relpath"], "relpath");
			await createIndex(["scanType"], "scanType");
			await createIndex(["type", "filesMatching"], "duplicates");
			await createIndex(["hash"], "hash");
			await createIndex(["name"], "name");
			console.log("DB loaded");

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
		this.closed = true;
		try {
			await this._db.destroy();
		} catch (error) {
			console.error("Could not destroy db... Ignore the error as the db is in memor", error);
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

	async deleteDb(obj) {
		if (this.closed) {
			throw Error("Database is closed");
		}
		const res = await this._db.remove(obj);
		return res.ok && res.id === obj._id ? 1 : 0;
	}
}

/* eslint no-await-in-loop: "off" */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_rev"] }] */
// import fs from 'fs';
// import path from 'path';
// import crypto from 'crypto';
import { isEligibleFile } from "../utils/filesystem";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");
const crypto = electron.remote.require("crypto");

// export type FilePropsType = {
//   _id: string | void,
//   name: string,
//   relpath: string,
//   hash: string,
//   size: number,
//   modifiedMs: number,
//   changedMs: number,
//   createdMs: number
// };

export class FilePropsDb {
	constructor(file) {
		this._id = file._id;
		this._rev = file._rev;
		this.name = file.name;
		this.relpath = file.relpath;
		this.hash = file.hash;
		this.size = file.size;
		this.modifiedMs = file.modifiedMs;
		this.changedMs = file.changedMs;
		this.createdMs = file.createdMs;
	}
	get id() {
		return this._id;
	}
	static fromDb(file) {
		return new FilePropsDb(file);
	}
	clone() {
		return new FilePropsDb(this);
	}
	setNewName(name) {
		this.name = name;
		this.relpath = path.join(path.dirname(this.relpath), name);
	}
	cloneFromSamePath(file) {
		const newFile = new FilePropsDb(this);
		["hash", "size", "modifiedMs", "changedMs", "createdMs"].forEach(prop => {
			newFile[prop] = file[prop];
		});
		return newFile;
	}
}

export class FileProps {
	constructor(file) {
		this.name = file.name;
		this.relpath = file.relpath; // Relative to the database... More usefull
		this._id = file.relpath;
		this._rev = file._rev;
		this.size = file.size;
		this.modifiedMs = file.modifiedMs;
		this.changedMs = file.changedMs;
		this.createdMs = file.createdMs;
		this.hash = file.hash || null;
	}
	static fromScan(file, stats, rootPath) {
		return new FileProps({
			name: path.basename(file),
			relpath: path.relative(rootPath, file),
			size: stats.size,
			modifiedMs: stats.mtimeMs,
			changedMs: stats.ctimeMs,
			createdMs: stats.birthtimeMs
		});
	}
	get id() {
		return this._id;
	}
	static fromDb(file) {
		return new FileProps(file);
	}
	toFilePropsDb() {
		return new FilePropsDb({ ...this, _id: undefined });
	}
	async computeHash(rootFolder) {
		/* Manage readCallback ? Need to send the size and the callback to computeHashForFile, to know how much reading, and how long it will be... */
		this.hash = await computeHashForFile(path.resolve(rootFolder, this.relpath));
	}
	compareToSamePath(dbFile) {
		const result = new Set();
		["hash", "size", "modifiedMs", "changedMs", "createdMs"].forEach(prop => {
			if (dbFile[prop] instanceof Date) {
				if (dbFile[prop].getTime() !== this[prop].getTime()) {
					result.add(prop);
				}
			} else if (dbFile[prop] !== this[prop]) {
				result.add(prop);
			}
		});
		return result;
	}
}

export async function doScan(
	folder,
	fileCallback,
	progressCallback,
	hashRequired,
	isCanceled = () => false
) {
	progressCallback("LISTING", { percent: 0 }, folder);
	let files;
	try {
		files = await walkDir(folder, 0, 100, progressCallback, isCanceled);
	} catch (error) {
		console.log("Error listing folder!", error);
		return;
	}

	if (isCanceled()) return;

	// Now scanning files to store in DB
	const { length: total } = files;
	console.log(`Found ${total} files...`);
	for (let i = 0; i < total; i += 1) {
		if (isCanceled()) return;
		const file = files[i];
		progressCallback("INDEXING", { value: i, total }, file);

		const stats = fs.statSync(file);

		const fileProps = FileProps.fromScan(file, stats, folder);
		if (hashRequired) {
			try {
				await fileProps.computeHash(folder);
			} catch (error) {
				console.error(`Could not compute hash for ${file}. Skip it...`, error);
			}
		}
		// console.log(`Hash for file ${file} is ${fileProps.hash}`, fileProps);
		await fileCallback(fileProps);
	}
	progressCallback("INDEXING", { value: total, total });
}
function computeHashForFile(fn) {
	return new Promise((resolve, reject) => {
		console.log(`Compute hash for ${fn}`);
		const hash = crypto.createHash("md5");
		const fh = fs.createReadStream(fn);

		fh.on("end", () => {
			const digest = hash.digest("hex");
			resolve(digest);
		});
		fh.on("error", reject);
		fh.on("data", d => {
			console.log("Read data from file...");
			return hash.update(d);
		});
	});
}

async function walkDir(folder, progressStart, progressEnd, progressCallback, isCanceled) {
	const [fileList, subFolders] = await readDir(folder);

	const progressStep = (progressEnd - progressStart) / (subFolders.length + 1);
	progressCallback(
		"LISTING",
		{ percent: Math.round((progressStart + progressStep) * 100) / 100 },
		folder
	);

	for (let i = 0; i < subFolders.length; i += 1) {
		if (isCanceled()) return [];
		const subFolder = subFolders[i];
		const subFolderProgressOffset = (i + 1) * progressStep;
		const subFolderProgress = progressStart + subFolderProgressOffset;
		const subFolderContent = await walkDir(
			subFolder,
			subFolderProgress,
			subFolderProgress + progressStep,
			progressCallback,
			isCanceled
		);
		subFolderContent.forEach(elt => {
			fileList.push(elt);
		});
	}

	return fileList;
}
const fsReadDir = (path, opts) =>
	new Promise((resolve, reject) => {
		fs.readdir(path, opts, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});
async function readDir(folder) {
	const content = await fsReadDir(folder);
	// const content = fs.readdirSync(folder);

	const fileList = [];
	const subFolders = [];
	for (let i = 0; i < content.length; i += 1) {
		const file = content[i];
		if (fs.statSync(path.join(folder, file)).isDirectory()) {
			subFolders.push(path.join(folder, file));
		} else if (isEligibleFile(file)) {
			fileList.push(path.join(folder, file));
		}
	}
	subFolders.sort((a, b) => a.localeCompare(b));
	return [fileList, subFolders];
}
/*
function getRootPath(fullPath: string, relPath: string): string | null {
  let res = fullPath;
  let prevRes = null;
  while (fullPath !== path.resolve(res, relPath) && res !== prevRes) {
    prevRes = res;
    res = path.dirname(res);
  }
  if (fullPath === path.resolve(res, relPath)) {
    return res;
  }
  return null;
}
*/

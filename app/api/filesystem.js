/* eslint no-await-in-loop: "off" */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isEligibleFile } from '../utils/filesystem';

export type FilePropsType = {
  _id: string,
  name: string,
  ext: string,
  folder: string,
  path: string,
  relpath: string,
  hash: string,
  size: number,
  modified: Date,
  changed: Date,
  created: Date
};

export class FilePropsDb {
  constructor(file: FilePropsType | FileProps | FilePropsDb) {
    this._id = file._id;
    this.name = file.name;
    this.ext = file.ext;
    this.folder = file.folder;
    this.path = file.path;
    this.relpath = file.relpath;
    this.hash = file.hash;
    this.size = file.size;
    this.modified = file.modified;
    this.changed = file.changed;
    this.created = file.created;
  }
  get id() {
    return this._id;
  }
  static fromFile(file: FilePropsType): FilePropsDb {
    return new FilePropsDb(file);
  }
  clone(): FilePropsDb {
    return new FilePropsDb(this);
  }
  setNewName(name: string): void {
    // const rootPath = getRootPath(this.path, this.relpath);
    this.name = name;
    this.ext = path.extname(name);
    this.path = path.resolve(path.dirname(this.path), name);
    this.relpath = path.join(path.dirname(this.relpath), name);
    // this.relpath = path.relative(rootPath, this.path);
  }
  cloneFromSamePath(file: FileProps) {
    const newFile = new FilePropsDb(this);
    ['hash', 'size', 'modified', 'changed', 'created'].forEach(prop => {
      newFile[prop] = file[prop];
    });
    return newFile;
  }
}

export class FileProps {
  constructor(file, stats, rootPath) {
    this._id = undefined;
    this.name = path.basename(file);
    this.ext = path.extname(file);
    this.folder = path.dirname(file); // Useless ??
    this.path = file; // Useless ??
    this.relpath = path.relative(rootPath, file); // Relative to the database... More usefull
    this.size = stats.size;
    this.modified = stats.mtime;
    this.changed = stats.ctime;
    this.created = stats.birthtime;
    this.hash = null;
    this.scanType = null;
    this.matches = [];
  }
  get id() {
    return this.relpath;
  }
  clone() {
    const clone = new FileProps(
      this.path,
      {
        size: this.size,
        mtime: this.modified,
        ctime: this.changed,
        birthtime: this.created
      },
      getRootPath(this.path, this.relpath)
    );
    clone.hash = this.hash;
    return clone;
  }
  async computeHash() {
    this.hash = await computeHashForFile(this.path);
  }
  setCompareType(scanType: string) {
    this.scanType = scanType;
  }
  get dbFiles() {
    return this.matches;
  }
  setDbMatches(dbFiles) {
    if (dbFiles instanceof Array) {
      this.matches = this.matches.concat(dbFiles);
    } else {
      this.matches.push(dbFiles);
    }
  }
  compareSameHash(dbFile: FilePropsDb) {
    const result: Map<string, Array<string | number | Date>> = new Map();
    if (dbFile.name !== this.name) {
      result.set('name', [this.name, dbFile.name]);
    }
    if (dbFile.size !== this.size) {
      result.set('size', [this.size, dbFile.size]);
    }
    if (dbFile.modified.getTime() !== this.modified.getTime()) {
      result.set('modified', [this.modified, dbFile.modified]);
    }
    // Ignore changed and created... They only depend on when the file was copied.
    // The correct date to check is the modified data.
    // if (dbFile.changed.getTime() !== this.changed.getTime()) {
    //   result.set('changed', [this.changed, dbFile.changed]);
    // }
    // if (dbFile.created.getTime() !== this.created.getTime()) {
    //   result.set('created', [this.created, dbFile.created]);
    // }
    return result;
  }
  compareToSamePath(dbFile: FilePropsDb) {
    const result: Set<string> = new Set();
    ['hash', 'size', 'modified', 'changed', 'created'].forEach(prop => {
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
  folder: string,
  fileCallback: (fileProps: FileProps) => void,
  progressCallback: (step: string, progress: number) => void,
  hashRequired: boolean = true
) {
  progressCallback('LISTING', 0);
  const files = await walkDir(folder, 0, 1, progressCallback);

  // Now scanning files to store in DB
  for (let i = 0; i < files.length; i += 1) {
    progressCallback('INDEXING', i / files.length);
    const file = files[i];

    const stats = fs.statSync(file);

    const fileProps = new FileProps(file, stats, folder);
    if (hashRequired) {
      await fileProps.computeHash();
    }
    await fileCallback(fileProps);
  }
}
function computeHashForFile(fn) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const fh = fs.createReadStream(fn);

    fh.on('data', d => hash.update(d));
    fh.on('end', () => {
      const digest = hash.digest('hex');
      resolve(digest);
    });
    fh.on('error', reject);
  });
}

async function walkDir(
  folder: string,
  progressStart: number,
  progressEnd: number,
  progressCallback: (step: string, progress: number) => void
) {
  const [fileList, subFolders] = await readDir(folder);

  const progressStep = (progressEnd - progressStart) / (subFolders.length + 1);
  progressCallback('LISTING', progressStart + progressStep);

  for (let i = 0; i < subFolders.length; i += 1) {
    const subFolder = subFolders[i];
    const subFolderProgressOffset = (i + 1) * progressStep;
    const subFolderProgress = progressStart + subFolderProgressOffset;
    const subFolderContent = await walkDir(
      subFolder,
      subFolderProgress,
      subFolderProgress + progressStep,
      progressCallback
    );
    subFolderContent.forEach(elt => {
      fileList.push(elt);
    });
  }

  return fileList;
}
function readDir(folder) {
  return new Promise(resolve => {
    const content = fs.readdirSync(folder);

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
    resolve([fileList, subFolders]);
  });
}

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

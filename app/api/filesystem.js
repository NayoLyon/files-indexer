/* eslint no-await-in-loop: "off" */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isEligibleFile } from '../utils/filesystem';

export type FilePropsType = {
  _id: string | void,
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
  static fromDb(file: FilePropsType): FilePropsDb {
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

export class FilePropsDbDuplicates extends FilePropsDb {
  constructor(file: FilePropsDb | FilePropsType) {
    super(file);
    this.type = 'FILEPROPSDB';
    this.filesMatching = file.filesMatching || [];
  }
  addFileRef(fileProps) {
    this.filesMatching.push(fileProps.id);
  }
  static fromDb(file: FilePropsType): FilePropsDbDuplicates {
    return new FilePropsDbDuplicates(file);
  }
}

export class FileProps {
  constructor(file) {
    this.name = file.name;
    this.ext = file.ext;
    this.folder = file.folder; // Useless ??
    this.path = file.path; // Useless ??
    this.relpath = file.relpath; // Relative to the database... More usefull
    this._id = file.relpath;
    this.size = file.size;
    this.modified = file.modified;
    this.changed = file.changed;
    this.created = file.created;
    this.hash = file.hash || null;
    this.scanType = file.scanType || null;
    if (file.matches) {
      this.matches = file.matches.map(filePropsDb => FilePropsDb.fromDb(filePropsDb));
    } else {
      this.matches = [];
    }
    this.diff = file.diff || [];
  }
  static fromScan(file, stats, rootPath) {
    return new FileProps({
      name: path.basename(file),
      ext: path.extname(file),
      folder: path.dirname(file),
      path: file,
      relpath: path.relative(rootPath, file),
      size: stats.size,
      modified: stats.mtime,
      changed: stats.ctime,
      created: stats.birthtime
    });
  }
  get id() {
    return this._id;
  }
  static fromDb(file: FilePropsType): FileProps {
    return new FileProps(file);
  }
  clone() {
    return new FileProps({ ...this, scanType: null, matches: null, diff: null });
  }
  toFilePropsDb() {
    return new FilePropsDb({ ...this, _id: undefined });
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
  compareSameHash() {
    if (this.matches == null || this.matches.length === 0) {
      return 0;
    }
    let resultMin = this.compareSameHashFile(this.matches[0]);
    for (let i = 1; i < this.matches; i += 1) {
      const result = this.compareSameHashFile(this.matches[i]);
      if (result.length < resultMin.length) {
        resultMin = result;
        this.matches.splice(0, 0, this.matches.splice(i, 1)[0]);
      }
    }
    this.diff = resultMin;
    return this.diff;
  }
  compareSameHashFile(dbFile: FilePropsDb) {
    const result = [];
    if (dbFile.name !== this.name) {
      result.push('name');
    }
    if (dbFile.size !== this.size) {
      result.push('size');
    }
    if (dbFile.modified.getTime() !== this.modified.getTime()) {
      result.push('modified');
    }
    // Ignore changed and created... They only depend on when the file was copied.
    // The correct date to check is the modified data.
    // if (dbFile.changed.getTime() !== this.changed.getTime()) {
    //   result.push('changed');
    // }
    // if (dbFile.created.getTime() !== this.created.getTime()) {
    //   result.push('created');
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

    const fileProps = FileProps.fromScan(file, stats, folder);
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

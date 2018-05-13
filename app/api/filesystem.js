/* eslint no-await-in-loop: "off" */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
  constructor(dbFile: FilePropsType) {
    this._id = dbFile._id;
    this.name = dbFile.name;
    this.ext = dbFile.ext;
    this.folder = dbFile.folder;
    this.path = dbFile.path;
    this.relpath = dbFile.relpath;
    this.hash = dbFile.hash;
    this.size = dbFile.size;
    this.modified = dbFile.modified;
    this.changed = dbFile.changed;
    this.created = dbFile.created;
  }
  get id() {
    return this._id;
  }
}
export class FileProps {
  constructor(hash, file, stats, rootPath) {
    this._id = hash;
    this.name = path.basename(file);
    this.ext = path.extname(file);
    this.folder = path.dirname(file); // Useless ??
    this.path = file; // Useless ??
    this.relpath = path.relative(rootPath, file); // Relative to the database... More usefull
    this.hash = hash;
    this.size = stats.size;
    this.modified = stats.mtime;
    this.changed = stats.ctime;
    this.created = stats.birthtime;
  }
  get id() {
    return this._id;
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
}

export async function doScan(
  folder: string,
  fileCallback: (fileProps: FileProps) => void,
  progressCallback: (step: string, progress: number) => void
) {
  progressCallback('LISTING', 0);
  const files = await walkDir(folder, 0, 1, progressCallback);

  // Now scanning files to store in DB
  for (let i = 0; i < files.length; i += 1) {
    progressCallback('INDEXING', i / files.length);
    const file = files[i];

    const hash = await computeHash(file);
    const stats = fs.statSync(file);

    const fileProps = new FileProps(hash, file, stats, folder);
    fileCallback(fileProps);
  }
}
function computeHash(fn) {
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
      } else if (!['.index.db', 'Thumbs.db'].includes(file)) {
        fileList.push(path.join(folder, file));
      }
    }
    resolve([fileList, subFolders]);
  });
}

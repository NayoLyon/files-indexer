/* eslint no-await-in-loop: "off" */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export class FileProps {
  constructor(id, file, stats, rootPath) {
    this._id = id;
    this.name = path.basename(file);
    this.ext = path.extname(file);
    this.folder = path.dirname(file); // Useless ??
    this.path = file; // Useless ??
    this.relpath = path.relative(rootPath, file); // Relative to the database... More usefull
    this.size = stats.size;
    this.modified = stats.mtime;
    this.changed = stats.ctime;
    this.created = stats.birthtime;
  }
  get id() {
    return this._id;
  }
}

export async function scan(
  folder: string,
  fileCallback: (fileProps: FileProps) => void,
  progressCallback: (step: string, progress: number) => void
) {
  progressCallback('LISTING', 0);
  const files = await walkDir(folder, 0, 100, progressCallback);

  // Now scanning files to store in DB
  for (let i = 0; i < files.length; i += 1) {
    const i100 = i * 100;
    progressCallback('INDEXING', Math.round(i100 / files.length));
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
  progressCallback('LISTING', Math.round(progressStart + progressStep));

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

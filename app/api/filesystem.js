/* eslint no-await-in-loop: "off" */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export function computeHash(fn) {
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

export async function walkDir(
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
    const subFolderProgress = progressStart + ((i + 1) * progressStep);
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

import { shell } from 'electron';
import fs from 'fs';
import path from 'path';

export function openExplorerOn(folder) {
  shell.showItemInFolder(folder);
}
export function openExplorerFor(folder) {
  shell.openItem(folder);
}

export function deleteFile(rootFolder, relPath) {
  const filePath = path.resolve(rootFolder, relPath);
  shell.moveItemToTrash(filePath);
  if (rootFolder) {
    tryDeleteFolder(rootFolder, path.dirname(relPath));
  }
}

function tryDeleteFolder(rootFolder, relFolder) {
  if (relFolder === '.') {
    return;
  }
  const folder = path.resolve(rootFolder, relFolder);
  const files = fs.readdirSync(folder);
  const eligibleFiles = files.filter(file => isEligibleFile(file));
  if (eligibleFiles.length === 0) {
    shell.moveItemToTrash(folder);
    tryDeleteFolder(rootFolder, path.dirname(relFolder));
  }
}

// function isChildOf(folder, rootFolder) {
//   if (folder === rootFolder) {
//     return false;
//   }
//   const relative = path.relative(rootFolder, folder);
//   return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
// }

export function isEligibleFile(file) {
  return !['.index.db', 'Thumbs.db'].includes(file);
}

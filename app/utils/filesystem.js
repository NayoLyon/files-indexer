import { shell } from 'electron';
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
}

export function isEligibleFile(file) {
  return !['.index.db', 'Thumbs.db'].includes(file);
}

import { shell } from 'electron';

export function openExplorerOn(folder) {
  shell.showItemInFolder(folder);
}
export function openExplorerFor(folder) {
  shell.openItem(folder);
}

export function deleteFile(filePath) {
  shell.moveItemToTrash(filePath);
}

export function isEligibleFile(file) {
  return !['.index.db', 'Thumbs.db'].includes(file);
}

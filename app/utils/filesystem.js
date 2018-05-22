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

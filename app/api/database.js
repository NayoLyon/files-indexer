const Datastore = require('nedb-promise');

const path = require('path');

const dbStore = new Map();

function getDbFile(folder: string) {
  return path.join(folder, '.index.db');
}

export async function getDatabaseSize(folder: string): number {
  try {
    if (folder === '') {
      return -1;
    }
    const db = new Datastore({ filename: getDbFile(folder), autoload: true });
    dbStore.set(folder, db);
    return await db.count({});
  } catch (error) {
    console.log(error);
    return -1;
  }
}

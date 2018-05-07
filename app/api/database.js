const Datastore = require('nedb-promise');

const path = require('path');

const dbStore = new Map();

function getDbFile(folder: string) {
  return path.join(folder, '.index.db');
}

function getDb(folder: string) {
  const db = dbStore.get(folder);
  if (typeof db === 'undefined') {
    throw new Error(`No database opened for ${folder}.`);
  }
  return db;
}

export async function getDatabaseSize(folder: string): number {
  try {
    if (folder === '') {
      return -1;
    }
    let db = null;
    try {
      db = getDb(folder);
    } catch (err) {
      db = new Datastore({ filename: getDbFile(folder), autoload: true });
      dbStore.set(folder, db);
    }
    return await db.count({});
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export function findDb(folder: string, what) {
  const db = getDb(folder);
  return db.find(what);
}

export function insertDb(folder: string, obj) {
  const db = getDb(folder);
  return db.insert(obj);
}

import { setSync } from 'winattr';

import { FilePropsType } from './filesystem';

const Datastore = require('nedb-promise');

const path = require('path');

const dbStore = new Map();

function getDbFile(folder: string) {
  return path.join(folder, '.index.db');
}

export function onClose() {
  // On close, set all dbFiles to hidden on Windows...
  // We cannot do it on the fly as NeDB always create a new file and does not allow callback on write...
  // Force this file to hidden, for windows...
  dbStore.forEach((db, folder) => {
    if (!db.nedb.inMemoryOnly) {
      const dbPath = getDbFile(folder);
      setSync(dbPath, { hidden: true });
    }
  });
}
function getDb(folder: string) {
  const db = dbStore.get(folder);
  if (typeof db === 'undefined') {
    throw new Error(`No database opened for ${folder}.`);
  }
  return db;
}

export async function closeDatabase(folder: string): void {
  const db = dbStore.get(folder);
  if (typeof db !== 'undefined') {
    dbStore.delete(folder);
    if (!db.nedb.inMemoryOnly) {
      db.on('compaction.done', () => {
        const dbPath = getDbFile(folder);
        setSync(dbPath, { hidden: true });
      });
      db.persistence.compactDatafile();
    }
  }
}
export async function initDatabase(folder: string, isInMemory: boolean | void): void {
  try {
    if (folder === '') {
      return;
    }
    let db = null;
    try {
      db = getDb(folder);
    } catch (err) {
      if (isInMemory) {
        db = new Datastore({ inMemoryOnly: true, autoload: true });
        await db.ensureIndex({ fieldName: 'relpath' });
      } else {
        db = new Datastore({ filename: getDbFile(folder), autoload: true });
        await db.ensureIndex({ fieldName: 'relpath', unique: true });
        await db.ensureIndex({ fieldName: 'hash' });
      }
      dbStore.set(folder, db);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getDatabaseSize(folder: string): number {
  const db = getDb(folder);
  try {
    return await db.count({});
  } catch (error) {
    console.error(error);
    return -1;
  }
}

export async function findDb(folder: string, what, toClass) {
  const db = getDb(folder);
  try {
    const occurences = await db.find(what);
    if (toClass != null) {
      const res = [];
      occurences.forEach(elt => {
        res.push(toClass.fromDb(elt));
      });
      return res;
    }
    return occurences;
  } catch (err) {
    console.error('Error in DB find', err);
    throw err;
  }
}

export function insertDb(folder: string, obj: FilePropsType) {
  const db = getDb(folder);
  return db.insert(obj);
}

export function updateDb(folder: string, obj: FilePropsType) {
  const db = getDb(folder);
  return db.update({ _id: obj.id }, obj, { returnUpdatedDocs: true });
}
export function updateDbQuery(folder: string, query, obj) {
  const db = getDb(folder);
  return db.update(query, obj, { returnUpdatedDocs: true });
}

export function deleteDb(folder: string, obj: FilePropsType) {
  const db = getDb(folder);
  return db.remove({ _id: obj.id }, {});
}
export function deleteDbQuery(folder: string, query, options) {
  const db = getDb(folder);
  return db.remove(query, options);
}

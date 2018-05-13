// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { shell } from 'electron';
import fs from 'fs';
import path from 'path';

import { FileProps, FilePropsDb } from '../api/filesystem';

import ScanResult from './ScanResult';
import { scanDbRef } from '../modules/scan/scan';
import { updateDb } from '../api/database';
import * as ScanActions from '../modules/scan/scanAction';

type Props = {
  scanProgress: (string, number) => void,
  startScan: () => void,
  endScan: () => void,
  scanExistsRemove: (file: FileProps) => void,
  scanNewRemove: (file: FileProps) => void,
  scanModifiedRemove: (file: FileProps) => void,
  scanDuplicateRemove: (file: FileProps) => void,
  scanProcessFile: (fileProps: FileProps, oldDbFile: FilePropsDb | undefined) => void,
  scanRefUpdate: (FileProps, FilePropsDb | undefined, FilePropsDb | undefined, string) => void,
  masterFolder: string,
  toScanFolder: string,
  dbFilesRef: Map<string, scanDbRef>,
  newFiles: Array<FileProps>,
  duplicates: Array<{ file: FileProps, matches: Arrays<FilePropsDb> }>
};

class ScanResultPage extends Component<Props> {
  props: Props;
  static openFolder(folder) {
    shell.showItemInFolder(folder);
  }

  constructor(props) {
    super(props);
    this.copyModifiedAttribute = this.copyModifiedAttribute.bind(this);
    this.openDbFolderFor = this.openDbFolderFor.bind(this);
    this.openFolderFor = this.openFolderFor.bind(this);
    this.dbFilePropUpdated = this.dbFilePropUpdated.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.copyNameAttribute = this.copyNameAttribute.bind(this);
  }

  openDbFolderFor(file: FilePropsDb) {
    ScanResultPage.openFolder(path.resolve(this.props.masterFolder, file.relpath));
  }
  openFolderFor(file: FileProps) {
    ScanResultPage.openFolder(path.resolve(this.props.toScanFolder, file.relpath));
  }
  async removeFile(file: FileProps, oldDbFile: FilePropsDb) {
    shell.moveItemToTrash(path.resolve(this.props.toScanFolder, file.relpath));
    this.props.scanModifiedRemove(file);
    this.props.scanRefUpdate(file, oldDbFile, undefined, 'whatever'); // TODO change 'whatever' to undefined ??
  }
  async copyModifiedAttribute(file: FileProps, dbFile: FilePropsDb) {
    const dbFilePath = path.resolve(this.props.masterFolder, dbFile.relpath);
    const newDbFile = dbFile.clone();
    newDbFile.modified = new Date(file.modified);
    fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, newDbFile.modified);
    try {
      const updatedDoc = await updateDb(this.props.masterFolder, newDbFile);
      if (updatedDoc[0] !== 1) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Document ${newDbFile.relpath} not updated!!`);
      } else if (updatedDoc[1]._id !== newDbFile._id) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
      }
      this.dbFilePropUpdated(dbFile);
    } catch (err) {
      console.warn('Error while updating doc', err);
      // TODO propagate an error...
    }
  }
  async copyNameAttribute(file: FileProps, dbFile: FilePropsDb) {
    const dbFilePath = path.resolve(this.props.masterFolder, dbFile.relpath);
    const newDbFile = dbFile.clone();
    newDbFile.setNewName(file.name);
    fs.renameSync(dbFilePath, path.resolve(path.dirname(dbFilePath), file.name));
    try {
      const updatedDoc = await updateDb(this.props.masterFolder, newDbFile);
      if (updatedDoc[0] !== 1) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Document ${newDbFile.relpath} not updated!!`);
      } else if (updatedDoc[1]._id !== newDbFile._id) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
      }
      this.dbFilePropUpdated(dbFile);
    } catch (err) {
      console.warn('Error while updating doc', err);
      // TODO propagate an error...
    }
  }

  async dbFilePropUpdated(dbFile) {
    this.props.startScan();
    const filesToRescan = [];
    let nbFilesToRescan = this.props.newFiles.length + this.props.duplicates.length;

    // Retrieve all files connected to this dbref and remove all scan references to these files
    let counter = 0;
    const dbRefInstance = this.props.dbFilesRef.get(dbFile.id);
    const oldDbMap = new Map();
    if (dbRefInstance) {
      nbFilesToRescan += dbRefInstance.files.size;
      const promises = [];
      dbRefInstance.files.forEach((val, key) => {
        this.props.scanProgress('LISTING', counter / nbFilesToRescan);
        counter += 1;
        switch (val) {
          case ScanActions.CONST_SCAN_TYPE_DUPLICATE:
            // Do nothing, will be managed in the next step...
            oldDbMap.set(key, dbFile);
            break;
          case ScanActions.CONST_SCAN_TYPE_EXISTS:
            filesToRescan.push(key);
            oldDbMap.set(key, dbFile);
            promises.push(this.props.scanExistsRemove(key));
            break;
          case ScanActions.CONST_SCAN_TYPE_MODIFIED:
            filesToRescan.push(key);
            oldDbMap.set(key, dbFile);
            promises.push(this.props.scanModifiedRemove(key));
            break;
          default:
            console.warn('Unexpected type!! Skip the error...', val, key);
        }
      });
      await Promise.all(promises);
      // /* eslint-disable no-restricted-syntax */
      // /* eslint-disable no-await-in-loop */
      // for (const [ key, val ] of dbRefInstance.files) {
      //   this.props.scanProgress('LISTING', counter / nbFilesToRescan);
      //   counter += 1;
      //   switch (val) {
      //     case ScanActions.CONST_SCAN_TYPE_DUPLICATE:
      //       // Do nothing, will be managed in the next step...
      //       break;
      //     case ScanActions.CONST_SCAN_TYPE_EXISTS:
      //       filesToRescan.push(key);
      //       await this.props.scanExistsRemove(key);
      //       break;
      //     case ScanActions.CONST_SCAN_TYPE_MODIFIED:
      //       filesToRescan.push(key);
      //       await this.props.scanModifiedRemove(key);
      //       break;
      //     default:
      //       console.warn('Unexpected type!! Skip the error...', val, key);
      //   }
      // }
      // /* eslint-enable no-await-in-loop */
      // /* eslint-enable no-restricted-syntax */
    }
    // Retrieve all files duplicated and new (not connected to dbFile by hash)
    //  and remove all scan references to these files
    await Promise.all(
      this.props.newFiles.map(async elt => {
        this.props.scanProgress('LISTING', counter / nbFilesToRescan);
        counter += 1;
        filesToRescan.push(elt);
        await this.props.scanNewRemove(elt);
      })
    );
    await Promise.all(
      this.props.duplicates.map(async elt => {
        this.props.scanProgress('LISTING', counter / nbFilesToRescan);
        counter += 1;
        filesToRescan.push(elt.file);
        await this.props.scanDuplicateRemove(elt.file);
      })
    );

    // Rescan them all
    counter = 0;
    await Promise.all(
      filesToRescan.map(async elt => {
        this.props.scanProgress('INDEXING', counter / filesToRescan.length);
        await this.props.scanProcessFile(elt, oldDbMap.get(elt));
      })
    );

    this.props.endScan();
  }

  render() {
    return (
      <ScanResult
        openDbFolderFor={this.openDbFolderFor}
        openFolderFor={this.openFolderFor}
        copyModifiedAttribute={this.copyModifiedAttribute}
        removeFile={this.removeFile}
        copyNameAttribute={this.copyNameAttribute}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.folders.masterPath,
    toScanFolder: state.folders.toScanPath,
    dbFilesRef: state.scan.dbFilesRef,
    newFiles: state.scan.newFiles,
    duplicates: state.scan.duplicates
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ScanActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanResultPage);

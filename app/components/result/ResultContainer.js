// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import fs from 'fs';
import path from 'path';

import { FileProps, FilePropsDb } from '../../api/filesystem';

import ResultView from './ResultView';
import { scanDbRef } from '../../modules/scan/scanReducer';
import { updateDb } from '../../api/database';
import * as ScanActions from '../../modules/scan/scanAction';
import { openExplorerOn, deleteFile } from '../../utils/filesystem';

type Props = {
  scanProgress: (string, number) => void,
  startScan: () => void,
  endScan: () => void,
  scanSetTabActive: string => void,
  scanExistsRemove: (file: FileProps) => void,
  scanNewRemove: (file: FileProps) => void,
  scanModifiedRemove: (file: FileProps) => void,
  scanDuplicateRemove: (file: FileProps) => void,
  scanProcessFile: (fileProps: FileProps, oldDbFile: FilePropsDb | void) => void,
  scanRefUpdate: (
    FileProps,
    Array<FilePropsDb> | FilePropsDb | void,
    FilePropsDb | void,
    ScanActions.ConstScanType
  ) => void,
  masterFolder: string,
  toScanFolder: string,
  identicals: Array<FileProps>,
  dbFilesRef: Map<string, scanDbRef>,
  newFiles: Array<FileProps>,
  duplicates: Array<FileProps>
};

class ResultContainer extends Component<Props> {
  props: Props;
  static wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  static async promisifyFunc(func, ...args) {
    await func(...args);
    await ResultContainer.wait(1);
  }

  constructor(props) {
    super(props);
    this.copyModifiedAttributeTo = this.copyModifiedAttributeTo.bind(this);
    this.openDbFolderFor = this.openDbFolderFor.bind(this);
    this.openFolderFor = this.openFolderFor.bind(this);
    this.dbFilePropUpdated = this.dbFilePropUpdated.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.copyNameAttributeTo = this.copyNameAttributeTo.bind(this);
    this.removeAllFiles = this.removeAllFiles.bind(this);
  }

  openDbFolderFor(file: FilePropsDb) {
    openExplorerOn(path.resolve(this.props.masterFolder, file.relpath));
  }
  openFolderFor(file: FileProps) {
    openExplorerOn(path.resolve(this.props.toScanFolder, file.relpath));
  }
  async removeFile(file: FileProps) {
    deleteFile(this.props.toScanFolder, file.relpath);
    switch (file.scanType) {
      case ScanActions.CONST_SCAN_TYPE_MODIFIED:
        this.props.scanModifiedRemove(file);
        break;
      case ScanActions.CONST_SCAN_TYPE_DUPLICATE:
        this.props.scanDuplicateRemove(file);
        break;
      case ScanActions.CONST_SCAN_TYPE_IDENTICAL:
        this.props.scanExistsRemove(file);
        break;
      case ScanActions.CONST_SCAN_TYPE_NEW:
        this.props.scanNewRemove(file);
        return;
      default:
        console.error(`Unexpected removeFile of ${file.scanType}!!`);
    }
    this.props.scanRefUpdate(file, file.dbFiles, undefined, 'whatever'); // TODO change 'whatever' to undefined ??
  }
  async removeAllFiles(scanType: ScanActions.ConstScanType) {
    if (scanType === ScanActions.CONST_SCAN_TYPE_IDENTICAL) {
      this.props.identicals.forEach(file => {
        this.removeFile(file);
      });
    } else {
      console.error(`Unexpected scanType '${scanType}' for removeAllFiles. Skip action...`);
    }
  }
  async copyModifiedAttributeTo(file: FileProps, dbFile: FilePropsDb) {
    const dbFilePath = path.resolve(this.props.masterFolder, dbFile.relpath);
    const newDbFile = dbFile.clone();
    newDbFile.modified = new Date(file.modified);
    fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, newDbFile.modified);
    try {
      const updatedDoc = await updateDb(this.props.masterFolder, newDbFile);
      if (updatedDoc[0] !== 1) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Document ${newDbFile.relpath} not updated!!`);
      } else if (updatedDoc[1].hash !== newDbFile.hash) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
      }
      this.dbFilePropUpdated(dbFile);
    } catch (err) {
      console.warn('Error while updating doc', err);
      // TODO propagate an error...
    }
  }
  async copyNameAttributeTo(file: FileProps, dbFile: FilePropsDb) {
    const dbFilePath = path.resolve(this.props.masterFolder, dbFile.relpath);
    const newDbFile = dbFile.clone();
    newDbFile.setNewName(file.name);
    const dbFileNewPath = path.resolve(this.props.masterFolder, newDbFile.relpath);
    if (fs.existsSync(dbFileNewPath)) {
      const err = new Error(`File '${newDbFile.relpath}' already exists!`);
      console.log(err);
      throw err;
    }
    fs.renameSync(dbFilePath, dbFileNewPath);
    try {
      const updatedDoc = await updateDb(this.props.masterFolder, newDbFile);
      if (updatedDoc[0] !== 1) {
        console.error(updatedDoc, newDbFile);
        throw Error(`Document ${newDbFile.relpath} not updated!!`);
      } else if (updatedDoc[1].hash !== newDbFile.hash) {
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
      nbFilesToRescan += dbRefInstance.filesMatching.size;
      /* eslint-disable-next-line no-restricted-syntax */
      for (const [, fileProps] of dbRefInstance.filesMatching) {
        this.props.scanProgress('LISTING', counter / nbFilesToRescan);
        counter += 1;
        switch (fileProps.scanType) {
          case ScanActions.CONST_SCAN_TYPE_DUPLICATE:
            // Do nothing, will be managed in the next step...
            oldDbMap.set(fileProps, dbFile);
            break;
          case ScanActions.CONST_SCAN_TYPE_IDENTICAL:
            filesToRescan.push(fileProps);
            oldDbMap.set(fileProps, dbFile);
            /* eslint-disable-next-line no-await-in-loop */
            await ResultContainer.promisifyFunc(this.props.scanExistsRemove, fileProps);
            break;
          case ScanActions.CONST_SCAN_TYPE_MODIFIED:
            filesToRescan.push(fileProps);
            oldDbMap.set(fileProps, dbFile);
            /* eslint-disable-next-line no-await-in-loop */
            await ResultContainer.promisifyFunc(this.props.scanModifiedRemove, fileProps);
            break;
          default:
            console.warn('Unexpected type!! Skip the error...', fileProps.scanType, fileProps);
        }
      }
      // /* eslint-disable no-restricted-syntax */
      // /* eslint-disable no-await-in-loop */
      // for (const [ filePropsRelPath, fileProps ] of dbRefInstance.filesMatching) {
      //   this.props.scanProgress('LISTING', counter / nbFilesToRescan);
      //   counter += 1;
      //   switch (fileProps.scanType) {
      //     case ScanActions.CONST_SCAN_TYPE_DUPLICATE:
      //       // Do nothing, will be managed in the next step...
      //       break;
      //     case ScanActions.CONST_SCAN_TYPE_IDENTICAL:
      //       filesToRescan.push(fileProps);
      //       await this.props.scanExistsRemove(fileProps);
      //       break;
      //     case ScanActions.CONST_SCAN_TYPE_MODIFIED:
      //       filesToRescan.push(fileProps);
      //       await this.props.scanModifiedRemove(fileProps);
      //       break;
      //     default:
      //       console.warn('Unexpected type!! Skip the error...', fileProps.scanType, fileProps);
      //   }
      // }
      // /* eslint-enable no-await-in-loop */
      // /* eslint-enable no-restricted-syntax */
    }
    // Retrieve all files duplicated and new (not connected to dbFile by hash)
    //  and remove all scan references to these files
    for (let index = 0; index < this.props.newFiles.length; index += 1) {
      const elt = this.props.newFiles[index];
      this.props.scanProgress('LISTING', counter / nbFilesToRescan);
      counter += 1;
      filesToRescan.push(elt);
      /* eslint-disable-next-line no-await-in-loop */
      await ResultContainer.promisifyFunc(this.props.scanNewRemove, elt);
    }
    for (let index = 0; index < this.props.duplicates.length; index += 1) {
      const file = this.props.duplicates[index];
      this.props.scanProgress('LISTING', counter / nbFilesToRescan);
      counter += 1;
      filesToRescan.push(file);
      /* eslint-disable-next-line no-await-in-loop */
      await ResultContainer.promisifyFunc(this.props.scanDuplicateRemove, file);
    }

    // Rescan them all
    for (let index = 0; index < filesToRescan.length; index += 1) {
      const elt = filesToRescan[index];
      this.props.scanProgress('INDEXING', index / filesToRescan.length);
      /* eslint-disable-next-line no-await-in-loop */
      await ResultContainer.promisifyFunc(this.props.scanProcessFile, elt, oldDbMap.get(elt));
    }

    this.props.endScan();
  }

  render() {
    return (
      <ResultView
        openDbFolderFor={this.openDbFolderFor}
        openFolderFor={this.openFolderFor}
        copyModifiedAttributeTo={this.copyModifiedAttributeTo}
        removeFile={this.removeFile}
        removeAllFiles={this.removeAllFiles}
        copyNameAttributeTo={this.copyNameAttributeTo}
        setTabActive={this.props.scanSetTabActive}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.foldersState.masterPath,
    toScanFolder: state.foldersState.toScanPath,
    identicals: state.scanState.identicals,
    dbFilesRef: state.scanState.dbFilesRef,
    newFiles: state.scanState.newFiles,
    duplicates: state.scanState.duplicates
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ScanActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultContainer);

// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import fs from 'fs';
import path from 'path';

import { FileProps, FilePropsDb } from '../../api/filesystem';

import ResultView from './ResultView';
import { updateDb } from '../../api/database';
import * as ScanActions from '../../modules/scan/scanAction';
import * as ResultActions from '../../modules/result/resultAction';
import { openExplorerOn } from '../../utils/filesystem';

type Props = {
  loadResult: () => void,
  resultSetTabActive: string => void,
  removeFile: (file: FileProps) => void,
  removeAllFiles: (scanType: ScanActions.ConstScanType) => void,
  dbFilePropUpdated: (dbFile: FilePropsDb) => void,
  masterFolder: string,
  toScanFolder: string
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
    this.copyNameAttributeTo = this.copyNameAttributeTo.bind(this);

    this.props.loadResult();
  }

  openDbFolderFor(file: FilePropsDb) {
    openExplorerOn(path.resolve(this.props.masterFolder, file.relpath));
  }
  openFolderFor(file: FileProps) {
    openExplorerOn(path.resolve(this.props.toScanFolder, file.relpath));
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
      this.props.dbFilePropUpdated(dbFile);
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
      this.props.dbFilePropUpdated(dbFile);
    } catch (err) {
      console.warn('Error while updating doc', err);
      // TODO propagate an error...
    }
  }

  render() {
    return (
      <ResultView
        openDbFolderFor={this.openDbFolderFor}
        openFolderFor={this.openFolderFor}
        copyModifiedAttributeTo={this.copyModifiedAttributeTo}
        removeFile={this.props.removeFile}
        removeAllFiles={this.props.removeAllFiles}
        copyNameAttributeTo={this.copyNameAttributeTo}
        setTabActive={this.props.resultSetTabActive}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.foldersState.masterPath,
    toScanFolder: state.foldersState.toScanPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadResult: ResultActions.loadResult,
      resultSetTabActive: ResultActions.resultSetTabActive,
      removeFile: ScanActions.removeFile,
      removeAllFiles: ScanActions.removeAllFiles,
      dbFilePropUpdated: ScanActions.dbFilePropUpdated
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultContainer);

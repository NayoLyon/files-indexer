// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { shell } from 'electron';
import path from 'path';

import { FileProps, FilePropsDb } from '../api/filesystem';

import ScanResult from './ScanResult';
import * as ScanActions from '../modules/scan/scanAction';

type Props = {
  masterFolder: string,
  toScanFolder: string
};

class ScanResultPage extends Component<Props> {
  props: Props;
  static openFolder(folder) {
    shell.showItemInFolder(folder);
  }

  constructor(props) {
    super(props);
    this.openDbFolderFor = this.openDbFolderFor.bind(this);
    this.openFolderFor = this.openFolderFor.bind(this);
  }

  openDbFolderFor(file: FilePropsDb) {
    ScanResultPage.openFolder(path.resolve(this.props.masterFolder, file.relpath));
  }
  openFolderFor(file: FileProps) {
    ScanResultPage.openFolder(path.resolve(this.props.toScanFolder, file.relpath));
  }

  render() {
    return <ScanResult openDbFolderFor={this.openDbFolderFor} openFolderFor={this.openFolderFor} />;
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.folders.masterPath,
    toScanFolder: state.folders.toScanPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ScanActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanResultPage);

// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ScanActions from '../modules/scan/scanAction';
import { scan, FileProps, FilePropsDb } from '../api/filesystem';
import { findDb } from '../api/database';

import Scan from './Scan';

type Props = {
  scanProgress: (string, number) => void,
  startScan: () => void,
  endScan: () => void,
  scanExists: FileProps => void,
  scanNew: FileProps => void,
  scanModified: (FileProps, Map<string, Array<string | number | Date>>, FilePropsDb) => void,
  scanDuplicate: (FileProps, Arrays<FilePropsDb>) => void,
  scanAddRef: (file: FileProps, dbFile: FilePropsDb, scanType: string) => void,
  masterFolder: string,
  toScanFolder: string
};

class ScanPage extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.processFile = this.processFile.bind(this);
  }

  async processFile(fileProps: FileProps) {
    let occurences = await findDb(this.props.masterFolder, { _id: fileProps.id });
    if (occurences.length === 0) {
      // File not found in db... Search for files with similar properties
      occurences = await findDb(this.props.masterFolder, {
        name: fileProps.name
      });
      if (occurences.length === 0) {
        this.props.scanNew(fileProps);
      } else {
        this.props.scanDuplicate(fileProps, occurences);
        occurences.forEach(elt => {
          this.props.scanAddRef(fileProps, elt, ScanActions.CONST_SCAN_TYPE_DUPLICATE);
        });
      }
    } else {
      if (occurences.length > 1) {
        console.error(occurences);
        throw Error(`Multiple occurences from hash ${fileProps.id}!!`);
      }
      const inDb = occurences[0];
      const compared: Map<string, Array<string | number | Date>> = fileProps.compareSameHash(inDb);
      if (compared.size > 0) {
        this.props.scanModified(fileProps, compared, inDb);
        this.props.scanAddRef(fileProps, inDb, ScanActions.CONST_SCAN_TYPE_MODIFIED);
      } else {
        this.props.scanExists(fileProps);
        this.props.scanAddRef(fileProps, inDb, ScanActions.CONST_SCAN_TYPE_EXISTS);
      }
    }
  }

  async scan() {
    this.props.startScan();

    await scan(this.props.toScanFolder, this.processFile, this.props.scanProgress);

    this.props.endScan();
  }

  render() {
    return <Scan scan={this.scan.bind(this)} />;
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

export default connect(mapStateToProps, mapDispatchToProps)(ScanPage);

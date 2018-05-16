// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ScanActions from '../../modules/scan/scanAction';
import { doScan, FileProps, FilePropsDb } from '../../api/filesystem';

import ScanView from './ScanView';

type Props = {
  scanProgress: (string, number) => void,
  startScan: () => void,
  endScan: () => void,
  scanProcessFile: (fileProps: FileProps, oldDbFile: FilePropsDb | void) => void,
  toScanFolder: string
};

class ScanContainer extends Component<Props> {
  props: Props;

  async scan() {
    this.props.startScan();

    await doScan(this.props.toScanFolder, this.props.scanProcessFile, this.props.scanProgress);

    this.props.endScan();
  }

  render() {
    return <ScanView scan={this.scan.bind(this)} />;
  }
}

function mapStateToProps(state) {
  return {
    toScanFolder: state.folders.toScanPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ScanActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanContainer);

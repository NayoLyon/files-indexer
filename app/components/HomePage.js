// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { remote } from 'electron';
import Home from './Home';
import * as FoldersActions from '../modules/folders/foldersAction';

const { dialog } = remote;

type Props = {
  selectMaster: (folderPath: string) => void,
  selectToScan: (folderPath: string) => void,
  masterFolder: string,
  toScanFolder: string
};

/*
For UI,
See http://reactdesktop.js.org/docs/windows/window/
Or https://xel-toolkit.org/ for an alternative to React desktop
Or https://www.material-ui.com/#/get-started/required-knowledge ???
*/
class HomePage extends Component<Props> {
  props: Props;

  selectFolder(isMaster: boolean) {
    console.log(`selectFolder(${isMaster})`, this);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, this.setFolder(isMaster));
  }

  setFolder(isMaster: boolean) {
    return (filePaths: ?string[]) => {
      if (typeof filePaths !== 'object' || filePaths.length < 1) {
        return;
      }
      if (isMaster) {
        this.props.selectMaster(filePaths[0]);
      } else {
        this.props.selectToScan(filePaths[0]);
      }
    };
  }

  isScanPossible() {
    return (
      typeof this.props.masterFolder === 'string'
      && typeof this.props.toScanFolder === 'string'
      && this.props.masterFolder !== ''
      && this.props.toScanFolder !== ''
    );
  }

  render() {
    return (
      <Home
        selectFolder={this.selectFolder.bind(this)}
        isScanPossible={this.isScanPossible.bind(this)}
        masterFolder={this.props.masterFolder}
        toScanFolder={this.props.toScanFolder}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.folders.masterPath,
    toScanFolder: state.folders.toScanPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(FoldersActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

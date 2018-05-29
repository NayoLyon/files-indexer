// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import path from 'path';
import fs from 'fs';

import * as AnalyseActions from '../../modules/analyseDb/analyseAction';
import { openExplorerFor, openExplorerOn, deleteFile } from '../../utils/filesystem';

import AnalyseView from './AnalyseView';

type Props = {
  removeMissing: FilePropsDb => void,
  removeDuplicate: FilePropsDb => void,
  doAnalyse: string => void,
  masterFolder: string
};

class AnalyseContainer extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);

    if (this.props.masterFolder) {
      this.props.doAnalyse(this.props.masterFolder);
    }

    this.openDbFolderFor = this.openDbFolderFor.bind(this);
    this.removeInDb = this.removeInDb.bind(this);
    this.removeFile = this.removeFile.bind(this);
  }

  openDbFolderFor(file: FilePropsDb) {
    let filePath = path.resolve(this.props.masterFolder, file.relpath);
    if (fs.existsSync(filePath)) {
      openExplorerOn(filePath);
    } else {
      filePath = path.dirname(filePath);
      while (!fs.existsSync(filePath)) {
        filePath = path.dirname(filePath);
      }
      openExplorerFor(filePath);
    }
  }
  removeInDb(file: FilePropsDb) {
    this.props.removeMissing(file);
  }
  removeFile(file: FilePropsDb) {
    deleteFile(this.props.masterFolder, file.relpath);
    this.props.removeDuplicate(file);
  }

  render() {
    return (
      <AnalyseView
        openDbFolderFor={this.openDbFolderFor}
        removeInDb={this.removeInDb}
        removeFile={this.removeFile}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.foldersState.masterPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AnalyseActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnalyseContainer);

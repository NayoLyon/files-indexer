// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab, Menu, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { scanDbRef } from '../../modules/scan/scanReducer';
import { CONST_SCAN_TYPE_IDENTICAL, ConstScanType } from '../../modules/scan/scanAction';

import ResultTabNewView from './ResultTabNewView';
import ResultTabModifiedView from './ResultTabModifiedView';
import ResultTabDuplicateView from './ResultTabDuplicateView';
import ResultTabReferencesView from './ResultTabReferencesView';
import ResultTabIdenticalView from './ResultTabIdenticalView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttribute: (FileProps, FilePropsDb) => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb | void, ConstScanType) => void,
  removeAllFiles: ConstScanType => void,
  copyNameAttribute: (FileProps, FilePropsDb) => void,
  identicals: Array<{ file: FileProps, dbFile: FilePropsDb }>,
  newFiles: Array<FileProps>,
  modified: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>,
    dbFile: FilePropsDb
  }>,
  duplicates: Array<{ file: FileProps, matches: Array<FilePropsDb> }>,
  dbFilesRef: Map<string, scanDbRef>
};

class ResultView extends Component<Props> {
  props: Props;

  render() {
    const inlineStyles = {
      trashButtonStyle: { fontSize: '0.7rem', marginRight: '-0.8rem', marginLeft: '0.4rem' }
    };
    const panes = [];
    if (this.props.dbFilesRef.size > 0) {
      const duplicatefileRefs = [];
      this.props.dbFilesRef.forEach(value => {
        if (value.files.size > 1) {
          duplicatefileRefs.push(value);
        }
      });
      if (duplicatefileRefs.length > 0) {
        panes.push({
          menuItem: `Caution: several files refers to the same db file!! (${
            duplicatefileRefs.length
          })`,
          render: () => (
            <ResultTabReferencesView
              files={duplicatefileRefs}
              removeFile={this.props.removeFile}
              openDbFolderFor={this.props.openDbFolderFor}
              openFolderFor={this.props.openFolderFor}
            />
          )
        });
      }
    }
    if (this.props.identicals.length > 0) {
      panes.push({
        menuItem: (
          <Menu.Item key="identical">
            Identical files ({this.props.identicals.length})<Button
              icon="trash"
              style={inlineStyles.trashButtonStyle}
              onClick={() => {
                this.props.removeAllFiles(CONST_SCAN_TYPE_IDENTICAL);
              }}
            />
          </Menu.Item>
        ),
        render: () => (
          <ResultTabIdenticalView
            files={this.props.identicals}
            removeFile={this.props.removeFile}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
          />
        )
      });
    }
    if (this.props.newFiles.length > 0) {
      panes.push({
        menuItem: `New files (${this.props.newFiles.length})`,
        render: () => <ResultTabNewView files={this.props.newFiles} />
      });
    }
    if (this.props.modified.length > 0) {
      panes.push({
        menuItem: `Modified files (${this.props.modified.length})`,
        render: () => (
          <ResultTabModifiedView
            files={this.props.modified}
            copyModifiedAttribute={this.props.copyModifiedAttribute}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
            removeFile={this.props.removeFile}
            copyNameAttribute={this.props.copyNameAttribute}
          />
        )
      });
    }
    if (this.props.duplicates.length > 0) {
      panes.push({
        menuItem: `Possible duplicates (${this.props.duplicates.length})`,
        render: () => (
          <ResultTabDuplicateView
            files={this.props.duplicates}
            removeFile={this.props.removeFile}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
          />
        )
      });
    }
    return <Tab style={{ height: '100%' }} panes={panes} />;
  }
}

function mapStateToProps(state) {
  return {
    identicals: state.scanState.identicals,
    newFiles: state.scanState.newFiles,
    modified: state.scanState.modified,
    duplicates: state.scanState.duplicates,
    dbFilesRef: state.scanState.dbFilesRef
  };
}

export default connect(mapStateToProps)(ResultView);

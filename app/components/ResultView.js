// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../api/filesystem';
import { scanDbRef } from '../modules/scan/scan';
import { ConstScanType } from '../modules/scan/scanAction';

import ResultTabNewView from './ResultTabNewView';
import ResultTabModifiedView from './ResultTabModifiedView';
import ResultTabDuplicateView from './ResultTabDuplicateView';
import ResultTabReferencesView from './ResultTabReferencesView';
import ResultTabIdenticalView from './ResultTabIdenticalView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttribute: (FileProps, FilePropsDb) => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb, ConstScanType) => void,
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
            <ResultTabReferencesView id="scan_result_references" files={duplicatefileRefs} />
          )
        });
      }
    }
    if (this.props.identicals.length > 0) {
      panes.push({
        menuItem: `Identical files (${this.props.identicals.length})`,
        render: () => (
          <ResultTabIdenticalView
            id="scan_result_identical"
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
        render: () => <ResultTabNewView id="scan_result_new" files={this.props.newFiles} />
      });
    }
    if (this.props.modified.length > 0) {
      panes.push({
        menuItem: `Modified files (${this.props.modified.length})`,
        render: () => (
          <ResultTabModifiedView
            id="scan_result_modified"
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
            id="scan_result_duplicates"
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
    identicals: state.scan.identicals,
    newFiles: state.scan.newFiles,
    modified: state.scan.modified,
    duplicates: state.scan.duplicates,
    dbFilesRef: state.scan.dbFilesRef
  };
}

export default connect(mapStateToProps)(ResultView);

// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../api/filesystem';
import { scanDbRef } from '../modules/scan/scan';

import ScanResultTab from './ScanResultTab';
import ScanResultTabModified from './ScanResultTabModified';
import ScanResultTabDuplicate from './ScanResultTabDuplicate';
import ScanResultTabReferences from './ScanResultTabReferences';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttribute: (FileProps, FilePropsDb) => void,
  identicals: Array<FileProps>,
  newFiles: Array<FileProps>,
  modified: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>,
    dbFile: FilePropsDb
  }>,
  duplicates: Array<{ file: FileProps, matches: Arrays<FilePropsDb> }>,
  dbFilesRef: Map<string, scanDbRef>
};

class ScanResult extends Component<Props> {
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
            <ScanResultTabReferences id="scan_result_references" files={duplicatefileRefs} />
          )
        });
      }
    }
    if (this.props.identicals.length > 0) {
      panes.push({
        menuItem: `Identical files (${this.props.identicals.length})`,
        render: () => <ScanResultTab id="scan_result_identical" files={this.props.identicals} />
      });
    }
    if (this.props.newFiles.length > 0) {
      panes.push({
        menuItem: `New files (${this.props.newFiles.length})`,
        render: () => <ScanResultTab id="scan_result_new" files={this.props.newFiles} />
      });
    }
    if (this.props.modified.length > 0) {
      panes.push({
        menuItem: `Modified files (${this.props.modified.length})`,
        render: () => (
          <ScanResultTabModified
            id="scan_result_modified"
            files={this.props.modified}
            copyModifiedAttribute={this.props.copyModifiedAttribute}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
          />
        )
      });
    }
    if (this.props.duplicates.length > 0) {
      panes.push({
        menuItem: `Possible duplicates (${this.props.duplicates.length})`,
        render: () => (
          <ScanResultTabDuplicate id="scan_result_duplicates" files={this.props.duplicates} />
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

export default connect(mapStateToProps)(ScanResult);

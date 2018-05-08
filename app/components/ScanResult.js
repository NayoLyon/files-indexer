// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';
import { FileProps } from '../api/filesystem';
import ScanResultTab from './ScanResultTab';
import ScanResultTabModified from './ScanResultTabModified';
import ScanResultTabDuplicate from './ScanResultTabDuplicate';

type Props = {
  identicals: Array<FileProps>,
  newFiles: Array<FileProps>,
  modified: Array<{ file: FileProps, diff: Map<string, Array<string | number | Date>> }>,
  duplicates: Array<{ file: FileProps, matches: Arrays<FileProps> }>
};

class ScanResult extends Component<Props> {
  props: Props;

  render() {
    const panes = [];
    if (this.props.identicals.length > 0) {
      panes.push({
        menuItem: 'Identical files',
        render: () => <ScanResultTab id="scan_result_identical" files={this.props.identicals} />
      });
    }
    if (this.props.newFiles.length > 0) {
      panes.push({
        menuItem: 'New files',
        render: () => <ScanResultTab id="scan_result_new" files={this.props.newFiles} />
      });
    }
    if (this.props.modified.length > 0) {
      panes.push({
        menuItem: 'Modified files',
        render: () => (
          <ScanResultTabModified id="scan_result_modified" files={this.props.modified} />
        )
      });
    }
    if (this.props.duplicates.length > 0) {
      panes.push({
        menuItem: 'Possible duplicates',
        render: () => (
          <ScanResultTabDuplicate id="scan_result_duplicates" files={this.props.duplicates} />
        )
      });
    }
    return <Tab panes={panes} />;
  }
}

function mapStateToProps(state) {
  return {
    identicals: state.scan.identicals,
    newFiles: state.scan.newFiles,
    modified: state.scan.modified,
    duplicates: state.scan.duplicates
  };
}

export default connect(mapStateToProps)(ScanResult);

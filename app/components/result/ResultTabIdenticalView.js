// @flow
import React, { Component } from 'react';
import { Tab, List, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { CONST_SCAN_TYPE_IDENTICAL, ConstScanType } from '../../modules/scan/scanAction';

import ResultView from './ResultView';
import CompareDialogView from './CompareDialogView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb | void, ConstScanType) => void,
  files: Array<{ file: FileProps, dbFile: FilePropsDb }>
};

export default class ResultTabIdenticalView extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.state = { open: false, file: null, dbFile: null };
  }

  close() {
    this.setState({ open: false });
  }
  show(file, dbFile) {
    return () => this.setState({ file, dbFile, open: true });
  }

  renderFiles() {
    const { buttonGroupStyle } = ResultView.getStyles();
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const { file, dbFile } = this.props.files[i];
      res.push(
        <List.Item key={`file_${file.relpath}`}>
          <List.Content>
            <Button.Group style={buttonGroupStyle}>
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeFile(file, dbFile, CONST_SCAN_TYPE_IDENTICAL);
                }}
              />
              <Button icon="search" onClick={this.show(file, dbFile)} />
            </Button.Group>
            {file.relpath}
          </List.Content>
        </List.Item>
      );
    }
    return res;
  }
  render() {
    const { tabPaneStyle } = ResultView.getStyles();
    return (
      <Tab.Pane key="scan_result_identical" style={tabPaneStyle}>
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={this.state.file}
          dbFiles={this.state.dbFile}
          dbFilesFirst
        />
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

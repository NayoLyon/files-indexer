// @flow
import React, { Component } from 'react';
import { Tab, List, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../api/filesystem';
import { CONST_SCAN_TYPE_IDENTICAL, ConstScanType } from '../modules/scan/scanAction';

import CompareDialog from './result/CompareDialog';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: (FileProps, FilePropsDb, ConstScanType) => void,
  id: string,
  files: Array<{ file: FileProps, dbFile: FilePropsDb }>
};

export default class ScanResultTabIdentical extends Component<Props> {
  props: Props;
  static getStyles() {
    return {
      tabPaneStyle: {
        overflowY: 'auto',
        height: 'calc(100% - 3.5rem)'
      },
      buttonGroupStyle: {
        marginRight: '1rem'
      }
    };
  }

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
    const { buttonGroupStyle } = ScanResultTabIdentical.getStyles();
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const { file, dbFile } = this.props.files[i];
      res.push(
        <List.Item key={`${this.props.id}_file_${i}`}>
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
            {file.name}
          </List.Content>
        </List.Item>
      );
    }
    return res;
  }
  render() {
    const { tabPaneStyle } = ScanResultTabIdentical.getStyles();
    return (
      <Tab.Pane key={this.props.id} style={tabPaneStyle}>
        <CompareDialog
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={[this.state.file]}
          dbFile={this.state.dbFile}
        />
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

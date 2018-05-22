// @flow
import React, { Component } from 'react';
import { Tab, List, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { CONST_SCAN_TYPE_NEW, ConstScanType } from '../../modules/scan/scanAction';

import ResultView from './ResultView';

type Props = {
  openFolderFor: FileProps => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb | void, ConstScanType) => void,
  files: Array<FileProps>
};

export default class ResultTabNewView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const { buttonGroupStyle } = ResultView.getStyles();
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];
      res.push(
        <List.Item key={file.relpath}>
          <List.Content>
            <Button.Group style={buttonGroupStyle}>
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeFile(file, undefined, CONST_SCAN_TYPE_NEW);
                }}
              />
              <Button
                icon="external"
                onClick={() => {
                  this.props.openFolderFor(file);
                }}
              />
            </Button.Group>
            {file.relpath}
          </List.Content>
        </List.Item>
      );
    }
    return res;
  }
  render() {
    return (
      <Tab.Pane key="scan_result_new" style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { Tab, List, Button } from 'semantic-ui-react';
import { FileProps } from '../api/filesystem';

type Props = {
  removeFile: (FileProps, FilePropsDb) => void,
  id: string,
  files: Array<{ file: FileProps, dbFile: FilePropsDb }>
};

export default class ScanResultTabIdentical extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const { file, dbFile } = this.props.files[i];
      res.push(
        <List.Item key={`${this.props.id}_file_${i}`}>
          <List.Content>
            <Button
              icon="trash"
              onClick={() => {
                this.props.removeFile(file, dbFile);
              }}
            />
            <List.Header>{file.name}</List.Header>
          </List.Content>
        </List.Item>
      );
    }
    return res;
  }
  render() {
    return (
      <Tab.Pane key={this.props.id} style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { Tab, List } from 'semantic-ui-react';
import { FileProps } from '../api/filesystem';

type Props = {
  id: string,
  files: Array<FileProps>
};

export default class ScanResultTab extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];
      res.push(
        <List.Item key={`${this.props.id}_file_${i}`}>
          <List.Content>
            <List.Header>{file.name}</List.Header>
          </List.Content>
        </List.Item>
      );
    }
    return res;
  }
  render() {
    return (
      <Tab.Pane key={this.props.id} style={{overflowY: "auto", height: "calc(100% - 3.5rem)"}}>
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

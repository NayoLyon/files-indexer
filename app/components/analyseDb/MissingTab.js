// @flow
import React, { Component } from 'react';
import { Tab, List, Button } from 'semantic-ui-react';

import { FilePropsDb } from '../../api/filesystem';

import AnalyseView from './AnalyseView';

type Props = {
  removeInDb: FilePropsDb => void,
  openDbFolderFor: FilePropsDb => void,
  files: Array<FilePropsDb>
};

export default class MissingTab extends Component<Props> {
  props: Props;

  renderFiles() {
    const { buttonGroupStyle } = AnalyseView.getStyles();
    const res = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];
      res.push(
        <List.Item key={`file_${file.relpath}`}>
          <List.Content>
            <Button.Group style={buttonGroupStyle}>
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeInDb(file);
                }}
              />
              <Button
                icon="external"
                onClick={() => {
                  this.props.openDbFolderFor(file);
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
      <Tab.Pane key="missing">
        <List selection verticalAlign="middle">
          {this.renderFiles()}
        </List>
      </Tab.Pane>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FilePropsDb } from '../../api/filesystem';
import { printValue } from '../../utils/format';

import AnalyseView from './AnalyseView';

type Props = {
  removeFile: FilePropsDb => void,
  openDbFolderFor: FilePropsDb => void,
  files: Map<string, Array<FilePropsDb>>
};

export default class DuplicateTab extends Component<Props> {
  props: Props;

  renderFiles() {
    const { buttonGroupStyle } = AnalyseView.getStyles();
    const rows = [];
    const addMatchRow = file => {
      rows.push(
        <Table.Row key={`${file.relpath}`}>
          <Table.Cell textAlign="center">
            <Button.Group style={buttonGroupStyle}>
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeFile(file);
                }}
              />
              <Button
                icon="external"
                onClick={() => {
                  this.props.openDbFolderFor(file);
                }}
              />
            </Button.Group>
            {printValue(file, 'relpath')}
          </Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'modified')}</Table.Cell>
        </Table.Row>
      );
    };
    this.props.files.forEach((filesDuplicates, hash) => {
      const filesViewCopy = [...filesDuplicates];
      const firstFile = filesViewCopy.shift();

      rows.push(
        <Table.Row key={`${firstFile.relpath}`}>
          <Table.Cell textAlign="center" rowSpan={filesDuplicates.length}>
            {hash}
          </Table.Cell>
          <Table.Cell textAlign="center">
            <Button.Group style={buttonGroupStyle}>
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeFile(firstFile);
                }}
              />
              <Button
                icon="external"
                onClick={() => {
                  this.props.openDbFolderFor(firstFile);
                }}
              />
            </Button.Group>
            {printValue(firstFile, 'relpath')}
          </Table.Cell>
          <Table.Cell textAlign="center">{printValue(firstFile, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(firstFile, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center" />
        </Table.Row>
      );

      filesViewCopy.forEach(addMatchRow);
    });
    return rows;
  }
  render() {
    return (
      <Tab.Pane key="duplicate" style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <Table celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell rowSpan="2">Hash</Table.HeaderCell>
              <Table.HeaderCell colSpan="4">Possible matches in DB</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Relative path</Table.HeaderCell>
              <Table.HeaderCell>Size</Table.HeaderCell>
              <Table.HeaderCell>Modified date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderFiles()}</Table.Body>
        </Table>
      </Tab.Pane>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { Tab, Table } from 'semantic-ui-react';
import { FileProps } from '../api/filesystem';
import styles from './ScanResult.css';
import { printValue } from '../utils/format';

type Props = {
  id: string,
  files: Array<{ file: FileProps, matches: Arrays<FileProps> }>
};

export default class ScanResultTabDuplicate extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const rows = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];
      const { matches } = file;

      rows.push(
        <Table.Row key={`${this.props.id}_file_${i}_dir`}>
          <Table.Cell textAlign="center" rowSpan={matches.length + 1}>
            {file.file.name}
          </Table.Cell>
          <Table.Cell textAlign="center">In folder</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file.file.size)}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file.file.modified)}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file.file.relpath)}</Table.Cell>
        </Table.Row>
      );

      for (let m = 0; m < matches.length; m += 1) {
        rows.push(
          <Table.Row key={`${this.props.id}_file_${i}_${m}`}>
            <Table.Cell textAlign="center">Possible match {m + 1}</Table.Cell>
            <Table.Cell textAlign="center">{printValue(matches[m].size)}</Table.Cell>
            <Table.Cell textAlign="center">{printValue(matches[m].modified)}</Table.Cell>
            <Table.Cell textAlign="center">{printValue(matches[m].relpath)}</Table.Cell>
          </Table.Row>
        );
      }
    }
    return rows;
  }
  render() {
    return (
      <Tab.Pane key={this.props.id}>
        <Table className={styles.scrollableTable} celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell rowSpan="2">Name</Table.HeaderCell>
              <Table.HeaderCell rowSpan="2">Origin</Table.HeaderCell>
              <Table.HeaderCell colSpan="3">Possible matches in DB</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Size</Table.HeaderCell>
              <Table.HeaderCell>Modified date</Table.HeaderCell>
              <Table.HeaderCell>Relative path</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderFiles()}</Table.Body>
        </Table>
      </Tab.Pane>
    );
  }
}
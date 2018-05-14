// @flow
import React, { Component } from 'react';
import { Tab, Table } from 'semantic-ui-react';
import { scanDbRef } from '../modules/scan/scan';
import { printValue } from '../utils/format';

type Props = {
  id: string,
  files: Array<scanDbRef>
};

export default class ScanResultTabReferences extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const rows = [];
    let counter = 0;
    let i = 0;
    const addMatchRow = (val, key) => {
      counter += 1;
      rows.push(
        <Table.Row key={`${this.props.id}_file_${i}_${counter}`}>
          <Table.Cell textAlign="center">Possible match {counter}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(key, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(key, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(key, 'relpath')}</Table.Cell>
          <Table.Cell textAlign="center">{val}</Table.Cell>
        </Table.Row>
      );
    };
    for (; i < this.props.files.length; i += 1) {
      const { dbFile, files } = this.props.files[i];

      rows.push(
        <Table.Row key={`${this.props.id}_file_${i}_dir`}>
          <Table.Cell textAlign="center" rowSpan={files.size + 1}>
            {dbFile.name}
          </Table.Cell>
          <Table.Cell textAlign="center">In DB</Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'relpath')}</Table.Cell>
          <Table.Cell textAlign="center" />
        </Table.Row>
      );

      counter = 0;
      files.forEach(addMatchRow);
    }
    return rows;
  }
  render() {
    return (
      <Tab.Pane key={this.props.id} style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <Table celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell rowSpan="2">Name</Table.HeaderCell>
              <Table.HeaderCell rowSpan="2">Origin</Table.HeaderCell>
              <Table.HeaderCell colSpan="4">Possible matches in DB</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Size</Table.HeaderCell>
              <Table.HeaderCell>Modified date</Table.HeaderCell>
              <Table.HeaderCell>Relative path</Table.HeaderCell>
              <Table.HeaderCell>Ref type</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderFiles()}</Table.Body>
        </Table>
      </Tab.Pane>
    );
  }
}

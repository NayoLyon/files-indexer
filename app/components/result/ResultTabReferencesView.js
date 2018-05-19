// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { ConstScanType, CONST_SCAN_TYPE_DUPLICATE } from '../../modules/scan/scanAction';
import { scanDbRef } from '../../modules/scan/scanReducer';
import { printValue } from '../../utils/format';

import CompareDialogView from './CompareDialogView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb, ConstScanType) => void,
  files: Array<scanDbRef>
};

export default class ResultTabReferencesView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.state = { open: false, files: null, dbFile: null };
  }

  close() {
    this.setState({ open: false });
  }
  show(files, dbFile) {
    return () => this.setState({ files, dbFile, open: true });
  }

  renderFiles() {
    const rows = [];
    let counter = 0;
    let i = 0;
    const addMatchRow = dbFile => (scanType, file) => {
      counter += 1;
      const label = scanType === CONST_SCAN_TYPE_DUPLICATE ? "Possible match" : "Match";
      rows.push(
        <Table.Row key={`file_${dbFile.relpath}_${file.relpath}`}>
          <Table.Cell textAlign="center">
            <Button
              icon="external"
              onClick={() => {
                this.props.openFolderFor(file);
              }}
            />
            {label} {counter}
          </Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'relpath')}</Table.Cell>
          <Table.Cell textAlign="center">
            <Button
              icon="trash"
              onClick={() => {
                this.props.removeFile(file, dbFile, scanType);
              }}
            />
            {scanType}
          </Table.Cell>
        </Table.Row>
      );
    };
    for (; i < this.props.files.length; i += 1) {
      const { dbFile, files } = this.props.files[i];

      const filesView = [];
      files.forEach((scanType, file) => {
        filesView.push(file);
      });

      rows.push(
        <Table.Row key={`db_${dbFile.relpath}`}>
          <Table.Cell textAlign="center" rowSpan={files.size + 1}>
            <Button icon="search" onClick={this.show(filesView, dbFile)} />
            {dbFile.name}
          </Table.Cell>
          <Table.Cell textAlign="center">
            <Button
              icon="external"
              onClick={() => {
                this.props.openDbFolderFor(dbFile);
              }}
            />
            In DB
          </Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(dbFile, 'relpath')}</Table.Cell>
          <Table.Cell textAlign="center" />
        </Table.Row>
      );

      counter = 0;
      files.forEach(addMatchRow(dbFile));
    }
    return rows;
  }
  render() {
    return (
      <Tab.Pane key="scan_result_references" style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={this.state.files}
          dbFiles={this.state.dbFile}
          dbFilesFirst
        />
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

// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { CONST_SCAN_TYPE_DUPLICATE } from '../../modules/scan/scanAction';
import { scanDbRef } from '../../modules/scan/scanReducer';
import { printValue } from '../../utils/format';

import CompareDialogView from './CompareDialogView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: FileProps => void,
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
    const addMatchRow = dbFile => fileProps => {
      counter += 1;
      const label = fileProps.scanType === CONST_SCAN_TYPE_DUPLICATE ? 'Possible match' : 'Match';
      rows.push(
        <Table.Row key={`file_${dbFile.relpath}_${fileProps.relpath}`}>
          <Table.Cell textAlign="center">
            <Button
              icon="external"
              onClick={() => {
                this.props.openFolderFor(fileProps);
              }}
            />
            {label} {counter}
          </Table.Cell>
          <Table.Cell textAlign="center">{printValue(fileProps, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(fileProps, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(fileProps, 'relpath')}</Table.Cell>
          <Table.Cell textAlign="center">
            <Button
              icon="trash"
              onClick={() => {
                this.props.removeFile(fileProps);
              }}
            />
            {fileProps.scanType}
          </Table.Cell>
        </Table.Row>
      );
    };
    for (; i < this.props.files.length; i += 1) {
      const { dbFile, filesMatching } = this.props.files[i];

      const filesView = [];
      filesMatching.forEach(fileProps => {
        filesView.push(fileProps);
      });

      rows.push(
        <Table.Row key={`db_${dbFile.relpath}`}>
          <Table.Cell textAlign="center" rowSpan={filesMatching.size + 1}>
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
      filesMatching.forEach(addMatchRow(dbFile));
    }
    return rows;
  }
  render() {
    return (
      <Tab.Pane
        key="scan_result_references"
        style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}
      >
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          removeFile={this.props.removeFile}
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

// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';
import { CONST_SCAN_TYPE_DUPLICATE, ConstScanType } from '../../modules/scan/scanAction';
import { printValue } from '../../utils/format';

import CompareDialogView from './CompareDialogView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb | void, ConstScanType) => void,
  files: Array<{ file: FileProps, matches: Array<FilePropsDb> }>
};

export default class ResultTabDuplicateView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.state = { open: false, file: null, dbFiles: null };
  }

  close() {
    this.setState({ open: false });
  }
  show(file, dbFiles) {
    return () => this.setState({ file, dbFiles, open: true });
  }

  renderFiles() {
    const rows = [];
    for (let i = 0; i < this.props.files.length; i += 1) {
      const { file, matches } = this.props.files[i];

      rows.push(
        <Table.Row key={`folder_${file.relpath}`}>
          <Table.Cell textAlign="center" rowSpan={matches.length + 1}>
            <Button icon="search" onClick={this.show(file, matches)} />
            {file.name}
          </Table.Cell>
          <Table.Cell textAlign="center">In folder</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'size')}</Table.Cell>
          <Table.Cell textAlign="center">{printValue(file, 'modified')}</Table.Cell>
          <Table.Cell textAlign="center">
            {printValue(file, 'relpath')}
            <Button.Group>
              <Button
                icon="external"
                onClick={() => {
                  this.props.openFolderFor(file);
                }}
              />
              <Button
                icon="trash"
                onClick={() => {
                  this.props.removeFile(file, matches, CONST_SCAN_TYPE_DUPLICATE);
                }}
              />
            </Button.Group>
          </Table.Cell>
        </Table.Row>
      );

      for (let m = 0; m < matches.length; m += 1) {
        rows.push(
          <Table.Row key={`db_${file.relpath}_${matches[m].relpath}`}>
            <Table.Cell textAlign="center">Possible match {m + 1}</Table.Cell>
            <Table.Cell textAlign="center">{printValue(matches[m], 'size')}</Table.Cell>
            <Table.Cell textAlign="center">{printValue(matches[m], 'modified')}</Table.Cell>
            <Table.Cell textAlign="center">
              {printValue(matches[m], 'relpath')}
              <Button
                icon="external"
                onClick={() => {
                  this.props.openDbFolderFor(matches[m]);
                }}
              />
            </Table.Cell>
          </Table.Row>
        );
      }
    }
    return rows;
  }
  render() {
    return (
      <Tab.Pane key="scan_result_duplicates" style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={this.state.file}
          dbFiles={this.state.dbFiles}
        />
        <Table celled structured>
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
          {/* <Visibility
            as={Table.Body}
            continuous={false}
            once={false}
            onBottomVisible={() => console.log('This will call API')}
          >
            {this.renderFiles()}
          </Visibility> */}
          <Table.Body>{this.renderFiles()}</Table.Body>
        </Table>
      </Tab.Pane>
    );
  }
}

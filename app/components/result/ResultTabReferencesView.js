// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb, FilePropsDbDuplicates } from '../../api/filesystem';
import { CONST_SCAN_TYPE_DUPLICATE } from '../../modules/scan/scanAction';
import { printValue } from '../../utils/format';

import TableContainer from '../table/TableContainer';
import CompareDialogView from './CompareDialogView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  removeFile: FileProps => void,
  filesProps: Map<string, FileProps>,
  files: Array<FilePropsDbDuplicates>
};

class ResultTabReferencesView extends Component<Props> {
  props: Props;
  static computeHeader() {
    const headers = [];
    headers.push([
      {
        key: 'name',
        label: 'Name',
        colProps: { key: 'name' },
        rowSpan: 2,
        sortStyle: 'alphabet',
        sortKey: 'name'
      },
      {
        key: 'origin',
        label: 'Origin',
        colProps: { key: 'origin' },
        rowSpan: 2
      },
      {
        key: 'matches',
        label: 'Possible matches in DB',
        colSpan: 4
      }
    ]);
    headers.push([
      {
        key: 'size',
        label: 'Size',
        colProps: { key: 'size' }
      },
      {
        key: 'modified',
        label: 'Modified date',
        colProps: { key: 'modified' }
      },
      {
        key: 'relpath',
        label: 'Relative path',
        colProps: { key: 'relpath' }
      },
      {
        key: 'scanType',
        label: 'Ref type',
        colProps: { key: 'scanType' }
      }
    ]);
    return headers;
  }

  constructor(props) {
    super(props);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.matchRowRenderer = this.matchRowRenderer.bind(this);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.state = { open: false, files: undefined, dbFile: undefined };
  }

  close() {
    this.setState({ open: false });
  }
  show(files, dbFile) {
    return () => this.setState({ files, dbFile, open: true });
  }

  matchRowRenderer(dbFile, rows) {
    let counter = 0;
    return filePropsId => {
      const fileProps = this.props.filesProps.get(filePropsId);
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
  }
  rowRenderer(props) {
    const As = props.as;
    const { row } = props;

    const { relpath, name, filesMatching } = row;

    const rows = [
      <As key={`db_${relpath}`}>
        <Table.Cell textAlign="center" rowSpan={filesMatching.length + 1}>
          <Button icon="search" onClick={this.show(filesMatching, row)} />
          {name}
        </Table.Cell>
        <Table.Cell textAlign="center">
          <Button
            icon="external"
            onClick={() => {
              this.props.openDbFolderFor(row);
            }}
          />
          In DB
        </Table.Cell>
        <Table.Cell textAlign="center">{printValue(row, 'size')}</Table.Cell>
        <Table.Cell textAlign="center">{printValue(row, 'modified')}</Table.Cell>
        <Table.Cell textAlign="center">{printValue(row, 'relpath')}</Table.Cell>
        <Table.Cell textAlign="center" />
      </As>
    ];
    filesMatching.forEach(this.matchRowRenderer(row, rows));
    return rows;
  }
  render() {
    const headers = ResultTabReferencesView.computeHeader();
    return (
      <Tab.Pane key="scan_result_references" style={{ height: 'calc(100% - 3.5rem)' }}>
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
        <TableContainer
          data={this.props.files}
          headers={headers}
          rowKey="relpath"
          rowRenderer={this.rowRenderer}
          defaultSortKey="name"
          defaultPageSize={4}
          pageSizeList={[1, 2, 3, 4, 5, 10, 20]}
        />
      </Tab.Pane>
    );
  }
}

function mapStateToProps(state) {
  return {
    filesProps: state.resultState.filesProps
  };
}

export default connect(mapStateToProps)(ResultTabReferencesView);

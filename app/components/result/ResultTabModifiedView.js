// @flow
import React, { Component } from 'react';
import { Tab, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';

import CompareDialogView from './CompareDialogView';
import { printValue } from '../../utils/format';
import TableContainer from '../table/TableContainer';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttributeTo: (FileProps, FilePropsDb) => void,
  removeFile: FileProps => void,
  copyNameAttributeTo: (FileProps, FilePropsDb) => void,
  files: Array<FileProps>
};

export default class ResultTabModifiedView extends Component<Props> {
  props: Props;
  static filterNameDiffer(file) {
    return file.diff.includes('name');
  }
  static filterModifiedLess(file) {
    return (
      file.diff.includes('modified') && file.modified.getTime() < file.dbFiles[0].modified.getTime()
    );
  }
  static filterModifiedGreater(file) {
    return (
      file.diff.includes('modified') && file.modified.getTime() > file.dbFiles[0].modified.getTime()
    );
  }

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.renderDbFile = this.renderDbFile.bind(this);
    this.renderFile = this.renderFile.bind(this);
    this.state = { open: false, file: undefined, dbFile: undefined };
  }

  close() {
    this.setState({ open: false });
  }
  show(file) {
    return () => this.setState({ file, dbFile: file.dbFiles[0], open: true });
  }

  computeHeader() {
    const columnsName = ['relpath'];
    // To have a pretty table, I need to parse the files twice:
    // one to compute the columns, and the other to actually create the rows.
    for (let i = 0; i < this.props.files.length; i += 1) {
      this.props.files[i].diff.forEach(prop => {
        if (!columnsName.includes(prop)) {
          columnsName.push(prop);
        }
      });
    }

    const headers = [];
    headers.push(
      columnsName.reduce(
        (res, elt) => {
          res.push({
            key: `header_${elt}`,
            label: elt,
            colSpan: 2
          });
          return res;
        },
        [
          {
            key: 'header_main',
            label: 'Name',
            colProps: { key: 'name', textAlign: 'center' },
            rowSpan: 2,
            sortStyle: 'alphabet',
            sortKey: 'file.name'
          }
        ]
      )
    );
    headers.push(
      columnsName.reduce((res, elt) => {
        const sortStyle = elt === 'modified' ? '' : 'alphabet';
        res.push({
          key: `db_${elt}`,
          label: 'In DB',
          colProps: { key: `db_${elt}`, textAlign: 'left', verticalAlign: 'middle' },
          sortStyle,
          sortKey: `file.dbFiles[0].${elt}`
        });
        res.push({
          key: `folder_${elt}`,
          label: 'In folder',
          colProps: { key: `folder_${elt}`, textAlign: 'left' },
          sortStyle,
          sortKey: `file.${elt}`
        });
        return res;
      }, [])
    );
    return headers;
  }
  cellRenderer(props) {
    const As = props.as;
    const { row, column } = props;
    const { key, ...columnAttributes } = column;
    if (key.startsWith('db_')) {
      const prop = key.substr('db_'.length);
      return this.renderDbFile(As, row, prop, columnAttributes);
    } else if (key.startsWith('folder_')) {
      const prop = key.substr('folder_'.length);
      return this.renderFile(As, row, prop, columnAttributes);
    }
    // Else, this is name...
    return (
      <As {...columnAttributes}>
        <Button icon="search" key="search" onClick={this.show(row)} />
        {row.name}
      </As>
    );
  }
  renderDbFile(As, row, prop, columnAttributes) {
    const { diff } = row;
    const dbFile = row.dbFiles[0];
    if (diff.includes(prop) || prop === 'relpath') {
      const actionsDb =
        prop === 'relpath' ? (
          <Button
            icon="external"
            key="open"
            onClick={() => {
              this.props.openDbFolderFor(dbFile);
            }}
          />
        ) : null;
      return (
        <As {...columnAttributes}>
          {actionsDb}
          {printValue(dbFile, prop)}
        </As>
      );
    }
    return <As {...columnAttributes} colSpan={2} />;
  }
  renderFile(As, row, prop, columnAttributes) {
    const { diff } = row;
    const dbFile = row.dbFiles[0];
    if (diff.includes(prop) || prop === 'relpath') {
      let actionsFolder = null;
      if (prop === 'relpath') {
        actionsFolder = (
          <Button.Group key="group">
            <Button
              icon="external"
              onClick={() => {
                this.props.openFolderFor(row);
              }}
            />
            <Button
              icon="trash"
              onClick={() => {
                this.props.removeFile(row);
              }}
            />
          </Button.Group>
        );
      } else if (prop === 'modified') {
        const buttonColor = row.modified.getTime() < dbFile.modified.getTime() ? 'green' : 'orange';
        actionsFolder = (
          <Button
            icon="long arrow alternate left"
            key="copy"
            color={buttonColor}
            onClick={() => {
              this.props.copyModifiedAttributeTo(row, dbFile);
            }}
          />
        );
      } else if (prop === 'name') {
        actionsFolder = (
          <Button
            icon="long arrow alternate left"
            key="copy"
            onClick={() => {
              this.props.copyNameAttributeTo(row, dbFile);
            }}
          />
        );
      }
      return (
        <As {...columnAttributes}>
          {actionsFolder}
          {printValue(row, prop)}
        </As>
      );
    }
    return null;
  }
  render() {
    const headers = this.computeHeader();
    const filters = [
      {
        label: 'Name differs',
        color: 'grey',
        property: 'filterName',
        value: 'diff',
        filterFunc: ResultTabModifiedView.filterNameDiffer
      },
      {
        label: 'Modified less',
        color: 'green',
        property: 'filterModified',
        value: 'less',
        filterFunc: ResultTabModifiedView.filterModifiedLess
      },
      {
        label: 'Modified greater',
        color: 'orange',
        property: 'filterModified',
        value: 'greater',
        filterFunc: ResultTabModifiedView.filterModifiedGreater
      }
    ];
    return (
      <Tab.Pane key="scan_result_modified" style={{ height: 'calc(100% - 3.5rem)' }}>
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={this.state.file}
          dbFiles={this.state.dbFile}
          dbFilesFirst
        />
        <TableContainer
          data={this.props.files}
          headers={headers}
          rowKey="relpath"
          cellRenderer={this.cellRenderer.bind(this)}
          defaultSortKey="name"
          defaultPageSize={5}
          filters={filters}
        />
      </Tab.Pane>
    );
  }
}

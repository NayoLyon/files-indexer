// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../api/filesystem';
import { CONST_SCAN_TYPE_MODIFIED, ConstScanType } from '../modules/scan/scanAction';

import styles from './Scrollables.css';
import { printValue } from '../utils/format';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttribute: (FileProps, FilePropsDb) => void,
  removeFile: (FileProps, Array<FilePropsDb> | FilePropsDb, ConstScanType) => void,
  copyNameAttribute: (FileProps, FilePropsDb) => void,
  id: string,
  files: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>,
    dbFile: FilePropsDb
  }>
};

export default class ResultTabModifiedView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const columnsName = ['relpath'];
    const rows = [];
    // To have a pretty table, I need to parse the files twice:
    // one to compute the columns, and the other to actually create the rows.
    for (let i = 0; i < this.props.files.length; i += 1) {
      this.props.files[i].diff.forEach((val, key) => {
        if (!columnsName.includes(key)) {
          columnsName.push(key);
        }
      });
    }
    for (let i = 0; i < this.props.files.length; i += 1) {
      const { file, diff, dbFile } = this.props.files[i];

      const fileDiff = columnsName.reduce((prevVal, elt) => {
        const curDiff = diff.get(elt);
        if (curDiff || elt === 'relpath') {
          const actionsDb =
            elt === 'relpath' ? (
              <Button
                icon="external"
                onClick={() => {
                  this.props.openDbFolderFor(dbFile);
                }}
              />
            ) : null;
          let actionsFolder = null;
          if (elt === 'relpath') {
            actionsFolder = (
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
                    this.props.removeFile(file, dbFile, CONST_SCAN_TYPE_MODIFIED);
                  }}
                />
              </Button.Group>
            );
          } else if (elt === 'modified') {
            actionsFolder = (
              <Button
                icon="triangle left"
                color="green"
                onClick={() => {
                  this.props.copyModifiedAttribute(file, dbFile);
                }}
              />
            );
          } else if (elt === 'name') {
            actionsFolder = (
              <Button
                icon="triangle left"
                color="green"
                onClick={() => {
                  this.props.copyNameAttribute(file, dbFile);
                }}
              />
            );
          }
          prevVal.push(
            <Table.Cell
              key={`${this.props.id}_file_${i}_${elt}db`}
              textAlign="left"
              verticalAlign="middle"
            >
              {actionsDb}
              {printValue(dbFile, elt)}
            </Table.Cell>
          );
          prevVal.push(
            <Table.Cell key={`${this.props.id}_file_${i}_${elt}dir`} textAlign="left">
              {actionsFolder}
              {printValue(file, elt)}
            </Table.Cell>
          );
        } else {
          prevVal.push(
            <Table.Cell key={`${this.props.id}_file_${i}_${elt}`} colSpan="2" textAlign="left" />
          );
        }
        return prevVal;
      }, []);

      rows.push(
        <Table.Row key={`${this.props.id}_file_${i}`}>
          <Table.Cell key={`${this.props.id}_file_${i}_name`} textAlign="center">
            {file.name}
          </Table.Cell>
          {fileDiff}
        </Table.Row>
      );
    }
    const columns = columnsName.reduce((res, elt) => {
      res.push(
        <Table.HeaderCell key={`${this.props.id}_header_${elt}`} colSpan="2">
          {elt}
        </Table.HeaderCell>
      );
      return res;
    }, []);
    const detailColumns = columnsName.reduce((res, elt) => {
      res.push(<Table.HeaderCell key={`${this.props.id}_header_${elt}db`}>In DB</Table.HeaderCell>);
      res.push(
        <Table.HeaderCell key={`${this.props.id}_header_${elt}dir`}>In folder</Table.HeaderCell>
      );
      return res;
    }, []);
    return { columns, detailColumns, rows };
  }
  render() {
    const { columns, detailColumns, rows } = this.renderFiles();
    return (
      <Tab.Pane key={this.props.id} style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
        <Table className={styles.scrollableTable} celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell rowSpan="2">Name</Table.HeaderCell>
              {columns}
            </Table.Row>
            <Table.Row>{detailColumns}</Table.Row>
          </Table.Header>
          <Table.Body>{rows}</Table.Body>
        </Table>
      </Tab.Pane>
    );
  }
}

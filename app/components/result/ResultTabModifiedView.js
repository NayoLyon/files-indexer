// @flow
import React, { Component } from 'react';
import { Tab, Table, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';

import CompareDialogView from './CompareDialogView';
import styles from './Scrollables.css';
import { printValue } from '../../utils/format';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttributeTo: (FileProps, FilePropsDb) => void,
  removeFile: FileProps => void,
  copyNameAttributeTo: (FileProps, FilePropsDb) => void,
  files: Array<{
    file: FileProps,
    diff: Map<string, Array<string | number | Date>>
  }>
};

export default class ResultTabModifiedView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
    this.close = this.close.bind(this);
    this.show = this.show.bind(this);
    this.state = { open: false, file: null, dbFile: null };
  }

  close() {
    this.setState({ open: false });
  }
  show(file, dbFile) {
    return () => this.setState({ file, dbFile, open: true });
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
      const { file, diff } = this.props.files[i];
      const dbFile = file.dbFiles[0];

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
                    this.props.removeFile(file);
                  }}
                />
              </Button.Group>
            );
          } else if (elt === 'modified') {
            const buttonColor =
              file.modified.getTime() < dbFile.modified.getTime() ? 'green' : 'orange';
            actionsFolder = (
              <Button
                icon="long arrow left"
                color={buttonColor}
                onClick={() => {
                  this.props.copyModifiedAttributeTo(file, dbFile);
                }}
              />
            );
          } else if (elt === 'name') {
            actionsFolder = (
              <Button
                icon="long arrow left"
                onClick={() => {
                  this.props.copyNameAttributeTo(file, dbFile);
                }}
              />
            );
          }
          prevVal.push(
            <Table.Cell key={`db_${elt}`} textAlign="left" verticalAlign="middle">
              {actionsDb}
              {printValue(dbFile, elt)}
            </Table.Cell>
          );
          prevVal.push(
            <Table.Cell key={`folder_${elt}`} textAlign="left">
              {actionsFolder}
              {printValue(file, elt)}
            </Table.Cell>
          );
        } else {
          prevVal.push(<Table.Cell key={`both_${elt}`} colSpan="2" textAlign="left" />);
        }
        return prevVal;
      }, []);

      rows.push(
        <Table.Row key={file.relpath}>
          <Table.Cell key="main" textAlign="center">
            <Button icon="search" onClick={this.show(file, dbFile)} />
            {file.name}
          </Table.Cell>
          {fileDiff}
        </Table.Row>
      );
    }
    const columns = columnsName.reduce((res, elt) => {
      res.push(
        <Table.HeaderCell key={`header_${elt}`} colSpan="2">
          {elt}
        </Table.HeaderCell>
      );
      return res;
    }, []);
    const detailColumns = columnsName.reduce((res, elt) => {
      res.push(<Table.HeaderCell key={`db_${elt}`}>In DB</Table.HeaderCell>);
      res.push(<Table.HeaderCell key={`folder_${elt}`}>In folder</Table.HeaderCell>);
      return res;
    }, []);
    return { columns, detailColumns, rows };
  }
  render() {
    const { columns, detailColumns, rows } = this.renderFiles();
    return (
      <Tab.Pane
        key="scan_result_modified"
        style={{ overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}
      >
        <CompareDialogView
          open={this.state.open}
          close={this.close}
          openDbFolderFor={this.props.openDbFolderFor}
          openFolderFor={this.props.openFolderFor}
          files={this.state.file}
          dbFiles={this.state.dbFile}
          dbFilesFirst
        />
        <Table className={styles.scrollableTable} celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell key="header_main" rowSpan="2">
                Name
              </Table.HeaderCell>
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

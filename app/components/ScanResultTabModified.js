// @flow
import React, { Component } from 'react';
import { Tab, Table } from 'semantic-ui-react';
import { FileProps } from '../api/filesystem';
import styles from './ScanResult.css';
import { printValue } from '../utils/format';

type Props = {
  id: string,
  files: Array<{ file: FileProps, diff: Map<string, Array<string | number | Date>> }>
};

export default class ScanResultTabModified extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderFiles = this.renderFiles.bind(this);
  }

  renderFiles() {
    const columnsName = [];
    const rows = [];
    // To have a pretty table, I need to parse the files twice:
    // one to compute the columns, and the other to actually create the rows.
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];
      file.diff.forEach((val, key) => {
        if (!columnsName.includes(key)) {
          columnsName.push(key);
        }
      });
    }
    for (let i = 0; i < this.props.files.length; i += 1) {
      const file = this.props.files[i];

      const fileDiff = columnsName.reduce((prevVal, elt) => {
        const curDiff = file.diff.get(elt);
        if (curDiff) {
          prevVal.push(
            <Table.Cell key={`${this.props.id}_file_${i}_${elt}db`} textAlign="left">
              {printValue(curDiff[1])}
            </Table.Cell>
          );
          prevVal.push(
            <Table.Cell key={`${this.props.id}_file_${i}_${elt}dir`} textAlign="left">
              {printValue(curDiff[0])}
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
            {file.file.name}
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
      <Tab.Pane key={this.props.id}>
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

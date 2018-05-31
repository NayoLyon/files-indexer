// @flow
import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';

export type HeaderRowType = Array<{
  key: string,
  label: string,
  colProps?: {
    key: string,
    textAlign?: string,
    verticalAlign?: string
  },
  textAlign?: string,
  verticalAlign?: string,
  rowSpan?: number,
  colSpan?: number
}>;
export type HeaderType = HeaderRowType | Array<HeaderRowType>;

type Props = {
  cellRenderer: React.Component | ((*) => *),
  rowRenderer: React.Component | ((*) => *),
  headers: HeaderType,
  data: Array<>,
  rowKey: string
};

export default class TableView extends Component<Props> {
  props: Props;

  /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["columns"] }] */
  static renderHeaderRow(headerRow, key, columns) {
    const cells = [];
    let columnIndex = 0;
    headerRow.forEach(header => {
      const { label, colProps, ...attributes } = header;
      while (columns[columnIndex] && columns[columnIndex].rowSpan) {
        columns[columnIndex].rowSpan -= 1;
        columnIndex += 1;
      }
      if (columns.length <= columnIndex) {
        columns.push({ prop: null, rowSpan: attributes.rowSpan ? attributes.rowSpan - 1 : 0 });
      }
      if (colProps) {
        columns[columnIndex].prop = colProps;
      }
      columnIndex += 1;
      if (attributes.colSpan) {
        for (let i = 1; i < attributes.colSpan; i += 1) {
          if (columns.length <= columnIndex) {
            columns.push({ prop: null, rowSpan: attributes.rowSpan ? attributes.rowSpan - 1 : 0 });
          }
          columnIndex += 1;
        }
      }
      cells.push(<Table.HeaderCell {...attributes}>{label}</Table.HeaderCell>);
    });
    return <Table.Row key={`row_${key}`}>{cells}</Table.Row>;
  }
  static renderHeader(headers) {
    const tableHeader = [];
    const columns = [];

    if (headers[0] instanceof Array) {
      headers.forEach((headerRow, index) => {
        tableHeader.push(TableView.renderHeaderRow(headerRow, index, columns));
      });
    } else {
      tableHeader.push(TableView.renderHeaderRow(headers, 0, columns));
    }

    return { tableHeader, columns };
  }
  static renderRows(data, columns, valueGetter, CellRenderer, RowRenderer) {
    return data.map(row => (
      <RowRenderer
        as={Table.Row}
        key={valueGetter(row)}
        columns={columns}
        row={row}
        cellRenderer={CellRenderer}
      />
    ));
  }
  static computeValueGetter(rowKey) {
    const keyParts = rowKey.split('.');
    if (keyParts.length === 1) {
      const prop = keyParts[0];
      return row => row[prop];
    }
    return row =>
      keyParts.reduce(
        (obj, prop) => (!obj || typeof obj[prop] === 'undefined' ? null : obj[prop]),
        row
      );
  }
  render() {
    const { headers, cellRenderer, rowRenderer, data, rowKey, ...rest } = this.props;
    const { tableHeader, columns } = TableView.renderHeader(headers);
    const valueGetter = TableView.computeValueGetter(rowKey);
    return (
      <Table celled structured {...rest}>
        <Table.Header>{tableHeader}</Table.Header>
        <Table.Body>
          {TableView.renderRows(data, columns, valueGetter, cellRenderer, rowRenderer)}
        </Table.Body>
      </Table>
    );
  }
}

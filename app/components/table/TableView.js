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
  customRenderer: ({ row: *, column: string }) => *,
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
  static renderRows(data, columns, rowKey, customRenderer) {
    const rows = [];
    data.forEach(row => {
      rows.push(
        <Table.Row key={TableView.getKeyFromRow(row, rowKey)}>
          {columns.reduce((cells, col) => {
            const render = customRenderer({ row, column: col.prop.key });
            if (render) {
              const { content, ...attributes } = render;
              cells.push(
                <Table.Cell {...col.prop} {...attributes}>
                  {content}
                </Table.Cell>
              );
            }
            return cells;
          }, [])}
        </Table.Row>
      );
    });
    return rows;
  }
  static getKeyFromRow(row, rowKey) {
    const firstPartIndex = rowKey.indexOf('.');
    if (firstPartIndex < 0) {
      return row[rowKey];
    }
    const firstPart = rowKey.substr(0, firstPartIndex);
    return TableView.getKeyFromRow(row[firstPart], rowKey.substr(firstPartIndex + 1));
  }
  render() {
    const { headers, customRenderer, data, rowKey, ...rest } = this.props;
    const { tableHeader, columns } = TableView.renderHeader(headers);
    return (
      <Table celled structured {...rest}>
        <Table.Header>{tableHeader}</Table.Header>
        <Table.Body>{TableView.renderRows(data, columns, rowKey, customRenderer)}</Table.Body>
      </Table>
    );
  }
}

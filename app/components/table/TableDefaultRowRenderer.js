// @flow
import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';

type Props = {
  as: React.Element,
  cellRenderer: (* => *) | React.Component,
  columns: Array<{ prop: *, rowSpan: number }>,
  row: *
};

export default class TableDefaultRowRenderer extends Component<Props> {
  render() {
    const As = this.props.as;
    const CellRenderer = this.props.cellRenderer;
    return (
      <As>
        {this.props.columns.map(col => (
          <CellRenderer as={Table.Cell} key={col.prop.key} row={this.props.row} column={col.prop} />
        ))}
      </As>
    );
  }
}

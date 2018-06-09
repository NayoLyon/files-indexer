// @flow
import React, { Component } from 'react';
import type { Element } from 'react';

type Props = {
  as: Element,
  column: *,
  row: Array<>
};

export default class TableDefaultCellRenderer extends Component<Props> {
  render() {
    const As = this.props.as;
    const { row, column } = this.props;
    return <As {...column}>{row[column.key]}</As>;
  }
}

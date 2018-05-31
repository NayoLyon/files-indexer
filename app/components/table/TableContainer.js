// @flow
import React, { Component } from 'react';

import TableView, { HeaderType } from './TableView';
import TableDefaultRowRenderer from './TableDefaultRowRenderer';
import TableDefaultCellRenderer from './TableDefaultCellRenderer';

type Props = {
  cellRenderer?: (React.Component | ((*) => *)),
  rowRenderer?: (React.Component | ((*) => *)),
  headers: HeaderType,
  data: Array<>,
  rowKey: string
};

export default class TableContainer extends Component<Props> {
  props: Props;

  render() {
    const { data, ...rest } = this.props;

    return <TableView {...rest} data={data} />;
  }
}
TableContainer.defaultProps = {
  cellRenderer: TableDefaultCellRenderer,
  rowRenderer: TableDefaultRowRenderer
};

// @flow
import React, { Component } from 'react';

import TableView, { HeaderType } from './TableView';

type Props = {
  customRenderer: React.Component | ((*) => *),
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

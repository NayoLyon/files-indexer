// @flow
import React, { Component } from 'react';

import { sortList } from '../../utils/arraySort';

import TableView, { HeaderType } from './TableView';
import TableDefaultRowRenderer from './TableDefaultRowRenderer';
import TableDefaultCellRenderer from './TableDefaultCellRenderer';

type Props = {
  cellRenderer?: React.Component | ((*) => *),
  rowRenderer?: React.Component | ((*) => *),
  headers: HeaderType,
  data: Array<>,
  defaultSortKey?: string,
  defaultSortAscending?: boolean,
  rowKey: string
};

export default class TableContainer extends Component<Props> {
  props: Props;
  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {};

    if (nextProps.data !== prevState.originalData) {
      const sortedData = prevState.currentSort.key
        ? sortList([...nextProps.data], prevState.currentSort.key, prevState.currentSort.ascending)
        : nextProps.data;

      newState.data = sortedData;
      newState.originalData = nextProps.data;
    }

    return newState;
  }
  static getDefaultSort(props) {
    return !(props.defaultSortAscending === false);
  }

  constructor(props) {
    super(props);
    // Compute default Sort in constructor.
    // The default sort should not change, so it should never override the currentSort afterwards...
    const defaultSortAscending = TableContainer.getDefaultSort(props);
    this.state = {
      currentSort: {
        key: props.defaultSortKey,
        ascending: defaultSortAscending
      }
    };

    this.changeSort = this.changeSort.bind(this);
  }

  changeSort(key) {
    let newSortAscending = !this.state.currentSort.ascending;
    if (key !== this.state.currentSort.key) {
      newSortAscending = TableContainer.getDefaultSort(this.props);
    }
    this.setState({
      currentSort: { key, ascending: newSortAscending },
      data: sortList([...this.state.data], key, newSortAscending)
    });
  }

  render() {
    const { data, defaultSortKey, defaultSortAscending, ...rest } = this.props;

    return (
      <TableView
        {...rest}
        data={this.state.data}
        onSort={this.changeSort}
        sortKey={this.state.currentSort.key}
        sortAscending={this.state.currentSort.ascending}
      />
    );
  }
}
TableContainer.defaultProps = {
  cellRenderer: TableDefaultCellRenderer,
  rowRenderer: TableDefaultRowRenderer,
  defaultSortKey: '',
  defaultSortAscending: true
};

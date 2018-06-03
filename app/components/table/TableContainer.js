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
  rowKey: string,
  defaultPage?: number,
  defaultPageSize?: number,
  pageSizeList?: Array<number>
};

export default class TableContainer extends Component<Props> {
  props: Props;
  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {};

    if (nextProps.data !== prevState.originalData) {
      const sortedData = prevState.currentSort.key
        ? sortList([...nextProps.data], prevState.currentSort.key, prevState.currentSort.ascending)
        : nextProps.data;

      newState.sortedData = sortedData;
      newState.originalData = nextProps.data;
      if (prevState.pageSize > 0) {
        newState.page = TableContainer.getPage(sortedData, prevState.page, prevState.pageSize);
      }
    }

    return newState;
  }
  static getDefaultSort(props) {
    return !(props.defaultSortAscending === false);
  }
  static getPage(data, page, pageSize) {
    if (page < 1) {
      return 1;
    } else if (data.length <= (page - 1) * pageSize) {
      return Math.ceil(data.length / pageSize);
    }
    return page;
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
      },
      page: props.defaultPage,
      pageSize: props.defaultPageSize
    };

    this.changeSort = this.changeSort.bind(this);
    this.changePage = this.changePage.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.currentSort.key !== nextState.currentSort.key ||
      this.state.currentSort.ascending !== nextState.currentSort.ascending ||
      this.state.page !== nextState.page ||
      this.state.pageSize !== nextState.pageSize ||
      this.state.sortedData !== nextState.sortedData
    ) {
      return true;
    }
    return false;
  }

  changePage(page) {
    this.setState({
      page: TableContainer.getPage(this.state.sortedData, page, this.state.pageSize)
    });
  }
  changePageSize(pageSize) {
    this.setState({ pageSize });
  }
  changeSort(key) {
    let newSortAscending = !this.state.currentSort.ascending;
    if (key !== this.state.currentSort.key) {
      newSortAscending = TableContainer.getDefaultSort(this.props);
    }
    this.setState({
      currentSort: { key, ascending: newSortAscending },
      sortedData: sortList([...this.state.sortedData], key, newSortAscending)
    });
  }

  render() {
    const {
      data,
      defaultSortKey,
      defaultSortAscending,
      defaultPage,
      defaultPageSize,
      pageSizeList,
      ...rest
    } = this.props;
    let dataPage = this.state.sortedData;
    if (this.state.pageSize > 0 && this.state.sortedData.length > 0) {
      const endIndex = Math.min(
        this.state.page * this.state.pageSize,
        this.state.sortedData.length
      );
      const startIndex = Math.min((this.state.page - 1) * this.state.pageSize, endIndex);
      dataPage = this.state.sortedData.slice(startIndex, endIndex);
    }
    const pageSizes = this.props.pageSizeList.map(pageSize => ({
      text: `${pageSize}`,
      value: pageSize
    }));

    return (
      <TableView
        {...rest}
        data={dataPage}
        onSort={this.changeSort}
        sortKey={this.state.currentSort.key}
        sortAscending={this.state.currentSort.ascending}
        page={this.state.page}
        pageSize={this.state.pageSize}
        onPageChange={this.changePage}
        tableSize={this.state.sortedData.length}
        onPageSizeChange={this.changePageSize}
        pageSizes={pageSizes}
      />
    );
  }
}
TableContainer.defaultProps = {
  cellRenderer: TableDefaultCellRenderer,
  rowRenderer: TableDefaultRowRenderer,
  defaultSortKey: '',
  defaultSortAscending: true,
  defaultPage: 1,
  defaultPageSize: -1,
  pageSizeList: [5, 10, 20, 50]
};

// @flow
import React, { Component } from 'react';

import { sortList } from '../../utils/arraySort';

import TableView, { HeaderType, FilterType } from './TableView';
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
  filters?: Array<FilterType>,
  defaultPage?: number,
  defaultPageSize?: number,
  pageSizeList?: Array<number>
};

export default class TableContainer extends Component<Props> {
  props: Props;
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.data !== prevState.originalData) {
      const newState = TableContainer.filterAndSortData(prevState, nextProps);
      newState.originalData = nextProps.data;
      return newState;
    }

    return null;
  }
  /*
  This methods requires the following info:
    - state.filtersState
    - state.currentSort
    - state.page
    - state.pageSize
    - props.data
    - props.filters
   */
  static filterAndSortData(state, props) {
    const filteredData = props.filters.reduce(
      (data, filter) => {
        if (state.filtersState[filter.property] === filter.value) {
          return data.filter(filter.filterFunc);
        }
        return data;
      },
      [...props.data]
    );
    const filteredSortedData = state.currentSort.key
      ? sortList(filteredData, state.currentSort.key, state.currentSort.ascending)
      : filteredData;

    const newState = { filteredSortedData };
    if (state.pageSize > 0) {
      newState.page = TableContainer.getPage(filteredSortedData, state.page, state.pageSize);
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
      pageSize: props.defaultPageSize,
      filtersState: {}
    };

    this.props.filters.forEach(filter => {
      if (filter.isActive) {
        this.state.filtersState[filter.property] = filter.value;
      }
    });

    this.changeSort = this.changeSort.bind(this);
    this.changePage = this.changePage.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.currentSort.key !== nextState.currentSort.key ||
      this.state.currentSort.ascending !== nextState.currentSort.ascending ||
      this.state.page !== nextState.page ||
      this.state.pageSize !== nextState.pageSize ||
      this.state.filteredSortedData !== nextState.filteredSortedData
    ) {
      return true;
    }
    return false;
  }

  changePage(page) {
    this.setState({
      page: TableContainer.getPage(this.state.filteredSortedData, page, this.state.pageSize)
    });
  }
  changePageSize(pageSize) {
    const startIndex = (this.state.page - 1) * this.state.pageSize;
    const newPage = Math.ceil(startIndex / pageSize) + 1;
    this.setState({ pageSize, page: newPage });
  }
  changeSort(key) {
    let newSortAscending = !this.state.currentSort.ascending;
    if (key !== this.state.currentSort.key) {
      newSortAscending = TableContainer.getDefaultSort(this.props);
    }
    const newState = { currentSort: { key, ascending: newSortAscending } };
    const newStateData = TableContainer.filterAndSortData(
      { ...this.state, ...newState },
      this.props
    );
    this.setState({ ...newState, ...newStateData });
  }
  toggleFilter({ property, value }) {
    const newState = { filtersState: { ...this.state.filtersState } };
    if (newState.filtersState[property] === value) {
      newState.filtersState[property] = null;
    } else {
      newState.filtersState[property] = value;
    }
    const newStateData = TableContainer.filterAndSortData(
      { ...this.state, ...newState },
      this.props
    );
    this.setState({ ...newState, ...newStateData });
  }

  render() {
    const {
      data,
      defaultSortKey,
      defaultSortAscending,
      defaultPage,
      defaultPageSize,
      pageSizeList,
      filters,
      ...rest
    } = this.props;
    let dataPage = this.state.filteredSortedData;
    if (this.state.pageSize > 0 && this.state.filteredSortedData.length > 0) {
      const endIndex = Math.min(
        this.state.page * this.state.pageSize,
        this.state.filteredSortedData.length
      );
      const startIndex = Math.min((this.state.page - 1) * this.state.pageSize, endIndex);
      dataPage = this.state.filteredSortedData.slice(startIndex, endIndex);
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
        tableSize={this.state.filteredSortedData.length}
        onPageSizeChange={this.changePageSize}
        filters={filters}
        filtersState={this.state.filtersState}
        toggleFilter={this.toggleFilter}
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
  pageSizeList: [5, 10, 20, 50],
  filters: []
};

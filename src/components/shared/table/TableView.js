import React, { Component } from "react";
import { Table, Icon, Pagination, Dropdown, Container, Button } from "semantic-ui-react";

import { computeValueGetter } from "../../../utils/arraySort";

export default class TableView extends Component {
	static getSort(sortStyle, sortKey, propsSort) {
		let sortIconName = "alphabet ";
		if (typeof sortStyle !== "undefined") {
			if (sortStyle.length > 0) {
				sortIconName = `${sortStyle} `;
			} else {
				sortIconName = "";
			}
		}

		if (propsSort.sortKey !== sortKey || propsSort.sortAscending) {
			sortIconName = `${sortIconName}ascending`;
		} else {
			sortIconName = `${sortIconName}descending`;
		}

		let sortRender = null;
		let sortClick = null;

		if (sortKey) {
			sortRender = (
				<Icon
					name={`sort ${sortIconName}`}
					disabled={propsSort.sortKey !== sortKey}
					style={{ marginLeft: "0.5rem" }}
				/>
			);
			sortClick = () => propsSort.onSort(sortKey);
		}
		return { sortRender, sortClick };
	}
	/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["howToRenderRows"] }] */
	static renderHeaderRow(headerRow, key, howToRenderRows, propsSort) {
		const cells = [];
		let columnIndex = 0;
		headerRow.forEach(header => {
			const { label, colProps, sortStyle, sortKey, ...attributes } = header;
			const { sortRender, sortClick } = TableView.getSort(sortStyle, sortKey, propsSort);

			while (howToRenderRows[columnIndex] && howToRenderRows[columnIndex].rowSpan) {
				howToRenderRows[columnIndex].rowSpan -= 1;
				columnIndex += 1;
			}
			if (howToRenderRows.length <= columnIndex) {
				howToRenderRows.push({
					prop: null,
					rowSpan: attributes.rowSpan ? attributes.rowSpan - 1 : 0
				});
			}
			if (colProps) {
				howToRenderRows[columnIndex].prop = colProps;
			}
			columnIndex += 1;
			if (attributes.colSpan) {
				for (let i = 1; i < attributes.colSpan; i += 1) {
					if (howToRenderRows.length <= columnIndex) {
						howToRenderRows.push({
							prop: null,
							rowSpan: attributes.rowSpan ? attributes.rowSpan - 1 : 0
						});
					}
					columnIndex += 1;
				}
			}
			cells.push(
				<Table.HeaderCell {...attributes} onClick={sortClick}>
					{label}
					{sortRender}
				</Table.HeaderCell>
			);
		});
		return <Table.Row key={`row_${key}`}>{cells}</Table.Row>;
	}
	static renderHeader(headers, propsSort) {
		const tableHeader = [];
		const howToRenderRows = [];

		if (headers[0] instanceof Array) {
			headers.forEach((headerRow, index) => {
				tableHeader.push(
					TableView.renderHeaderRow(headerRow, index, howToRenderRows, propsSort)
				);
			});
		} else {
			tableHeader.push(TableView.renderHeaderRow(headers, 0, howToRenderRows, propsSort));
		}

		return { tableHeader, howToRenderRows };
	}
	static renderRows(data, howToRenderRows, valueGetter, CellRenderer, RowRenderer) {
		return data.map(row => (
			<RowRenderer
				as={Table.Row}
				key={valueGetter(row)}
				columns={howToRenderRows}
				row={row}
				cellRenderer={CellRenderer}
			/>
		));
	}
	static renderFiltersButton(filters, filtersState, toggleFilter) {
		return filters.map(filter => (
			<Button
				key={`${filter.property}_${filter.value}`}
				toggle
				color={filter.color}
				style={filtersState[filter.property] === filter.value ? { color: "#BBBBBB" } : {}}
				onClick={() => toggleFilter(filter)}
			>
				{filter.label}
			</Button>
		));
	}

	render() {
		const {
			headers,
			rowKey,
			rowRenderer,
			cellRenderer,
			data,
			sortKey,
			sortAscending,
			onSort,
			page,
			pageSize,
			onPageChange,
			tableSize,
			onPageSizeChange,
			pageSizes,
			filters,
			filtersState,
			toggleFilter,
			...rest
		} = this.props;
		const { tableHeader, howToRenderRows } = TableView.renderHeader(headers, {
			sortKey,
			sortAscending,
			onSort
		});
		const valueGetter = computeValueGetter(rowKey);
		let headerSize = 0;
		let pagination = null;
		if (pageSize > 0) {
			headerSize += 3.5;
			const totalPages = Math.ceil(tableSize / pageSize);
			pagination = (
				<React.Fragment>
					<Pagination
						activePage={page}
						ellipsisItem={{ content: <Icon name="ellipsis horizontal" />, icon: true }}
						firstItem={{ content: <Icon name="angle double left" />, icon: true }}
						lastItem={{ content: <Icon name="angle double right" />, icon: true }}
						prevItem={{ content: <Icon name="angle left" />, icon: true }}
						nextItem={{ content: <Icon name="angle right" />, icon: true }}
						totalPages={totalPages}
						onPageChange={(e, { activePage }) => onPageChange(activePage)}
					/>
					<Dropdown
						style={{ float: "right" }}
						compact
						selection
						value={pageSize}
						options={pageSizes}
						onChange={(e, target) => onPageSizeChange(target.value)}
					/>
				</React.Fragment>
			);
		}
		let filterContainer = null;
		if (this.props.filters.length) {
			headerSize += 3.5;
			filterContainer = (
				<Container textAlign="center" style={{ height: "3rem" }}>
					{TableView.renderFiltersButton(filters, filtersState, toggleFilter)}
				</Container>
			);
		}
		return (
			<React.Fragment>
				{filterContainer}
				{pagination}
				<div
					style={{
						overflowY: "auto",
						width: "100%",
						height: `calc(100% - ${headerSize}rem)`,
						padding: "1rem",
						position: "absolute",
						bottom: 0,
						left: 0
					}}
				>
					<Table celled structured {...rest}>
						<Table.Header>{tableHeader}</Table.Header>
						<Table.Body>
							{TableView.renderRows(
								data,
								howToRenderRows,
								valueGetter,
								cellRenderer,
								rowRenderer
							)}
						</Table.Body>
					</Table>
				</div>
			</React.Fragment>
		);
	}
}

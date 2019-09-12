import React, { Component } from "react";
import { Table } from "semantic-ui-react";

import { printValue } from "../../utils/format";

class IndexationAnomaliesView extends Component {
	static renderAnomaly(dupFile, relpath, listItems) {
		const { dbFile, file, diff } = dupFile;
		let isFirst = true;
		diff.forEach(prop => {
			let mainCell = null;
			if (isFirst) {
				mainCell = (
					<Table.Cell key="relpath" textAlign="center" rowSpan={diff.size}>
						{relpath}
					</Table.Cell>
				);
			}
			let rowContent;
			if (prop === "new") {
				rowContent = [
					<Table.Cell key="prop" textAlign="center">
						{prop}
					</Table.Cell>,
					<Table.Cell key="filevalue" textAlign="center" />,
					<Table.Cell key="dbvalue" />
				];
			} else {
				rowContent = [
					<Table.Cell key="prop" textAlign="center">
						{prop}
					</Table.Cell>,
					<Table.Cell key="filevalue" textAlign="center">
						{printValue(file, prop)}
					</Table.Cell>,
					<Table.Cell key="dbvalue" textAlign="center">
						{printValue(dbFile, prop)}
					</Table.Cell>
				];
			}
			/* eslint-disable react/no-array-index-key */
			listItems.push(
				<Table.Row key={`${relpath}_${prop}`}>
					{mainCell}
					{rowContent}
				</Table.Row>
			);
			/* eslint-enable react/no-array-index-key */
			isFirst = false;
		});
	}

	render() {
		if (this.props.duplicates.size === 0) {
			return null;
		}

		const listItems = [];
		this.props.duplicates.forEach((dupFile, relpath) => {
			IndexationAnomaliesView.renderAnomaly(dupFile, relpath, listItems);
		});

		return (
			<Table>
				<Table.Body>{listItems}</Table.Body>
			</Table>
		);
	}
}

export default IndexationAnomaliesView;

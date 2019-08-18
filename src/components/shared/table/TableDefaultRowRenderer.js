import React, { Component } from "react";
import { Table } from "semantic-ui-react";

export default class TableDefaultRowRenderer extends Component {
	render() {
		const As = this.props.as;
		const CellRenderer = this.props.cellRenderer;
		return (
			<As>
				{this.props.columns.map(col => (
					<CellRenderer
						as={Table.Cell}
						key={col.prop.key}
						row={this.props.row}
						column={col.prop}
					/>
				))}
			</As>
		);
	}
}

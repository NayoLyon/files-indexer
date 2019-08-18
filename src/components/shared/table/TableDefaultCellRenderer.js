import React, { Component } from "react";

export default class TableDefaultCellRenderer extends Component {
	render() {
		const As = this.props.as;
		const { row, column } = this.props;
		return <As {...column}>{row[column.key]}</As>;
	}
}

import React, { Component } from "react";
import { connect } from "react-redux";
import { Tab, Table, Button } from "semantic-ui-react";

import { CONST_SCAN_TYPE_DUPLICATE } from "../scan/Scanner";
import { printValue } from "../../utils/format";

import TableContainer from "../shared/table/TableContainer";
import CompareDialogView from "./CompareDialogView";

class ResultTabReferencesView extends Component {
	static computeHeader() {
		const headers = [];
		headers.push([
			{
				key: "name",
				label: "Name",
				colProps: { key: "name" },
				rowSpan: 2,
				sortStyle: "alphabet",
				sortKey: "name"
			},
			{
				key: "origin",
				label: "Origin",
				colProps: { key: "origin" },
				rowSpan: 2
			},
			{
				key: "matches",
				label: "Possible matches in DB",
				colSpan: 4
			}
		]);
		headers.push([
			{
				key: "size",
				label: "Size",
				colProps: { key: "size" }
			},
			{
				key: "modifiedMs",
				label: "Modified date",
				colProps: { key: "modifiedMs" }
			},
			{
				key: "relpath",
				label: "Relative path",
				colProps: { key: "relpath" }
			},
			{
				key: "scanType",
				label: "Ref type",
				colProps: { key: "scanType" }
			}
		]);
		return headers;
	}

	constructor(props) {
		super(props);
		this.rowRenderer = this.rowRenderer.bind(this);
		this.matchRowRenderer = this.matchRowRenderer.bind(this);
		this.close = this.close.bind(this);
		this.show = this.show.bind(this);
		this.state = { open: false, files: undefined, dbFile: undefined };
	}

	close() {
		this.setState({ open: false });
	}

	show(filesId, dbFile) {
		const { filesProps } = this.props;
		const files = Array.from(filesId).map(fileId => filesProps.get(fileId));
		return () => this.setState({ files, dbFile, open: true });
	}

	matchRowRenderer(dbFile, rows) {
		const { filesProps, openFolderFor, removeFile } = this.props;
		let counter = 0;
		return filePropsId => {
			const fileProps = filesProps.get(filePropsId);
			if (!fileProps) {
				console.error("FilePropsId does not exist anymore", filePropsId);
				return;
			}
			counter += 1;
			const label =
				fileProps.scanType === CONST_SCAN_TYPE_DUPLICATE ? "Possible match" : "Match";
			rows.push(
				<Table.Row key={`file_${dbFile.relpath}_${fileProps.relpath}`}>
					<Table.Cell textAlign="center">
						<Button
							icon="external"
							onClick={() => {
								openFolderFor(fileProps);
							}}
						/>
						{label} {counter}
					</Table.Cell>
					<Table.Cell textAlign="center">{printValue(fileProps, "size")}</Table.Cell>
					<Table.Cell textAlign="center">
						{printValue(fileProps, "modifiedMs")}
					</Table.Cell>
					<Table.Cell textAlign="center">{printValue(fileProps, "relpath")}</Table.Cell>
					<Table.Cell textAlign="center">
						<Button
							icon="trash"
							onClick={() => {
								removeFile(fileProps);
							}}
						/>
						{fileProps.scanType}
					</Table.Cell>
				</Table.Row>
			);
		};
	}

	rowRenderer(props) {
		const As = props.as;
		const { row } = props;
		const { openDbFolderFor } = this.props;

		const { relpath, name, filesMatching } = row;

		const rows = [
			<As key={`db_${relpath}`}>
				<Table.Cell textAlign="center" rowSpan={filesMatching.size + 1}>
					<Button icon="search" onClick={this.show(filesMatching, row)} />
					{name}
				</Table.Cell>
				<Table.Cell textAlign="center">
					<Button
						icon="external"
						onClick={() => {
							openDbFolderFor(row);
						}}
					/>
					In DB
				</Table.Cell>
				<Table.Cell textAlign="center">{printValue(row, "size")}</Table.Cell>
				<Table.Cell textAlign="center">{printValue(row, "modifiedMs")}</Table.Cell>
				<Table.Cell textAlign="center">{printValue(row, "relpath")}</Table.Cell>
				<Table.Cell textAlign="center" />
			</As>
		];
		filesMatching.forEach(this.matchRowRenderer(row, rows));
		return rows;
	}

	render() {
		const headers = ResultTabReferencesView.computeHeader();
		const { open, files, dbFile } = this.state;
		const { openDbFolderFor, openFolderFor, removeFile, files: filesFromProps } = this.props;
		return (
			<Tab.Pane key="scan_result_references" style={{ height: "calc(100% - 3.5rem)" }}>
				<CompareDialogView
					open={open}
					close={this.close}
					openDbFolderFor={openDbFolderFor}
					openFolderFor={openFolderFor}
					removeFile={removeFile}
					files={files}
					dbFiles={dbFile}
					dbFilesFirst
				/>
				<TableContainer
					data={filesFromProps}
					headers={headers}
					rowKey="relpath"
					rowRenderer={this.rowRenderer}
					defaultSortKey="name"
					defaultPageSize={4}
					pageSizeList={[1, 2, 3, 4, 5, 10, 20]}
				/>
			</Tab.Pane>
		);
	}
}

function mapStateToProps(state) {
	return {
		filesProps: state.resultState.filesProps
	};
}

export default connect(mapStateToProps)(ResultTabReferencesView);

import React, { Component } from "react";
import { Tab, Table, Button } from "semantic-ui-react";

import { printValue } from "../../utils/format";

import CompareDialogView from "./CompareDialogView";

export default class ResultTabDuplicateView extends Component {
	constructor(props) {
		super(props);
		this.renderFiles = this.renderFiles.bind(this);
		this.close = this.close.bind(this);
		this.show = this.show.bind(this);
		this.state = { open: false, file: undefined, dbFiles: undefined };
	}

	close() {
		this.setState({ open: false });
	}
	show(file, dbFiles) {
		return () => this.setState({ file, dbFiles, open: true });
	}

	renderFiles() {
		const rows = [];
		for (let i = 0; i < this.props.files.length; i += 1) {
			const file = this.props.files[i];

			rows.push(
				<Table.Row key={`folder_${file.relpath}`}>
					<Table.Cell textAlign="center" rowSpan={file.dbFiles.length + 1}>
						<Button icon="search" onClick={this.show(file, file.dbFiles)} />
						{file.name}
					</Table.Cell>
					<Table.Cell textAlign="center">In folder</Table.Cell>
					<Table.Cell textAlign="center">{printValue(file, "size")}</Table.Cell>
					<Table.Cell textAlign="center">{printValue(file, "modifiedMs")}</Table.Cell>
					<Table.Cell textAlign="center">
						{printValue(file, "relpath")}
						<Button.Group>
							<Button
								icon="external"
								onClick={() => {
									this.props.openFolderFor(file);
								}}
							/>
							<Button
								icon="trash"
								onClick={() => {
									this.props.removeFile(file);
								}}
							/>
						</Button.Group>
					</Table.Cell>
				</Table.Row>
			);

			for (let m = 0; m < file.dbFiles.length; m += 1) {
				rows.push(
					<Table.Row key={`db_${file.relpath}_${file.dbFiles[m].relpath}`}>
						<Table.Cell textAlign="center">Possible match {m + 1}</Table.Cell>
						<Table.Cell textAlign="center">
							{printValue(file.dbFiles[m], "size")}
						</Table.Cell>
						<Table.Cell textAlign="center">
							{printValue(file.dbFiles[m], "modifiedMs")}
						</Table.Cell>
						<Table.Cell textAlign="center">
							{printValue(file.dbFiles[m], "relpath")}
							<Button
								icon="external"
								onClick={() => {
									this.props.openDbFolderFor(file.dbFiles[m]);
								}}
							/>
						</Table.Cell>
					</Table.Row>
				);
			}
		}
		return rows;
	}
	render() {
		return (
			<Tab.Pane
				key="scan_result_duplicates"
				style={{ overflowY: "auto", height: "calc(100% - 3.5rem)" }}
			>
				<CompareDialogView
					open={this.state.open}
					close={this.close}
					openDbFolderFor={this.props.openDbFolderFor}
					openFolderFor={this.props.openFolderFor}
					files={this.state.file}
					dbFiles={this.state.dbFiles}
				/>
				<Table celled structured>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell rowSpan="2">Name</Table.HeaderCell>
							<Table.HeaderCell rowSpan="2">Origin</Table.HeaderCell>
							<Table.HeaderCell colSpan="3">Possible matches in DB</Table.HeaderCell>
						</Table.Row>
						<Table.Row>
							<Table.HeaderCell>Size</Table.HeaderCell>
							<Table.HeaderCell>Modified date</Table.HeaderCell>
							<Table.HeaderCell>Relative path</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					{/* <Visibility
            as={Table.Body}
            continuous={false}
            once={false}
            onBottomVisible={() => console.log('This will call API')}
          >
            {this.renderFiles()}
          </Visibility> */}
					<Table.Body>{this.renderFiles()}</Table.Body>
				</Table>
			</Tab.Pane>
		);
	}
}

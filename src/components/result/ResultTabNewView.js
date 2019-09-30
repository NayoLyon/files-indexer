import React, { Component } from "react";
import { Tab, List, Button } from "semantic-ui-react";

import ResultView from "./ResultView";
import CompareDialogView from "./CompareDialogView";

export default class ResultTabNewView extends Component {
	constructor(props) {
		super(props);
		this.renderFiles = this.renderFiles.bind(this);
		this.close = this.close.bind(this);
		this.show = this.show.bind(this);
		this.state = { open: false, file: undefined };
	}

	close() {
		this.setState({ open: false });
	}
	show(file) {
		return () => {
			console.log("Show modal ??");
			this.setState({ file, open: true });
		};
	}

	renderFiles() {
		const { buttonGroupStyle } = ResultView.getStyles();
		const res = [];
		for (let i = 0; i < this.props.files.length; i += 1) {
			const file = this.props.files[i];
			res.push(
				<List.Item key={file.relpath}>
					<List.Content>
						<Button.Group style={buttonGroupStyle}>
							<Button
								icon="trash"
								onClick={() => {
									this.props.removeFile(file);
								}}
							/>
							<Button
								icon="external"
								onClick={() => {
									this.props.openFolderFor(file);
								}}
							/>
							<Button icon="search" onClick={this.show(file)} />
						</Button.Group>
						{file.relpath}
					</List.Content>
				</List.Item>
			);
		}
		return res;
	}
	render() {
		return (
			<Tab.Pane
				key="scan_result_new"
				style={{ overflowY: "auto", height: "calc(100% - 3.5rem)" }}
			>
				<CompareDialogView
					open={this.state.open}
					close={this.close}
					files={this.state.file}
				/>
				<List selection verticalAlign="middle">
					{this.renderFiles()}
				</List>
			</Tab.Pane>
		);
	}
}

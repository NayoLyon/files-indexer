import React, { Component } from "react";
import { Tab, List, Button } from "semantic-ui-react";

import { buttonGroupStyle } from "./AnalyzeView";

export default class MissingTab extends Component {
	renderFiles() {
		const res = [];
		for (let i = 0; i < this.props.files.length; i += 1) {
			const file = this.props.files[i];
			res.push(
				<List.Item key={`file_${file.relpath}`}>
					<List.Content>
						<Button.Group style={buttonGroupStyle}>
							<Button
								icon="trash"
								onClick={() => {
									this.props.removeInDb(file);
								}}
							/>
							<Button
								icon="external"
								onClick={() => {
									this.props.openDbFolderFor(file);
								}}
							/>
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
			<Tab.Pane key="missing">
				<List selection verticalAlign="middle">
					{this.renderFiles()}
				</List>
			</Tab.Pane>
		);
	}
}

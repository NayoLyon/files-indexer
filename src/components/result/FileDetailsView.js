import React, { Component } from "react";
import { Image, Card, Icon, Button, Label } from "semantic-ui-react";
import { lookup } from "mime-types";

import { printValue } from "../../utils/format";

const electron = window.require("electron");
const path = electron.remote.require("path");

export default class FileDetailsView extends Component {
	static inlineStyles = {
		card: {
			margin: "1em",
			flex: "1 1"
		},
		genericHeaderStyles: {
			color: "red",
			fontWeight: "bolder"
		}
	};

	constructor(props) {
		super(props);
		this.getProp = this.getProp.bind(this);
		this.computePreview = this.computePreview.bind(this);
	}
	getProp(prop) {
		return this.props.file ? printValue(this.props.file, prop) : "";
	}
	computePreview() {
		const { rootPath } = this.props;
		const mimeType = lookup(this.getProp("name"));
		const adjustStyle = {
			objectFit: "contain",
			maxHeight: "50vh"
		};
		if (mimeType.match("^image/")) {
			return (
				<Image
					style={adjustStyle}
					size="huge"
					src={path.resolve(rootPath, this.getProp("relpath"))}
				/>
			);
		}
		return (
			<Card.Header style={FileDetailsView.inlineStyles.genericHeaderStyles}>
				{mimeType}
			</Card.Header>
		);
	}

	render() {
		let actions = null;
		if (this.props.removeFile) {
			actions = (
				<Button
					icon="trash"
					onClick={() => {
						this.props.removeFile(this.props.file);
					}}
					style={{ marginLeft: "1rem" }}
				/>
			);
		}
		return (
			<Card style={FileDetailsView.inlineStyles.card}>
				{this.computePreview()}
				<Card.Content>
					<Card.Header>
						{this.getProp("name")}
						{actions}
					</Card.Header>
					<Card.Description>
						Size:&nbsp;
						<span className="date">{this.getProp("size")}</span>
					</Card.Description>
					<Card.Meta>
						Modified on&nbsp;
						<span className="date">{this.getProp("modifiedMs")}</span>
					</Card.Meta>
					<Card.Description>Created on&nbsp;{this.getProp("createdMs")}</Card.Description>
				</Card.Content>
				<Card.Content
					extra
					onClick={() => {
						this.props.openFolderFor(this.props.file);
					}}
				>
					{/* <a> */}
					<Label as="a" basic>
						<Icon name="folder" />
						{this.getProp("relpath")}
					</Label>
					{/* </a> */}
				</Card.Content>
			</Card>
		);
	}
}

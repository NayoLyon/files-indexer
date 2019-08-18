import React, { Component } from "react";
import { Modal, Button, Label } from "semantic-ui-react";

import { FileProps, FilePropsDb } from "../../api/filesystem";

import FileDetailsView from "./FileDetailsView";

export default class CompareDialogView extends Component {
	static renderFiles(files, openFolderFunc, removeFile) {
		const res = [];
		if (files instanceof Array) {
			const type = CompareDialogView.getType(files[0]);
			files.forEach(file => {
				res.push(CompareDialogView.renderFile(file, type, openFolderFunc, removeFile));
			});
		} else {
			const type = CompareDialogView.getType(files);
			res.push(CompareDialogView.renderFile(files, type, openFolderFunc, removeFile));
		}
		return res;
	}
	static renderFile(file, type, openFolderFunc, removeFile) {
		return (
			<FileDetailsView
				key={`${type}_${file.relpath}`}
				file={file}
				openFolderFor={openFolderFunc}
				removeFile={removeFile}
			/>
		);
	}
	static getType(file) {
		if (file instanceof FileProps) {
			return "scan";
		} else if (file instanceof FilePropsDb) {
			return "db";
		}
		return "unknown";
	}
	static getDivider(topLabel, bottomLabel) {
		const inlineStyle = {
			divider: {
				flex: "0 1",
				margin: "1rem auto",
				textAlign: "center"
			},
			dividerLine: {
				borderLeft: "1px solid rgba(34, 36, 38, 0.15)",
				borderRight: "1px solid rgba(255, 255, 255, 0.1)",
				height: "calc(50% - 2.5em)",
				width: 0,
				display: "inline-block"
			},
			dividerLabel: {
				display: "block",
				margin: "0.4em"
			}
		};

		return (
			<div key="divider" style={{ ...inlineStyle.divider, color: "black" }}>
				<div style={inlineStyle.dividerLine} />
				<Label
					basic
					color="grey"
					pointing="left"
					style={{ ...inlineStyle.dividerLabel, marginTop: 0 }}
				>
					{topLabel}
				</Label>
				<Label basic color="grey" pointing="right" style={inlineStyle.dividerLabel}>
					{bottomLabel}
				</Label>
				<div style={inlineStyle.dividerLine} />
			</div>
		);
	}

	render() {
		const inlineStyle = {
			modal: {
				marginTop: "auto !important",
				marginLeft: "auto",
				marginRight: "auto",
				paddingLeft: "1rem",
				paddingRight: "1rem"
			},
			content: {
				overflowX: "auto",
				padding: 0,
				paddingTop: "1rem"
			}
		};
		if (!this.props.files && !this.props.dbFiles) {
			return null;
		}
		const dbFilesFirst = (this.props.dbFilesFirst && this.props.dbFiles) || !this.props.files;

		let filesDetails;

		// Display the files in the given order
		if (dbFilesFirst) {
			filesDetails = CompareDialogView.renderFiles(
				this.props.dbFiles,
				this.props.openDbFolderFor
			);
			if (this.props.files) {
				filesDetails.push(CompareDialogView.getDivider("Db", "Folder"));
				filesDetails = filesDetails.concat(
					CompareDialogView.renderFiles(
						this.props.files,
						this.props.openFolderFor,
						this.props.removeFile
					)
				);
			}
		} else {
			filesDetails = CompareDialogView.renderFiles(
				this.props.files,
				this.props.openFolderFor,
				this.props.removeFile
			);
			if (this.props.dbFiles) {
				filesDetails.push(CompareDialogView.getDivider("Folder", "Db"));
				filesDetails = filesDetails.concat(
					CompareDialogView.renderFiles(this.props.dbFiles, this.props.openDbFolderFor)
				);
			}
		}
		return (
			<Modal open={this.props.open} onClose={this.props.close} style={inlineStyle.modal}>
				{/* <Modal.Header>Select a Photo</Modal.Header> */}
				<Modal.Content image style={inlineStyle.content}>
					{filesDetails}
				</Modal.Content>
				<Modal.Actions>
					<Button icon="close" onClick={this.props.close} />
				</Modal.Actions>
			</Modal>
		);
	}
}

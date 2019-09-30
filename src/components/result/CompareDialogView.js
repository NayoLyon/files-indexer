import React, { Component } from "react";
import { Modal, Button } from "semantic-ui-react";

import { FileProps, FilePropsDb } from "../../api/filesystem";

import FileDetailsView from "./FileDetailsView";
import CompareDialogViewDivider from "./CompareDialogViewDivider";

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
				filesDetails.push(
					<CompareDialogViewDivider key="divider" topLabel="Db" bottomLabel="Folder" />
				);
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
				filesDetails.push(
					<CompareDialogViewDivider key="divider" topLabel="Folder" bottomLabel="Db" />
				);
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

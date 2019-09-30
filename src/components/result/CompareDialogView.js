import React from "react";
import { Modal, Button } from "semantic-ui-react";

import FileDetailsView from "./FileDetailsView";
import CompareDialogViewDivider from "./CompareDialogViewDivider";

const CompareFiles = ({ files, openFolderFunc, removeFile }) => {
	const filesList = Array.isArray(files) ? files : [files];
	return filesList.map(file => (
		<FileDetailsView
			key={file.relpath}
			file={file}
			openFolderFor={openFolderFunc}
			removeFile={removeFile}
		/>
	));
};

const CompareDialogView = ({
	files,
	dbFiles,
	dbFilesFirst,
	open,
	close,
	openFolderFor,
	removeFile,
	openDbFolderFor
}) => {
	if (!files && !dbFiles) {
		return null;
	}

	const filesRender = files ? (
		<CompareFiles files={files} openFolderFunc={openFolderFor} removeFile={removeFile} />
	) : null;
	const dbFilesRender = dbFiles ? (
		<CompareFiles files={dbFiles} openFolderFunc={openDbFolderFor} />
	) : null;

	// Display the files in the given order
	let filesDetails;
	if ((dbFilesFirst && dbFilesRender) || !filesRender) {
		filesDetails = (
			<React.Fragment>
				{dbFilesRender}
				{filesRender && <CompareDialogViewDivider topLabel="Db" bottomLabel="Folder" />}
				{filesRender}
			</React.Fragment>
		);
	} else {
		filesDetails = (
			<React.Fragment>
				{filesRender}
				{dbFilesRender && <CompareDialogViewDivider topLabel="Folder" bottomLabel="Db" />}
				{dbFilesRender}
			</React.Fragment>
		);
	}
	return (
		<Modal open={open} onClose={close} style={inlineStyle.modal}>
			{/* <Modal.Header>Select a Photo</Modal.Header> */}
			<Modal.Content image style={inlineStyle.content}>
				{filesDetails}
			</Modal.Content>
			<Modal.Actions>
				<Button icon="close" onClick={close} />
			</Modal.Actions>
		</Modal>
	);
};
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

export default CompareDialogView;

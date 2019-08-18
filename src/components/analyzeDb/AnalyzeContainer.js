import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import path from "path";
// import fs from "fs";

import { openExplorerFor, openExplorerOn, deleteFile } from "../../utils/filesystem";
import routes from "../../utils/routes";

import { doAnalyze, removeMissing, removeDuplicate } from "../../modules/analyzeDb/analyzeAction";
import { push } from "../../modules/router/routerActions";

import AnalyzeView from "./AnalyzeView";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

class AnalyzeContainer extends Component {
	constructor(props) {
		super(props);

		if (this.props.masterFolder) {
			this.props.doAnalyze(this.props.masterFolder);
		}

		this.openDbFolderFor = this.openDbFolderFor.bind(this);
		this.removeInDb = this.removeInDb.bind(this);
		this.removeFile = this.removeFile.bind(this);
	}

	openDbFolderFor(file) {
		let filePath = path.resolve(this.props.masterFolder, file.relpath);
		if (fs.existsSync(filePath)) {
			openExplorerOn(filePath);
		} else {
			filePath = path.dirname(filePath);
			while (!fs.existsSync(filePath)) {
				filePath = path.dirname(filePath);
			}
			openExplorerFor(filePath);
		}
	}
	removeInDb(file) {
		this.props.removeMissing(file);
	}
	removeFile(file) {
		deleteFile(this.props.masterFolder, file.relpath);
		this.props.removeDuplicate(file);
	}

	render() {
		return (
			<AnalyzeView
				openDbFolderFor={this.openDbFolderFor}
				removeInDb={this.removeInDb}
				removeFile={this.removeFile}
				goToScan={this.props.goToScan}
				goToIndex={this.props.goToIndex}
			/>
		);
	}
}

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			doAnalyze,
			removeMissing,
			removeDuplicate,
			goToScan: () => push(routes.scan),
			goToIndex: () => push(routes.index)
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AnalyzeContainer);

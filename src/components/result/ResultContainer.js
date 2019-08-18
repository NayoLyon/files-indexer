import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import fs from 'fs';
// import path from 'path';

import { updateDb } from "../../api/database";
import { openExplorerOn } from "../../utils/filesystem";

import { removeFile, removeAllFiles, dbFilePropUpdated } from "../../modules/scan/scanAction";
import { loadResult, resultSetTabActive } from "../../modules/result/resultAction";

import ResultView from "./ResultView";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

class ResultContainer extends Component {
	static wait(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	static async promisifyFunc(func, ...args) {
		await func(...args);
		await ResultContainer.wait(1);
	}

	constructor(props) {
		super(props);
		this.copyModifiedAttributeTo = this.copyModifiedAttributeTo.bind(this);
		this.openDbFolderFor = this.openDbFolderFor.bind(this);
		this.openFolderFor = this.openFolderFor.bind(this);
		this.copyNameAttributeTo = this.copyNameAttributeTo.bind(this);

		props.loadResult();
	}

	openDbFolderFor(file) {
		const { masterFolder } = this.props;
		openExplorerOn(path.resolve(masterFolder, file.relpath));
	}

	openFolderFor(file) {
		const { toScanFolder } = this.props;
		openExplorerOn(path.resolve(toScanFolder, file.relpath));
	}

	async copyModifiedAttributeTo(file, dbFile) {
		const { masterFolder, dbFilePropUpdated } = this.props;
		const dbFilePath = path.resolve(masterFolder, dbFile.relpath);
		const newDbFile = dbFile.clone();
		newDbFile.modified = new Date(file.modified);
		fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, newDbFile.modified);
		try {
			const updatedDoc = await updateDb(masterFolder, newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			dbFilePropUpdated(dbFile);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	}

	async copyNameAttributeTo(file, dbFile) {
		const { masterFolder, dbFilePropUpdated } = this.props;
		const dbFilePath = path.resolve(masterFolder, dbFile.relpath);
		const newDbFile = dbFile.clone();
		newDbFile.setNewName(file.name);
		const dbFileNewPath = path.resolve(masterFolder, newDbFile.relpath);
		if (fs.existsSync(dbFileNewPath)) {
			const err = new Error(`File '${newDbFile.relpath}' already exists!`);
			console.log(err);
			throw err;
		}
		fs.renameSync(dbFilePath, dbFileNewPath);
		try {
			const updatedDoc = await updateDb(masterFolder, newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			dbFilePropUpdated(dbFile);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	}

	render() {
		const { removeFile, removeAllFiles, resultSetTabActive } = this.props;
		return (
			<ResultView
				openDbFolderFor={this.openDbFolderFor}
				openFolderFor={this.openFolderFor}
				copyModifiedAttributeTo={this.copyModifiedAttributeTo}
				removeFile={removeFile}
				removeAllFiles={removeAllFiles}
				copyNameAttributeTo={this.copyNameAttributeTo}
				setTabActive={resultSetTabActive}
			/>
		);
	}
}

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		toScanFolder: state.foldersState.toScanPath
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			loadResult,
			resultSetTabActive,
			removeFile,
			removeAllFiles,
			dbFilePropUpdated
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ResultContainer);

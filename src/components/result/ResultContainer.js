import React, { useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { openExplorerOn } from "../../utils/filesystem";

import { removeFile, removeAllFiles, dbFilePropUpdated } from "../../modules/scan/scanAction";
import { loadResult, resultSetTabActive } from "../../modules/result/resultAction";
import SourceContext from "../source/SourceContext";

import ResultView from "./ResultView";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

const ResultContainer = ({
	toScanFolder,
	loadResult,
	dbFilePropUpdated,
	removeFile,
	removeAllFiles,
	resultSetTabActive
}) => {
	const db = useContext(SourceContext);

	useEffect(() => {
		loadResult();
	}, [loadResult]);

	if (!db) {
		// Should not happen...
		return null;
	}

	const openDbFolderFor = file => openExplorerOn(path.resolve(db.folder, file.relpath));
	const openFolderFor = file => openExplorerOn(path.resolve(toScanFolder, file.relpath));

	const copyModifiedAttributeTo = async (file, dbFile) => {
		const dbFilePath = path.resolve(db.folder, dbFile.relpath);
		const newDbFile = dbFile.clone();
		newDbFile.modified = new Date(file.modified);
		fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, newDbFile.modified);
		try {
			const updatedDoc = await db.updateDb(newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			dbFilePropUpdated(db, dbFile);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	};

	const copyNameAttributeTo = async (file, dbFile) => {
		const dbFilePath = path.resolve(db.folder, dbFile.relpath);
		const newDbFile = dbFile.clone();
		newDbFile.setNewName(file.name);
		const dbFileNewPath = path.resolve(db.folder, newDbFile.relpath);
		if (fs.existsSync(dbFileNewPath)) {
			const err = new Error(`File '${newDbFile.relpath}' already exists!`);
			console.log(err);
			throw err;
		}
		fs.renameSync(dbFilePath, dbFileNewPath);
		try {
			const updatedDoc = await db.updateDb(newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			dbFilePropUpdated(db, dbFile);
		} catch (err) {
			console.warn("Error while updating doc", err);
			// TODO propagate an error...
		}
	};

	return (
		<ResultView
			openDbFolderFor={openDbFolderFor}
			openFolderFor={openFolderFor}
			copyModifiedAttributeTo={copyModifiedAttributeTo}
			removeFile={removeFile}
			removeAllFiles={removeAllFiles}
			copyNameAttributeTo={copyNameAttributeTo}
			setTabActive={resultSetTabActive}
		/>
	);
};

const mapStateToProps = state => ({
	toScanFolder: state.foldersState.toScanPath
});

const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			loadResult,
			resultSetTabActive,
			removeFile,
			removeAllFiles,
			dbFilePropUpdated
		},
		dispatch
	);

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ResultContainer);

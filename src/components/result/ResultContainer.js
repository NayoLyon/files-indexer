import React, { useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { openExplorerOn } from "../../utils/filesystem";

import { removeFile, removeAllFiles, dbFilePropUpdated } from "../../modules/scan/scanAction";
import { loadResult, resultSetTabActive } from "../../modules/result/resultAction";
import SourceContext from "../source/SourceContext";
import ScanContext from "../scan/ScanContext";

import ResultView from "./ResultView";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

const ResultContainer = ({
	loadResult,
	dbFilePropUpdated,
	removeFile,
	removeAllFiles,
	resultSetTabActive
}) => {
	const db = useContext(SourceContext);
	const dbScan = useContext(ScanContext);

	useEffect(() => {
		if (dbScan) {
			loadResult(dbScan);
		}
	}, [loadResult, dbScan]);

	if (!db || !dbScan) {
		// Should not happen...
		return null;
	}

	const openDbFolderFor = file => openExplorerOn(path.resolve(db.folder, file.relpath));
	const openFolderFor = file => openExplorerOn(path.resolve(dbScan.folder, file.relpath));

	const copyModifiedAttributeTo = async (file, dbFile) => {
		const dbFilePath = path.resolve(db.folder, dbFile.relpath);
		const newDbFile = dbFile.clone();
		newDbFile.modifiedMs = file.modifiedMs;
		fs.utimesSync(dbFilePath, fs.statSync(dbFilePath).atime, new Date(newDbFile.modifiedMs));
		try {
			const updatedDoc = await db.updateDb(newDbFile);
			if (updatedDoc[0] !== 1) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Document ${newDbFile.relpath} not updated!!`);
			} else if (updatedDoc[1].hash !== newDbFile.hash) {
				console.error(updatedDoc, newDbFile);
				throw Error(`Wrong document ${newDbFile.relpath} not updated!!`);
			}
			dbFilePropUpdated(db, dbScan, dbFile);
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
			dbFilePropUpdated(db, dbScan, dbFile);
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
			removeFile={file => removeFile(dbScan, file)}
			removeAllFiles={scanType => removeAllFiles(dbScan, scanType)}
			copyNameAttributeTo={copyNameAttributeTo}
			setTabActive={resultSetTabActive}
		/>
	);
};

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
	null,
	mapDispatchToProps
)(ResultContainer);

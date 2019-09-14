import React, { useEffect, useCallback } from "react";
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

const AnalyzeContainer = props => {
	const {
		masterFolder,
		loading,
		isAnalyzed,
		step,
		progress,
		missingList,
		duplicateList,
		goToScan,
		goToIndex,
		doAnalyze,
		removeMissing,
		removeDuplicate
	} = props;
	useEffect(() => {
		if (masterFolder) {
			doAnalyze(masterFolder);
		}
	}, [masterFolder, doAnalyze]);

	const openDbFolderFor = useCallback(
		file => {
			let filePath = path.resolve(masterFolder, file.relpath);
			if (fs.existsSync(filePath)) {
				openExplorerOn(filePath);
			} else {
				filePath = path.dirname(filePath);
				while (!fs.existsSync(filePath)) {
					filePath = path.dirname(filePath);
				}
				openExplorerFor(filePath);
			}
		},
		[masterFolder]
	);

	const removeFile = useCallback(
		file => {
			deleteFile(masterFolder, file.relpath);
			removeDuplicate(file);
		},
		[masterFolder, removeDuplicate]
	);

	return (
		<AnalyzeView
			masterFolder={masterFolder}
			loading={loading}
			isAnalyzed={isAnalyzed}
			step={step}
			progress={progress}
			missingList={missingList}
			duplicateList={duplicateList}
			openDbFolderFor={openDbFolderFor}
			removeInDb={removeMissing}
			removeFile={removeFile}
			goToScan={goToScan}
			goToIndex={goToIndex}
		/>
	);
};

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		loading: state.analyzeState.loading,
		isAnalyzed: state.analyzeState.isAnalyzed,
		step: state.analyzeState.step,
		progress: state.analyzeState.progress,
		missingList: state.analyzeState.missingList,
		duplicateList: state.analyzeState.duplicateList
	};
}

function mapDispatchToProps(dispatch) {
	return {
		...bindActionCreators(
			{
				doAnalyze,
				removeMissing,
				removeDuplicate
			},
			dispatch
		),
		goToScan: () => dispatch(push(routes.scan)),
		goToIndex: () => dispatch(push(routes.index))
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AnalyzeContainer);

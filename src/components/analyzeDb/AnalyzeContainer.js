import React, { useEffect, useCallback, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import path from "path";
// import fs from "fs";

import { openExplorerFor, openExplorerOn, deleteFile } from "../../utils/filesystem";
import routes from "../../utils/routes";

import { doAnalyze, removeMissing, removeDuplicate } from "../../modules/analyzeDb/analyzeAction";
import { push } from "../../modules/router/routerActions";
import SourceContext from "../source/SourceContext";

import AnalyzeView from "./AnalyzeView";

const electron = window.require("electron");
const fs = electron.remote.require("fs");
const path = electron.remote.require("path");

const AnalyzeContainer = ({
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
}) => {
	const db = useContext(SourceContext);
	useEffect(() => {
		if (db) {
			doAnalyze(db);
		}
	}, [db, doAnalyze]);

	const openDbFolderFor = useCallback(
		file => {
			if (!db) return;

			let filePath = path.resolve(db.folder, file.relpath);
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
		[db]
	);

	const removeFile = useCallback(
		file => {
			if (!db) return;

			deleteFile(db.folder, file.relpath);
			removeDuplicate(db, file);
		},
		[db, removeDuplicate]
	);

	return (
		<AnalyzeView
			masterFolder={(db && db.folder) || ""}
			loading={loading}
			isAnalyzed={isAnalyzed}
			step={step}
			progress={progress}
			missingList={missingList}
			duplicateList={duplicateList}
			openDbFolderFor={openDbFolderFor}
			removeInDb={dbFile => removeMissing(db, dbFile)}
			removeFile={removeFile}
			goToScan={goToScan}
			goToIndex={goToIndex}
		/>
	);
};

function mapStateToProps(state) {
	return {
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

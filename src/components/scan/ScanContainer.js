import React, { useState, useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { doScan } from "../../api/filesystem";
import routes from "../../utils/routes";

import { endScan, scanProgress, startScan, scanProcessFile } from "../../modules/scan/scanAction";
import { push } from "../../modules/router/routerActions";
import SourceContext from "../source/SourceContext";

import ScanView from "./ScanView";

const ScanContainer = ({
	toScanFolder,
	indexing,
	isScanned,
	step,
	progress,
	fileProgress,
	startScan,
	scanProcessFile,
	scanProgress,
	endScan,
	goToIndex
}) => {
	const db = useContext(SourceContext);
	// Caution: scan is a function, so to update it we have to escape the function mode of setState of Hooks.
	// See setStartIndexFunc comment in IndexationContainer
	const [scan, setScan] = useState(() => () => {});
	useEffect(() => {
		if (db) {
			let canceled = false;
			setScan(() => async () => {
				if (canceled) return; // Component has changed, stop now...

				await startScan();

				if (canceled) return; // Component has changed, stop now...
				await doScan(
					toScanFolder,
					fileProps => scanProcessFile(db, fileProps),
					scanProgress,
					true,
					() => canceled
				);

				if (canceled) return; // Component has changed, stop now...
				endScan();
			});
			return () => (canceled = true);
		} else {
			setScan(() => () => {});
		}
	}, [db, startScan, toScanFolder, scanProcessFile, scanProgress, endScan]);

	return (
		<ScanView
			toScanFolder={toScanFolder}
			indexing={indexing}
			isScanned={isScanned}
			step={step}
			progress={progress}
			fileProgress={fileProgress}
			scan={scan}
			goToIndex={goToIndex}
		/>
	);
};

function mapStateToProps(state) {
	return {
		toScanFolder: state.foldersState.toScanPath,
		indexing: state.scanState.indexing,
		isScanned: state.scanState.isScanned,
		step: state.scanState.step,
		progress: state.scanState.progress,
		fileProgress: state.scanState.fileProgress
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ endScan, scanProgress, startScan, scanProcessFile, goToIndex: () => push(routes.index) },
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScanContainer);

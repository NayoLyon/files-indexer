import React, { useState, useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { doScan } from "../../api/filesystem";
import routes from "../../utils/routes";

import {
	resetScan,
	endScan,
	scanProgress,
	startScan,
	scanProcessFile
} from "../../modules/scan/scanAction";
import { push } from "../../modules/router/routerActions";
import SourceContext from "../source/SourceContext";
import ScanContext from "./ScanContext";

import ScanView from "./ScanView";

const ScanContainer = ({
	indexing,
	isScanned,
	step,
	progress,
	fileProgress,
	resetScan,
	startScan,
	scanProcessFile,
	scanProgress,
	endScan,
	goToIndex
}) => {
	const db = useContext(SourceContext);
	const dbScan = useContext(ScanContext);
	// Caution: scan is a function, so to update it we have to escape the function mode of setState of Hooks.
	// See setStartIndexFunc comment in IndexationContainer
	const [scan, setScan] = useState(() => null);
	useEffect(() => {
		if (db && dbScan) {
			resetScan();
			let canceled = false;
			setScan(() => async () => {
				if (canceled) return; // Component has changed, stop now...

				await startScan();

				if (canceled) return; // Component has changed, stop now...
				await doScan(
					dbScan.folder,
					fileProps => scanProcessFile(db, dbScan, fileProps),
					scanProgress,
					true,
					() => canceled
				);

				if (canceled) return; // Component has changed, stop now...
				endScan();
			});
			return () => (canceled = true);
		} else {
			setScan(null);
		}
	}, [db, dbScan, resetScan, startScan, scanProcessFile, scanProgress, endScan]);

	return (
		<ScanView
			toScanFolder={dbScan ? dbScan.folder : ""}
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
		indexing: state.scanState.indexing,
		isScanned: state.scanState.isScanned,
		step: state.scanState.step,
		progress: state.scanState.progress,
		fileProgress: state.scanState.fileProgress
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			resetScan,
			endScan,
			scanProgress,
			startScan,
			scanProcessFile,
			goToIndex: () => push(routes.index)
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScanContainer);

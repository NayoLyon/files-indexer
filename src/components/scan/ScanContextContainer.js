import React, { useState, useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { push } from "../../modules/router/routerActions";
import { startScan, scanProgress, endScan } from "../../modules/scan/scanAction";
import routes from "../../utils/routes";
import SourceContext from "../source/SourceContext";

import ScanContainer from "./ScanContainer";

import ScanContext from "./ScanContext";
import { newScanner } from "./Scanner";

const ScanContextContainer = ({ scanFolder, goHome, startScan, scanProgress, endScan }) => {
	const sourceDb = useContext(SourceContext);
	useEffect(() => {
		if (!scanFolder) {
			goHome();
		}
	}, [scanFolder, goHome]);
	const [scanContext, setScanContext] = useState(null);
	useEffect(() => {
		let canceled = false;
		let scanner = newScanner(sourceDb, {
			startScan,
			scanProgress,
			endScan
		});
		const loadDb = async () => {
			await scanner.load(scanFolder);
			if (!canceled) {
				setScanContext(scanner);
			} else {
				scanner.close();
			}
		};
		loadDb();

		return () => {
			canceled = false;
			scanner.close();
		};
	}, [scanFolder, sourceDb, startScan, scanProgress, endScan]);

	return (
		<ScanContext.Provider value={scanContext}>
			<ScanContainer />
		</ScanContext.Provider>
	);
};

const mapStateToProps = store => ({
	scanFolder: store.foldersState.toScanPath
});
const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			startScan,
			scanProgress,
			endScan,
			goHome: () => push(routes.base)
		},
		dispatch
	);

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScanContextContainer);

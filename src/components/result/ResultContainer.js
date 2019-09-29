import React, { useEffect, useContext } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { loadResult, resultSetTabActive } from "../../modules/result/resultAction";
import ScanContext from "../scan/ScanContext";

import ResultView from "./ResultView";

const ResultContainer = ({ loadResult, resultSetTabActive }) => {
	const dbScan = useContext(ScanContext);

	useEffect(() => {
		if (dbScan) {
			loadResult(dbScan);
		}
	}, [loadResult, dbScan]);

	if (!dbScan) {
		// Should not happen...
		return null;
	}

	return (
		<ResultView
			openDbFolderFor={dbScan.openDbFolderFor}
			openFolderFor={dbScan.openFolderFor}
			copyModifiedAttributeTo={dbScan.copyModifiedAttributeTo}
			removeFile={dbScan.removeFile}
			removeAllIdenticals={dbScan.removeAllIdenticals}
			copyNameAttributeTo={dbScan.copyNameAttributeTo}
			setTabActive={resultSetTabActive}
		/>
	);
};

const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			loadResult,
			resultSetTabActive
		},
		dispatch
	);

export default connect(
	null,
	mapDispatchToProps
)(ResultContainer);

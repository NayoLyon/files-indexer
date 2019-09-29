import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { push } from "../../modules/router/routerActions";
import routes from "../../utils/routes";
import { Db } from "../../api/database";

import ScanContainer from "./ScanContainer";

import ScanContext from "./ScanContext";

const SourceContainer = ({ scanFolder, goHome }) => {
	useEffect(() => {
		if (!scanFolder) {
			goHome();
		}
	}, [scanFolder, goHome]);
	const [scanContext, setScanContext] = useState(null);
	useEffect(() => {
		let canceled = false;
		let db = null;
		const loadDb = async () => {
			db = await Db.load(scanFolder, true);
			if (!canceled) {
				setScanContext(db);
			} else {
				db.close();
			}
		};
		loadDb();

		return () => {
			canceled = false;
			if (db) {
				db.close();
			}
		};
	}, [scanFolder]);

	return (
		<ScanContext.Provider value={scanContext}>
			<ScanContainer />
		</ScanContext.Provider>
	);
};

const mapStateToProps = store => ({
	scanFolder: store.foldersState.toScanPath
});
const mapDispatchToProps = dispatch => ({
	goHome: () => dispatch(push(routes.base))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SourceContainer);

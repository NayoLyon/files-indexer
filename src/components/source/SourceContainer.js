import React, { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import { push } from "../../modules/router/routerActions";
import routes from "../../utils/routes";

import NotFound from "../NotFound";
import IndexationContainer from "../indexation/IndexationContainer";
import AnalyzeContainer from "../analyzeDb/AnalyzeContainer";
import ScanContextContainer from "../scan/ScanContextContainer";

import SourceContext, { initializeDatabase } from "./SourceContext";

const SourceContainer = ({ masterFolder, goHome }) => {
	useEffect(() => {
		if (!masterFolder) {
			goHome();
		}
	}, [masterFolder, goHome]);
	const [sourceContext, setSourceContext] = useState(null);
	useEffect(() => {
		let canceled = false;
		let sourceDb = null;
		const loadDb = async () => {
			sourceDb = await initializeDatabase(masterFolder);
			if (!canceled) {
				setSourceContext(sourceDb);
			} else {
				sourceDb.close();
			}
		};
		loadDb();

		return () => {
			canceled = false;
			if (sourceDb) {
				sourceDb.close();
			}
		};
	}, [masterFolder]);

	return (
		<SourceContext.Provider value={sourceContext}>
			<Switch>
				<Route exact path={routes.index} component={IndexationContainer} />
				<Route exact path={routes.scan} component={ScanContextContainer} />
				<Route exact path={routes.analyzeDb} component={AnalyzeContainer} />
				<Route path={routes.base} component={NotFound} />
			</Switch>
		</SourceContext.Provider>
	);
};

const mapStateToProps = store => ({
	masterFolder: store.foldersState.masterPath
});
const mapDispatchToProps = dispatch => ({
	goHome: () => dispatch(push(routes.base))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SourceContainer);

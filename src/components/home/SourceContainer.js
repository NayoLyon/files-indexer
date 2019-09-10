import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import { push } from "../../modules/router/routerActions";
import routes from "../../utils/routes";

import NotFound from "../NotFound";
import IndexationContainer from "../indexation/IndexationContainer";
import AnalyzeContainer from "../analyzeDb/AnalyzeContainer";
import ScanContainer from "../scan/ScanContainer";

const SourceContainer = ({ masterFolder, goHome }) => {
	useEffect(() => {
		if (!masterFolder) {
			goHome();
		}
	}, [masterFolder, goHome]);

	return (
		<Switch>
			<Route exact path={routes.index} component={IndexationContainer} />
			<Route exact path={routes.scan} component={ScanContainer} />
			<Route exact path={routes.analyzeDb} component={AnalyzeContainer} />
			<Route path={routes.base} component={NotFound} />
		</Switch>
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

import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { Container } from "semantic-ui-react";

import routes from "../../utils/routes";

// import { checkToken, checkTokenAlive } from "modules/user/userActions";
// import { push } from "modules/router/routerActions";

import NotFound from "../NotFound";
// import LoaderCustom from "../shared/LoaderCustom";
import HomeContainer from "../home/HomeContainer";
import IndexationContainer from "../indexation/IndexationContainer";
import AnalyzeContainer from "../analyzeDb/AnalyzeContainer";
import ScanContainer from "../scan/ScanContainer";

class AppLayout extends Component {
	// componentDidMount() {
	// 	if (!this.props.dbLoaded && this.props.location !== '/index') {
	// 		// Special case of reload, in dev mode... Go back to /index
	// 		this.props.push('/index');
	// 	}
	// }
	render() {
		const { divBackgroundStyle } = this.getStyles();

		// if (!this.props.logged) {
		// 	return <LoaderCustom />;
		// }

		return (
			<div style={divBackgroundStyle}>
				<Container>
					<Switch>
						<Route exact path={routes.index} component={IndexationContainer} />
						<Route exact path={routes.scan} component={ScanContainer} />
						<Route exact path={routes.analyzeDb} component={AnalyzeContainer} />
						<Route exact path={routes.base} component={HomeContainer} />
						<Route path={routes.base} component={NotFound} />
					</Switch>
				</Container>
			</div>
		);
	}

	getStyles() {
		return {
			divBackgroundStyle: {
				width: "100%",
				height: "100%",
				// backgroundImage: "url(" + this.props.theme.backgroundImageURL + ")",
				// backgroundSize: "cover",
				position: "absolute",
				overflowY: "auto",
				top: 0,
				left: 0
			}
		};
	}
}

const mapStateToProps = function(store) {
	return {
		// logged: store.userState.logged
	};
};

export default connect(mapStateToProps)(AppLayout);

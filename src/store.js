import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createHashHistory as createHistory } from "history";

import { getComposeFunc } from "./utils/devTools";

import reducers from "./modules/reducers";
import loggerMiddleware from "./modules/loggerMiddleware";
import routerMiddleware from "./modules/routerMiddleware";
// import notificationMiddleware from "modules/notificationMiddleware";

// Create a browser history
const history = createHistory();

// DEVTOOL FOR REDUX !
const composeEnhancers = getComposeFunc(compose);
const store = createStore(
	reducers,
	/* preloadedState, */
	composeEnhancers(
		applyMiddleware(
			loggerMiddleware,
			routerMiddleware(history),
			/*notificationMiddleware, */ thunk
		)
	)
);

export { store, history };

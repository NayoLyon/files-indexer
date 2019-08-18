import update from "immutability-helper";

// const BLOB_VALUE = "<<LONG_BLOB>>";

// DEVTOOL FOR REDUX !
const actionSanitizer =
	process.env.NODE_ENV !== "production"
		? action => {
				switch (action.type) {
					// case "MYACTION":
					// 	return { ...action /*, sanitize params*/ };
					default:
						return action;
				}
		  }
		: undefined;
const stateSanitizer =
	process.env.NODE_ENV !== "production"
		? state => {
				// state here is the whole reducer
				let updateCommands = null;

				// Sanitize all reducers content

				// If nothing to sanitize, return raw state
				if (updateCommands === null) {
					return state;
				}

				return update(state, updateCommands);
		  }
		: undefined;

export function getComposeFunc(compose) {
	if (process.env.NODE_ENV !== "production" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
		return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
			actionSanitizer,
			stateSanitizer
		});
	}
	return compose;
}

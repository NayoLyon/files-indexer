const routerMiddleware = history => () => next => action => {
	const ret = next(action);
	if (action.payload && typeof action.payload.routing !== "undefined") {
		const { method, args } = action.payload.routing;
		history[method](...args);
	}
	return ret;
};

function routingFunction(method) {
	return (...args) => ({ method, args });
}
export const push = routingFunction("push");
export const replace = routingFunction("replace");
export const go = routingFunction("go");
export const goBack = routingFunction("goBack");
export const goForward = routingFunction("goForward");

export default routerMiddleware;

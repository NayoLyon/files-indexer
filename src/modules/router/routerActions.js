import { ROUTER_ROUTING } from "../actionTypes";

import * as router from "../routerMiddleware";

function historyFunction(method) {
	return (...args) => ({ type: ROUTER_ROUTING, payload: { routing: router[method](...args) } });
}

export const push = historyFunction("push");
export const replace = historyFunction("replace");
export const go = historyFunction("go");
export const goBack = historyFunction("goBack");
export const goForward = historyFunction("goForward");

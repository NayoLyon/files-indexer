// This is for redux-devtools-extension to display the maps
if (process.env.NODE_ENV !== "production") {
	// eslint-disable-next-line
	Map.prototype.toJSON = function() {
		var obj = {};
		this.forEach((value, key) => (obj[key] = value));
		return obj;
	};
}

import path from "path";
import Conf from "conf";

const electron = window.require("electron");

class ElectronStore extends Conf {
	constructor(options) {
		const defaultCwd = (electron.app || electron.remote.app).getPath("userData");

		options = {
			name: "config",
			...options
		};

		if (options.cwd) {
			options.cwd = path.isAbsolute(options.cwd)
				? options.cwd
				: path.join(defaultCwd, options.cwd);
		} else {
			options.cwd = defaultCwd;
		}

		options.configName = options.name;
		delete options.name;
		super(options);
	}

	openInEditor() {
		electron.shell.openItem(this.path);
	}
}

export default ElectronStore;

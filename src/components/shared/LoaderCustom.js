import React from "react";
import { Component } from "react";
import { Dimmer, Loader } from "semantic-ui-react";

class LoaderCustom extends Component {
	render() {
		return (
			<Dimmer active>
				<Loader />
			</Dimmer>
		);
	}
}

export default LoaderCustom;

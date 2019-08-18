import React, { Component } from "react";
import { withRouter } from "react-router";

class NotFound extends Component {
	render() {
		return <div>{this.props.location.pathname} not found</div>;
	}
}

export default withRouter(NotFound);

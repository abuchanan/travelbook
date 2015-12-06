import React from 'react';

const Inspector = React.createClass({
  render() {

    // Find the active child component matching the "active" prop
    var active;
    for (var child of this.props.children) {
      if (this.props.state.active == child.key) {
        active = child;
      }
    }

    return (<div id="inspector">
      {active}
    </div>);
  }
});

export default Inspector;

import React from 'react'

const Layout = React.createClass({

  render() {
    return (
      <div>
        <h1>layout</h1>
        <div>{this.props.children}</div>
      </div>
    );
  }
});

export default Layout;

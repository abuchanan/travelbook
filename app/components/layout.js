import React from 'react'
import { Link } from 'react-router';

const Layout = React.createClass({

  render() {
    return (
      <div>
        <h1><Link to="/calendar">layout</Link></h1>
        <div>{this.props.children}</div>
      </div>
    );
  }
});

export default Layout;

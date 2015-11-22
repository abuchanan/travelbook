import React from 'react'
import { Link } from 'react-router';

const Layout = React.createClass({

  render() {
    return this.props.children;
  }
});

export default Layout;

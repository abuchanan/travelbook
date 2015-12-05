import React from 'react';
import { render } from 'react-dom';
import polyfill from 'babel-polyfill';

import Layout from './components/layout';
import Home from './components/home';
import Map from './components/map';
//import Calendar from './components/calendar';
//import DayDetails from './components/day-details';
//import { DayActions } from '../actions';


function setScroll() {
    window.scrollTo(0, 0)
}

//var history = createBrowserHistory();

function updateDay(data) {
  console.log('dump', arguments);
  var dayID = data.params.id;
  //DayActions.setCurrentDay(dayID);
}


const Shell = React.createClass({
  childContextTypes: {
    act: React.PropTypes.func,
  },

  getChildContext() {
    return {act: this.props.act};
  },

  render() {
    return this.props.children;
  },
});


export function update_view(state, act) {

  var structure = (
    <Shell act={act}>
      <Map map={state.map} />
    </Shell>
  );

  render(structure, state.container);
}

import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import Layout from '../components/layout';
import Home from '../components/home';
import Map from '../components/map';
import Calendar from '../components/calendar';
import DayDetails from '../components/day-details';
import { DayActions } from '../actions';

function setScroll() {
    window.scrollTo(0, 0)
}

var history = createBrowserHistory();

function updateDay(data) {
  console.log('dump', arguments);
  var dayID = data.params.id;
  DayActions.setCurrentDay(dayID);
}

export var history;

export default (

    <Router onUpdate={setScroll} history={history}>
      <Route path="/" component={Layout}>
        <IndexRoute component={Home} />
        <Route path="map" component={Map} />
        <Route path="calendar" component={Calendar} />
        <Route path="day/:id" component={DayDetails} onEnter={updateDay} />
      </Route>
    </Router>
);

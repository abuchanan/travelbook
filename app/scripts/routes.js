import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import Layout from '../components/layout'
import Home from '../components/home'
import Calendar from '../components/calendar'
import DayDetails from '../components/day-details'

export default (

    <Router>
      <Route path="/" component={Layout}>
        <IndexRoute component={Home} />
        <Route path="calendar" component={Calendar} />
        <Route path="day/:id" component={DayDetails} />
      </Route>
    </Router>
);

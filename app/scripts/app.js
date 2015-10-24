import React from 'react';
import { render } from 'react-dom';

import routes from './routes';
import CalendarActions from '../actions/calendar';

render(routes, document.getElementById('app-container'));

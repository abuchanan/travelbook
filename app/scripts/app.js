import React from 'react';
import { render } from 'react-dom';
import polyfill from 'babel-polyfill';

import routes from './routes';

render(routes, document.getElementById('app-container'));

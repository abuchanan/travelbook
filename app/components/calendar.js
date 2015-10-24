import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';

import Day from './day';
import CalendarStore from '../stores/calendar';
import * as constants from '../scripts/constants';


export default React.createClass({

  mixins: [Reflux.connect(CalendarStore, 'days')],

  render() {
    if (!this.state.days) {
      return <div>none</div>;
    }

    var days = this.state.days.map((d) => {

      var key = d.moment.valueOf();

      if (d.moment.date() == 1) {
        var s = d.moment.format("MMM D");
      } else {
        var s = d.moment.format("D");
      }

      var path = "/day/" + d.moment.format(constants.DATE_ID_FORMAT);

      return (
        <div key={key}>
          <Link to={path}>
            <Day date={s} backgroundImage={d.backgroundImage} />
          </Link>
        </div>
      );
    });

    return <div className="contain">{days}</div>;
  }

});

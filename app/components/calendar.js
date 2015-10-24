import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';

import CalendarStore from '../stores/calendar';


const Day = React.createClass({

  render() {

    var day = this.props.day;
    var style = {
      backgroundImage: "url(" + day.backgroundImage + ")",
    };

    // The first day of the month gets a date string, e.g. "Jan 1"
    // otherwise it's just the date number, e.g. "1"
    if (day.moment.date() == 1) {
      var dateStr = day.moment.format("MMM D");
    } else {
      var dateStr = day.moment.format("D");
    }

    return (
      <Link to={day.path}>
        <div className="day" style={style}>
          <div className="date-row">
            <div className="date">{dateStr}</div>
          </div>
        </div>
      </Link>
    );
  }
});


const Month = React.createClass({

  render() {

    var days = this.props.days.map((day) => {
      return <Day day={day} key={day.key} />;
    });

    return <div className="month">{days}</div>;
  }
});


export default React.createClass({

  mixins: [Reflux.connect(CalendarStore)],

  render() {
    if (!this.state.months) {
      return <div>none</div>;
    }

    var months = this.state.months.map((month) => {
      return <Month days={month.days} key={month.key} />
    });

    return <div>{months}</div>;
  }

});

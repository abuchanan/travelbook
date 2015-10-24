import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import CalendarStore from '../stores/calendar';
import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


const FocusWrapper = React.createClass({
  render() {

    if (this.props.focused) {
      var className = "focused";
    } else {
      var className = "unfocused";
    }

    return <div className={className}>{this.props.children}</div>;
  }
});


const Day = React.createClass({

  mixins: [PureRenderMixin],

  isFirstDay: function() {
    return this.props.day.moment.date() == 1;
  },

  _setContainerRef(r) {
    this._containerRef = r;
  },

  handleScroll() {
    CalendarActions.setDayRect(this.props.day, this._containerRef.getBoundingClientRect());
  },

  componentDidMount: function() {
    if (this.isFirstDay()) {
      this._unsubscribeScroll = CalendarActions.scroll.listen(this.handleScroll);
    }
    CalendarActions.setDayRect(this.props.day, this._containerRef.getBoundingClientRect());
  },

  componentWillUnmount: function() {
    if (this._unsubscribeScroll) {
      this._unsubscribeScroll();
    }
  },

  render() {
    console.log('day render');

    var day = this.props.day;
    var style = {
      backgroundImage: "url(" + day.backgroundImage + ")",
    };

    // The first day of the month gets a date string, e.g. "Jan 1"
    // otherwise it's just the date number, e.g. "1"
    if (this.isFirstDay()) {
      var dateStr = day.moment.format("MMM D");
    } else {
      var dateStr = day.moment.format("D");
    }

    return (
      <div className="day-container" ref={this._setContainerRef}>
      <Link to={day.path}>
        <div className="day" style={style}>
          <div className="date-row">
            <div className="date">{dateStr}</div>
          </div>
        </div>
      </Link>
      </div>
    );
  }
});


export default React.createClass({

  mixins: [Reflux.connect(CalendarStore)],

  handleScroll(event) {
    var scrollTop = this._containerRef.offsetTop;
    CalendarActions.scroll(event);
  },

  componentDidMount() {
    CalendarActions.setCalendarRect(this._containerRef.getBoundingClientRect());
  },

  _setContainerRef(r) {
    this._containerRef = r;
  },

  render() {
    if (!this.state.days) {
      return <div>none</div>;
    }

    var days = this.state.days.map((day) => {

      var focused = day.moment.month() == this.state.focusedMonth;
      return (
        <FocusWrapper focused={focused} key={day.key}>
          <Day day={day} />
        </FocusWrapper>
      );
    });

    return (<div className="calendar" onScroll={this.handleScroll}
                 ref={this._setContainerRef}>{days}</div>);
  }

});

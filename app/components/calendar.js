import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import buildClassNames from 'classnames';

import CalendarStore from '../stores/calendar';
import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


// TODO mixing focus and first day position communication here
//      could separate if wanting to have other kinds of focus
const FocusWrapper = React.createClass({

  setContainerRef(r) {
    this.containerRef = r;
  },

  sendRect() {
    CalendarActions.setDayRect(this.props.day, this.containerRef.getBoundingClientRect());
  },

  componentDidMount: function() {
    if (this.props.day.isFirst) {
      this.unsubscribe = CalendarActions.scroll.listen(this.sendRect);
      // TODO could simplify by having the store init send an initial scroll event
      this.sendRect()
    }
  },

  componentWillUnmount: function() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },

  render() {

    // TODO forcing focused to have one meaning. could make it a set that contains
    //      references to days or day/card keys to make it more generic
    if (this.props.focused == this.props.day.moment.month().date()) {
      var className = "focused";
    } else {
      var className = "unfocused";
    }

    return <div className={className} ref={this._setContainerRef}>{this.props.children}</div>;
  }
});


const MonthMarker = React.createClass({
  render() {
    var dateStr = this.props.month.format("MMMM");

    return (
      <div className="day-container">
        <div className="month-marker">
          <div className="month-name">{dateStr}</div>
        </div>
      </div>
    );
  }
});


const Day = React.createClass({

  mixins: [PureRenderMixin],

  render() {
    var day = this.props.day;
    var style = {};
    var dateStr = day.moment.format("D");
    var classNames = buildClassNames("day", day.type);

    if (day.backgroundImage != "") {
      style.backgroundImage = "url(" + day.backgroundImage + ")";
    }

    return (
      <div className="day-container">
      <Link to={day.path}>
        <div className={classNames} style={style}>
        </div>
      </Link>
      </div>
    );
  }
});


const Calendar = React.createClass({

  mixins: [Reflux.connect(CalendarStore)],

  // TODO would love to extract this into its own component
  componentDidMount() {
    window.addEventListener("scroll", CalendarActions.scroll);

    if (this._containerRef) {
      // TODO handle resize
      CalendarActions.setCalendarRect(this._containerRef.getBoundingClientRect());
    }
  },

  componentWillUnmount() {
    window.removeEventListener("scroll", CalendarActions.scroll);
  },

  _setContainerRef(r) {
    this._containerRef = r;
  },
/*
      return (
        <FocusWrapper focused={this.state.focused} day={day} key={day.id}>
          <Day day={day} />
        </FocusWrapper>
      );
      */



  render() {
    if (!this.state.days) {
      return <div>none</div>;
    }

    var children = [];

    this.state.days.forEach((day) => {
      // TODO should I add the month card here, or generate it in the store
      //      as just another type of day/card?
      if (day.isFirst) {
        children.push(<MonthMarker month={day.moment} key={day.id + "-month"} />);
      }

      children.push(<Day day={day} key={day.id} />);
    });

    return (<div className="calendar" onScroll={CalendarActions.scroll}
                 ref={this._setContainerRef}>{children}</div>);
  }

});

export default Calendar;

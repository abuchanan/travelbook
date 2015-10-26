import Reflux from 'reflux';
import moment from 'moment';
import 'moment-range';
import Immutable from 'immutable';
import jQuery from 'jquery';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';

var DayRecord = Immutable.Record({
  key: "",
  isFirst: false,
  moment: null,
  focused: false,
  type: "",
  path: "",
  backgroundImage: "",
});

export default Reflux.createStore({

  listenables: [CalendarActions],
  _focusedMonth: '',
  _data: {},
  _calendarRect: 0,
  _currentFocus: -1,
  _lastUpdate: null,
  _dayRects: [],
  _timer: null,
  _interval: null,
  _timeout: 25,
  _start: moment("2015-01-01", "YYYY-MM-DD"),
  _end: moment("2015-10-15", "YYYY-MM-DD"),

  init() {
    this._range = moment.range(this._start, this._end);
    this._currentFocus = this._start.month();
    this.fetchDays();
  },

  _resolveFocus() {

    var nextFocus = -1;

    for (var i = 0; i < this._dayRects.length; i++) {
      var dr = this._dayRects[i];

      // TODO bug: this is the *total* calendar height, not the visible height
      // TODO bug: doesn't handle case where first/last section can't pass middle line
      if (dr.top >= this._calendarRect.top && dr.top <= this._calendarRect.bottom) {

        var p = this._calendarRect.bottom - dr.top;

        if (p > (this._calendarRect.height / 2)) {
          nextFocus = i;
        } else {
          nextFocus = i - 1;
        }
        break;

      } else if (dr.top > this._calendarRect.bottom) {
        nextFocus = i - 1;
        break;
      }
    }

    if (nextFocus == -1 || nextFocus == this._currentFocus) {
      return;
    }

    this._currentFocus = nextFocus;
    this._triggerData();
  },

  _scrollFinished() {
    //this._resolveFocus();
    clearInterval(this._interval);
    this._interval = null;
  },


  scroll() {
    if (this._interval === null) {
      this._interval = setInterval(this._resolveFocus, 100);
    }

    if (this._timer !== null) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(this._scrollFinished, this._timeout);
  },


  getInitialState() {
    return this._data;
  },

  setCalendarRect(rect) {
    this._calendarRect = rect;
  },

  setDayRect(day, rect) {
    var i = day.moment.month();
    this._dayRects[i] = rect;
  },

  buildDays(daysData) {
    this._days = [];
    var daysConfig = {};

    daysData.forEach((d) => {
      daysConfig[d.date] = d;
    });

    this._range.by("days", (dayMoment) => {
      var key = dayMoment.format(constants.DATE_ID_FORMAT);
      var config = daysConfig[key] || {};

      var dayRec = new DayRecord({
        key: key,
        isFirst: dayMoment.date() == 1,
        moment: dayMoment,
        path: "/day/" + key,
        type: config.type || "",
        backgroundImage: config.backgroundImage || "",
      });

      this._days.push(dayRec);
    });

    this._triggerData();
  },

  fetchDays() {

    jQuery.ajax({
      url: '/data.json',
      dataType: 'json',
      cache: false,
      success: this.buildDays
    });
  },


  _triggerData() {
    this._data = {days: this._days, focused: this._currentFocus};
    this.trigger(this._data);
  }
});

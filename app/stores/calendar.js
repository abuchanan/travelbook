import Reflux from 'reflux';
import moment from 'moment';
import 'moment-range';
import Immutable from 'immutable';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';

var DayRecord = Immutable.Record({
  key: "",
  moment: null,
  focused: false,
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
  _timeout: 25,
  _start: moment("2015-01-01", "YYYY-MM-DD"),
  _end: moment("2015-10-15", "YYYY-MM-DD"),

  init() {
    this._range = moment.range(this._start, this._end);
    this._currentFocus = this._start.month();
    this.fetchDays();
  },

  _resolveFocus() {
    for (var i = 0; i < this._dayRects.length; i++) {
      var dr = this._dayRects[i];

      if (dr.top >= this._calendarRect.top && dr.top <= this._calendarRect.bottom) {

        var p = this._calendarRect.bottom - dr.top;
        console.log('cand', dr, this._calendarRect, p, (this._calendarRect.height / 2));

        if (p > (this._calendarRect.height / 2)) {
          this._currentFocus = i;
        } else {
          this._currentFocus = i - 1;
        }
        break;

      } else if (dr.top > this._calendarRect.bottom) {
        this._currentFocus = i - 1;
        break;
      }
    }
    this._triggerData();
  },

  _scrollFinished() {
    console.log('scroll finished');
    this._resolveFocus();
  },


  scroll() {
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


  fetchDays() {

    this._days = [];

    this._range.by("days", (dayMoment) => {

      var dayRec = new DayRecord({
        key: dayMoment.valueOf(),
        moment: dayMoment,
        path: "/day/" + dayMoment.format(constants.DATE_ID_FORMAT),
        backgroundImage: "images/thumb1.jpg",
      });

      this._days.push(dayRec);
    });

    this._triggerData();
  },


  _triggerData() {
    this._data = {days: this._days, focusedMonth: this._currentFocus};
    this.trigger(this._data);
  }
});

import Reflux from 'reflux';
import moment from 'moment';
import 'moment-range';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


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

  init() {
    this.fetchDays();
  },

  _setCurrentFocus(i) {
    if (i != this._currentFocus) {
      this._currentFocus = i;
      this.fetchDays();
    }
  },

  _resolveFocus() {
    for (var i = 0; i < this._dayRects.length; i++) {
      var dr = this._dayRects[i];

      if (dr.top >= this._calendarRect.top && dr.top <= this._calendarRect.bottom) {


        var p = this._calendarRect.bottom - dr.top;
        console.log('cand', dr, this._calendarRect, p, (this._calendarRect.height / 2));

        if (p > (this._calendarRect.height / 2)) {
          this._setCurrentFocus(i);
        } else {
          this._setCurrentFocus(i - 1);
        }

        break;

      } else if (dr.top > this._calendarRect.bottom) {
        this._setCurrentFocus(i - 1);
        break;
      }
    }
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
    var start = moment("2015-01-01", "YYYY-MM-DD");
    var end = moment("2015-10-15", "YYYY-MM-DD");
    var range = moment.range(start, end);

    if (this._currentFocus == -1) {
      this._currentFocus = start.month();
    }

    var days = [];

    range.by("days", (day) => {
      days.push({
        key: day.valueOf(),
        moment: day,
        focused: day.month() == this._currentFocus,
        path: "/day/" + day.format(constants.DATE_ID_FORMAT),
        backgroundImage: "images/thumb1.jpg",
      });
    });
    
    this._data = {days: days};
    this.trigger(this._data);
  }
});

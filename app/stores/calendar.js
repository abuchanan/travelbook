import Reflux from 'reflux';
import Moment from 'moment';
import 'moment-range';
import Immutable from 'immutable';
import jQuery from 'jquery';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';

var DayRecord = Immutable.Record({
  id: 0,
  isFirst: false,
  moment: null,
  type: "",
  path: "",
  backgroundImage: "",
});


class DaysConfig {
  constructor() {
    this._data = new Map();
  }

  _get_or_create(key) {
    var entry = this._data.get(key);
    if (!entry) {
      entry = [];
      this._data.set(key, entry);
    }
    return entry;
  }

  _key(x) {
    var moment = Moment(x);
    return moment.format(constants.DATE_ID_FORMAT);
  }

  add(x, config) {
    this._get_or_create(this._key(x)).push(config);
  }

  get(x) {
    if (!this.has(x)) {
      return [];
    }
    return this._data.get(this._key(x));
  }

  has(x) {
    return this._data.has(this._key(x));
  }
}



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
  _start: Moment("2015-01-01", "YYYY-MM-DD"),
  _end: Moment("2015-10-15", "YYYY-MM-DD"),
  _dayId: 0,

  init() {
    this._range = Moment.range(this._start, this._end);
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


  buildDays(config) {
    // reset days
    this._days = [];

    this._range.by("days", (dayMoment) => {

      if (!config.has(dayMoment)) {
        this.addDay(dayMoment);
      } else {
        config.get(dayMoment).forEach((d) => {
          this.addDay(dayMoment, d);
        });
      }

    });

    this._triggerData();
  },


  addDay(dayMoment, extra) {
    var id = this._dayId++;
    console.log(id, dayMoment.format('MMM D'));

    var config = jQuery.extend({
      id: id,
      moment: dayMoment,
      isFirst: dayMoment.date() == 1,
      path: "/day/" + id,
    }, extra);

    this._days.push(new DayRecord(config));
  },


  fetchDays() {
    jQuery.ajax({
      url: '/data.json',
      dataType: 'json',
      cache: false,
      context: this,
      success: function(data) {
        var config = new DaysConfig();

        data.forEach((d) => {
          config.add(d.date, d);
        });

        this.buildDays(config);
      }
    });
  },


  _triggerData() {
    this._data = {days: this._days, focused: this._currentFocus};
    this.trigger(this._data);
  }
});

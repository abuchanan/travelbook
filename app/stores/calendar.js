import Reflux from 'reflux';
import Moment from 'moment';
import 'moment-range';
import Immutable from 'immutable';
import jQuery from 'jquery';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


var DayRecord = Immutable.Record({
  id: 0,
  moment: null,
  path: "",
  type: "",
  backgroundImage: "",
  description: "",
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

  init() {
    this.fetchDays();
  },


  getInitialState() {
    return this._data;
  },

  buildDays(days) {
    // reset days
    this._days = [];

    days.forEach((day) => {
      var id = this._days.length;

      var rec = new DayRecord({
        id: id,
        moment: Moment(day.moment),
        path: "/day/" + id,
        type: day.type,
        backgroundImage: day.backgroundImage,
        description: day.description,
      });

      this._days.push(rec);
    });

    this._triggerData();
  },

  getDay(ID) {
    console.log('get day');
    return this._days[ID];
  },


  setDayImage(id, src) {
    this._days[id] = this._days[id].set('backgroundImage', src);
    this._triggerData();
    this.save();
  },

  save() {
    var data = [];
    this._days.forEach((d) => { 
      var j = d.toJSON();
      data.push(j);
    });
    var json = JSON.stringify(data);

    jQuery.ajax({
      type: "POST",
      url: '/save',
      dataType: 'json',
      data: {days: data},
      cache: false,
      context: this,
      success: function(data) {
        console.log('saved');
      }
    });
  },


  fetchDays() {
    jQuery.ajax({
      url: '/data.json',
      dataType: 'json',
      cache: false,
      context: this,
      success: function(data) {
        console.log('fetched');
        this.buildDays(data.days);
      }
    });
  },


  _triggerData() {
    this._data = {days: this._days, focused: this._currentFocus};
    this.trigger(this._data);
  },




///////////////////////////////////

  setCalendarRect(rect) {
    this._calendarRect = rect;
  },

  setDayRect(day, rect) {
    var i = day.moment.month();
    this._dayRects[i] = rect;
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
});

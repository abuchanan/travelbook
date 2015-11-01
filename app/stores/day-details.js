import Reflux from "reflux";
import moment from "moment";
import "moment-range";
import jQuery from "jquery";

import { history } from '../scripts/routes';
import DayActions from "../actions/day";
import CalendarActions from "../actions/calendar";
import CalendarStore from "../stores/calendar";
import * as constants from '../scripts/constants';


export default Reflux.createStore({

  listenables: [DayActions, CalendarActions],
  _data: {
    imageCollection: [],
    day: null,
  },

  init() {
    this.fetchImageCollection();
  },

  getInitialState() {
    return this._data;
  },

  // TODO: ugh... so lame.
  setDayImage(dayID, src) {
    this._data.day = CalendarStore.getDay(dayID);
    this.triggerData();
  },

  setCurrentDay(dayID) {
    this._data.day = CalendarStore.getDay(dayID);
    this.triggerData();
  },

  gotoNext() {
    if (this._data.day !== null) {
      var nextID = this._data.day.id + 1;
      history.pushState(null, '/day/' + nextID);
    }
  },

  gotoPrevious() {
    if (this._data.day !== null) {
      var previousID = this._data.day.id - 1;
      history.pushState(null, '/day/' + previousID);
    }
  },

  fetchImageCollection() {
    jQuery.ajax({
        url: "/image-collection.json",
        dataType: "json",
        cache: false,
        context: this,
        success: function(data) {
            this._data.imageCollection = data.map((path) => {
              if (path[0] != "/") {
                path = "/" + path;
              }
              return path;
            });
            this.triggerData();
        }
    });
  },

  triggerData() {
    this.trigger(this._data);
  }
  
});

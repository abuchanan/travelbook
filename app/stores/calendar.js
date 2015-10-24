import Reflux from 'reflux';
import moment from 'moment';
import 'moment-range';

import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


export default Reflux.createStore({

  listenables: [CalendarActions],
  _data: {},

  init() {
    this.fetchDays();
  },

  getInitialState() {
    return this._data;
  },

  fetchDays() {

    var start = moment("2015-01-01", "YYYY-MM-DD");
    var end = moment("2015-10-15", "YYYY-MM-DD");
    var range = moment.range(start, end);

    var months = [];
    range.by('months', (month) => {

      var month_range = month.range("month");
      var days = [];

      month_range.by("days", (day) => {
        days.push({
          key: day.valueOf(),
          moment: day,
          path: "/day/" + day.format(constants.DATE_ID_FORMAT),
          backgroundImage: "images/thumb1.jpg",
        });
      });

      months.push({
        key: month.valueOf(),
        moment: month,
        days: days,
      });
    });
    
    this._data = {months: months};
    this.trigger(this._data);
  }
});

import Reflux from 'reflux';
import moment from 'moment';
import 'moment-range';
import CalendarActions from '../actions/calendar';


export default Reflux.createStore({

  listenables: [CalendarActions],
  _days: [],

  init() {
    this.fetchDays();
  },

  getInitialState() {
    return this._days;
  },

  fetchDays() {
    var days = this._days = [];

    var start = moment("2015-01-01", "YYYY-MM-DD");
    var end = moment("2015-10-15", "YYYY-MM-DD");
    var range = moment.range(start, end);

    range.by('days', (m) => {

      days.push({moment: m, backgroundImage: "images/thumb1.jpg"});
    });
    
    this.trigger(days);

  }
});

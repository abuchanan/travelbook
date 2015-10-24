import Reflux from "reflux";
import moment from "moment";
import "moment-range";
import jquery from "jquery";

import DayActions from "../actions/day";
import * as constants from '../scripts/constants';


export default Reflux.createStore({

  listenables: [DayActions],

  loadDate(date) {
    var date_ID = date.format(constants.DATE_ID_FORMAT);
    var url = "/html/day-" + date_ID + ".html";

    console.log('fetching');

    jquery.ajax({
        url: url,
        dataType: "html",
        cache: false,
        context: this,
        success: function(data) {
            console.log("fetch complete", data);
            this.trigger({html: data});
        }
    });
  }
});

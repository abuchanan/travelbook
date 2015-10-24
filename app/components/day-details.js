import React from 'react';
import Reflux from 'reflux';
import moment from 'moment';

import DayDetailsStore from '../stores/day-details';
import DayActions from '../actions/day';
import * as constants from '../scripts/constants';


export default React.createClass({

  mixins: [Reflux.connect(DayDetailsStore)],

  componentDidMount() {
    const date_ID = this.props.params.id;
    const date = moment(date_ID, constants.DATE_ID_FORMAT);
    console.log('mount');
    DayActions.loadDate(date);
  },

  _getHtml() {
    if (this.state.html) {
      var htmlStr = this.state.html;
    } else {
      var htmlStr = "Loading";
    }
    return {__html: htmlStr};
  },

  render() {
    return <div dangerouslySetInnerHTML={this._getHtml()}></div>;
  }
});

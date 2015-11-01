import React from 'react';
import Reflux from 'reflux';
import moment from 'moment';

import DayDetailsStore from '../stores/day-details';
import DayActions from '../actions/day';
import CalendarActions from '../actions/calendar';
import * as constants from '../scripts/constants';


const Image = React.createClass({

  handleClick() {
    CalendarActions.setDayImage(this.props.dayID, this.props.src);
  },

  render() {
    var src = this.props.src;
    return (<img onClick={this.handleClick}
                 className="image-select"
                 src={src} />);
  }
});


export default React.createClass({

  mixins: [Reflux.connect(DayDetailsStore)],

  updateFilter(event) {
    DayActions.setFilter(event.target.value);
  },

  render() {
    if (!this.state.day) {
      return <div>Loading</div>;
    }

    var day = this.state.day;
    var images = [];

    this.state.imageCollection.forEach((path) => {
      images.push(<Image dayID={day.id} src={path} key={path} />);
    });

    var src = this.state.day.backgroundImage;

    return (<div>
      <div>{day.description}</div>
      <div>
        <input type="text" onChange={this.updateFilter} autoFocus />
      </div>
      <div>
        <button onClick={DayActions.gotoPrevious}>Previous</button>
        <button onClick={DayActions.gotoNext}>Next</button>
      </div>
      <div><img className="image-select" src={src} /></div>
      <div>{images}</div>
    </div>);
  }
});

import React from 'react';
import Reflux from 'reflux';

import DayDetailsStore from '../stores/day-details';
import { DayActions, CalendarActions } from '../actions';
import * as constants from '../scripts/constants';


const Image = React.createClass({

  handleClick() {
    CalendarActions.setDayImage(this.props.dayID, this.props.img);
  },

  render() {
    return (<img onClick={this.handleClick}
                 className="image-select"
                 src={this.props.img.thumb} />);
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

    this.state.imageCollection.forEach((img) => {
      images.push(<Image dayID={day.id} img={img} key={img.thumb} />);
    });

    var src = this.state.day.thumb;

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

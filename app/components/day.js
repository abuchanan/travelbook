import React from 'react';


const Day = React.createClass({

  render() {

    var style = {
      backgroundImage: "url(" + this.props.backgroundImage + ")",
    };

    return (
      <div className="day" style={style}>
        <div className="date-row">
          <div className="date">{this.props.date}</div>
        </div>
      </div>
    );
  }
});

export default Day;

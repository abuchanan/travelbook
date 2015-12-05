import React from 'react';

const PlaybackControl = React.createClass({
  render() {
    return (<div className="travel-map-playback-controls">
      <button onClick={TimelineActions.play}>Play</button>
      <button onClick={TimelineActions.stop}>Stop</button>
    </div>);
  }
});

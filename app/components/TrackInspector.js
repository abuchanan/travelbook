import React from 'react';

export const TrackInspector = props => {

  let {tracks, dispatchers} = props;

  let track_elements = [];
  for (let track_id in tracks) {
    let track = tracks[track_id];
    track_elements.push(<div key={track_id}>{track.name}</div>);
  }

  return (
    <div>
      <h1>Tracks</h1>
      {track_elements}
    </div>
  );
}

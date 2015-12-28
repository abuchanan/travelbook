import React from 'react';
import Draggable from 'react-draggable';

import { Ruler } from './Ruler';


const Keyframe = props => {
  let {
    onTimeChange,
    time,
    value
  } = props;

  let scale = 4;
  let start = {
    x: ((time / 1000) * scale),
    y: 0,
  };

  function on_drag_stop(e, ui) {
    console.log("drag stop", ui.position);
    onTimeChange((ui.position.left / scale) * 1000);
  }

  return (
    <Draggable
      axis="x"
      start={start}
      bounds="parent"
      onStop={on_drag_stop}
      >
      <div
        className="track-keyframe"
      ></div>
    </Draggable>
  );
};


const Track = props => {
  let {
    name,
    keyframes,
    onKeyframeTimeChange
  } = props;


  return (
    <div className="track">
      <div className="track-name">{name}</div>
      <div className="track-keyframes">{

        keyframes.map((keyframe, index) => {
          return (
            <Keyframe
              key={index}
              onTimeChange={t => onKeyframeTimeChange(keyframe, t)}
              {...keyframe}
            />
          );
        })

      }</div>
    </div>
  );
};



export const TrackInspector = props => {

  let {tracks, dispatchers} = props;
  let track_types = {};

  let track_elements = Object.keys(tracks).map(track_id => {
    let track = tracks[track_id];
    let track_type = track_types[track.type] || Track;

    return React.createElement(track_type, {
      key: track_id,
      start: 0,
      scale: 4,
      onKeyframeTimeChange(keyframe, time) {
        dispatchers.update_keyframe_time(track_id, keyframe.id, time);
      },
      ...track
    });
  });


  return (
    <div className="track-inspector">
      <h1>Tracks</h1>
      <div className="tracks">
        <Ruler start={0} scale={4} />
        {track_elements}
      </div>
    </div>
  );
};

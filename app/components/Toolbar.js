import React from 'react';

export const InspectorButton = ({inspector, panel, children}) => {
  return (<div>
    <button onClick={ e => inspector.active = panel }>
      {children}
    </button>
  </div>);
};

export const PlaybackButton = ({playing, onClick}) => {
  return (
    <div>
      <button onClick={onClick}>{ playing ? "Stop" : "Play" }</button>
    </div>
  );
};

export const Toolbar = ({children}) => {
  return <div id="toolbar">{children}</div>;
};

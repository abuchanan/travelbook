import React from 'react';

export const Ruler = React.createClass({
  componentDidMount() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.update(this.props);

    // TODO set window resize event listener
  },

  update(props) {
    let {start, scale} = props;

    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let major_tick = 10;
    let mid_tick = 5;
    let minor_tick = 1;

    // Pixels-per-time-unit ratio
    // e.g. scale of 2 = 2 pixels per unit of time
    let canvas_height = this.canvas.height;

    ctx.fillStyle = "rgb(200,0,0)";

    for (let position = 0, max = this.canvas.width / scale; position < max; position++) {
      let time = start + position;
      let height_scale;

      if (major_tick && time % major_tick == 0) {
        height_scale = 1;
      } else if (mid_tick && time % mid_tick == 0) {
        height_scale = 0.7;
      } else if (minor_tick && time % minor_tick == 0) {
        height_scale = 0.3;
      }

      ctx.fillRect(position * scale, 0, 1, canvas_height * height_scale);
    }
  },

  componentWillReceiveProps(props) {
    this.update(props);
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    return (
      <div className="track">
        <div className="track-name"></div>
        <div className="track-time-ruler">
          <canvas
            ref={el => this.canvas = el}
          ></canvas>
        </div>
      </div>
    );
  }
});

import keyboard from 'keyboardJS';
import React from 'react';
import buildClassNames from 'classnames';

const LocationControl = React.createClass({

  contextTypes: {
    actions: React.PropTypes.object,
  },

  bindKeys() {
    keyboard.bind('up', this.onUpKey);
    keyboard.bind('down', this.onDownKey);
    keyboard.bind('enter', this.onEnterKey);
  },

  onEnterKey(e) {
    e.preventDefault();
    // TODO LocationActions.selectHighlighted();
  },

  onUpKey(e) {
    e.preventDefault();
    // TODO LocationActions.highlightPrevious();
  },

  onDownKey(e) {
    e.preventDefault();
    // TODO LocationActions.highlightNext();
  },

  getInitialState() {
    return {results: []};
  },

  componentDidMount() {
    this.geocoder = this.context.actions.Geocoder(results => {
      this.setState({results: results.features});
    });
  },

  onFocus(event) {
    //keyboard.setContext('location search');
    this.geocoder.geocode_forward(event.target.value);
  },

  onBlur() {
    this.geocoder.cancel();
  },

  render() {
    console.log("res", this.state.results);
    var results = this.state.results.map((result, idx) => {
      return (<li role="option" key={result.id}>
      <Result
        idx={idx}
        highlighted={idx == this.state.highlighted}
        result={result}
      /></li>);
    });

    return (<div>
      <input
        autoFocus={false}
        autoComplete={false}
        placeholder="Search"

        onChange={e => this.geocoder.geocode_forward(e.target.value)}
        onFocus={this.onFocus}
        onBlur={this.onBlur}

        role="combobox"
        aria-autocomplete="list"
        aria-owns="location-search-results"
        aria-expanded={results.length > 0}
      />
      <div id='location-search-results' role="listbox">
        <ul>
        {results}
        </ul>
      </div>
    </div>);
  }
});

const Result = React.createClass({

  handleClick(event) {
    console.log('click', this.props.result);
    // TODO LocationActions.selectLocation(this.props.result);
  },

  select() {
    // TODO LocationActions.setHighlight(this.props.idx);
  },

  render() {
    var result = this.props.result;
    var classNames = buildClassNames("autocomplete-result", {
      "highlighted": this.props.highlighted,
    });

    return (<div
      className={classNames}
      onMouseOver={this.select}
      onMouseDown={this.handleClick}>
      {result.place_name}
    </div>);
  }
});

export default LocationControl;

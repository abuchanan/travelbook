import React from 'react';

const LocationControl = React.createClass({

  mixins: [Reflux.connect(LocationStore)],

  componentDidMount() {
    keyboard.withContext('location search', this.bindKeys);
  },

  bindKeys() {
    keyboard.bind('up', this.onUpKey);
    keyboard.bind('down', this.onDownKey);
    keyboard.bind('enter', this.onEnterKey);
  },

  onEnterKey(e) {
    e.preventDefault();
    LocationActions.selectHighlighted();
  },

  onUpKey(e) {
    e.preventDefault();
    LocationActions.highlightPrevious();
  },

  onDownKey(e) {
    e.preventDefault();
    LocationActions.highlightNext();
  },

  handleChange(event) {
    LocationActions.geocodeForward(event.target.value);
  },

  onFocus(event) {
    keyboard.setContext('location search');
    LocationActions.geocodeForward(event.target.value);
  },

  onBlur() {
    LocationActions.clearResults();
  },

  render() {
    var results = [];

    if (this.state.results) {
      results = this.state.results.map((result, idx) => {
        return (<li role="option" key={result.id}>
        <Result
          idx={idx}
          highlighted={idx == this.state.highlighted}
          result={result}
        /></li>);
      });
    }

    return (<div className="travel-map-controls">
      <input
        autoFocus={false}
        autoComplete={false}
        placeholder="Search"
        onChange={this.handleChange}
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
    LocationActions.selectLocation(this.props.result);
  },

  select() {
    LocationActions.setHighlight(this.props.idx);
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

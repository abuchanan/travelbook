import React from 'react';
import buildClassNames from 'classnames';

const LocationControl = React.createClass({

  contextTypes: {
    actions: React.PropTypes.object,
  },

  getInitialState() {
    return {results: [], highlighted: 0, value: ""};
  },

  componentDidMount() {
    this.geocoder = this.context.actions.Geocoder(results => {
      this.setState({results: results.features});
    });
  },

  onBlur() {
    this.geocoder.clear();
  },

  highlight(idx) {
    this.setState({highlighted: idx});
  },

  select_result(result) {
    this.props.onResultSelected(result);
    this.setState({value: result.place_name});
  },

  handle_change(e) {
    this.setState({value: e.target.value});
    this.geocoder.geocode_forward(e.target.value);
  },

  render() {

    // TODO "No results" message when query but no results
    // TODO loading spinner
    var results = this.state.results.map((result, idx) => {
      return (
        <li role="option" key={result.id}>
          <Result
            idx={idx}
            onMouseOver={e => this.highlight(idx)}
            onMouseDown={e => this.select_result(result)}
            highlighted={idx == this.state.highlighted}
            result={result}
          />
        </li>
      );
    });

    return (
      <div>
        <input
          autoFocus={false}
          autoComplete={false}
          placeholder="Search"
          value={this.state.value}

          onChange={this.handle_change}
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
      </div>
    );
  }
});

const Result = props => {
  var {result, highlighted, ...other} = props;
  var classNames = buildClassNames("autocomplete-result", {highlighted});

  return (
    <div className={classNames} {...other}>{result.place_name}</div>
  );
};

export default LocationControl;

import Reflux from 'reflux';
import { EventEmitter } from 'events';

export const CalendarActions = Reflux.createActions([
  'fetchDays', 'scroll', 'setDayRect', 'setCalendarRect', 'setDayImage'
]);

export const DayActions = Reflux.createActions([
  'loadDate', 'setCurrentDay',
  'gotoNext', 'gotoPrevious', 'setFilter'
]);

export const MapActions = Reflux.createActions([
  'setCenter', 'fitBounds', 'clicked', 'disableInteraction',
  'enableInteraction',
]);

export const LocationActions = Reflux.createActions([
  'geocodeForward', 'selectLocation', 'selectHighlighted',
  'highlightNext', 'highlightPrevious', 'openSearch',
  'clearResults', 'setHighlight'
]);

export const TimelineActions = Reflux.createActions([
  'play', 'stop', 'setCenter'
]);

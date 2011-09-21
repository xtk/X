/*
 * ${HEADER}
 */

// provides
goog.provide('X.event');

// requires
goog.require('X');
goog.require('goog.events');
goog.require('goog.events.Event');



/**
 * The superclass class for all events in XTK.
 * 
 * @constructor
 * @name X.event
 * @extends {goog.events.Event}
 */
X.event = function(type) {

  //
  // call the default event constructor
  goog.base(this, type);
  
};
// inherit from goog.events.Event
goog.inherits(X.event, goog.events.Event);


/**
 * Creates a unique event id.
 * 
 * @param {string} id The id.
 * @return {string} A unique id.
 */
X.event.uniqueId = function(id) {

  return goog.events.getUniqueId(id);
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.event', X.event);
goog.exportSymbol('X.event.uniqueId', X.event.uniqueId);

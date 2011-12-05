/*
 * ${HEADER}
 */

// provides
goog.provide('X.parser');
goog.provide('X.parser.ModifiedEvent');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.exception');



/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends {X.base}
 */
X.parser = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'parser';
  
};
// inherit from X.base
goog.inherits(X.parser, X.base);


/**
 * Supported data types by extension.
 * 
 * @enum {string}
 */
X.parser.extensions = {
  // support for the following extensions
  STL: 'STL',
  VTK: 'VTK'
};


X.parser.events = {
  MODIFIED: X.event.uniqueId('modified')
};


/**
 * The modified event to update a single object.
 * 
 * @constructor
 * @extends {X.event}
 */
X.parser.ModifiedEvent = function() {

  // call the default event constructor
  goog.base(this, X.parser.events.MODIFIED);
  
  /**
   * The timestamp of this modified event.
   * 
   * @type {!number}
   */
  this._timestamp = Date.now();
  
  /**
   * The associated X.object of this modified event.
   * 
   * @type {?X.object}
   */
  this._object = null;
  
};
// inherit from X.event
goog.inherits(X.parser.ModifiedEvent, X.event);


/**
 * Parse data and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.object} object The object to configure.
 * @param {!String} data The data to parse.
 * @throws {X.exception} An exception if something goes wrong.
 */
X.parser.prototype.parse = function(object, data) {

  throw new X.exception('Fatal: The function parse() should be overloaded!');
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parser', X.parser);
goog.exportSymbol('X.parser.extensions', X.parser.extensions);
goog.exportSymbol('X.parser.prototype.parse', X.parser.prototype.parse);

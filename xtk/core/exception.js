/*
 * ${HEADER}
 */

// provides
goog.provide('X.exception');

// requires
goog.require('X.base');



/**
 * The general xtk exception.
 * 
 * @param {?string} message An error message.
 * @constructor
 * @extends {X.base}
 */
X.exception = function(message) {

  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'exception';
  
  // The message associated to this exception.
  if (message) {
    this._message = message;
  } else {
    this._message = 'Unknown error!';
  }
  
  // we will use a new error object to get the stacktrace
  var _err = new Error();
  
  /**
   * The stack trace of this exception.
   * 
   * @type {!string}
   * @private
   */
  this._stackTrace_ = _err.stack;
  
};
goog.inherits(X.exception, X.base);

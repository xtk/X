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
 * @param {?string} An error message.
 * @constructor
 * @extends {X.base}
 */
X.exception = function(message) {
  
  goog.base(this);
  
  //
  // class attributes
  
  /** @inheritDoc */
  this._className = 'exception';
  
  // The message associated to this exception.
  if (message) {
    this._message = message;
  } else {
    this._message = 'Unknown error!';
  }
  
};
goog.inherits(X.exception, X.base);

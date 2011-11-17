/*
 * ${HEADER}
 */

// provides
goog.provide('X.loader');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * This object loads external files in an asynchronous fashion. In addition, the
 * loading process is monitored and summarized to a total progress value.
 * 
 * @constructor
 * @extends {X.base}
 */
X.loader = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'loader';
  
  this._completed = false;
  
  goog.Timer.callOnce(function() {

    this._completed = true;
  }.bind(this), 6000);
  
};
// inherit from X.base
goog.inherits(X.loader, X.base);


X.loader.prototype.completed = function() {

  return this._completed;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.loader', X.loader);

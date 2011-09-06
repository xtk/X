/*
 * ${HEADER}
 */

// provides
goog.provide('X.console');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('goog.dom');



/**
 * Create a wrapper around a javascript console with convenience methods for
 * outputting information.
 * 
 * @constructor
 * @extends {X.base}
 */
X.console = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'console';
  
  /**
   * The wrapped console of the browser.
   * 
   * @type {?Element}
   * @private
   */
  this._console_ = null;
  
};
// inherit from X.base
goog.inherits(X.console, X.base);


/**
 * Returns the wrapped console of the browser. If it does not exist, set up the
 * wrapping first.
 * 
 * @return {!Element} The wrapped console of the browser.
 * @throws {X.exception} An exception if the wrapping failed.
 * @private
 */
X.console.prototype.console_ = function() {

  if (!this._console_) {
    
    // grab the console if available
    var _window = goog.dom.getWindow(goog.dom.getDocument());
    
    if (!_window) {
      
      // could not get the window
      throw new X.exception('Fatal: Could not get the window!');
      
    }
    
    var _console = _window.console;
    
    if (!_console) {
      
      // could not get the console
      throw new X.exception('Fatal: The console is not available!');
      
    }
    
    this._console_ = _console;
    
  }
  
  return this._console_;
  
};


/**
 * Prints a message to the console.
 * 
 * @param {?string} message The message to print.
 */
X.console.prototype.out = function(message) {

  var _console = this.console_();
  
  if (_console) {
    
    _console.log(message);
    
  }
  
};


/**
 * Prints an error message to the console.
 * 
 * @param {?string} errorMessage The message to print.
 */
X.console.prototype.err = function(errorMessage) {

  var _console = this.console_();
  
  if (_console) {
    
    _console.error(errorMessage);
    
  }
  
};

// export symbols (requiered for advanced compilation)
goog.exportSymbol('X.console',X.console);
goog.exportSymbol('X.console.prototype.console_', X.console.prototype.console_);
goog.exportSymbol('X.console.prototype.out',X.console.prototype.out);
goog.exportSymbol('X.console.prototype.err', X.console.prototype.err);

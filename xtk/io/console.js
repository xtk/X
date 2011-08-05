/*
 * ${HEADER}
 */

// provides
goog.provide('X.console');

// requires
goog.require('goog.dom');
goog.require('X.base');
goog.require('X.exception');

/**
 * Create a wrapper around a javascript console with convenience methods
 * for outputting information.
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
  this._console = null;
  
};
//inherit from X.base
goog.inherits(X.console, X.base);

/**
 * Returns the wrapped console of the browser. If it does not exist, 
 * set up the wrapping first.
 * 
 * @returns {!Element} The wrapped console of the browser.
 * @throws {X.exception} An exception if the wrapping failed.
 * @private
 * 
 */
X.console.prototype.getConsole = function() {
  
  if (!this._console) {
    
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
    
    this._console = _console;
    
  }
  
  return this._console;
  
};

/**
 * Prints a message to the console.
 * 
 * @param {?string} message The message to print.
 */
X.console.prototype.out = function(message) {
  
  var _console = this.getConsole();
  
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
  
  var _console = this.getConsole();
  
  if (_console) {
    
    _console.error(errorMessage);
    
  }
  
};

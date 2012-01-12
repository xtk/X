/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.exception');

// requires
goog.require('X.base');



/**
 * The general XTK exception.
 * 
 * @param {?string} message An error message.
 * @constructor
 * @extends X.base
 */
X.exception = function(message) {

  var validMessage = 'Unknown error!';
  
  if (goog.isDefAndNotNull(message)) {
    
    // use the given message
    validMessage = message;
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'exception';
  
  /**
   * The message of this exception.
   * 
   * @type {!string}
   * @protected
   */
  this._message = 'Fatal: ' + validMessage;
  
  /**
   * The associated error object of this exception.
   * 
   * @type {Error}
   * @private
   */
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

// export symbols (required for advanced compilation)
goog.exportSymbol('X.exception', X.exception);

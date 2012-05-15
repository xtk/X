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

// entry point
// namespace
goog.provide('X');


/**
 * The XTK namespace.
 * 
 * @const
 */
var X = X || {};

window["X.counter"] = function() {

  this._counters = [];
  
  function uniqueId(instance) {

    var className = instance._className;
    
    if (className in this._counters) {
      
      // we have already a counter for that
      // so just increase it
      this._counters[className] += 1;
      
    } else {
      
      // this is a new counter
      this._counter[className] = 0;
      
    }
    
    // .. and return it
    return this._counters[className];
    
  }
  
};


//
// BROWSER COMPATIBILITY FIXES GO HERE
//

//
// 1. Safari does not support the .bind(this) functionality which is crucial for
// XTK's event mechanism. This hack fixes this.
//
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {

    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError(
          "Function.prototype.bind - what is trying to be bound is not callable");
    }
    
    var fSlice = Array.prototype.slice, aArgs = fSlice.call(arguments, 1), fToBind = this;
    
    /**
     * @constructor
     */
    var fNOP = function() {

    };
    
    var fBound = function() {

      return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs
          .concat(fSlice.call(arguments)));
    };
    
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    
    return fBound;
  };
}

goog.exportSymbol('Function.prototype.bind', Function.prototype.bind);

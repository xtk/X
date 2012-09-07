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
goog.provide('X.counter');

/**
 * The XTK namespace.
 * 
 * @const
 */
var X = X || {};

/**
 * Can be used to check if the XTK library was compiled.
 * 
 * <pre>
 * if (X.DEV === undefined) {
 *   // xtk was compiled
 * }
 * </pre>
 * 
 * @type {boolean}
 */
X.DEV = true;

/**
 * Timer functionality which can be used in developer mode to clock certain
 * things.
 * 
 * <pre>
 * X.TIMER(this._classname+'.functionname');
 * 
 * ... stuff is happening
 * </pre>
 * 
 * @param {string} what The title of this timer.
 */
X.TIMER = function(what) {

  if (eval('X.DEV === undefined')) {
    return;
  }
  
  window.console.time(what);
  
};

/**
 * Timer functionality which can be used in developer mode to clock certain
 * things.
 * 
 * <pre>
 * ... stuff was happening 
 * 
 * X.TIMERSTOP(this._classname+'.functionname');
 * </pre>
 * 
 * @param {string} what The title of this timer.
 */
X.TIMERSTOP = function(what) {

  if (eval('X.DEV === undefined')) {
    return;
  }
  
  window.console.timeEnd(what);
  
};

/**
 * The counter class, keeping track of instance ids.
 * 
 * @constructor
 */
X.counter = function() {

  this._counter = 0;
  

  /**
   * Get a unique id.
   * 
   * @return {number} A unique id
   */
  this.uniqueId = function() {

    // return a unique id
    return this._counter++;
    
  };
  
};

window["X.counter"] = new X.counter();


/**
 * Injection mechanism for mixins (from
 * http://ejohn.org/blog/javascript-getters-and-setters/) which means copying
 * properties, getters/setters and functions from a source object to a target.
 * Works best on instances.
 * 
 * @param {Object} a The target object.
 * @param {Object} b The source object.
 * @return {Object} The altered object.
 */
function inject(a, b) {

  for ( var i in b) { // iterate over all properties
    // get getter and setter functions
    var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
    
    if (g || s) { // if there is a getter or setter
      if (g) {
        a.__defineGetter__(i, g); // copy getter to new object
      }
      if (s) {
        a.__defineSetter__(i, s); // copy setter to new object
      }
    } else {
      a[i] = b[i]; // just copy the value; nothing special
    }
  }
  return a; // return the altered object
}

//
// BROWSER COMPATIBILITY FIXES GO HERE
//

//
// 1. Safari does not support the .bind(this) functionality which is crucial for
// XTK's event mechanism. This hack fixes this.
//
function bind_shim() {
  
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
  
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Mšller
// fixes from Paul Irish and Tino Zijdel
//
// from: https://gist.github.com/1579671

function requestAnimationFrame_shim() {
  
  (function() {
  
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
          window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
  
        var currTime = Date.now(); // changed this to avoid new object each time
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
  
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
  
        clearTimeout(id);
      };
    }
  }());
  
}

// install the shims, if necessary
bind_shim();
requestAnimationFrame_shim();

goog.exportSymbol('Function.prototype.bind', Function.prototype.bind);
goog.exportSymbol('window.requestAnimationFrame', window.requestAnimationFrame);
goog.exportSymbol('window.cancelAnimationFrame', window.cancelAnimationFrame);

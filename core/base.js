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
goog.provide('X.base');

// requires
goog.require('X');
goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * The superclass for all X.base-objects. All derived objects will be registered
 * for event handling.
 * 
 * @constructor
 * @extends goog.events.EventTarget
 */
X.base = function() {

  //
  // register this class within the event system by calling the superclass
  // constructor
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this['className'] = 'base';
  
  /**
   * The 'dirty' flag of this object.
   * 
   * @type {boolean}
   * @protected
   */
  this._dirty = false;
};
// enable events
goog.inherits(X.base, goog.events.EventTarget);

/**
 * Print the className of the current X.base-object.
 * 
 * @return {string} The className of the current X.object.
 */
X.base.prototype.className = function() {

  return this['className'];
  
};


/**
 * Print the className and all attributes of the current X.base-object.
 * 
 * @return {string} A string representation of the current X.base-object.
 */
X.base.prototype.print = function() {

  var attributes = Object.keys(this);
  var attributesStringList = '';
  var className = '<unknown>';
  
  // loop through the attributes of a class
  var a = 0;
  for (a in attributes) {
    
    var aName = 'this.' + attributes[a];
    var aValue = eval(aName);
    
    // catch the className, since we want to display it differently
    if (aName == 'this.className') {
      className = aValue;
    } else {
      attributesStringList += aName + ': ' + aValue + '\n';
    }
    
  }
  
  // build string output
  var output = '== X.' + className + ' ==\n';
  output += attributesStringList;
  
  return output;
  
};


/**
 * Get the 'dirty'-flag of this class.
 * 
 * @return {boolean} TRUE if this class is dirty, FALSE otherwise.
 */
X.base.prototype.dirty = function() {

  return this._dirty;
  
};


/**
 * Remove the 'dirty'-flag of this class.
 */
X.base.prototype.setClean = function() {

  this._dirty = false;
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.base', X.base);
goog.exportSymbol('X.base.prototype.className', X.base.prototype.className);
goog.exportSymbol('X.base.prototype.print', X.base.prototype.print);
goog.exportSymbol('X.base.prototype.dirty', X.base.prototype.dirty);

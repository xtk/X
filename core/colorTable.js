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
goog.provide('X.colorTable');

// requires
goog.require('X.base');
goog.require('X.file');
goog.require('goog.structs.Map');



/**
 * Create a container for a colorTable.
 * 
 * @constructor
 * @extends X.base
 */
X.colorTable = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'colorTable';
  
  /**
   * The internal hash map to store the value-color mapping.
   * 
   * @type {!goog.structs.Map}
   */
  this._map = new goog.structs.Map();
  
  // the global id counter
  var counter = window["X.Counter"];
  // ..get a new unique id
  counter.increment();
  
  /**
   * The uniqueId of this object. Each object in XTK has a uniqueId.
   * 
   * @type {number}
   * @protected
   */
  this['_id'] = counter.value();
  
  this._file = null;
  
};
// inherit from X.base
goog.inherits(X.colorTable, X.base);


/**
 * Add an entry to this color table.
 * 
 * @param value
 * @param label
 * @param r
 * @param g
 * @param b
 * @param a
 * @throws {Error} If the given values are invalid.
 */
X.colorTable.prototype.add = function(value, label, r, g, b, a) {

  if (!goog.isNumber(value) || !goog.isNumber(r) || !goog.isNumber(g) ||
      !goog.isNumber(b) || !goog.isNumber(a)) {
    
    throw new Error('Invalid color table entry.');
    
  }
  
  this._map.set(value, [label, r, g, b, a]);
  
  this._dirty = true;
  
};


/**
 * Get the id of this color table.
 * 
 * @return {number} The id of this color table.
 */
X.colorTable.prototype.id = function() {

  return this['_id'];
  
};


/**
 * Get the file of this color table.
 * 
 * @return {?X.file} The file of this color table.
 */
X.colorTable.prototype.file = function() {

  return this._file;
  
};


/**
 * Set the file for this color table.
 * 
 * @param {?X.file|string} file The file path or an X.file object containing the
 *          path.
 */
X.colorTable.prototype.setFile = function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    // null files are allowed
    this._file = null;
    return;
    
  }
  
  if (goog.isString(file)) {
    
    file = new X.file(file);
    
  }
  
  this._file = file;
  
};

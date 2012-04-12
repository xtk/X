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
goog.provide('X.scalars');

// requires
goog.require('X.base');
goog.require('X.file');



/**
 * Create a container for a scalar array.
 * 
 * @constructor
 * @extends X.base
 */
X.scalars = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'scalars';
  
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
goog.inherits(X.scalars, X.base);


/**
 * Get the id of this scalars container.
 * 
 * @return {number} The id of this scalars container.
 */
X.scalars.prototype.id = function() {

  return this['_id'];
  
};


/**
 * Get the file of this scalars container.
 * 
 * @return {?X.file} The file of this scalars container.
 */
X.scalars.prototype.file = function() {

  return this._file;
  
};


/**
 * Set the file for this scalars container.
 * 
 * @param {?X.file|string} file The file path or an X.file object containing the
 *          path.
 */
X.scalars.prototype.setFile = function(file) {

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


/**
 * Load a scalars file.
 * 
 * @param {string} filepath The file path for this scalars container.
 */
X.scalars.prototype.load = function(filepath) {

  if (!goog.isDefAndNotNull(filepath) || !goog.isString(filepath)) {
    
    // not allowed
    throw new Error('Invalid filepath.');
    
  }
  
  this.setFile(filepath);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.scalars', X.scalars);
goog.exportSymbol('X.scalars.prototype.load', X.scalars.prototype.load);

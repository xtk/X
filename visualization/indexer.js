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
goog.provide('X.indexer');

// requires
goog.require('X.base');



/**
 * Create an indexer which maps indices to objects while dropping duplicates.
 * 
 * @constructor
 * @extends X.base
 */
X.indexer = function() {

  // this was 'borrowed' from lightGl
  //
  // https://github.com/evanw/lightgl.js/
  //
  // Thanks!
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'indexer';
  
  /**
   * The unique objects.
   * 
   * @type {!Array}
   * @protected
   */
  this._unique = [];
  
  /**
   * The indices of the objects.
   * 
   * @type {!Array}
   * @protected
   */
  this._indices = [];
  
  /**
   * The mapping between indices and objects.
   * 
   * @type {!Object}
   * @protected
   */
  this._map = {};
  
};
// inherit from X.base
goog.inherits(X.indexer, X.base);

/**
 * Add an object if it has not been added.
 * 
 * @param {!Object} object The object to add.
 * @return The index of the object after it was added.
 * @throws {Error} An exception if the object is invalid.
 */
X.indexer.prototype.add = function(object) {

  if (!goog.isDefAndNotNull(object)) {
    
    throw new Error('Invalid object.');
    
  }
  
  var key = window.JSON.stringify(object);
  if (!(key in this._map)) {
    this._map[key] = this._unique.length;
    this._unique.push(object);
  }
  return this._map[key];
  
};


/**
 * Get the unique objects.
 * 
 * @return {!Array}
 */
X.indexer.prototype.unique = function() {

  return this._unique;
  
};

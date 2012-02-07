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
goog.provide('X.triplets');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('goog.math.Coordinate3');
goog.require('goog.structs.Map');



/**
 * Create an ordered container for triplets (3D tuples).
 * 
 * @param {Array=} data Initial data as an array.
 * @constructor
 * @extends X.base
 */
X.triplets = function(data) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'triplets';
  
  this._minA = null;
  this._maxA = null;
  this._minB = null;
  this._maxB = null;
  this._minC = null;
  this._maxC = null;
  
  /**
   * The one dimensional array storing all triplets.
   * 
   * @type {!Array}
   * @private
   */
  this._triplets_ = new Array();
  
  // if we have initial data, use it!
  if (goog.isDefAndNotNull(data)) {
    
    this._triplets_ = data;
    
  }
  
};
// inherit from X.base
goog.inherits(X.triplets, X.base);


/**
 * Add a triplet to this container.
 * 
 * @param {!number} a The first value of the triplet.
 * @param {!number} b The second value of the triplet.
 * @param {!number} c The third value of the triplet.
 * @return {!number} The id of the added triplet.
 * @throws {X.exception} An exception if the passed coordinates are invalid.
 */
X.triplets.prototype.add = function(a, b, c) {

  if (!goog.isNumber(a) || !goog.isNumber(b) || !goog.isNumber(c)) {
    
    throw new X.exception('Invalid triplet.');
    
  }
  
  // update bounding box
  if (!this._minA || a < this._minA) {
    this._minA = a;
  }
  if (!this._maxA || a > this._maxA) {
    this._maxA = a;
  }
  if (!this._minB || b < this._minB) {
    this._minB = b;
  }
  if (!this._maxB || b > this._maxB) {
    this._maxB = b;
  }
  if (!this._minC || c < this._minC) {
    this._minC = c;
  }
  if (!this._maxC || c > this._maxC) {
    this._maxC = c;
  }
  

  this._dirty = true;
  return this._triplets_.push(a, b, c) / 3;
  
};


/**
 * Get the triplet with the given id.
 * 
 * @param {!number} id The id of the requested triplet.
 * @return {!Array} The triplet with the given id as a 1D Array with length 3.
 * @throws {X.exception} An exception if the passed id is invalid or does not
 *           exist.
 */
X.triplets.prototype.get = function(id) {

  if (!goog.isNumber(id) || (id * 3 > this._triplets_.length)) {
    
    throw new X.exception('Invalid id.');
    
  }
  
  // we need to convert the id to the index in the array
  id = id * 3;
  
  return [this._triplets_[id], this._triplets_[id + 1], this._triplets_[id + 2]];
  
};


/**
 * Remove a given triplet from this container.
 * 
 * @param {!number} id The id of the to be removed triplet.
 * @throws {X.exception} An exception if the passed id is invalid or does not
 *           exist.
 */
X.triplets.prototype.remove = function(id) {

  if (!goog.isNumber(id) || (id * 3 > this._triplets_.length)) {
    
    throw new X.exception('Invalid id.');
    
  }
  
  this._triplets_.splice(id, 3);
  
  this._dirty = true;
  
};


/**
 * Get all triplets as a sequence.
 * 
 * @return {!Array} All triplets as a sequence in a 1D Array.
 */
X.triplets.prototype.all = function() {

  return this._triplets_;
  
};


/**
 * Delete all triplets in this container.
 */
X.triplets.prototype.clear = function() {

  // delete all triplets
  this._triplets_ = new Array();
  
  this._dirty = true;
  
};


/**
 * Get the number of triplets in this container.
 * 
 * @return {!number} The number of triplets in this container.
 */
X.triplets.prototype.count = function() {

  return this._triplets_.length / 3;
  
};


/**
 * Get the length of this container. This equals the number of triplets
 * multiplied by 3.
 * 
 * @return {!number} The length of this container.
 */
X.triplets.prototype.length = function() {

  return this._triplets_.length;
  
};


/**
 * 
 */
X.triplets.prototype.minA = function() {

  return this._minA;
  
};

X.triplets.prototype.maxA = function() {

  return this._maxA;
  
};

X.triplets.prototype.minB = function() {

  return this._minB;
  
};

X.triplets.prototype.maxB = function() {

  return this._maxB;
  
};

X.triplets.prototype.minC = function() {

  return this._minC;
  
};

X.triplets.prototype.maxC = function() {

  return this._maxC;
  
};
// export symbols (required for advanced compilation)
goog.exportSymbol('X.triplets', X.triplets);
goog.exportSymbol('X.triplets.prototype.add', X.triplets.prototype.add);
goog.exportSymbol('X.triplets.prototype.get', X.triplets.prototype.get);
goog.exportSymbol('X.triplets.prototype.remove', X.triplets.prototype.remove);
goog.exportSymbol('X.triplets.prototype.all', X.triplets.prototype.all);
goog.exportSymbol('X.triplets.prototype.clear', X.triplets.prototype.clear);
goog.exportSymbol('X.triplets.prototype.count', X.triplets.prototype.count);
goog.exportSymbol('X.triplets.prototype.length', X.triplets.prototype.length);

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
goog.require('goog.math.Coordinate3');
goog.require('goog.structs.Map');



/**
 * Create an ordered container for triplets (3D tuples).
 * 
 * @param {X.triplets=} data Initial data as another X.triplets container.
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
  this._classname = 'triplets';
  
  /**
   * The minA border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._minA = Infinity;
  
  /**
   * The maxA border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._maxA = -Infinity;
  
  /**
   * The minB border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._minB = Infinity;
  
  /**
   * The maxB border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._maxB = -Infinity;
  
  /**
   * The minC border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._minC = Infinity;
  
  /**
   * The maxC border of the bounding box.
   * 
   * @type {number}
   * @protected
   */
  this._maxC = -Infinity;
  
  /**
   * The centroid of the bounding box.
   * 
   * @type {!Array}
   * @protected
   */
  this._centroid = [0, 0, 0];
  
  /**
   * The one dimensional array storing all triplets.
   * 
   * @type {!Array}
   * @private
   */
  this._triplets = new Array();
  
  // if we have initial data, use it!
  if (goog.isDefAndNotNull(data)) {
    
    this._triplets = data._triplets.slice();
    this._minA = data._minA;
    this._maxA = data._maxA;
    this._minB = data._minB;
    this._maxB = data._maxB;
    this._minC = data._minC;
    this._maxC = data._maxC;
    this._centroid = data._centroid.slice();
    
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
 * @throws {Error} An exception if the passed coordinates are invalid.
 * @public
 */
X.triplets.prototype.add = function(a, b, c) {

  if (!goog.isNumber(a) || !goog.isNumber(b) || !goog.isNumber(c)) {
    
    throw new Error('Invalid triplet.');
    
  }
  
  // update bounding box
  this._minA = Math.min(this._minA, a);
  this._maxA = Math.max(this._maxA, a);
  this._minB = Math.min(this._minB, b);
  this._maxB = Math.max(this._maxB, b);
  this._minC = Math.min(this._minC, c);
  this._maxC = Math.max(this._maxC, c);
  
  this._centroid = [(this._minA + this._maxA) / 2,
                    (this._minB + this._maxB) / 2,
                    (this._minC + this._maxC) / 2];
  
  this._dirty = true;
  return this._triplets.push(a, b, c) / 3;
  
};


/**
 * Get the triplet with the given id.
 * 
 * @param {!number} id The id of the requested triplet.
 * @return {!Array} The triplet with the given id as a 1D Array with length 3.
 * @throws {Error} An exception if the passed id is invalid or does not exist.
 * @public
 */
X.triplets.prototype.get = function(id) {

  if (!goog.isNumber(id) ||
      (id < 0 || id * 3 > this._triplets.length || id == this._triplets.length / 3)) {
    
    throw new Error('Invalid id.');
    
  }
  
  // we need to convert the id to the index in the array
  id = id * 3;
  
  return [this._triplets[id], this._triplets[id + 1], this._triplets[id + 2]];
  
};


/**
 * Remove a given triplet from this container.
 * 
 * @param {!number} id The id of the to be removed triplet.
 * @throws {Error} An exception if the passed id is invalid or does not exist.
 * @public
 */
X.triplets.prototype.remove = function(id) {

  if (!goog.isNumber(id) ||
      (id < 0 || id * 3 > this._triplets.length || id == this.count)) {
    
    throw new Error('Invalid id.');
    
  }
  
  this._triplets.splice(id, 3);
  
  this._dirty = true;
  
};


/**
 * Delete all triplets in this container.
 * 
 * @public
 */
X.triplets.prototype.clear = function() {

  // delete all triplets
  this._triplets = new Array();
  
  this._dirty = true;
  
};


/**
 * Get the number of triplets in this container.
 * 
 * @return {!number} The number of triplets in this container.
 * @public
 */
X.triplets.prototype.__defineGetter__('count', function() {

  return this._triplets.length / 3;
  
});


/**
 * Get the length of this container. This equals the number of triplets
 * multiplied by 3.
 * 
 * @return {!number} The length of this container.
 * @public
 */
X.triplets.prototype.__defineGetter__('length', function() {

  return this._triplets.length;
  
});


// export symbols (required for advanced compilation)
goog.exportSymbol('X.triplets', X.triplets);
goog.exportSymbol('X.triplets.prototype.add', X.triplets.prototype.add);
goog.exportSymbol('X.triplets.prototype.get', X.triplets.prototype.get);
goog.exportSymbol('X.triplets.prototype.remove', X.triplets.prototype.remove);
goog.exportSymbol('X.triplets.prototype.clear', X.triplets.prototype.clear);

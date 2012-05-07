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
  this['className'] = 'triplets';
  
  this._minA = Infinity;
  this._maxA = -Infinity;
  this._minB = Infinity;
  this._maxB = -Infinity;
  this._minC = Infinity;
  this._maxC = -Infinity;
  this._centroid = [0, 0, 0];
  
  /**
   * The one dimensional array storing all triplets.
   * 
   * @type {!Array}
   * @private
   */
  this._triplets_ = new Array();
  
  // if we have initial data, use it!
  if (goog.isDefAndNotNull(data)) {
    
    this._triplets_ = data._triplets_.slice();
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
 */
X.triplets.prototype.add = function(a, b, c) {

  if (!goog.isNumber(a) || !goog.isNumber(b) || !goog.isNumber(c)) {
    
    throw new Error('Invalid triplet.');
    
  }
  
  this.parseTriplet_(a, b, c);
  
  this._dirty = true;
  return this._triplets_.push(a, b, c) / 3;
  
};


/**
 * Calculate the bounding box by parsing a triplet.
 * 
 * @param {!number} a The first value of the triplet.
 * @param {!number} b The second value of the triplet.
 * @param {!number} c The third value of the triplet.
 */
X.triplets.prototype.parseTriplet_ = function(a, b, c) {

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
  
};


/**
 * Get the triplet with the given id.
 * 
 * @param {!number} id The id of the requested triplet.
 * @return {!Array} The triplet with the given id as a 1D Array with length 3.
 * @throws {Error} An exception if the passed id is invalid or does not exist.
 */
X.triplets.prototype.get = function(id) {

  if (!goog.isNumber(id) ||
      (id < 0 || id * 3 > this._triplets_.length || id == this.count())) {
    
    throw new Error('Invalid id.');
    
  }
  
  // we need to convert the id to the index in the array
  id = id * 3;
  
  return [this._triplets_[id], this._triplets_[id + 1], this._triplets_[id + 2]];
  
};


/**
 * Remove a given triplet from this container.
 * 
 * @param {!number} id The id of the to be removed triplet.
 * @throws {Error} An exception if the passed id is invalid or does not exist.
 */
X.triplets.prototype.remove = function(id) {

  if (!goog.isNumber(id) ||
      (id < 0 || id * 3 > this._triplets_.length || id == this.count())) {
    
    throw new Error('Invalid id.');
    
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
 * Set all triplets as a sequence. If one or more values of the bounding box are
 * missing, a re-calculation is forced.
 * 
 * @param {!Array} triplets All triplets as a sequence in a 1D Array.
 * @param {number=} minA The minA value.
 * @param {number=} maxA The maxA value.
 * @param {number=} minB The minB value.
 * @param {number=} maxB The maxB value.
 * @param {number=} minC The minC value.
 * @param {number=} maxC The maxC value.
 * @param {number=} centroid The centroid.
 */
X.triplets.prototype.setAll = function(triplets, minA, maxA, minB, maxB, minC,
    maxC, centroid) {

  this._triplets_ = triplets;
  
  if (!goog.isDefAndNotNull(minA) || !goog.isDefAndNotNull(maxA) ||
      !goog.isDefAndNotNull(minB) || !goog.isDefAndNotNull(maxB) ||
      !goog.isDefAndNotNull(minC) || !goog.isDefAndNotNull(maxC) ||
      !goog.isDefAndNotNull(centroid)) {
    
    // we can set the bounding box directly (yahoo, this is fast)
    this._minA = minA;
    this._maxA = maxA;
    this._minB = minB;
    this._maxB = maxB;
    this._minC = minC;
    this._maxC = maxC;
    this._centroid = centroid;
    

  } else {
    
    // we have to update the bounding box (a little slower)
    var i = 0;
    for (i = 0; i < this.count(); i++) {
      
      var _triplet = this.get(i);
      this.parseTriplet_(_triplet[0], _triplet[1], _triplet[2]);
      
    }
    
  }
  
  this._dirty = true;
  
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

X.triplets.prototype.centroid = function() {

  return this._centroid;
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.triplets', X.triplets);
goog.exportSymbol('X.triplets.prototype.add', X.triplets.prototype.add);
goog.exportSymbol('X.triplets.prototype.get', X.triplets.prototype.get);
goog.exportSymbol('X.triplets.prototype.remove', X.triplets.prototype.remove);
goog.exportSymbol('X.triplets.prototype.all', X.triplets.prototype.all);
goog.exportSymbol('X.triplets.prototype.setAll', X.triplets.prototype.setAll);
goog.exportSymbol('X.triplets.prototype.clear', X.triplets.prototype.clear);
goog.exportSymbol('X.triplets.prototype.count', X.triplets.prototype.count);
goog.exportSymbol('X.triplets.prototype.length', X.triplets.prototype.length);
goog.exportSymbol('X.triplets.prototype.minA', X.triplets.prototype.minA);
goog.exportSymbol('X.triplets.prototype.maxA', X.triplets.prototype.maxA);
goog.exportSymbol('X.triplets.prototype.minB', X.triplets.prototype.minB);
goog.exportSymbol('X.triplets.prototype.maxB', X.triplets.prototype.maxB);
goog.exportSymbol('X.triplets.prototype.minC', X.triplets.prototype.minC);
goog.exportSymbol('X.triplets.prototype.maxC', X.triplets.prototype.maxC);
goog.exportSymbol('X.triplets.prototype.centroid',
    X.triplets.prototype.centroid);

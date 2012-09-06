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



/**
 * Create an ordered container for triplets (3D tuples) with a 
 * fixed memory size.
 * 
 * @param {!number} size The number of triplets to store. This is used to
 *                       allocate memory: 4 bytes * size.
 * @param {X.triplets=} data Initial data as another X.triplets container.
 * @constructor
 * @extends X.base
 */
X.triplets = function(size, data) {

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
   * This marks the triplets container as fresh meaning unused.
   * 
   * @type {!boolean}
   * @protected
   */
  this._fresh = true;
  
  /**
   * The pointer to the current position in the float array.
   * 
   * @type {!number}
   * @protected
   */
  this._dataPointer = 0;
  
  /**
   * The one dimensional float array storing all triplets.
   * 
   * @type {!Float32Array}
   * @private
   */
  this._triplets = new Float32Array(size);
  
  // if we have initial data, use it!
  if (goog.isDefAndNotNull(data)) {
    
    this._triplets = data._triplets.subarray(0, data._triplets.length);
    this._dataPointer = this._triplets.length;
    this._minA = data._minA;
    this._maxA = data._maxA;
    this._minB = data._minB;
    this._maxB = data._maxB;
    this._minC = data._minC;
    this._maxC = data._maxC;
    this._centroid = data._centroid.slice();
    this._fresh = false;
    
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
  
  this._fresh = false;
  this._dirty = true;
  
  this._triplets[this._dataPointer++] = a;
  this._triplets[this._dataPointer++] = b;
  this._triplets[this._dataPointer++] = c;
  
  return this._dataPointer / 3;
  
};


/**
 * Adjust the size of the internal array to match
 * the real content.
 */
X.triplets.prototype.resize = function() {
  
  // jump out if there is no need
  if (this._dataPointer == this._triplets.length) {
    
    //console.log('no resize',this._dataPointer,this._triplets.length);
    
    return;
    
  }
  //console.log('resize',this._dataPointer,this._triplets.length);
  
  // resize the array according to its real content
  var _tmpArr = new Float32Array(this._dataPointer);
  _tmpArr.set(this._triplets.subarray(0,this._dataPointer));
  
  this._triplets = _tmpArr; 
  
};


/**
 * Get the triplet with the given id.
 * 
 * @param {!number} id The id of the requested triplet.
 * @return {!Array} The triplet with the given id as a 1D Array with length 3.
 * @public
 */
X.triplets.prototype.get = function(id) {
  
  // we need to convert the id to the index in the array
  id = id * 3;
  
  //return this._triplets.subarray(id,id+3);
  return [this._triplets[id],this._triplets[id+1],this._triplets[id+2]];
  
};


/**
 * Remove a given triplet from this container.
 * 
 * @param {!number} id The id of the to be removed triplet.
 * @public
 */
X.triplets.prototype.remove = function(id) {
  
  //this._triplets.splice(id, 3);
  //TODO do we need that?
  throw new Error('Not implemented.');
  //this._dirty = true;
  
};


/**
 * Delete all triplets in this container.
 * 
 * @public
 */
X.triplets.prototype.clear = function() {

  // delete all triplets
  this._triplets = new Float32Array(this._triplets.length);
  
  this._dirty = true;
  
};


/**
 * Get the number of triplets in this container.
 * 
 * @return {!number} The number of triplets in this container.
 * @public
 */
X.triplets.prototype.__defineGetter__('count', function() {

  // just in case resize here to get the right number
  this.resize();
  
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

  // just in case resize here to get the right number
  this.resize();
  
  return this._triplets.length;
  
});


// export symbols (required for advanced compilation)
goog.exportSymbol('X.triplets', X.triplets);
goog.exportSymbol('X.triplets.prototype.add', X.triplets.prototype.add);
goog.exportSymbol('X.triplets.prototype.resize', X.triplets.prototype.resize);
goog.exportSymbol('X.triplets.prototype.get', X.triplets.prototype.get);
goog.exportSymbol('X.triplets.prototype.remove', X.triplets.prototype.remove);
goog.exportSymbol('X.triplets.prototype.clear', X.triplets.prototype.clear);

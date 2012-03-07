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
goog.provide('X.volume');

// requires
goog.require('X.object');
goog.require('X.slice');



/**
 * Create a displayable volume which consists of X.slices in X,Y and Z
 * direction.
 * 
 * @constructor
 * @extends X.object
 */
X.volume = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'volume';
  
  /**
   * The center of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The dimensions of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._dimensions = [10, 10, 10];
  
  /**
   * The spacing of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._spacing = [1, 1, 1];
  
  /**
   * The index of the currently shown slice in X-direction.
   * 
   * @type {!number}
   * @protected
   */
  this['_indexX'] = 0;
  
  /**
   * The index of the formerly shown slice in X-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexXold = 0;
  
  /**
   * The index of the currently shown slice in Y-direction.
   * 
   * @type {!number}
   * @protected
   */
  this['_indexY'] = 0;
  
  /**
   * The index of the formerly shown slice in Y-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexYold = 0;
  
  /**
   * The index of the currently shown slice in Z-direction.
   * 
   * @type {!number}
   * @protected
   */
  this['_indexZ'] = 0;
  
  /**
   * The index of the formerly shown slice in Z-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexZold = 0;
  
  /**
   * The X.object holding the slices in X-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesX = new X.object();
  
  /**
   * The X.object holding the slices in Y-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesY = new X.object();
  
  /**
   * The X.object holding the slices in Z-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesZ = new X.object();
  
  /**
   * The upper threshold for this volume.
   * 
   * @type {number}
   * @public
   */
  this['_lowerThreshold'] = 0;
  
  /**
   * The upper threshold for this volume.
   * 
   * @type {number}
   * @public
   */
  this['_upperThreshold'] = 1000;
  
  /**
   * The scalar range of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._scalarRange = [0, 1000];
  
};
// inherit from X.object
goog.inherits(X.volume, X.object);


/**
 * Create the volume.
 * 
 * @private
 */
X.volume.prototype.create_ = function() {

  // remove all old children
  this.children().length = 0;
  
  // add the new children
  this.children().push(this._slicesX);
  this.children().push(this._slicesY);
  this.children().push(this._slicesZ);
  
  //
  // create the slices
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var halfDimension = (this._dimensions[xyz] - 1) / 2;
    
    var _indexCenter = halfDimension;
    
    var i = 0;
    for (i = 0; i < this._dimensions[xyz]; i++) {
      
      var _position = (-halfDimension * this._spacing[xyz]) +
          (i * this._spacing[xyz]);
      
      var _center = new Array([_position, this._center[1], this._center[2]],
          [this._center[0], _position, this._center[2]], [this._center[0],
                                                          this._center[1],
                                                          _position]);
      
      var _front = new Array([1, 0, 0], [0, 1, 0], [0, 0, 1]);
      var _up = new Array([0, 1, 0], [0, 0, -1], [0, 1, 0]);
      
      // the container and indices
      var slices = this.children()[xyz].children();
      
      // dimensions
      var width = 0;
      var height = 0;
      if (xyz == 0) {
        // for x slices
        width = this._dimensions[2] * this._spacing[2] - this._spacing[2];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
      } else if (xyz == 1) {
        // for y slices
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[2] * this._spacing[2] - this._spacing[2];
      } else if (xyz == 2) {
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
      }
      
      // .. new slice
      var _slice = new X.slice(_center[xyz], _front[xyz], _up[xyz], width,
          height);
      _slice._volume = this;
      
      // only show the middle slice, hide everything else
      _slice.setVisible(i == _indexCenter);
      
      // attach to all _slices with the correct slice index
      slices.push(_slice);
      
    }
    
    // by default, all the 'middle' slices are shown
    if (xyz == 0) {
      this['_indexX'] = _indexCenter;
      this._indexXold = _indexCenter;
    } else if (xyz == 1) {
      this['_indexY'] = _indexCenter;
      this._indexYold = _indexCenter;
    } else if (xyz == 2) {
      this['_indexZ'] = _indexCenter;
      this._indexZold = _indexCenter;
    }
  }
  
  this._dirty = true;
  
};

/**
 * Show the current slices which are set by this._indexX, this._indexY and
 * this._indexZ and hide all others.
 * 
 * @inheritDoc
 */
X.volume.prototype.modified = function() {

  // display the current slices in X,Y and Z direction
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var currentIndex = 0;
    var oldIndex = 0;
    
    if (xyz == 0) {
      currentIndex = this['_indexX'];
      oldIndex = this._indexXold;
      this._indexXold = this['_indexX'];
    } else if (xyz == 1) {
      currentIndex = this['_indexY'];
      oldIndex = this._indexYold;
      this._indexYold = this['_indexY'];
    } else if (xyz == 2) {
      currentIndex = this['_indexZ'];
      oldIndex = this._indexZold;
      this._indexZold = this['_indexZ'];
    }
    
    // hide the old slice
    this.children()[xyz].children()[parseInt(oldIndex, 10)].setVisible(false);
    // show the current slice
    this.children()[xyz].children()[parseInt(currentIndex, 10)]
        .setVisible(true);
    
  }
  
  // call the superclass' modified method
  X.volume.superClass_.modified.call(this);
  
};


/**
 * Get the dimensions of this volume.
 * 
 * @return {!Array} The dimensions of this volume.
 */
X.volume.prototype.dimensions = function() {

  return this._dimensions;
  
};


/**
 * Get the scalar range of this volume.
 * 
 * @return {!Array} The scalar range of this volume.
 */
X.volume.prototype.scalarRange = function() {

  return this._scalarRange;
  
};


/**
 * Threshold this volume. All pixel values smaller than lower or larger than
 * upper are ignored during rendering.
 * 
 * @param {!number} lower The lower threshold value.
 * @param {!number} upper The upper threshold value.
 * @throws {Error} If the specified range is invalid.
 */
X.volume.prototype.threshold = function(lower, upper) {

  if (!goog.isDefAndNotNull(lower) || !goog.isNumber(lower) ||
      !goog.isDefAndNotNull(upper) || !goog.isNumber(upper) ||
      (lower > upper) || (lower < this._scalarRange[0]) ||
      (upper > this._scalarRange[1])) {
    
    throw new Error('Invalid threshold range.');
    
  }
  
  this._lowerThreshold = lower;
  this._upperThreshold = upper;
  
};


X.volume.prototype.volumeRenderingOn = function() {

  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var currentIndex;
    if (xyz == 0) {
      currentIndex = this['_indexX'];
    } else if (xyz == 1) {
      currentIndex = this['_indexY'];
    } else if (xyz == 2) {
      currentIndex = this['_indexZ'];
    }
    
    this.children()[xyz].children()[parseInt(currentIndex, 10)]
        .setVisible(false);
    
  }
  

  var xChildren = this.children()[2].children();
  // var xChildrenLength = this.children()[0].children().length;
  
  var xC;
  for (xC in xChildren) {
    

    xC = xChildren[xC];
    xC.setVisible(true);
    xC.setOpacity(0.3);
    
  }
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);
goog.exportSymbol('X.volume.prototype.dimensions',
    X.volume.prototype.dimensions);
goog.exportSymbol('X.volume.prototype.scalarRange',
    X.volume.prototype.scalarRange);
goog.exportSymbol('X.volume.prototype.modified', X.volume.prototype.modified);

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
 * @param {!Array} center The center position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!number} size The width and height of one side of the volume.
 * @extends X.object
 */
X.volume = function(center, size) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      (center.length != 3)) {
    
    throw new Error('Invalid center.');
    
  }
  
  if (!goog.isNumber(size)) {
    
    throw new Error('Invalid size.');
    
  }
  
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
  
  this._center = center;
  
  this._size = size;
  
  this._dimensions = [3 * size, 3 * size, 3 * size];
  
  this['_indexX'] = 0;
  this._indexXold = 0;
  
  this['_indexY'] = 0;
  this._indexYold = 0;
  
  this['_indexZ'] = 0;
  this._indexZold = 0;
  
  this._slicesX = new X.object();
  
  this._slicesY = new X.object();
  
  this._slicesZ = new X.object();
  
  this.create_();
  
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
    var spacing = 2 * this._size / this._dimensions[xyz];
    var _indexCenter = Math.floor(this._dimensions[xyz] / 2);
    
    var i = 0;
    for (i = 0; i <= this._dimensions[xyz]; i++) {
      
      var _position = -this._size + (i * spacing);
      
      var _center = [[_position, this._center[1], this._center[2]],
                     [this._center[0], _position, this._center[2]],
                     [this._center[0], this._center[1], _position]];
      
      var _front = new Array([1, 0, 0], [0, 1, 0], [0, 0, 1]);
      var _up = new Array([0, 1, 0], [0, 0, -1], [0, 1, 0]);
      
      // the container and indices
      var slices = this.children()[xyz].children();
      
      // .. new slice
      var _slice = new X.slice(_center[xyz], _front[xyz], _up[xyz], this._size);
      
      // only show the middle slice, hide everything else
      _slice.setVisible(i == _indexCenter);
      
      // attach to all _slicesX with the correct slice index
      slices.push(_slice);
      
    }
    
    // by default, all the 'middle' slices are shown
    if (xyz == 0) {
      this._indexX = _indexCenter;
      this._indexXold = _indexCenter;
    } else if (xyz == 1) {
      this._indexY = _indexCenter;
      this._indexYold = _indexCenter;
    } else if (xyz == 2) {
      this._indexZ = _indexCenter;
      this._indexZold = _indexCenter;
    }
  }
  
};

X.volume.prototype.modified = function() {

  // display the current slices in X,Y and Z direction
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var currentIndex = 0;
    var oldIndex = 0;
    
    if (xyz == 0) {
      currentIndex = this._indexX;
      oldIndex = this._indexXold;
      this._indexXold = this._indexX;
    } else if (xyz == 1) {
      currentIndex = this._indexY;
      oldIndex = this._indexYold;
      this._indexYold = this._indexY;
    } else if (xyz == 2) {
      currentIndex = this._indexZ;
      oldIndex = this._indexZold;
      this._indexZold = this._indexZ;
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

// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);

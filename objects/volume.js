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
goog.require('X.thresholdable');



/**
 * Create a displayable volume which consists of X.slices in X,Y and Z direction
 * and can also be volume rendered.
 * 
 * @constructor
 * @param {X.volume=} volume Another X.volume to use as a template.
 * @extends X.object
 * @mixin X.loadable
 * @mixin X.thresholdable
 */
X.volume = function(volume) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'volume';
  
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
   * The image data as a 3D array.
   * 
   * @type {!Array}
   * @protected
   */
  this._image = [];
  

  /**
   * The index of the currently shown slice in X-direction.
   * 
   * @type {!number}
   * @public
   */
  this._indexX = 0;
  
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
   * @public
   */
  this._indexY = 0;
  
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
   * @public
   */
  this._indexZ = 0;
  
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
   * The toggle for volume rendering or cross-sectional slicing.
   * 
   * @type {boolean}
   * @public
   */
  this._volumeRendering = false;
  
  /**
   * The cached toggle for volume rendering or cross-sectional slicing.
   * 
   * @type {boolean}
   * @public
   */
  this._volumeRenderingOld = false;
  
  /**
   * The direction for the volume rendering. This is used for caching.
   * 
   * @type {!number}
   * @private
   */
  this._volumeRenderingDirection = 0;
  
  /**
   * The label map of this volume.
   * 
   * @type {?X.volume}
   * @private
   */
  this._labelmap = null;
  
  /**
   * Flag to show borders or not.
   * 
   * @type {boolean}
   * @protected
   */
  this._borders = true;
  
  /**
   * The lower window border.
   * 
   * @type {!number}
   * @private
   */
  this._windowLow = Infinity;
  
  /**
   * The upper window border.
   * 
   * @type {!number}
   * @private
   */
  this._windowHigh = -Infinity;
  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  inject(this, new X.thresholdable()); // this object is thresholdable
  
  if (goog.isDefAndNotNull(volume)) {
    
    // copy the properties of the given volume over
    this.copy_(volume);
    
  }
  
};
// inherit from X.object
goog.inherits(X.volume, X.object);



/**
 * Copies the properties from a given volume to this volume.
 * 
 * @param {!X.volume} volume The given volume.
 * @protected
 */
X.volume.prototype.copy_ = function(volume) {

  window.console.log(volume);
  this._center = volume._center.slice();
  this._dimensions = volume._dimensions.slice();
  this._spacing = volume._spacing.slice();
  this._indexX = volume._indexX;
  this._indexXold = volume._indexXold;
  this._indexY = volume._indexY;
  this._indexYold = volume._indexYold;
  this._indexZ = volume._indexZ;
  this._indexZold = volume._indexZold;
  this._slicesX = new X.object(volume._slicesX);
  this._slicesY = new X.object(volume._slicesY);
  this._slicesZ = new X.object(volume._slicesZ);
  
  // TODO threshold
  
  this._volumeRendering = volume._volumeRendering;
  this._volumeRenderingOld = volume._volumeRenderingOld;
  this._volumeRenderingDirection = volume._volumeRenderingDirection;
  this._labelmap = volume._labelmap;
  this._borders = volume._borders;
  
  // call the superclass' modified method
  goog.base(this, 'copy_', volume);
  
};


/**
 * Create the volume.
 * 
 * @private
 */
X.volume.prototype.create_ = function() {

  // remove all old children
  this._children.length = 0;
  this._slicesX._children.length = 0;
  this._slicesY._children.length = 0;
  this._slicesZ._children.length = 0;
  
  // add the new children
  this._children.push(this._slicesX);
  this._children.push(this._slicesY);
  this._children.push(this._slicesZ);
  
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
      
      var _center = new Array([this._center[0] + _position, this._center[1],
                               this._center[2]], [this._center[0],
                                                  this._center[1] + _position,
                                                  this._center[2]],
          [this._center[0], this._center[1], this._center[2] + _position]);
      
      var _front = new Array([1, 0, 0], [0, 1, 0], [0, 0, 1]);
      var _up = new Array([0, 1, 0], [0, 0, -1], [0, 1, 0]);
      
      // the container and indices
      var slices = this._children[xyz]._children;
      
      // dimensions
      var width = 0;
      var height = 0;
      var borderColor = [1, 1, 1];
      var borders = this._borders;
      if (xyz == 0) {
        // for x slices
        width = this._dimensions[2] * this._spacing[2] - this._spacing[2];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
        borderColor = [1, 1, 0];
      } else if (xyz == 1) {
        // for y slices
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[2] * this._spacing[2] - this._spacing[2];
        borderColor = [1, 0, 0];
      } else if (xyz == 2) {
        // for z slices
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
        borderColor = [0, 1, 0];
      }
      
      // for labelmaps, don't create the borders since this would create them 2x
      if (goog.isDefAndNotNull(this._volume)) {
        borders = false;
      }
      
      // .. new slice
      var _slice = new X.slice();
      _slice.setup(_center[xyz], _front[xyz], _up[xyz], width, height, borders,
          borderColor);
      _slice._volume = this;
      
      // only show the middle slice, hide everything else
      _slice['visible'] = (i == Math.floor(_indexCenter));
      
      // attach to all _slices with the correct slice index
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
  
  this._dirty = true;
  
};

/**
 * Re-show the slices or re-activate the volume rendering for this volume.
 * 
 * @inheritDoc
 */
X.volume.prototype.modified = function(propagateEvent) {

  // by default, propagate event should be true
  propagateEvent = typeof propagateEvent !== 'undefined' ? propagateEvent
      : true;
  
  // only do this if we already have children aka. the create_() method was
  // called
  if (this._children.length > 0) {
    if (this._volumeRendering != this._volumeRenderingOld) {
      
      if (this._volumeRendering) {
        
        // first, hide possible slicing slices but only if volume rendering was
        // just switched on
        var _sliceX = this._children[0]._children[parseInt(this._indexX, 10)];
        _sliceX['visible'] = false;
        var _sliceY = this._children[1]._children[parseInt(this._indexY, 10)];
        _sliceY['visible'] = false;
        var _sliceZ = this._children[2]._children[parseInt(this._indexZ, 10)];
        _sliceZ['visible'] = false;
        
      } else {
        
        // hide the volume rendering slices
        var _child = this._children[this._volumeRenderingDirection];
        _child['visible'] = false;
        
      }
      
      // switch from slicing to volume rendering or vice versa
      this._dirty = true;
      this._volumeRenderingOld = this._volumeRendering;
      
    }
    
    if (this._volumeRendering) {
      
      // prepare volume rendering
      this.volumeRendering_(this._volumeRenderingDirection);
      
    } else {
      
      // prepare slicing
      this.slicing_();
      
    }
  }
  
  // call the superclass' modified method
  if (propagateEvent) {
    
    // but only if propagateEvent is not turned off
    goog.base(this, 'modified');
    
  }
  
};

/**
 * Show the current slices which are set by this._indexX, this._indexY and
 * this._indexZ and hide all others.
 */
X.volume.prototype.slicing_ = function() {

  // display the current slices in X,Y and Z direction
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var _child = this._children[xyz];
    var currentIndex = 0;
    var oldIndex = 0;
    
    // buffer the old indices
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
    var _oldSlice = _child._children[parseInt(oldIndex, 10)];
    _oldSlice['visible'] = false;
    
    // show the current slice and also show the borders if they exist by
    // calling the setter of visible rather than accessing the _visible property
    var _currentSlice = _child._children[parseInt(currentIndex, 10)];
    _currentSlice['visible'] = true;
    _currentSlice._opacity = 1.0;
    
  }
  
};


/**
 * Get the dimensions of this volume.
 * 
 * @return {!Array} The dimensions of this volume.
 * @public
 */
X.volume.prototype.__defineGetter__('dimensions', function() {

  return this._dimensions;
  
});


/**
 * Get the volume rendering setting of this X.volume.
 * 
 * @public
 */
X.volume.prototype.__defineGetter__('volumeRendering', function() {

  return this._volumeRendering;
  
});


/**
 * Toggle volume rendering or cross-sectional slicing of this X.volume.
 * 
 * @param {boolean} volumeRendering If TRUE, display volume rendering, if FALSE
 *          display cross-sectional slices.
 * @public
 */
X.volume.prototype.__defineSetter__('volumeRendering',
    function(volumeRendering) {

      this._volumeRendering = volumeRendering;
      
      // fire a modified event without propagation for fast switching
      this.modified(false);
      
    });


/**
 * @inheritDoc
 */
X.volume.prototype.__defineSetter__('visible', function(visible) {

  // we do not want to propagate to the children here
  this._visible = visible;
  
});


/**
 * Get the center of this X.volume.
 * 
 * @return {!Array} The center.
 * @public
 */
X.volume.prototype.__defineGetter__('center', function() {

  return this._center;
  
});


/**
 * Set the center of this X.volume. This has to be called (for now) before a
 * volume data gets loaded aka. before the first X.renderer.render() call.
 * 
 * @param {!Array} center The new center.
 * @throws {Error} If the center is invalid.
 * @public
 */
X.volume.prototype.__defineSetter__('center', function(center) {

  if (!goog.isDefAndNotNull(center) || !goog.isArray(center) ||
      !(center.length == 3)) {
    
    throw new Error('Invalid center.');
    
  }
  
  this._center = center;
  
});


/**
 * Get the original image data of this volume.
 * 
 * @return {!Array} A 3D array containing the pixel (image) data.
 * @public
 */
X.volume.prototype.__defineGetter__('image', function() {
  
  return this._image;
  
});


/**
 * Get the label map of this volume. A new label map gets created if required
 * (Singleton).
 * 
 * @return {!X.volume}
 * @public
 */
X.volume.prototype.__defineGetter__('labelmap', function() {

  if (!this._labelmap) {
    
    this._labelmap = new X.labelmap(this);
    
  }
  
  return this._labelmap;
  
});


/**
 * Get the slice index in X-direction.
 * 
 * @return {!number} The slice index in X-direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexX', function() {

  return this._indexX;
  
});


/**
 * Set the slice index in X-direction.
 * 
 * @param {!number} indexX The slice index in X-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexX', function(indexX) {

  if (goog.isNumber(indexX) && indexX >= 0 &&
      indexX < this._slicesX._children.length) {
    
    this._indexX = indexX;
    
    // fire a modified event without propagation for fast slicing
    this.modified(false);
    
  }
  
});


/**
 * Get the slice index in Y-direction.
 * 
 * @return {!number} The slice index in Y-direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexY', function() {

  return this._indexY;
  
});


/**
 * Set the slice index in Y-direction.
 * 
 * @param {!number} indexY The slice index in Y-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexY', function(indexY) {

  if (goog.isNumber(indexY) && indexY >= 0 &&
      indexY < this._slicesY._children.length) {
    
    this._indexY = indexY;
    
    // fire a modified event without propagation for fast slicing
    this.modified(false);
    
  }
  
});


/**
 * Get the slice index in Z-direction.
 * 
 * @return {!number} The slice index in Z-direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexZ', function() {

  return this._indexZ;
  
});


/**
 * Set the slice index in Z-direction.
 * 
 * @param {!number} indexZ The slice index in Z-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexZ', function(indexZ) {

  if (goog.isNumber(indexZ) && indexZ >= 0 &&
      indexZ < this._slicesZ._children.length) {
    
    this._indexZ = indexZ;
    
    // fire a modified event without propagation for fast slicing
    this.modified(false);
    
  }
  
});


/**
 * Return the lower window border for window/level adjustment.
 * 
 * @return {!number} The lower window border.
 * @public
 */
X.volume.prototype.__defineGetter__('windowLow', function() {

  return this._windowLow;
  
});


/**
 * Set the lower window border for window/level adjustment.
 * 
 * @param {!number} windowLow The new lower window border.
 * @public
 */
X.volume.prototype.__defineSetter__('windowLow', function(windowLow) {

  this._windowLow = windowLow;
  
});


/**
 * Return the upper window border for window/level adjustment.
 * 
 * @return {!number} The upper window border.
 * @public
 */
X.volume.prototype.__defineGetter__('windowHigh', function() {

  return this._windowHigh;
  
});


/**
 * Set the upper window border for window/level adjustment.
 * 
 * @param {!number} windowHigh The new upper window border.
 * @public
 */
X.volume.prototype.__defineSetter__('windowHigh', function(windowHigh) {

  this._windowHigh = windowHigh;
  
});


/**
 * Return the borders flag.
 * 
 * @return {boolean} TRUE if borders are enabled, FALSE otherwise.
 * @public
 */
X.volume.prototype.__defineGetter__('borders', function() {

  return this._borders;
  
});


/**
 * Set the borders flag. Must be called before the volume gets created
 * internally. After that, the borders can be modified using the children of
 * each slice.
 * 
 * @param {boolean} borders TRUE to enable borders, FALSE to disable them.
 * @public
 */
X.volume.prototype.__defineSetter__('borders', function(borders) {

  this._borders = borders;
  
});


/**
 * Perform volume rendering of this volume along a specific direction. The
 * direction is important since we show tiled 2d textures along the direction
 * for a clean rendering experience.
 * 
 * @param {number} direction The direction of the volume rendering
 *          (0==x,1==y,2==z).
 * @protected
 */
X.volume.prototype.volumeRendering_ = function(direction) {

  if ((!this._volumeRendering) ||
      (!this._dirty && direction == this._volumeRenderingDirection)) {
    
    // we do not have to do anything
    return;
    
  }
  
  // hide old volume rendering slices
  var _child = this._children[this._volumeRenderingDirection];
  _child['visible'] = false;
  
  // show new volume rendering slices, but don't show the borders
  _child = this._children[direction];
  var _numberOfSlices = _child._children.length;
  var i;
  for (i = 0; i < _numberOfSlices; i++) {
    _child._children[i]._visible = true;
  }
  // _child['visible'] = true;
  
  // store the direction
  this._volumeRenderingDirection = direction;
  
  this._dirty = false;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);
goog.exportSymbol('X.volume.prototype.modified', X.volume.prototype.modified);

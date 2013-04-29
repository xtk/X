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
   * The index of the shown slice in Left-Right direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexLR = 0;
  /**
   * The index of the shown slice in Posterior-Anterior direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexPA = 0;
  /**
   * The index of the shown slice in Inferior-Superior direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexIS = 0;
  /**
   * The dimensions of this volume 0: SAGITTAL, 1: CORONAL, 2: AXIAL.
   * 
   * @type {!Array}
   * @protected
   */
  this._dimensionsRAS = [ 10, 10, 10 ];
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

  /**
   * The reslicing flag.
   *
   * @type {!boolean}
   * @protected
   */
  this._reslicing = true;
  /**
   * The space in which image was acquired
   * 
   * @type {!Array}
   * @protected
   */
  this._space = [ 'left', 'posterior', 'superior' ];
  /**
   * The image orientation
   * 
   * @type {!Array}
   * @protected
   */
  this._spaceorientation = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
  /**
   * The image orientation in RAS space
   * 
   * @type {!Array}
   * @protected
   */
  this._rasspaceorientation = [ -1, 0, 0, 0, -1, 0, 0, 0, 1 ];
  /**
   * The orientation of each cosine
   * 
   * @type {!Array}
   * @protected
   */
  this._orientation = [ -1, -1, 1 ];
  /**
   * The normalized cosines
   * 
   * @type {!Array}
   * @protected
   */
  this._normcosine = [ [ -1, 0, 0 ], [ 0, -1, 0 ], [ 0, 0, 1 ] ];
  /**
   * The max intensity in the image
   * 
   * @type {!number}
   * @private
   */
  this._max = 0;
  /**
   * The image pixels
   * 
   * @type {?Array}
   * @protected
   */
  this._data = null;
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
 * @param {*} volume The given volume.
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
  this._indexLR = volume._indexLR;
  this._indexPA = volume._indexPA;
  this._indexIS = volume._indexIS;
  this._dimensionsRAS = volume._dimensionsRAS.slice();
  this._slicesX = new X.object(volume._slicesX);
  this._slicesY = new X.object(volume._slicesY);
  this._slicesZ = new X.object(volume._slicesZ);
  this._space = volume.space;
  this._spaceorientation = volume._spaceorientation;
  this._rasspaceorientation = volume._rasspaceorientation;
  this._orientation = volume._orientation;
  this._normcosine = volume._normcosine;
  this._max = volume._max;
  this._data = volume._data;
  // all info
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
X.volume.prototype.create_ = function(_info) {
  // remove all old children
  this._children.length = 0;
  this._slicesX._children.length = 0;
  this._slicesY._children.length = 0;
  this._slicesZ._children.length = 0;
  // add the new children
  this._children.push(this._slicesX);
  this._children.push(this._slicesY);
  this._children.push(this._slicesZ);
  // setup image specific information
  this._space = _info.space;
  this._spaceorientation = _info.spaceorientation;
  this._rasspaceorientation = _info.rasspaceorientation;
  this._orientation = _info.orientation;
  this._normcosine = _info.normcosine;
  this._max = _info.max;
  this._data = _info.data;
  
  
  this._dirty = true;

};
/**
 * Map variables to user friendly named variables
 * 
 * @private
 */
X.volume.prototype.map_ = function() {
  if (this._normcosine[2][0] != 0) {
    this._indexLR = this._indexX;
    this._indexPA = this._indexY;
    this._indexIS = this._indexZ;
    this._dimensionsRAS[0] = this._dimensions[2];
    this._dimensionsRAS[1] = this._dimensions[0];
    this._dimensionsRAS[2] = this._dimensions[1];
  } else if (this._normcosine[2][1] != 0) {
    this._indexLR = this._indexZ;
    this._indexPA = this._indexX;
    this._indexIS = this._indexY;
    this._dimensionsRAS[0] = this._dimensions[1];
    this._dimensionsRAS[1] = this._dimensions[2];
    this._dimensionsRAS[2] = this._dimensions[0];
  } else {
    this._indexLR = this._indexY;
    this._indexPA = this._indexZ;
    this._indexIS = this._indexX;
    this._dimensionsRAS[0] = this._dimensions[0];
    this._dimensionsRAS[1] = this._dimensions[1];
    this._dimensionsRAS[2] = this._dimensions[2];
  }
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

    if (!this._visible) {
      return;
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
 * Get the dimensions of this volume.
 *
 * @return {!Array} The dimensions of this volume in RAS context.
 * @public
 */
X.volume.prototype.__defineGetter__('dimensionsRAS', function() {
  return this._dimensionsRAS;
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
X.volume.prototype.__defineGetter__('visible', function() {

  return this._visible;

});


/**
 * @inheritDoc
 */
X.volume.prototype.__defineSetter__('visible', function(visible) {

  if (visible) {

    // here we have to only set specific children to visible using
    // the modified function without down propagation..
    this._visible = visible;

    // .. but then call the modified function to show/hide individual or
    // all slices depending on the volume rendering setting
    this.modified(false);

  } else {

    // since nothing should be visible we just use the setter of the
    // X.displayable inject which propagates everything down
    // loop through the children and set the new visibility
    var children = this._children;
    var numberOfChildren = children.length;
    var c = 0;

    for (c = 0; c < numberOfChildren; c++) {

      children[c]['visible'] = visible;

    }

    this._visible = visible;

    this._dirty = true;

  }

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
 * Get the slice index in Inferior-Superior direction.
 * 
 * @return {!number} The slice index in Inferior-Superior direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexIS', function() {
  // map variables based on orientation
  if (this._normcosine[2][0] != 0) {
    this._indexIS = this._indexZ;
  } else if (this._normcosine[2][1] != 0) {
    this._indexIS = this._indexY;
  } else {
    this._indexIS = this._indexX;
  }
  return this._indexIS;
});
/**
 * Set the slice index in Inferior-Superior direction.
 * 
 * @param {!number}
 *          indexIS The slice index in Inferior-Superior direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexIS', function(indexIS) {
  if (goog.isNumber(indexIS)) {
    // map variables based on orientation
    if (this._normcosine[2][0] != 0) {
      this._indexZ = indexIS;
    } else if (this._normcosine[2][1] != 0) {
      this._indexY = indexIS;
    } else {
      this._indexX = indexIS;
    }
    this._indexIS = indexIS;
    // fire a modified event without propagation for fast slicing
    this.modified(false);
  }
});
/**
 * Get the slice index in Left-Right direction.
 * 
 * @return {!number} The slice index in Left-Right direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexLR', function() {
  // map variables based on orientation
  if (this._normcosine[2][0] != 0) {
    this._indexLR = this._indexX;
  } else if (this._normcosine[2][1] != 0) {
    this._indexLR = this._indexZ;
  } else {
    this._indexLR = this._indexY;
  }
  return this._indexLR;
});
/**
 * Set the slice index in Left-Right direction.
 * 
 * @param {!number}
 *          indexLR The slice index in Left-Right direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexLR', function(indexLR) {
  if (goog.isNumber(indexLR)) {
    // map variables based on orientation
    if (this._normcosine[2][0] != 0) {
      this._indexX = indexLR;
    } else if (this._normcosine[2][1] != 0) {
      this._indexZ = indexLR;
    } else {
      this._indexY = indexLR;
    }
    this._indexLR = indexLR;
    // fire a modified event without propagation for fast slicing
    this.modified(false);
  }
});
/**
 * Get the slice index in Posterior-Anterior direction.
 * 
 * @return {!number} The slice index in Posterior-Anterior direction.
 * @public
 */
X.volume.prototype.__defineGetter__('indexPA', function() {
  // map variables based on orientation
  if (this._normcosine[2][0] != 0) {
    this._indexPA = this._indexY;
  } else if (this._normcosine[2][1] != 0) {
    this._indexPA = this._indexX;
  } else {
    this._indexPA = this._indexZ;
  }
  return this._indexPA;
});
/**
 * Set the slice index in Posterior-Anterior direction.
 * 
 * @param {!number}
 *          indexPA The slice index in Posterior-Anterior direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexPA', function(indexPA) {
  if (goog.isNumber(indexPA)) {
    // map variables based on orientation
    if (this._normcosine[2][0] != 0) {
      this._indexY = indexPA;
    } else if (this._normcosine[2][1] != 0) {
      this._indexX = indexPA;
    } else {
      this._indexZ = indexPA;
    }
    this._indexPA = indexPA;
    // fire a modified event without propagation for fast slicing
    this.modified(false);
  }
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
 * Return the reslicing flag.
 *
 * @return {boolean} TRUE if reslicing is enabled, FALSE otherwise.
 * @public
 */
X.volume.prototype.__defineGetter__('reslicing', function() {

  return this._reslicing;

});


/**
 * Set the borders flag. Must be called before the volume gets created
 * internally. After that, the borders can be modified using the children of
 * each slice.
 *
 * @param {boolean} reslicing TRUE to enable reslicing, FALSE to disable it.
 * @public
 */
X.volume.prototype.__defineSetter__('reslicing', function(reslicing) {

  this._reslicing = reslicing;

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
  // map direction to correspoding container
  // mapping based on slice's normal
  // direction 0: sagittal container
  // direction 1: coronal container
  // direction 3: axial container
  var _dir = (direction + 2) % 3;
  if (this._normcosine[0][_dir] != 0) {
    _dir = 2;
  } else if (this._normcosine[1][_dir] != 0) {
    _dir = 0;
  } else {
    _dir = 1;
  }
  if ((!this._volumeRendering)
      || (!this._dirty && _dir == this._volumeRenderingDirection)) {
    // we do not have to do anything
    return;

  }

  // hide old volume rendering slices
  var _child = this._children[this._volumeRenderingDirection];
  _child['visible'] = false;

  // show new volume rendering slices, but don't show the borders
  _child = this._children[_dir];
  var _numberOfSlices = _child._children.length;
  var i;
  for (i = 0; i < _numberOfSlices; i++) {
    _child._children[i]._visible = true;
  }
  // _child['visible'] = true;

  // store the direction
  this._volumeRenderingDirection = _dir;
  this._dirty = false;

};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);
goog.exportSymbol('X.volume.prototype.modified', X.volume.prototype.modified);

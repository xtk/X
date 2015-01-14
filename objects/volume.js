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
goog.require('X.parser');
goog.require('X.thresholdable');


/**
 * Create a displayable volume which consists of X.slices in X,Y and Z direction
 * and can also be volume rendered.
 *
 * @constructor
 * @param {X.volume=}
 *          volume Another X.volume to use as a template.
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
  this._center = [ 0, 0, 0 ];

  /**
   * The dimensions of this volume.
   *
   * @type {!Array}
   * @protected
   */
  this._dimensions = [ 10, 10, 10 ];


  /**
   * The RAS Bonding Box of this volume.
   *
   * @type {!Array}
   * @protected
   */
  this._BBox = [1, 1, 1];

  /**
   * The range of the x, y and z slices.
   *
   * @type {!Array}
   * @protected
   */
  this._range = [ 10, 10, 10 ];

  /**
   * The spacing of this volume.
   *
   * @type {!Array}
   * @protected
   */
  this._spacing = [ 1, 1, 1 ];

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
  this._volumeRenderingDirection = -1;

  /**
   * Cache for the already computed volume rendering directions.
   *
   * @type {!Array}
   * @private
   */
  this._volumeRenderingCache = [];

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
   * The resolution factor.
   * It lets us artificialy increasing the resolution of the slice,
   * by decreasing the in slice spacing.
   *
   * @type {!number}
   * @protected
   */
  this._resolutionFactor = 1;

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

  /**
   * The information about the children slices
   *
   * @type {!Array}
   * @protected
   */
  this._childrenInfo = [];

  /**
   * The volume center in RAS coordinates
   *
   * @type {!Array}
   * @protected
   */
  this._RASCenter = [0, 0, 0];

  /**
   * The volume dimensions in RAS coordinates
   *
   * @type {!Array}
   * @protected
   */
  this._RASDimensions = [0, 0, 0];

  /**
   * The volume spacing in RAS coordinates
   *
   * @type {!Array}
   * @protected
   */
  this._RASSpacing = [0, 0, 0];

  /**
   * The volume pixel values in IJK coordinates
   *
   * @type {!Array}
   * @protected
   */
  this._IJKVolume = [];

  /**
   * The volume normalized pixel values in IJK coordinates
   *
   * @type {!Array}
   * @protected
   */
  this._IJKVolumeN = [];

  /**
   * The raw data
   *
   * @type {?Array}
   * @protected
   */
  this._filedata = null;

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
 * @param {*}
 *          volume The given volume.
 * @protected
 */
X.volume.prototype.copy_ = function(volume) {

  this._center = volume._center.slice();
  this._dimensions = volume._dimensions.slice();
  this._spacing = volume._spacing.slice();

  this._indexX = volume._indexX;
  this._indexXold = volume._indexXold;
  this._indexY = volume._indexY;
  this._indexYold = volume._indexYold;
  this._indexZ = volume._indexZ;
  this._indexZold = volume._indexZold;

  this._dimensionsRAS = volume._dimensionsRAS.slice();
  this._slicesX = new X.object(volume._slicesX);
  this._slicesY = new X.object(volume._slicesY);
  this._slicesZ = new X.object(volume._slicesZ);

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
  this._RASOrigin = _info.RASOrigin;
  this._RASSpacing = _info.RASSpacing;
  this._RASDimensions = _info.RASDimensions;
  this._IJKToRAS = _info.IJKToRAS;
  this._RASToIJK = _info.RASToIJK;
  this._max = _info.max;
  this._data = _info.data;
  this._dirty = true;
};

/**
 * @inheritDoc
 */
X.volume.prototype.destroy = function() {

  // call destroy of parent
  // call the update_ method of the superclass
  goog.base(this, 'destroy');

  this._image.length = 0;
  this._children.length = 0;
  this._slicesX._children.length = 0;
  this._slicesX.length = 0;
  this._slicesY._children.length = 0;
  this._slicesY.length = 0;
  this._slicesZ._children.length = 0;
  this._slicesZ.length = 0;
  this._data = null;
  this._BBox.length = 0;
  this._childrenInfo.length = 0;
  this._RASCenter.length = 0;
  this._RASDimensions.length = 0;
  this._RASSpacing.length = 0;
  this._IJKVolume.length = 0;
  this._IJKVolumeN.length = 0;
  this._filedata = null;

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

      if (!this._volumeRendering && this._volumeRenderingDirection != -1) {

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

    this.slicing_();

    if (this._volumeRendering && this._volumeRenderingDirection != -1) {
      // prepare volume rendering
      this.volumeRendering_(this._volumeRenderingDirection);

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

    // RESLICE VOLUME IF NECESSARY!
    if(!goog.isDefAndNotNull(this._children[xyz]._children[parseInt(currentIndex, 10)])){

      // GO reslice!
      var _sliceOrigin = goog.vec.Vec3.createFloat32();

      _sliceOrigin[0] = this._childrenInfo[xyz]._solutionsLine[0][0][0] + this._childrenInfo[xyz]._sliceDirection[0]*parseInt(currentIndex, 10);
      _sliceOrigin[1] = this._childrenInfo[xyz]._solutionsLine[0][0][1] + this._childrenInfo[xyz]._sliceDirection[1]*parseInt(currentIndex, 10);
      _sliceOrigin[2] = this._childrenInfo[xyz]._solutionsLine[0][0][2] + this._childrenInfo[xyz]._sliceDirection[2]*parseInt(currentIndex, 10);

      //attach labelmap
      if(this.hasLabelMap){
        var _sliceLabel = X.parser.reslice2(_sliceOrigin, this._childrenInfo[xyz]._sliceXYSpacing, this._childrenInfo[xyz]._sliceNormal, this._childrenInfo[xyz]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
        this._labelmap._children[xyz]._children[parseInt(currentIndex, 10)] = _sliceLabel;
        // add it to create the texture
        this._labelmap._children[xyz].modified(true);
      }

      var _slice = X.parser.reslice2(_sliceOrigin, this._childrenInfo[xyz]._sliceXYSpacing, this._childrenInfo[xyz]._sliceNormal, this._childrenInfo[xyz]._color, this._BBox, this._IJKVolume, this, true, null);

      if(this.hasLabelMap){
        _slice._labelmap = _slice._texture;
        _slice._labelmap = this._labelmap._children[xyz]._children[parseInt(currentIndex, 10)]._texture;
      }

      _child._children[parseInt(currentIndex, 10)] = _slice;

      // add it to renderer!
      this._children[xyz].modified(true);
    }
    // DONE RESLICING!

    // hide the old slice
    var _oldSlice = _child._children[parseInt(oldIndex, 10)];
    if(!this._volumeRendering){

      _oldSlice['visible'] = false;

    }

    // show the current slice and also show the borders if they exist by
    // calling the setter of visible rather than accessing the _visible property
    var _currentSlice = _child._children[parseInt(currentIndex, 10)];
    _currentSlice['visible'] = true;
    _currentSlice._opacity = 1.0;

    if(this._volumeRendering){

      _currentSlice._children[0]._visible = false;
      if(xyz != this._volumeRenderingDirection){

        _currentSlice['visible'] = false;
        _currentSlice._opacity = 0.0;

      }

    }

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
 * Set the dimensions of this volume.
 *
 * @param {!Array} dimensions The dimensions of this volume.
 * @public
 */
X.volume.prototype.__defineSetter__('dimensions', function(dimensions) {

  this._dimensions = dimensions;

});

/**
 * Get the spacing of this volume.
 *
 * @return {!Array} The spacing of this volume.
 * @public
 */
X.volume.prototype.__defineGetter__('spacing', function() {

  return this._spacing;

});

/**
 * Set the spacing of this volume.
 *
 * @param {!Array} spacing The spacing of this volume.
 * @public
 */
X.volume.prototype.__defineSetter__('spacing', function(spacing) {

  this._spacing = spacing;

});


/**
 * Get the RAS Bounding Box of this volume.
 *
 * @return {!Array} The dimensions of this volume.
 * @public
 */
X.volume.prototype.__defineGetter__('bbox', function() {

  return this._BBox;

});

/**
 * Get the range of this volume.
 *
 * @return {!Array} The dimensions of this volume.
 * @public
 */
X.volume.prototype.__defineGetter__('range', function() {

  return this._range;

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
 * @param {boolean}
 *          volumeRendering If TRUE, display volume rendering, if FALSE display
 *          cross-sectional slices.
 * @public
 */
X.volume.prototype.__defineSetter__('volumeRendering', function(volumeRendering) {

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
 * @param {!Array}
 *          center The new center.
 * @throws {Error}
 *           If the center is invalid.
 * @public
 */
X.volume.prototype.__defineSetter__('center', function(center) {

  if (!goog.isDefAndNotNull(center) || !goog.isArray(center)
      || !(center.length == 3)) {

    throw new Error('Invalid center.');

  }

  this._center = center;

});

/**
 * Get the volumeRenderingCache of this X.volume.
 *
 * @return {!Array} The volume rendering cache.
 * @public
 */
X.volume.prototype.__defineGetter__('volumeRenderingCache', function() {

  return this._volumeRenderingCache;

});


/**
 * Set the volumeRenderingCache of this X.volume.
 *
 * @param {!Array}
 *          volumeRenderingCache The new volume rendering cache.
 * @throws {Error}
 *           If the volume rendering cache is invalid.
 * @public
 */
X.volume.prototype.__defineSetter__('volumeRenderingCache', function(volumeRenderingCache) {

  if (!goog.isDefAndNotNull(volumeRenderingCache) || !goog.isArray(volumeRenderingCache)
      || !(volumeRenderingCache.length <= 3)) {

    throw new Error('Invalid volumeRederingCache.');

  }

  this._volumeRenderingCache = volumeRenderingCache;

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
 * @param {!number}
 *          indexX The slice index in X-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexX', function(indexX) {

  if (goog.isNumber(indexX) && indexX >= 0
      && indexX < this._slicesX._children.length) {

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
 * @param {!number}
 *          indexY The slice index in Y-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexY', function(indexY) {

  if (goog.isNumber(indexY) && indexY >= 0
      && indexY < this._slicesY._children.length) {

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
 * @param {!number}
 *          indexZ The slice index in Z-direction.
 * @public
 */
X.volume.prototype.__defineSetter__('indexZ', function(indexZ) {

  if (goog.isNumber(indexZ) && indexZ >= 0
      && indexZ < this._slicesZ._children.length) {

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
 * @param {!number}
 *          windowLow The new lower window border.
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
 * @param {!number}
 *          windowHigh The new upper window border.
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
 * @param {boolean}
 *          borders TRUE to enable borders, FALSE to disable them.
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
 * Set the reslicing flag for this volume.
 *
 * @param {boolean}
 *          reslicing TRUE to enable reslicing, FALSE to disable it.
 * @public
 */
X.volume.prototype.__defineSetter__('reslicing', function(reslicing) {

  this._reslicing = reslicing;

});

/**
 * Return the resolution factor.
 *
 * @return {number} Default is 1.
 * @public
 */
X.volume.prototype.__defineGetter__('resolutionFactor', function() {

  return this._resolutionFactor;

});


/**
 * Set the resolution factor for this volume.
 * Must be set before the volume is loaded.
 *
 * @param {number} resolutionFactor Default is 1.
 * @public
 */
X.volume.prototype.__defineSetter__('resolutionFactor', function(resolutionFactor) {

  this._resolutionFactor = resolutionFactor;

});

/**
 * Set value of normal X of slice X.
 *
 * @param {number} xNormX Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('xNormX', function(xNormX) {

  this._childrenInfo[0]._sliceNormal[0] = xNormX;

});

/**
 * Get value of normal X of slice X.
 *
 * @return {number} xNormX.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('xNormX', function() {

  return this._childrenInfo[0]._sliceNormal[0] ;

});

/**
 * Set value of normal Y of slice X.
 *
 * @param {number} xNormY Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('xNormY', function(xNormY) {

  this._childrenInfo[0]._sliceNormal[1] = xNormY;

});

/**
 * Get value of normal Y of slice X.
 *
 * @return {number} xNormY.
 *
 * @public
 */
 X.volume.prototype.__defineGetter__('xNormY', function() {

  return this._childrenInfo[0]._sliceNormal[1];

});

/**
 * Set value of normal Z of slice X.
 *
 * @param {number} xNormZ Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('xNormZ', function(xNormZ) {

  this._childrenInfo[0]._sliceNormal[2] = xNormZ;

});

/**
 * Get value of normal Z of slice X.
 *
 * @return {number} xNormZ.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('xNormZ', function() {

  return this._childrenInfo[0]._sliceNormal[2];

});

/**
 * Set value of slice X color.
 *
 * @param {!Array} xColor [0-1, 0-1, 0-1].
 *
 * @public
 */
X.volume.prototype.__defineSetter__('xColor', function(xColor) {

  this._childrenInfo[0]._color = xColor;

});

/**
 * Get value of slice X color.
 *
 * @return {!Array} xColor.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('xColor', function() {

  return this._childrenInfo[0]._color;

});

/**
 * Set value of normal X of slice Y.
 *
 * @param {number} yNormX Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('yNormX', function(yNormX) {

  this._childrenInfo[1]._sliceNormal[0] = yNormX;

});

/**
 * Get value of normal X of slice X.
 *
 * @return {number} yNormX.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('yNormX', function() {

  return this._childrenInfo[1]._sliceNormal[0] ;

});

/**
 * Set value of normal Y of slice X.
 *
 * @param {number} yNormY Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('yNormY', function(yNormY) {

  this._childrenInfo[1]._sliceNormal[1] = yNormY;

});

/**
 * Get value of normal Y of slice Y.
 *
 * @return {number} yNormY.
 *
 * @public
 */
 X.volume.prototype.__defineGetter__('yNormY', function() {

  return this._childrenInfo[1]._sliceNormal[1];

});

/**
 * Set value of normal Z of slice Y.
 *
 * @param {number} yNormZ Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('yNormZ', function(yNormZ) {

  this._childrenInfo[1]._sliceNormal[2] = yNormZ;

});

/**
 * Get value of normal Z of slice Y.
 *
 * @return {number} yNormZ.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('yNormZ', function() {

  return this._childrenInfo[1]._sliceNormal[2];

});

/**
 * Set value of slice Y color.
 *
 * @param {!Array} yColor [0-1, 0-1, 0-1].
 *
 * @public
 */
X.volume.prototype.__defineSetter__('yColor', function(yColor) {

  this._childrenInfo[1]._color = yColor;

});

/**
 * Get value of slice Y color.
 *
 * @return {!Array} yColor.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('yColor', function() {

  return this._childrenInfo[1]._color;

});

/**
 * Set value of normal X of slice Z.
 *
 * @param {number} zNormX Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('zNormX', function(zNormX) {

  this._childrenInfo[2]._sliceNormal[0] = zNormX;

});

/**
 * Get value of normal X of slice Z.
 *
 * @return {number} zNormX.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('zNormX', function() {

  return this._childrenInfo[2]._sliceNormal[0] ;

});

/**
 * Set value of normal Y of slice Z.
 *
 * @param {number} zNormY Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('zNormY', function(zNormY) {

  this._childrenInfo[2]._sliceNormal[1] = zNormY;

});

/**
 * Get value of normal Y of slice X.
 *
 * @return {number} zNormY.
 *
 * @public
 */
 X.volume.prototype.__defineGetter__('zNormY', function() {

  return this._childrenInfo[2]._sliceNormal[1];

});

/**
 * Set value of normal Z of slice Z.
 *
 * @param {number} zNormZ Value between -1 and 1.
*
 * @public
 */
X.volume.prototype.__defineSetter__('zNormZ', function(zNormZ) {

  this._childrenInfo[2]._sliceNormal[2] = zNormZ;

});

/**
 * Get value of normal Z of slice X.
 *
 * @return {number} zNormZ.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('zNormZ', function() {

  return this._childrenInfo[2]._sliceNormal[2];

});

/**
 * Set value of slice Z color.
 *
 * @param {!Array} zColor [0-1, 0-1, 0-1].
 *
 * @public
 */
X.volume.prototype.__defineSetter__('zColor', function(zColor) {

  this._childrenInfo[2]._color = zColor;

});

/**
 * Get value of slice Z color.
 *
 * @return {!Array} zColor.
 *
 * @public
 */
X.volume.prototype.__defineGetter__('zColor', function() {

  return this._childrenInfo[2]._color;

});

/**
 * Recompute the slice information.
 * Only supports normals and color for now.
 * Todo: origin
 *
 * @param {number}
 *          index Slice to be updated.
 *
 * @public
 */
X.volume.prototype.sliceInfoChanged = function(index){

  // Hide slices
  this._children[index]['visible'] = false;

  // delete all textures attached to 1 child
  // for each child
  for(var i=0; i<this._children[index]._children.length; i++){
    if(typeof this._children[index]._children[i] != 'undefined'){

      if(this.hasLabelMap) {
        // add it to create the texture
        this._labelmap._children[index]._children[i].remove();
        this._labelmap._children[index]._children[i] = null;
      }

      this._children[index]._children[i].remove();
      this._children[index]._children[i] = null;

    }

  }

  // UPDATE SLICE INFO
  goog.vec.Vec3.normalize(this._childrenInfo[index]._sliceNormal, this._childrenInfo[index]._sliceNormal);
  //
  X.parser.prototype.updateSliceInfo(index, this._childrenInfo[index]._sliceOrigin, this._childrenInfo[index]._sliceNormal, this);
  // Create empty array for all slices in this direction
  this._children[index]._children = [];
  this._children[index]._children = new Array(this._childrenInfo[index]._nb);

  //attach labelmap
  if(this.hasLabelMap) {

    var _sliceLabel = X.parser.reslice2(this._childrenInfo[index]._sliceOrigin, this._childrenInfo[index]._sliceXYSpacing, this._childrenInfo[index]._sliceNormal, this._childrenInfo[index]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
    this._labelmap._children[index]._children = [];
    this._labelmap._children[index]._children = new Array(this._childrenInfo[index]._nb);
    this._labelmap._children[index]._children[Math.floor(this._childrenInfo[index]._nb/2)] = _sliceLabel;
    // add it to create the texture
    this._labelmap._children[index].modified();
  }

  var _slice = X.parser.reslice2(this._childrenInfo[index]._sliceOrigin, this._childrenInfo[index]._sliceXYSpacing, this._childrenInfo[index]._sliceNormal, this._childrenInfo[index]._color, this._BBox, this._IJKVolume, this, true, null);

  window.console.log('modified!');

  if(this.hasLabelMap) {

    _slice._labelmap = _slice._texture;
    _slice._labelmap = this._labelmap._children[index]._children[Math.floor(this._childrenInfo[index]._nb/2)]._texture;

  }

 this._children[index]._children[Math.floor(this._childrenInfo[index]._nb/2)] = _slice;

  if(index == 0) {

    this._indexX = Math.floor(this._childrenInfo[index]._nb/2);
    this._indexXold = Math.floor(this._childrenInfo[index]._nb/2);

  }
  else if(index == 1) {

    this._indexY = Math.floor(this._childrenInfo[index]._nb/2);
    this._indexYold = Math.floor(this._childrenInfo[index]._nb/2);

  }
  else {

    this._indexZ = Math.floor(this._childrenInfo[index]._nb/2);
    this._indexZold = Math.floor(this._childrenInfo[index]._nb/2);

  }

  // add it to renderer!
  this._children[index].modified();
  this._children[index]._children[Math.floor(this._childrenInfo[index]._nb/2)]._visible = true;

}

/**
 * Perform volume rendering of this volume along a specific direction. The
 * direction is important since we show tiled 2d textures along the direction
 * for a clean rendering experience.
 *
 * @param {number}
 *          direction The direction of the volume rendering (0==x,1==y,2==z).
 * @protected
 */
X.volume.prototype.volumeRendering_ = function(direction) {

  // map direction to correspoding container
  // mapping based on slice's normal
  // direction 0: sagittal container
  // direction 1: coronal container
  // direction 2: axial container

  if(this._computing){

    return;
  }

  if ((!this._volumeRendering)
      || (!this._dirty && direction == this._volumeRenderingDirection)) {

    this._volumeRenderingDirection = direction;

    // we do not have to do anything
    return;

  }

  if (this._volumeRenderingCache.indexOf(direction) == -1) {

    this._volumeRenderingCache.push(direction);

    this._computing = true;

    // call computing callback
    this.onComputing_(direction);

  } else {

    // we do not need to reslice

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

    // store the direction
    this._volumeRenderingDirection = direction;

    this._dirty = false;

    // and that's it

    return;

  }

  //
  // we are using timeouts here, just for interaction with the user interface
  //


  setTimeout(function() {

    // hide old volume rendering slices
    var _child = null;

    if( this._volumeRenderingDirection >= 0 ){

      _child = this._children[this._volumeRenderingDirection];
      _child['visible'] = false;

    }

    // show new volume rendering slices, but don't show the borders
    _child = this._children[direction];
    var _numberOfSlices = _child._children.length;

    var _progress = 0;

    var quarters = Math.floor(_numberOfSlices/4);

    //
    // THE FOLLOWING IS UNROLLED AND THIS PROBABLY COULD BE OPTIMIZED
    //

    var i;
    for (i = 0; i < 1*quarters; i++) {

      // RESLICE VOLUME IF NECESSARY!
      //loop through slice
      if(!goog.isDefAndNotNull(_child._children[i])){

        var _sliceOrigin = goog.vec.Vec3.createFloat32();

        _sliceOrigin[0] = this._childrenInfo[direction]._solutionsLine[0][0][0] + this._childrenInfo[direction]._sliceDirection[0]*i;
        _sliceOrigin[1] = this._childrenInfo[direction]._solutionsLine[0][0][1] + this._childrenInfo[direction]._sliceDirection[1]*i;
        _sliceOrigin[2] = this._childrenInfo[direction]._solutionsLine[0][0][2] + this._childrenInfo[direction]._sliceDirection[2]*i;

        //attach labelmap
        if(this.hasLabelMap){
          var _sliceLabel = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
          this._labelmap._children[direction]._children[i] = _sliceLabel;
          // add it to create the texture
          this._labelmap._children[direction].modified(true);
        }

        var _slice = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._IJKVolume, this, true, null);
        _slice._children[0]._visible = false;

        if(this.hasLabelMap){
          _slice._labelmap = _slice._texture;
          _slice._labelmap = this._labelmap._children[direction]._children[i]._texture;
        }

        _child._children[i] = _slice;

        _child._children[i]._visible = true;

      }
      else{

        _child._children[i]._visible = true;

      }

    }

    this.onComputingProgress_(0.25);

    setTimeout(function() {

      for (; i < 2*quarters; i++) {

        // RESLICE VOLUME IF NECESSARY!
        //loop through slice
        if(!goog.isDefAndNotNull(_child._children[i])){

          var _sliceOrigin = goog.vec.Vec3.createFloat32();

          _sliceOrigin[0] = this._childrenInfo[direction]._solutionsLine[0][0][0] + this._childrenInfo[direction]._sliceDirection[0]*i;
          _sliceOrigin[1] = this._childrenInfo[direction]._solutionsLine[0][0][1] + this._childrenInfo[direction]._sliceDirection[1]*i;
          _sliceOrigin[2] = this._childrenInfo[direction]._solutionsLine[0][0][2] + this._childrenInfo[direction]._sliceDirection[2]*i;

          //attach labelmap
          if(this.hasLabelMap){
            var _sliceLabel = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
            this._labelmap._children[direction]._children[i] = _sliceLabel;
            // add it to create the texture
            this._labelmap._children[direction].modified(true);
          }

          var _slice = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._IJKVolume, this, true, null);
          _slice._children[0]._visible = false;

          if(this.hasLabelMap){
            _slice._labelmap = _slice._texture;
            _slice._labelmap = this._labelmap._children[direction]._children[i]._texture;
          }

          _child._children[i] = _slice;

          _child._children[i]._visible = true;

        }
        else{

          _child._children[i]._visible = true;

        }
      }

      this.onComputingProgress_(0.50);

      setTimeout(function() {

        for (; i < 3*quarters; i++) {

          // RESLICE VOLUME IF NECESSARY!
          //loop through slice
          if(!goog.isDefAndNotNull(_child._children[i])){

            var _sliceOrigin = goog.vec.Vec3.createFloat32();

            _sliceOrigin[0] = this._childrenInfo[direction]._solutionsLine[0][0][0] + this._childrenInfo[direction]._sliceDirection[0]*i;
            _sliceOrigin[1] = this._childrenInfo[direction]._solutionsLine[0][0][1] + this._childrenInfo[direction]._sliceDirection[1]*i;
            _sliceOrigin[2] = this._childrenInfo[direction]._solutionsLine[0][0][2] + this._childrenInfo[direction]._sliceDirection[2]*i;

            //attach labelmap
            if(this.hasLabelMap){
              var _sliceLabel = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
              this._labelmap._children[direction]._children[i] = _sliceLabel;
              // add it to create the texture
              this._labelmap._children[direction].modified(true);
            }

            var _slice = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._IJKVolume, this, true, null);
            _slice._children[0]._visible = false;

            if(this.hasLabelMap){
              _slice._labelmap = _slice._texture;
              _slice._labelmap = this._labelmap._children[direction]._children[i]._texture;
            }

            _child._children[i] = _slice;

            _child._children[i]._visible = true;

          }
          else{

             _child._children[i]._visible = true;

          }

        }

        this.onComputingProgress_(0.75);

        setTimeout(function() {

          for (i=3*quarters; i < _numberOfSlices; i++) {

            // RESLICE VOLUME IF NECESSARY!
            //loop through slice
            if(!goog.isDefAndNotNull(_child._children[i])){

              var _sliceOrigin = goog.vec.Vec3.createFloat32();

              _sliceOrigin[0] = this._childrenInfo[direction]._solutionsLine[0][0][0] + this._childrenInfo[direction]._sliceDirection[0]*i;
              _sliceOrigin[1] = this._childrenInfo[direction]._solutionsLine[0][0][1] + this._childrenInfo[direction]._sliceDirection[1]*i;
              _sliceOrigin[2] = this._childrenInfo[direction]._solutionsLine[0][0][2] + this._childrenInfo[direction]._sliceDirection[2]*i;

              //attach labelmap
              if(this.hasLabelMap){
                var _sliceLabel = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._labelmap._IJKVolume, this._labelmap, this._labelmap.hasLabelMap, this._labelmap._colortable._map);
                this._labelmap._children[direction]._children[i] = _sliceLabel;
                // add it to create the texture
                this._labelmap._children[direction].modified(true);
              }

              var _slice = X.parser.reslice2(_sliceOrigin, this._childrenInfo[direction]._sliceXYSpacing, this._childrenInfo[direction]._sliceNormal, this._childrenInfo[direction]._color, this._BBox, this._IJKVolume, this, true, null);
              _slice._children[0]._visible = false;

              if(this.hasLabelMap){
                _slice._labelmap = _slice._texture;
                _slice._labelmap = this._labelmap._children[direction]._children[i]._texture;
              }

              _child._children[i] = _slice;

              _child._children[i]._visible = true;

            }
            else{

             _child._children[i]._visible = true;

            }

          }

          this.onComputingProgress_(1.0);

          setTimeout(function() {

            if (this._computing) {

              // add it to renderer!
              this._children[direction].modified(true);

            }

            // store the direction
            this._volumeRenderingDirection = direction;

            this._dirty = false;

            if (this._computing) {
              //call computing end callback
              this.onComputingEnd_(direction);

            }

            this._computing = false;

          }.bind(this), 10);

        }.bind(this), 10);

      }.bind(this), 10);

    }.bind(this), 10);

  }.bind(this), 10);

};


/**
 * The oncomputing internal callback. Any actions prior to firing the
 * public oncomputing callback go here.
 *
 * @param {!number} direction The direction to compute.
 * @protected
 *
 */
X.volume.prototype.onComputing_ = function(direction) {

  var computingEvent = new X.event.ComputingEvent();
  computingEvent._object = this;
  this.dispatchEvent(computingEvent);

  this['onComputing'](direction);

};


/**
 * The oncomputingprogress internal callback. Any actions prior to
 * firing the public oncomputingprogress callback go here.
 *
 * @param {!number} progress The progress value in percent.
 * @protected
 */
X.volume.prototype.onComputingProgress_ = function(progress) {

  var computingProgressEvent = new X.event.ComputingProgressEvent();
  computingProgressEvent._value = progress;
  this.dispatchEvent(computingProgressEvent);

  this['onComputingProgress'](progress*100);

};


/**
 * The oncomputingend internal callback. Any actions prior to firing the
 * public oncomputingend callback go here.
 *
 * @param {!number} direction The direction which was computed.
 * @protected
 *
 */
X.volume.prototype.onComputingEnd_ = function(direction) {

  var computingEndEvent = new X.event.ComputingEndEvent();
  computingEndEvent._object = this;
  this.dispatchEvent(computingEndEvent);

  this['onComputingEnd'](direction);

};


/**
 * This callback gets fired when computation has to happen in order
 * to display volume rendering.
 *
 * @param {!number} direction The direction to compute.
 * @public
 *
 */
X.volume.prototype.onComputing = function(direction) {

  // should be overloaded

};


/**
 * This callback gets fired when computation is happening.
 *
 * @param {!number} progress The current computation progress in percent.
 * @public
 *
 */
X.volume.prototype.onComputingProgress = function(progress) {

  // should be overloaded

};


/**
 * This callback gets fired when computation is complete.
 *
 * @param {!number} direction The direction which was computed.
 * @public
 *
 */
X.volume.prototype.onComputingEnd = function(direction) {

  // should be overloaded

}


// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);
goog.exportSymbol('X.volume.prototype.modified', X.volume.prototype.modified);
goog.exportSymbol('X.volume.prototype.destroy', X.volume.prototype.destroy);
goog.exportSymbol('X.volume.prototype.sliceInfoChanged', X.volume.prototype.sliceInfoChanged);
goog.exportSymbol('X.volume.prototype.onComputing', X.volume.prototype.onComputing);
goog.exportSymbol('X.volume.prototype.onComputingProgress', X.volume.prototype.onComputingProgress);
goog.exportSymbol('X.volume.prototype.onComputingEnd', X.volume.prototype.onComputingEnd);

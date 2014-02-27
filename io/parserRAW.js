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
 *      'Free software' is a matter of liberty, not price.
 *      'Free' as in 'free speech', not as in 'free beer'.
 *                                         - Richard M. Stallman
 *
 */
// provides
goog.provide('X.parserRAW');
// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('Zlib.Inflate');
/**
 * Create a parser for .RAW files. This means just a byte stream.
 *
 * @constructor
 * @extends X.parser
 */
X.parserRAW = function() {
  //
  // call the standard constructor of X.parser
  goog.base(this);
  //
  // class attributes
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserRAW';
};
// inherit from X.parser
goog.inherits(X.parserRAW, X.parser);
/**
 * @inheritDoc
 */
X.parserRAW.prototype.parse = function(container, object, data, flag) {
  X.TIMER(this._classname + '.parse');
  var b_zipped = flag;
  var _data = data;
  if (b_zipped) {
    // we need to decompress the datastream
    // here we start the unzipping and get a typed Uint8Array back
    var inflate = new Zlib.Inflate(new Uint8Array(_data));
    _data = inflate.decompress();
    // .. and use the underlying array buffer
    _data = _data.buffer;
  }

  var MRI = {};
  MRI.data = new Uint8Array(_data);

  // grab the min, max intensities
  // get the min and max intensities
  var min_max = this.arrayMinMax(MRI.data);
  var min = min_max[0];
  var max = min_max[1];
  var _dimensions = object._dimensions;

  // attach the scalar range to the volume
  MRI.min = object._min = object._windowLow = min;
  MRI.max = object._max = object._windowHigh = max;
  // .. and set the default threshold
  // only if the threshold was not already set
  if (object._lowerThreshold == -Infinity) {
    object._lowerThreshold = min;
  }
  if (object._upperThreshold == Infinity) {
    object._upperThreshold = max;
  }

  // Create IJKtoXYZ matrix
  var IJKToRAS = goog.vec.Mat4.createFloat32Identity();

  // compute origin
  var fcx = _dimensions[0] / 2.0;
  var fcy = _dimensions[1] / 2.0;
  var fcz = _dimensions[2] / 2.0;
  var _origin = [0, 0, 0];

  MRI.IJKToRAS = IJKToRAS;
  MRI.RASToIJK = goog.vec.Mat4.createFloat32Identity();
  
  // get bounding box
  // Transform ijk (0, 0, 0) to RAS
  var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
  var res = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(IJKToRAS, tar, res);
  // Transform ijk (spacingX, spacinY, spacingZ) to RAS
  var tar2 = goog.vec.Vec4.createFloat32FromValues(1, 1, 1, 1);
  var res2 = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);
  
  // get location of 8 corners and update BBox
  //
  var _rasBB = X.parser.computeRASBBox(IJKToRAS, object._dimensions);

  // grab the RAS Dimensions
  MRI.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
  
  // grab the RAS Dimensions
  MRI.RASDimensions = [_rasBB[1] - _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];
  
  // grab the RAS Origin
  MRI.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];

  // create the object
  object.create_(MRI);

  X.TIMERSTOP(this._classname + '.parse');

  // re-slice the data according each direction
  object._image = this.reslice(object);

  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserRAW', X.parserRAW);
goog.exportSymbol('X.parserRAW.prototype.parse', X.parserRAW.prototype.parse);

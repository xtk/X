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
goog.provide('X.parserMGZ');
// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('Zlib.Gunzip');
/**
 * Create a parser for .MGZ files. Note: MGH/MGZ files are BIG ENDIAN so we need
 * to take care of that..
 *
 * @constructor
 * @extends X.parser
 */
X.parserMGZ = function() {
  //
  // call the standard constructor of X.parser
  goog.base(this);
  //
  // class attributes
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserMGZ';
  /**
   * Here, the data stream is big endian.
   *
   * @inheritDoc
   */
  this._littleEndian = false;
};
// inherit from X.parser
goog.inherits(X.parserMGZ, X.parser);
/**
 * @inheritDoc
 */
X.parserMGZ.prototype.parse = function(container, object, data, flag) {
  X.TIMER(this._classname + '.parse');

  window.console.log(object);

  var b_zipped = flag;
  var _data = data;
  if (b_zipped) {
    // we need to decompress the datastream
    // here we start the unzipping and get a typed Uint8Array back
    var inflate = new Zlib.Gunzip(new Uint8Array(_data));
    _data = inflate.decompress();
    // .. and use the underlying array buffer
    _data = _data.buffer;
  }
  // parse the byte stream
  var MRI = this.parseStream(_data);
  // grab the dimensions
  var _dimensions = [ MRI.ndim1, MRI.ndim2, MRI.ndim3 ];
  object._dimensions = _dimensions;
  // grab the spacing
  var _spacing = MRI.v_voxelsize;
  object._spacing = _spacing;
  // grab the min, max intensities
  var min = MRI.min;
  var max = MRI.max;
  // attach the scalar range to the volume
  object._min = object._windowLow = min;
  object._max = object._windowHigh = max;
  // .. and set the default threshold
  // only if the threshold was not already set
  if (object._lowerThreshold == -Infinity) {
    object._lowerThreshold = min;
  }
  if (object._upperThreshold == Infinity) {
    object._upperThreshold = max;
  }

  // Create IJKtoXYZ matrix
  var IJKToRAS = goog.vec.Mat4.createFloat32();

  // NO RESLICING, only use the spacing
  if(object['reslicing'] == 'false' || object['reslicing'] == false){

    goog.vec.Mat4.setRowValues(IJKToRAS,
      0,
      object._spacing[0],
      0,
      0,
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      1,
      0,
      object._spacing[1],
      0,
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      2,
      0,
      0,
      object._spacing[2],
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);

    goog.vec.Mat4.setColumnValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);
  }
  else{
    goog.vec.Mat4.setRowValues(IJKToRAS,
      0,
      MRI.M_ras[0][0],
      MRI.M_ras[1][0],
      MRI.M_ras[2][0],
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      1,
      MRI.M_ras[0][1],
      MRI.M_ras[1][1],
      MRI.M_ras[2][1],
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      2,
      MRI.M_ras[0][2],
      MRI.M_ras[1][2],
      MRI.M_ras[2][2],
      0);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);

    // compute origin
    var fcx = _dimensions[0] / 2.0;
    var fcy = _dimensions[1] / 2.0;
    var fcz = _dimensions[2] / 2.0;
    var _origin = [0, 0, 0];

    for( var ui = 0; ui < 3; ++ui ) {
      _origin[ui] = MRI.M_ras[3][ui]
        - ( goog.vec.Mat4.getElement(IJKToRAS, ui, 0) * _spacing[0] * fcx
            + goog.vec.Mat4.getElement(IJKToRAS, ui, 1) * _spacing[1] * fcy
            + goog.vec.Mat4.getElement(IJKToRAS, ui, 2) * _spacing[2] * fcz );
      }

    goog.vec.Mat4.setColumnValues(IJKToRAS,
      3,
      _origin[0],
      _origin[1],
      _origin[2],
      1);
  }

  MRI.IJKToRAS = IJKToRAS;
  MRI.RASToIJK = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.invert(MRI.IJKToRAS, MRI.RASToIJK);
  
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
/**
 * Parse the data stream according to the MGH/MGZ file format and return an MRI
 * structure which holds all parsed information.
 *
 * @param {!ArrayBuffer}
 *          data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserMGZ.prototype.parseStream = function(data) {
  // attach the given data to the internal scan function
  this._data = data;
  var MRI = {
    version : 0,
    Tr : 0,
    Te : 0,
    flipangle : 0,
    Ti : 0,
    ndim1 : 0,
    ndim2 : 0,
    ndim3 : 0,
    nframes : 0,
    type : 0,
    dof : 0,
    rasgoodflag : 0,
    MRIreader : null,
    M_ras : null,
    v_voxelsize : null,
    data : null, // data as single vector
    min : Infinity,
    max : -Infinity
  };
  MRI.version = this.scan('uint');
  MRI.ndim1 = this.scan('uint');
  MRI.ndim2 = this.scan('uint');
  MRI.ndim3 = this.scan('uint');
  MRI.nframes = this.scan('uint');
  MRI.type = this.scan('uint');
  MRI.dof = this.scan('uint');
  MRI.rasgoodflag = this.scan('ushort');
  if (MRI.rasgoodflag > 0) {
    // Read in voxel size and RAS matrix
    MRI.v_voxelsize = this.scan('float', 3);
    var _ras = [];
    // X
    _ras.push(this.scan('float', 3));
    // Y
    _ras.push(this.scan('float', 3));
    // Z
    _ras.push(this.scan('float', 3));
    // C
    _ras.push(this.scan('float', 3));
    MRI.M_ras = _ras;
  }
  // jump to the image data which starts at byte 284,
  // according to http://surfer.nmr.mgh.harvard.edu/fswiki/FsTutorial/MghFormat
  this.jumpTo(284);
  // number of pixels in the volume
  var volsize = MRI.ndim1 * MRI.ndim2 * MRI.ndim3;
  // scan the pixels regarding the data type
  switch (MRI.type) {
  case 0:
    // unsigned char
    MRI.data = this.scan('uchar', volsize);
    break;
  case 1:
    // unsigned int
    MRI.data = this.scan('uint', volsize);
    break;
  // case 2:
  // long
  // break;
  case 3:
    // float
    MRI.data = this.scan('float', volsize);
    break;
  case 4:
    // unsigned short
    MRI.data = this.scan('ushort', volsize);
    break;
  // case 5:
  // bitmap
  // break;
  default:
    throw new Error('Unsupported MGH/MGZ data type: ' + MRI.type);
  }
  // get the min and max intensities
  var min_max = this.arrayMinMax(MRI.data);
  MRI.min = min_max[0];
  MRI.max = min_max[1];
  // Now for the final MRI parameters at the end of the data stream:
  if (this._dataPointer + 4 * 4 < this._data.byteLength) {
    MRI.Tr = this.scan('float');
    MRI.flipangle = this.scan('float');
    MRI.Te = this.scan('float');
    MRI.Ti = this.scan('float');
  }
  return MRI;
};
// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserMGZ', X.parserMGZ);
goog.exportSymbol('X.parserMGZ.prototype.parse', X.parserMGZ.prototype.parse);

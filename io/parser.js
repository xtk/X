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
 * CREDITS:
 *
 *   - the endianness handling was inspired by
 *     Ilmari Heikkinen's DataStream.js (https://github.com/kig/DataStream.js)
 *     THANKS!!
 *
 */

// provides
goog.provide('X.parser');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.texture');
goog.require('X.triplets');


/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends X.base
 */
X.parser = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parser';

  /**
   * The data.
   * 
   * @type {?ArrayBuffer}
   * @protected
   */
  this._data = null;

  /**
   * The pointer to the current byte.
   * 
   * @type {!number}
   * @protected
   */
  this._dataPointer = 0;

  /**
   * The native endianness flag. Based on
   * https://github.com/kig/DataStream.js/blob/master/DataStream.js
   * 
   * @type {!boolean}
   * @protected
   */
  this._nativeLittleEndian = new Int8Array(new Int16Array([ 1 ]).buffer)[0] > 0;

  /**
   * The data-specific endianness flag.
   * 
   * @type {!boolean}
   * @protected
   */
  this._littleEndian = true;

  /**
   * The min value of the last parsing attempt.
   * 
   * @type {!number}
   * @protected
   */
  this._lastMin = -Infinity;

  /**
   * The max value of the last parsing attempt.
   * 
   * @type {!number}
   * @protected
   */
  this._lastMax = Infinity;

};
// inherit from X.base
goog.inherits(X.parser, X.base);


/**
 * Parse data and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.base}
 *          container A container which holds the loaded data. This can be an
 *          X.object as well.
 * @param {!X.object}
 *          object The object to configure.
 * @param {!ArrayBuffer}
 *          data The data to parse.
 * @param {*}
 *          flag An additional flag.
 * @throws {Error}
 *           An exception if something goes wrong.
 */
X.parser.prototype.parse = function(container, object, data, flag) {

  throw new Error('The function parse() should be overloaded.');

};


//
// PARSE FUNCTIONS
//
//
/**
 * Get the min and max values of an array.
 * 
 * @param {!Array}
 *          data The data array to analyze.
 * @return {!Array} An array with length 2 containing the [min, max] values.
 */
X.parser.prototype.arrayMinMax = function(data) {

  var _min = Infinity;
  var _max = -Infinity;

  // buffer the length
  var _datasize = data.length;

  var i = 0;
  for (i = 0; i < _datasize; i++) {

    var _value = data[i];
    _min = Math.min(_min, _value);
    _max = Math.max(_max, _value);

  }

  return [ _min, _max ];

};


/**
 * Create a string from a bunch of UChars. This replaces a
 * String.fromCharCode.apply call and therefor supports more platforms (like the
 * Android stock browser).
 * 
 * @param {!Array|Uint8Array}
 *          array The Uint8Array.
 * @param {?number=}
 *          start The start position. If undefined, use the whole array.
 * @param {?number=}
 *          end The end position. If undefined, use the whole array.
 * @return {string} The created string.
 */
X.parser.prototype.parseChars = function(array, start, end) {

  // without borders, use the whole array
  if (start === undefined) {

    start = 0;

  }
  if (end === undefined) {

    end = array.length;

  }

  var _output = '';
  // create and append the chars
  var i = 0;
  for (i = start; i < end; ++i) {

    _output += String.fromCharCode(array[i]);

  }

  return _output;

};


/**
 * Jump to a position in the byte stream.
 * 
 * @param {!number}
 *          position The new offset.
 */
X.parser.prototype.jumpTo = function(position) {

  this._dataPointer = position;

};


/**
 * Scan binary data relative to the internal position in the byte stream.
 * 
 * @param {!string}
 *          type The data type to scan, f.e.
 *          'uchar','schar','ushort','sshort','uint','sint','float'
 * @param {!number=}
 *          chunks The number of chunks to scan. By default, 1.
 */
X.parser.prototype.scan = function(type, chunks) {

  if (!goog.isDefAndNotNull(chunks)) {

    chunks = 1;

  }

  var _chunkSize = 1;
  var _array_type = Uint8Array;

  switch (type) {

  // 1 byte data types
  case 'uchar':
    break;
  case 'schar':
    _array_type = Int8Array;
    break;
  // 2 byte data types
  case 'ushort':
    _array_type = Uint16Array;
    _chunkSize = 2;
    break;
  case 'sshort':
    _array_type = Int16Array;
    _chunkSize = 2;
    break;
  // 4 byte data types
  case 'uint':
    _array_type = Uint32Array;
    _chunkSize = 4;
    break;
  case 'sint':
    _array_type = Int32Array;
    _chunkSize = 4;
    break;
  case 'float':
    _array_type = Float32Array;
    _chunkSize = 4;
    break;
  case 'complex':
    _array_type = Float64Array;
    _chunkSize = 8;
    break;
  case 'double':
    _array_type = Float64Array;
    _chunkSize = 8;
    break;

  }

  // increase the data pointer in-place
  var _bytes = new _array_type(this._data.slice(this._dataPointer,
      this._dataPointer += chunks * _chunkSize));

  // if required, flip the endianness of the bytes
  if (this._nativeLittleEndian != this._littleEndian) {

    // we need to flip here since the format doesn't match the native endianness
    _bytes = this.flipEndianness(_bytes, _chunkSize);

  }

  if (chunks == 1) {

    // if only one chunk was requested, just return one value
    return _bytes[0];

  }

  // return the byte array
  return _bytes;

};


/**
 * Flips typed array endianness in-place. Based on
 * https://github.com/kig/DataStream.js/blob/master/DataStream.js.
 * 
 * @param {!Object}
 *          array Typed array to flip.
 * @param {!number}
 *          chunkSize The size of each element.
 * @return {!Object} The converted typed array.
 */
X.parser.prototype.flipEndianness = function(array, chunkSize) {

  var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  for ( var i = 0; i < array.byteLength; i += chunkSize) {

    for ( var j = i + chunkSize - 1, k = i; j > k; j--, k++) {

      var tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;

    }

  }

  return array;

};


/**
 * Convert orientation to RAS
 * 
 * @param {!Array}
 *          space The space we are in (RAS, LPS, etc.).
 * @param {!Array}
 *          orientation The orientation in current space.
 * @return {!Array} The RAS orienation array.
 */
X.parser.prototype.toRAS = function(space, orientation) {

  var _ras_space_orientation = orientation;

  if (space[0] != 'right') {

    _ras_space_orientation[0] = -_ras_space_orientation[0];
    _ras_space_orientation[3] = -_ras_space_orientation[3];
    _ras_space_orientation[6] = -_ras_space_orientation[6];

  }
  if (space[1] != 'anterior') {

    _ras_space_orientation[1] = -_ras_space_orientation[1];
    _ras_space_orientation[4] = -_ras_space_orientation[4];
    _ras_space_orientation[7] = -_ras_space_orientation[7];

  }
  if (space[2] != 'superior') {

    _ras_space_orientation[2] = -_ras_space_orientation[2];
    _ras_space_orientation[5] = -_ras_space_orientation[5];
    _ras_space_orientation[8] = -_ras_space_orientation[8];

  }

  return _ras_space_orientation;

};


/**
 * Get orientation on normalized cosines
 * 
 * @param {!Array}
 *          rasorientation The orientation in RAS space.
 * @return {!Array} The orientation and the normalized cosines.
 */
X.parser.prototype.orientnormalize = function(rasorientation) {

  X.TIMER(this._classname + '.orientnormalize');

  var _x_cosine = rasorientation.slice(0, 3);

  var _x_abs_cosine = _x_cosine.map(function(v) {

    return Math.abs(v);

  });

  var _x_max = _x_abs_cosine.indexOf(Math.max.apply(Math, _x_abs_cosine));
  var _x_norm_cosine = [ 0, 0, 0 ];
  _x_norm_cosine[_x_max] = _x_cosine[_x_max] < 0 ? -1 : 1;
  var _y_cosine = rasorientation.slice(3, 6);
  var _y_abs_cosine = _y_cosine.map(function(v) {

    return Math.abs(v);

  });

  var _y_max = _y_abs_cosine.indexOf(Math.max.apply(Math, _y_abs_cosine));
  var _y_norm_cosine = [ 0, 0, 0 ];
  _y_norm_cosine[_y_max] = _y_cosine[_y_max] < 0 ? -1 : 1;
  var _z_cosine = rasorientation.slice(6, 9);
  var _z_abs_cosine = _z_cosine.map(function(v) {

    return Math.abs(v);

  });

  var _z_max = _z_abs_cosine.indexOf(Math.max.apply(Math, _z_abs_cosine));
  var _z_norm_cosine = [ 0, 0, 0 ];
  _z_norm_cosine[_z_max] = _z_cosine[_z_max] < 0 ? -1 : 1;
  //
  var orientation = [ _x_norm_cosine[_x_max], _y_norm_cosine[_y_max],
      _z_norm_cosine[_z_max] ];

  // might be usefull to loop
  var norm_cosine = [ _x_norm_cosine, _y_norm_cosine, _z_norm_cosine ];

  X.TIMERSTOP(this._classname + '.orientnormalize');

  return [ orientation, norm_cosine ];

};

// list all steps
// step1: create/fill IJK volume
// this is the actual parsing
// return 2 images in an array
X.parser.prototype.createIJKVolume = function(_data, _dims, _max){
  X.TIMER(this._classname + '.createIJKVolumes');
  
  // initiate variables
  // allocate images
  var _image = new Array(_dims[2]);
  var _imageN = new Array(_dims[2]);
  var _nb_pix_per_slice = _dims[1] * _dims[0];
  var _pix_value = 0;
  var _i = 0;
  var _j = 0;
  var _k = 0;
  var _data_pointer = 0;
  
  for (_k = 0; _k < _dims[2]; _k++) {
    // get current slice
    var _current_k = _data.subarray(_k * (_nb_pix_per_slice), (_k + 1)
        * _nb_pix_per_slice);
    // initiate data pointer
    _data_pointer = 0;

    // allocate images
    _imageN[_k] = new Array(_dims[1]);
    _image[_k] = new Array(_dims[1]);
    for (_j = 0; _j < _dims[1]; _j++) {
      
      // allocate images
      _imageN[_k][_j] = new _data.constructor(_dims[0]);
      _image[_k][_j] = new _data.constructor(_dims[0]);
    for (_i = 0; _i < _dims[0]; _i++) {
      
        _pix_value = _current_k[_data_pointer];
        _imageN[_k][_j][_i] = 255 * (_pix_value / _max);
        _image[_k][_j][_i] = _pix_value;
        _data_pointer++;
        
      }
    }
  }
  
  X.TIMERSTOP(this._classname + '.createIJKVolumes');
  
  return [_image, _imageN];
};

X.parser.prototype.intersectionBBoxLine = function(_bbox, _sliceOrigin, _sliceNormal){
  X.TIMER(this._classname + '.intersectionBBoxLine');
  
  var _solutionsIn = new Array();
  var _solutionsOut = new Array();
  
  // xmin, xmax, ymin, ymax, zmin, zmax
  for(var _i = 0; _i < 6; _i++){
    // 
    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j1 = (2 + (2*_i2))%6;
    var _j2 = (4 + (2*_i2))%6;
    
    // i
    // i4=?
    var _dir = _i2;
    
    
    var _sol0 = _bbox[_i];
    var _invN1 = 1/_sliceNormal[_i2];
    
    var _t = (_sol0 - _sliceOrigin[_i2])*_invN1;
    
    // if _t infinity, we are //
    if(_t != Infinity && _t != -Infinity)
      {
    var _sol1 = _sliceOrigin[_i3] + _sliceNormal[_i3]*_t;
    var _sol2 = _sliceOrigin[_i4] + _sliceNormal[_i4]*_t;
    
    window.console.log("INTERSECTIONS");
    window.console.log(_t);
    window.console.log(_sliceNormal);
    window.console.log(_sol0 + ' - ' + _sol1 + ' - ' + _sol2);
    
    // in range?
      if( (_sol1 >= _bbox[_j1] && _sol1 <= _bbox[_j1+1]) &&
          (_sol2 >= _bbox[_j2] && _sol2 <= _bbox[_j2+1])){
        
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;

        _solutionsIn.push(_sol);
      }
      else{
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;
        
        _solutionsOut.push(_sol);
      }
    }
  }
  
  
  X.TIMERSTOP(this._classname + '.intersectionBBoxLine');
  
  return [_solutionsIn, _solutionsOut];
};

X.parser.prototype.intersectionBBoxPlane = function(_bbox, _sliceOrigin, _sliceNormal){
  X.TIMER(this._classname + '.intersectionBBoxPlane');

  var _solutionsIn = new Array();
  var _solutionsOut = new Array();
  
  // xmin, xmax, ymin, ymax, zmin, zmax
  for(var _i = 0; _i < 6; _i++){
    // 
    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j3 = (4 + (2*_i2))%6;
    for(var _j = 0; _j < 2; _j++){

      var _j2 = (2 + _j + (2*_i2))%6;

      var _solution = (-(
          _sliceNormal[_i2]*(_bbox[_i] - _sliceOrigin[_i2])
          +
          _sliceNormal[_i3]*(_bbox[_j2] - _sliceOrigin[_i3])
          )
          /
          _sliceNormal[_i4]
          )
          +
          _sliceOrigin[_i4]
          ;

      if((_solution >= _bbox[_j3] && _solution <= _bbox[_j3+1])
          ||
          (_solution <= _bbox[_j3] && _solution >= _bbox[_j3+1])){
        
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _bbox[_j2];
        _sol[_i4] = _solution;

        _solutionsIn.push(_sol);
      }
      else{
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _bbox[_j2];
        _sol[_i4] = _solution;
        
        _solutionsOut.push(_sol);
      }
    }
  }

  X.TIMERSTOP(this._classname + '.intersectionBBoxPlane');
  
  return [_solutionsIn, _solutionsOut];
};

X.parser.prototype.xyrasTransform = function(_sliceNormal, _XYNormal){
  X.TIMER(this._classname + '.xyrasTransform');

  var _RASToXY = new goog.vec.Mat4.createFloat32Identity();
  
  // no rotation needed if we are in the z plane already
  if(!goog.vec.Vec3.equals(_sliceNormal,_XYNormal))
    {
    var _cp = _sliceNormal[2];
    
    var _teta = Math.acos(_cp);
  
    var _r = new goog.vec.Vec3.createFloat32();
    goog.vec.Vec3.cross(_sliceNormal, _XYNormal, _r);
    goog.vec.Vec3.normalize(_r, _r);
    
    var a = Math.cos(_teta/2);
    var b = Math.sin(_teta/2)*_r[0];
    var c = Math.sin(_teta/2)*_r[1];
    var d = Math.sin(_teta/2)*_r[2];
  
    goog.vec.Mat4.setRowValues(_RASToXY,
        0,
        (a*a+b*b-c*c-d*d),
        2*(b*c-a*d),
        2*(b*d+a*c),
        0
        );
    goog.vec.Mat4.setRowValues(_RASToXY,
        1,
        2*(b*c+a*d),
        (a*a+c*c-b*b-d*d),
        2*(c*d-a*b),
        0
        );
    goog.vec.Mat4.setRowValues(_RASToXY,
        2,
        2*(b*d-a*c ),
        2*(c*d+a*b),
        (a*a+d*d-c*c-b*b),
        0
        );
    }
  

  var _XYToRAS = new goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.invert(_RASToXY, _XYToRAS);
  

  X.TIMERSTOP(this._classname + '.xyrasTransform');
  
  return [_RASToXY, _XYToRAS];
};

X.parser.prototype.xyBBox = function(_solutionsXY){
  X.TIMER(this._classname + '.xyBBox');

  var _xyBBox = [Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE];

  for (var i = 0; i < _solutionsXY.length; ++i) {
    if(_solutionsXY[i][0] < _xyBBox[0]){
      _xyBBox[0] = _solutionsXY[i][0];
    }

    if(_solutionsXY[i][0] > _xyBBox[1]){
      _xyBBox[1] = _solutionsXY[i][0];
    }

    if(_solutionsXY[i][1] < _xyBBox[2]){
      _xyBBox[2] = _solutionsXY[i][1];
    }

    if(_solutionsXY[i][1] > _xyBBox[3]){
      _xyBBox[3] = _solutionsXY[i][1];
    }

    if(_solutionsXY[i][2] < _xyBBox[4]){
      _xyBBox[4] = _solutionsXY[i][2];
    }

    if(_solutionsXY[i][2] > _xyBBox[5]){
      _xyBBox[5] = _solutionsXY[i][2];
    }
  }

  X.TIMERSTOP(this._classname + '.xyBBox');
  
  return _xyBBox;
};

X.parser.prototype.reslice2 = function(_sliceOrigin, _sliceNormal, _color, _bbox, _rasspacing, _ras2ijk, _IJKVolumeN, object, hasLabelMap, colorTable){
  X.TIMER(this._classname + '.reslice2');
  
  //
  //
  //
  var sliceXY = new X.slice();
  
  
  goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
  
  object._front = _sliceNormal;
  object._sliceOrigin = _sliceOrigin;
  object._sliceNormal = _sliceNormal;
  object._boundingBox = _bbox;
  
  // ------------------------------------------
  // GET INTERSECTION BOUNDING BOX/PLANE
  // ------------------------------------------

  var _solutions = this.intersectionBBoxPlane(_bbox,_sliceOrigin, _sliceNormal);
  var _solutionsIn = _solutions[0];
  var _solutionsOut = _solutions[1];

  object._solutions = _solutionsIn;
  object._solutionsOut = _solutionsOut;
  
  // ------------------------------------------
  // MOVE TO 2D SPACE
  // ------------------------------------------

  var _sliceNormal = _sliceNormal;
  var _XYNormal = new goog.vec.Vec3.createFloat32FromValues(0, 0, 1);
  
  var _XYRASTransform = this.xyrasTransform(_sliceNormal, _XYNormal);
  var _RASToXY = _XYRASTransform[0];
  var _XYToRAS = _XYRASTransform[1];
  
// // Apply transform to each point!
  var _solutionsXY = new Array();
  for (var i = 0; i < _solutionsIn.length; ++i) {
    var tar2 = new goog.vec.Vec4.createFloat32FromValues(_solutionsIn[i][0], _solutionsIn[i][1], _solutionsIn[i][2], 1);
    var res2 = new goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(_RASToXY, tar2, res2);

    var _sol = new Array();
    _sol[0] = res2[0];
    _sol[1] = res2[1];
    _sol[2] = res2[2];
    
    _solutionsXY.push(_sol);
  }
  
  object._solutionsXY = _solutionsXY;
  
  // rigth
  var _right = new goog.vec.Vec3.createFloat32FromValues(1, 0, 0);
  var _rright = new goog.vec.Vec3.createFloat32();
  goog.vec.Mat4.multVec3(_XYToRAS, _right, _rright);
  object._right = _rright;
  
  // up
  var _up = new goog.vec.Vec3.createFloat32FromValues(0, 1, 0);
  var _rup = new goog.vec.Vec3.createFloat32();
  goog.vec.Mat4.multVec3(_XYToRAS, _up, _rup);
  object._up= _rup;
  
  var qqq = new goog.vec.Vec4.createFloat32FromValues(_rasspacing[0], _rasspacing[1], _rasspacing[2], 0);
  var _xySpacing = new goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(_RASToXY, qqq, _xySpacing);
  
  // get XY bounding box!
  var _xyBBox = this.xyBBox(_solutionsXY);
  object._xyBBox = _xyBBox;
  
  var _xyCenter = new goog.vec.Vec4.createFloat32FromValues(_xyBBox[0] + (_xyBBox[1] - _xyBBox[0])/2,_xyBBox[2] + (_xyBBox[3] - _xyBBox[2])/2, _xyBBox[4] + (_xyBBox[5] - _xyBBox[4])/2,0);
  var _RASCenter = new goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multMat(_XYToRAS,_xyCenter, _RASCenter);
  object._sliceCenter = [_RASCenter[0],
      _RASCenter[1], _RASCenter[2]];

  var res = new goog.vec.Vec4.createFloat32();
  var res2 = new goog.vec.Vec4.createFloat32();
  
  var _wmin =  Math.floor(_xyBBox[0]);
  var _wmax =  Math.ceil(_xyBBox[1]);
  var _woffset = _xyBBox[0] - _wmin + _wmax - _xyBBox[1];
  var _swidth = _wmax - _wmin;
  
  var _hmin = Math.floor(_xyBBox[2]);
  var _hmax = Math.ceil(_xyBBox[3]);
  var _hoffset = _xyBBox[2] - _hmin + _hmax - _xyBBox[3];
  var _sheight = _hmax - _hmin;
  
  object._SW = _swidth;
  object._SH = _sheight;

//  var _resX = Math.abs(_xySpacing[0]);
//  var _resY = Math.abs(_xySpacing[1]);
  var _resX = 1;
  var _resY = 1;
  
// var _epsilon = Number.MIN_VALUE;
  var _epsilon = 0.0000001;

  // How many pixels are we expecting the raw data
  var _cswidth = Math.ceil(_swidth/_resX);
  var _csheight = Math.ceil(_sheight/_resY);
  
  var _csize =  _cswidth*_csheight;
  var textureSize = 4 * _csize;
  var textureForCurrentSlice = new Uint8Array(textureSize);
  var pixelTexture = new X.texture();
  pixelTexture._rawDataWidth = _cswidth;
  pixelTexture._rawDataHeight = _csheight;

  // return ijk indices
  var _mappedPoints = new Array();
  var _mappedPointsIJK = new Array();
  
  var _count = 0;
  var _p = 0;
  
  var tar = new goog.vec.Vec4.createFloat32FromValues(i, j, _xyBBox[4], 1);
  var tttt = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.multMat(_ras2ijk,_XYToRAS, tttt);
  
  var _he = _hmax - _epsilon;
  var _we = _wmax - _epsilon;
  
  var _iWidth = 0;
  var _iHeight = 0;
  
  
  for (var j = _hmin; j <= _he; j+=_resY) {
    _iHeight++;
    _iWidth = 0;
    
    var _ci = 0;
for (var i = _wmin; i <= _we; i+=_resX) {
  _iWidth++;
    //
    tar[0] = i;
    tar[1] = j;
  // convert to RAS
    // convert to IJK
    goog.vec.Mat4.multVec4(tttt, tar, res2);
    
    // get value if there is a match, trnasparent if no match!
    var textureStartIndex = _p * 4;
    
    if( (0 <= res2[0]) && (res2[0] < object._dimensions[0] ) &&
        (0 <= res2[1]) && (res2[1] < object._dimensions[1] ) &&
        (0 <= res2[2]) && (res2[2] < object._dimensions[2] )){
      // map to 0 if necessary
      var _k = Math.floor(res2[2]);
      var _j = Math.floor(res2[1]);
      var _i = Math.floor(res2[0]);
      
      var pixval = _IJKVolumeN[_k][_j][_i];
      var pixelValue_r = 0;
      var pixelValue_g = 0;
      var pixelValue_b = 0;
      var pixelValue_a = 0;
      
      if (colorTable) {
        // color table!
        var lookupValue = colorTable.get(Math.floor(pixval));
        // check for out of range and use the last label value in this case
        if (!lookupValue) {
          lookupValue = [ 0, 1, 0.1, 0.2, 1 ];
        }
        pixelValue_r = 255 * lookupValue[1];
        pixelValue_g = 255 * lookupValue[2];
        pixelValue_b = 255 * lookupValue[3];
        pixelValue_a = 255 * lookupValue[4];
      } else {
        pixelValue_r = pixelValue_g = pixelValue_b = 255 * (pixval / object._max);
        pixelValue_a = 255;
      }
      
      textureForCurrentSlice[textureStartIndex] = pixelValue_r;
      textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
      textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
      textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
    }
    else{
//      textureForCurrentSlice[textureStartIndex] = 255*_count/_csize;
//      textureForCurrentSlice[++textureStartIndex] = 255;
      textureForCurrentSlice[textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;
    }

    _ci++;
    _p++;
    _count++;
    } 

  }
  
  object._mappedPoints = _mappedPoints;
  object._mappedPointsIJK = _mappedPointsIJK;

  pixelTexture._rawData = textureForCurrentSlice; 
  object._texture = pixelTexture;
  
  sliceXY._xyBBox = _xyBBox;
  sliceXY._XYToRAS = _XYToRAS;
  
  sliceXY._iWidth = _iWidth;
  sliceXY._iHeight = _iHeight;
  
  sliceXY._widthSpacing = _resX;
  sliceXY._width = object._SW;

  sliceXY.texture._rawDataWidth = object._texture._rawDataWidth;
  sliceXY.texture._rawDataHeight = object._texture._rawDataHeight;
  sliceXY.texture._rawData = object._texture._rawData;
  
  sliceXY._heightSpacing = _resY;
  sliceXY._height = object._SH;
  sliceXY._center = object._sliceCenter;
  sliceXY._front = object._front;
  sliceXY._right= object._right;
  sliceXY._up = object._up;
  sliceXY._visible = false;
  sliceXY._volume = /** @type {X.volume} */(object);
  
  // for labelmaps, don't create the borders since this would create them 2x
  // hasLabelMap == true means we are the volume
  // hasLabelMap == false means we are the labelmap
  if (goog.isDefAndNotNull(object._volume) && !hasLabelMap) {
    sliceXY._borders = false;
  }
  else{
    sliceXY._borders = true;
  }
  
  sliceXY._borderColor = _color;
  
  sliceXY.create_();
  
  sliceXY['visible'] = false;
  
  X.TIMERSTOP(this._classname + '.reslice2');
  return sliceXY;
};
/**
 * Reslice a data stream to fill the slices of an X.volume in X,Y and Z
 * directions. The given volume (object) has to be created at this point
 * according to the proper dimensions. This also takes care of a possible
 * associated label map which has to be loaded before.
 * 
 * @param {!X.object}
 *          object The X.volume to fill.
 * @return {!Array} The volume data as a 3D Array.
 */
X.parser.prototype.reslice = function(object) {
  
  // ------------------------------------------
  // CREATE IJK VOLUMES
  // ------------------------------------------
  
  // Step 1: create 2 IJK volumes
  // 1 full res, 1 normalized [0-255]
  var _IJKVolumes = this.createIJKVolume(object._data, object._dimensions, object._max);
  // real volume
  var _IJKVolume = _IJKVolumes[0];
  // normalized volume
  var _IJKVolumeN = _IJKVolumes[1];
  X.TIMER(this._classname + '.reslice');
  
  // ------------------------------------------
  // SETUP LABEL MAPS AND COLOR TABLES
  // ------------------------------------------
  var hasLabelMap = object._labelmap != null;
  var _colorTable = null;
  if (object._colortable) {
    _colorTable = object._colortable._map;
  }
  
  
  // ------------------------------------------
  // SET GLOBAL TRANSFORMS
  // ------------------------------------------
  object.range = [object._dimensions[0],object._dimensions[1],object._dimensions[2]];
  // general tranformation matrices and origins, etc.
  var _rasorigin = object._RASOrigin;
  var _rasspacing = object._RASSpacing;
  var _rasdimensions = object._RASDimensions;
  var _rascenter = [_rasorigin[0] + _rasdimensions[0]/2,
                    _rasorigin[1] + _rasdimensions[1]/2,
                    _rasorigin[2] + _rasdimensions[2]/2
                    ];
  var _ras2ijk = object._RASToIJK;
  object._center = _sliceOrigin;
  var _bbox = [Math.min(_rasorigin[0],_rasorigin[0] + _rasdimensions[0]),
                      Math.max(_rasorigin[0],_rasorigin[0] + _rasdimensions[0]),
                      Math.min(_rasorigin[1],_rasorigin[1] + _rasdimensions[1]),
                      Math.max(_rasorigin[1],_rasorigin[1] + _rasdimensions[1]),
                      Math.min(_rasorigin[2],_rasorigin[2] + _rasdimensions[2]),
                      Math.max(_rasorigin[2],_rasorigin[2] + _rasdimensions[2])
                      ];

  // ------------------------------------------
  // GO RESLICE!
  // ------------------------------------------
  // For each slice
  
  // ------------------------------------------
  // GO SAGITTAL
  // ------------------------------------------
  var _count = 0;
  
  // CENTER
  var _sliceOrigin = new goog.vec.Vec3.createFloat32FromValues(
      _rascenter[0],
      _rascenter[1],
      _rascenter[2]);

  // NORMAL
  var _sliceNormal = new goog.vec.Vec3.createFloat32FromValues(
     1,
     0,
     0);
  
  goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
  
  // COLOR
  var _color = [ 1, 1, 0 ];
  
  // ------------------------------------------
  // GET INTERSECTION BOUNDING BOX/LINE
  // ------------------------------------------

  var _solutionsLine = this.intersectionBBoxLine(_bbox,_sliceOrigin, _sliceNormal);
  var _solutionsInLine = _solutionsLine[0];
  var _solutionsOutLine = _solutionsLine[1];

  object._solutionsL = _solutionsInLine;
  object._solutionsOutL = _solutionsOutLine;
  
  window.console.log(_solutionsInLine);
  window.console.log(_solutionsOutLine);
  
  // ------------------------------------------
  // GET DISTANCE BETWEEN 2 POINTS
  // ------------------------------------------
  var _first = new goog.math.Vec3(_solutionsInLine[0][0], _solutionsInLine[0][1], _solutionsInLine[0][2]);
  var _last = new goog.math.Vec3(_solutionsInLine[1][0], _solutionsInLine[1][1], _solutionsInLine[1][2]);
  var _dist = goog.math.Vec3.distance(_first, _last);
  
  window.console.log(_dist);
  
  // ------------------------------------------
  // GET SPACING IN SLICE SPACE
  // ------------------------------------------

  var _XYNormal = new goog.vec.Vec3.createFloat32FromValues(0, 0, 1);
  
  var _XYRASTransform = this.xyrasTransform(_sliceNormal, _XYNormal);
  var _RASToXY = _XYRASTransform[0];
  var _XYToRAS = _XYRASTransform[1];
  
  var qqq = new goog.vec.Vec4.createFloat32FromValues(_rasspacing[0], _rasspacing[1], _rasspacing[2], 0);
  var _xySpacing = new goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(_RASToXY, qqq, _xySpacing);
  
  window.console.log(_xySpacing);
  
  var _sliceDirection = new goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.getColumn(_XYToRAS,2,_sliceDirection);
  goog.vec.Vec4.scale(_sliceDirection,_xySpacing[2],_sliceDirection)

  // ------------------------------------------
  // GET NUMBER OF SLICES
  // ------------------------------------------
  
  // floor cause if plane do not intersect box : crash
  var _nb = Math.abs(Math.floor(_dist/_xySpacing[2]));
  object.range[0] = _nb;
  window.console.log(_nb);
  
  // ITERATE THROUGH SLICE!
  
  for(var _iloop=0; _iloop<_nb; _iloop++){
    
    X.TIMER(this._classname + '.SLICE_SPECIFIC');
    
    _sliceOrigin[0] = _solutionsInLine[0][0] + _sliceDirection[0]*_iloop;
    _sliceOrigin[1] = _solutionsInLine[0][1] + _sliceDirection[1]*_iloop;
    _sliceOrigin[2] = _solutionsInLine[0][2] + _sliceDirection[2]*_iloop;
    
    window.console.log(_iloop + ' / ' + _nb);
    window.console.log(_sliceOrigin);
    window.console.log(_xySpacing);
    window.console.log(_solutionsInLine[0]);
    window.console.log(_solutionsInLine[1]);
    window.console.log("===================");
    
    var _slice = this.reslice2(_sliceOrigin, _sliceNormal, _color, _bbox, _rasspacing, _ras2ijk, _IJKVolume, object, hasLabelMap, _colorTable);
    
    if (hasLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      _slice._labelmap = object._labelmap._children[0]._children[_iloop]._texture;
    }
    
    object._children[0]._children.push(_slice);
      
    X.TIMERSTOP(this._classname + '.SLICE_SPECIFIC');
  }
  
  object._indexX = Math.round(_nb/2);
  object._indexXold = Math.round(_nb/2);
  
  //return;
  
  // ------------------------------------------
  // GO CORONAL
  // ------------------------------------------
  
  var _count = 0;
  for(var _iloop=_bbox[2]; _iloop<=_bbox[3]; _iloop+=Math.abs(_rasspacing[1])){
    
    X.TIMER(this._classname + '.SLICE_SPECIFIC');
    
    // CENTER
    var _sliceOrigin = new goog.vec.Vec3.createFloat32FromValues(
        _rascenter[0],
        _iloop,
        _rascenter[2]);

    // NORMAL
    var _sliceNormal = new goog.vec.Vec3.createFloat32FromValues(
        0,
        1,
        0);
    
    // COLOR
    var _color = [ 1, 0, 0 ];
    
    var _slice = this.reslice2(_sliceOrigin, _sliceNormal, _color, _bbox, _rasspacing, _ras2ijk, _IJKVolume, object, hasLabelMap, _colorTable);
    
    if (hasLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      _slice._labelmap = object._labelmap._children[1]._children[_count]._texture;
    }
    
      object._children[1]._children.push(_slice);
      
      ++_count;
  }
  
  object._indexY = Math.round(_count/2);
  object._indexYold = Math.round(_count/2);
  
  
  // ------------------------------------------
  // GO AXIAL
  // ------------------------------------------
  
  var _count = 0;
  for(var _iloop=_bbox[4]; _iloop<=_bbox[5]; _iloop+=Math.abs(_rasspacing[2])){
    
    X.TIMER(this._classname + '.SLICE_SPECIFIC');
    
    // CENTER
    var _sliceOrigin = new goog.vec.Vec3.createFloat32FromValues(
        _rascenter[0],
        _rascenter[1],
        _iloop);

    // NORMAL
    var _sliceNormal = new goog.vec.Vec3.createFloat32FromValues(
        0,
        0,
        1);
    
    // COLOR
    var _color = [ 0, 1, 0 ];
    
    var _slice = this.reslice2(_sliceOrigin, _sliceNormal, _color, _bbox, _rasspacing, _ras2ijk, _IJKVolume, object, hasLabelMap, _colorTable);
    
    if (hasLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      _slice._labelmap = object._labelmap._children[2]._children[_count]._texture;
    }
// if (object._orientation[_tk] > 0) {
      object._children[2]._children.push(_slice);
// } else {
// object._children[xyz]._children.unshift(_slice);
// }
      
      ++_count;
  }
  object._indexZ = Math.round(_count/2);
  object._indexZold = Math.round(_count/2);
  
  
    X.TIMERSTOP(this._classname + '.SLICE_SPECIFIC');
    
    // set middle too
    
    var tmpreal = _IJKVolume;

  X.TIMERSTOP(this._classname + '.reslice');
  
  return tmpreal;
};


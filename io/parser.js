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
goog.require('goog.vec.Vec4');
goog.require('goog.vec.Vec3');
goog.require('goog.vec.Mat4');

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
 * @param {Array|Uint8Array|Uint16Array|Uint32Array|null}
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

    if(!isNaN(data[i])) {

      var _value = data[i];
      _min = Math.min(_min, _value);
      _max = Math.max(_max, _value);

    }

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
 * Compute RAS bonding box fron IJK dimensions.
 *
 * @param {!Float32Array} IJKToRAS The IJK to RAS transformation.
 * @param {!Array} MRIdim The IJK dimensions.
 *
 * @return The RAS bounding box.
 * @static
 */
X.parser.computeRASBBox = function(IJKToRAS, MRIdim){

  var _rasBB = [Number.MAX_VALUE, -Number.MAX_VALUE,
               Number.MAX_VALUE, -Number.MAX_VALUE,
               Number.MAX_VALUE, -Number.MAX_VALUE];

  var ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
  var rasResult = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, 0, MRIdim[2]-1, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, MRIdim[1]-1, 0, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, 0, 0, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, MRIdim[1]-1, 0, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, 0, MRIdim[2]-1, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, MRIdim[1]-1, MRIdim[2]-1, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

  ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, MRIdim[1]-1, MRIdim[2]-1, 1);
  goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);

  _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
  _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
  _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
  _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
  _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
  _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];

return _rasBB;
}

/**
 * Create the IJK volume.
 *
 * @param {!Float32Array} _data The target Bounding Box.
 * @param {!Array} _dims The line origin.
 * @param {!number} _max The maximum intensity value.
 *
 * @return The IJK volume and the IJK 'normalized' volume.
 * @static
 */
X.parser.createIJKVolume = function(_data, _dims, _max, _min){
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
        _imageN[_k][_j][_i] = 255 * ((_pix_value - _min) / (_max - _min));
        _image[_k][_j][_i] = _pix_value;
        _data_pointer++;

      }
    }
  }

  return [_image, _imageN];
};

/**
 * Compute intersection between line and a bounding box
 *
 * @param {!Array} _bbox The target Bounding Box.
 * @param {!Float32Array} _sliceOrigin The line origin.
 * @param {!Float32Array} _sliceNormal The line normal.
 *
 * @return The intersection points and the 'non-intersection' points.
 * @static
 */
X.parser.intersectionBBoxLine = function(_bbox, _sliceOrigin, _sliceNormal){

  var _solutionsIn = new Array();
  var _solutionsOut = new Array();

  // xmin, xmax, ymin, ymax, zmin, zmax
  for(var _i = 0; _i < 6; _i++) {

    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j1 = (2 + (2*_i2))%6;
    var _j2 = (4 + (2*_i2))%6;
    var _dir = _i2;


    var _sol0 = _bbox[_i];
    var _invN1 = 1/_sliceNormal[_i2];

    var _t = (_sol0 - _sliceOrigin[_i2])*_invN1;

    // if _t infinity, we are //
    if(_t != Infinity && _t != -Infinity) {

      var _sol1 = _sliceOrigin[_i3] + _sliceNormal[_i3]*_t;
      var _sol2 = _sliceOrigin[_i4] + _sliceNormal[_i4]*_t;

      // in range?
      if( (_sol1 >= _bbox[_j1] && _sol1 <= _bbox[_j1+1]) &&
          (_sol2 >= _bbox[_j2] && _sol2 <= _bbox[_j2+1])) {

        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;

        _solutionsIn.push(_sol);

      }
      else {

        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;

        _solutionsOut.push(_sol);

      }
    }
  }

  return [_solutionsIn, _solutionsOut];
};

/**
 * Compute intersection between plane and a bounding box
 *
 * @param {!Array} _bbox The target Bounding Box.
 * @param {!Float32Array} _sliceOrigin The plane origin.
 * @param {!Float32Array} _sliceNormal The plane normal.
 *
 * @return The intersection points and the 'non-intersection' points.
 * @static
 */
X.parser.intersectionBBoxPlane = function(_bbox, _sliceOrigin, _sliceNormal){

  var _solutionsIn = new Array();
  var _solutionsOut = new Array();

  // xmin, xmax, ymin, ymax, zmin, zmax
  for(var _i = 0; _i < 6; _i++) {
    //
    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j3 = (4 + (2*_i2))%6;

    for(var _j = 0; _j < 2; _j++) {

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
          (_solution <= _bbox[_j3] && _solution >= _bbox[_j3+1])) {

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

  return [_solutionsIn, _solutionsOut];
};

/**
 * Get XYToRAS transform and its inverse.
 *
 * @param {!Float32Array} _sliceNormal The slice normal.
 * @param {!Float32Array} _XYNormal The XY normal.
 *
 * @return The XY to RAS transform and its inverse.
 * @static
 */
X.parser.xyrasTransform = function(_sliceNormal, _XYNormal){

  var _RASToXY = goog.vec.Mat4.createFloat32Identity();
    // no rotation needed if we are in the z plane already
  if(!goog.vec.Vec3.equals(_sliceNormal,_XYNormal)) {

    var _cp = _sliceNormal[2];
    var _teta = Math.acos(_cp);
    var _r = goog.vec.Vec3.createFloat32();
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


  var _XYToRAS = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.invert(_RASToXY, _XYToRAS);

  return [_RASToXY, _XYToRAS];
};

/**
 * Get bounding box given a point cloud.
 *
 * @param {!Array} _solutionsXY The slice origin in RAS space.
 *
 * @return The bounding box.
 * @static
 */
X.parser.xyBBox = function(_solutionsXY){

  var _xyBBox = [Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE];
  var i = 0;
  for (i = 0; i < _solutionsXY.length; ++i) {

    if(_solutionsXY[i][0] < _xyBBox[0]) {

      _xyBBox[0] = _solutionsXY[i][0];

    }

    if(_solutionsXY[i][0] > _xyBBox[1]) {

      _xyBBox[1] = _solutionsXY[i][0];

    }

    if(_solutionsXY[i][1] < _xyBBox[2]) {

      _xyBBox[2] = _solutionsXY[i][1];

    }

    if(_solutionsXY[i][1] > _xyBBox[3]) {

      _xyBBox[3] = _solutionsXY[i][1];

    }

    if(_solutionsXY[i][2] < _xyBBox[4]) {

      _xyBBox[4] = _solutionsXY[i][2];

    }

    if(_solutionsXY[i][2] > _xyBBox[5]) {

      _xyBBox[5] = _solutionsXY[i][2];

    }
  }

  return _xyBBox;
};

/**
 * Perform the actual reslicing
 *
 * @param {!Float32Array} _sliceOrigin The slice origin in RAS space.
 * @param {!Float32Array} _sliceNormal The slice normal direction.
 * @param {!Array} _color The slice border color.
 * @param {!Array} _bbox The volume bounding box.
 * @param {!Array} _IJKVolume The IJK volume.
 * @param {!X.object} object The X.volume.
 * @param {!boolean} hasLabelMap Volume has labelmap attached.
 * @param {goog.structs.Map} colorTable Associated color table.
 *
 * @return The target slice.
 * @static
 */
X.parser.reslice2 = function(_sliceOrigin, _sliceXYSpacing, _sliceNormal, _color, _bbox, _IJKVolume, object, hasLabelMap, colorTable){

  var sliceXY = new X.slice();

  // normalize slice normal (just in case)
  goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);

  // ------------------------------------------
  // GET INTERSECTION BOUNDING BOX/PLANE
  // ------------------------------------------

  //_bbox is only this slice bounding box
  var _solutions = X.parser.intersectionBBoxPlane(_bbox,_sliceOrigin, _sliceNormal);
  var _solutionsIn = _solutions[0];

  // ------------------------------------------
  // MOVE TO 2D SPACE
  // ------------------------------------------

  var _XYNormal = goog.vec.Vec3.createFloat32FromValues(0, 0, 1);
  var _XYRASTransform = X.parser.xyrasTransform(_sliceNormal, _XYNormal);
  var _RASToXY = _XYRASTransform[0];
  var _XYToRAS = _XYRASTransform[1];

  // Apply transform to each point!
  var _solutionsXY = new Array();
  for (var i = 0; i < _solutionsIn.length; ++i) {
    var _rasIntersection = goog.vec.Vec4.createFloat32FromValues(_solutionsIn[i][0], _solutionsIn[i][1], _solutionsIn[i][2], 1);
    var _xyIntersection = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(_RASToXY, _rasIntersection, _xyIntersection);
    _solutionsXY.push([_xyIntersection[0], _xyIntersection[1], _xyIntersection[2]]);
  }

  // right
  var _right = goog.vec.Vec3.createFloat32FromValues(1, 0, 0);
  var _rright = goog.vec.Vec3.createFloat32();
  goog.vec.Mat4.multVec3(_XYToRAS, _right, _rright);

  // up
  var _up = goog.vec.Vec3.createFloat32FromValues(0, 1, 0);
  var _rup = goog.vec.Vec3.createFloat32();
  goog.vec.Mat4.multVec3(_XYToRAS, _up, _rup);

  // get XY bounding box!
  var _xyBBox = X.parser.xyBBox(_solutionsXY);

  var _xyCenter = goog.vec.Vec4.createFloat32FromValues(_xyBBox[0] + (_xyBBox[1] - _xyBBox[0])/2,_xyBBox[2] + (_xyBBox[3] - _xyBBox[2])/2, _xyBBox[4] + (_xyBBox[5] - _xyBBox[4])/2,0);
  var _RASCenter = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multMat(_XYToRAS,_xyCenter, _RASCenter);

  var _wmin =  Math.floor(_xyBBox[0]);
  var _wmax =  Math.ceil(_xyBBox[1]);
  // window.console.log(_xyBBox);
  // var _wmin =  _xyBBox[0];
  // var _wmax =  _xyBBox[1];

  // if the slice only has to intersections with the volume BBox
  // (can happens if the slice is right on the edge of the volume)
  if(_wmin == _wmax){

    _wmax++;

  }

  var _swidth = _wmax - _wmin;

  var _hmin = Math.floor(_xyBBox[2]);
  var _hmax = Math.ceil(_xyBBox[3]);
  // var _hmin = _xyBBox[2];
  // var _hmax = _xyBBox[3];

  // if the slice only has to intersections with the volume BBox
  // (can happens if the slice is right on the edge of the volume)
  if(_hmin == _hmax){

    _hmax++;

  }

  var _sheight = _hmax - _hmin;

  var _resX = _sliceXYSpacing[0];
  var _resY = _sliceXYSpacing[1];

  // not sure why?
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


  var _indexIJK = goog.vec.Vec4.createFloat32();
  var _indexXY = goog.vec.Vec4.createFloat32FromValues(0, 0, _xyBBox[4], 1);
  var _XYToIJK = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.multMat(object._RASToIJK,_XYToRAS, _XYToIJK);

  var _he = _hmax - _epsilon;
  var _we = _wmax - _epsilon;

  var _p = 0;
  var _iWidth = 0;
  var _iHeight = 0;
  var j = _hmin;
  var i = _wmin;

  for (j = _hmin; j <= _he; j+=_resY) {

    _iHeight++;
    _iWidth = 0;
    _indexXY[1] = j;
    i = _wmin;

    for (i = _wmin; i <= _we; i+=_resX) {
      _iWidth++;
      //
      _indexXY[0] = i;

      // convert to RAS
      // convert to IJK
      goog.vec.Mat4.multVec4(_XYToIJK, _indexXY, _indexIJK);

      // get value if there is a match, trnasparent if no match!
      var textureStartIndex = _p * 4;

      var _k = Math.floor(_indexIJK[2]);
      var _j = Math.floor(_indexIJK[1]);
      var _i = Math.floor(_indexIJK[0]);

      if( (0 <= _i) && (_i < object._dimensions[0] ) &&
        (0 <= _j) && (_j < object._dimensions[1] ) &&
        (0 <= _k) && (_k < object._dimensions[2] )) {

        // map to 0 if necessary
        var pixval = _IJKVolume[_k][_j][_i];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;

        if (colorTable) {

          // color table!
          var lookupValue = colorTable.get(pixval);
          // check for out of range and use the last label value in this case
          if (!lookupValue) {

          lookupValue = [ 0, .61, 0, 0, 1 ];

          }

          pixelValue_r = 255 * lookupValue[1];
          pixelValue_g = 255 * lookupValue[2];
          pixelValue_b = 255 * lookupValue[3];
          pixelValue_a = 255 * lookupValue[4];

        }
        else {
          // normalization should not happen here, only in the shaders/canvas??
          pixelValue_r = pixelValue_g = pixelValue_b = 255 * ((pixval - object._min )/ (object._max - object._min));
          pixelValue_a = 255;
        }

        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;

      }
      else {

      textureForCurrentSlice[textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;
      textureForCurrentSlice[++textureStartIndex] = 0;

      }

    _p++;

    }

  }

  // setup slice texture
  pixelTexture._rawData = textureForCurrentSlice;
  sliceXY._texture = pixelTexture;
  // setup slice spacial information
  sliceXY._xyBBox = _xyBBox;
  sliceXY._XYToRAS = _XYToRAS;
  sliceXY._XYToIJK = _XYToIJK;
  sliceXY._hmin = _hmin;
  sliceXY._hmax = _hmax;
  sliceXY._wmin = _wmin;
  sliceXY._wmax = _wmax;
  sliceXY._iWidth = _iWidth;
  sliceXY._iHeight = _iHeight;
  sliceXY._widthSpacing = _resX;
  sliceXY._width = _swidth;
  sliceXY._heightSpacing = _resY;
  sliceXY._height = _sheight;
  sliceXY._center = [_RASCenter[0], _RASCenter[1], _RASCenter[2]];
  // ADD SPACING OFFSET to center so it matches meshes/tracts perfectly
  sliceXY._front = [_sliceNormal[0], _sliceNormal[1], _sliceNormal[2]];
  sliceXY._right= [_rright[0], _rright[1], _rright[2]];
  sliceXY._up = [_rup[0], _rup[1], _rup[2]];
  // more styling
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

  // create slice
  sliceXY.create_();

  // update visibility (has to be done after slice creation)
  sliceXY._visible = false;

  return sliceXY;
};

/**
 * Setup basic information for given slice orientation
 *
 * @param {!number} _index The slice orientation index: 0=SAGITTAL, 1=CORONAL, 2=AXIAL.
 * @param {!Float32Array} _sliceOrigin The slice origin in RAS space.
 * @param {!Float32Array} _sliceNormal The slice normal direction.
 * @param {!X.object} object The X.volume.
 */
X.parser.prototype.updateSliceInfo = function(_index, _sliceOrigin, _sliceNormal, object){

  // ------------------------------------------
  // GET INTERSECTION BOUNDING BOX/LINE
  // ------------------------------------------

  var _solutionsLine = X.parser.intersectionBBoxLine(object._BBox,_sliceOrigin, _sliceNormal);
  var _solutionsInLine = _solutionsLine[0];
  var _solutionsOutLine = _solutionsLine[1];

  object._childrenInfo[_index]._solutionsLine = _solutionsLine;

  // ------------------------------------------
  // GET DISTANCE BETWEEN 2 POINTS
  // ------------------------------------------
  var _first = new goog.math.Vec3(_solutionsInLine[0][0], _solutionsInLine[0][1], _solutionsInLine[0][2]);
  var _last = new goog.math.Vec3(_solutionsInLine[1][0], _solutionsInLine[1][1], _solutionsInLine[1][2]);
  var _dist = goog.math.Vec3.distance(_first, _last);

  object._childrenInfo[_index]._dist = _dist;

  // ------------------------------------------
  // GET CENTER OF 2 POINTS
  // ------------------------------------------

  // ------------------------------------------
  // GET SPACING IN SLICE SPACE
  // ------------------------------------------

  var _XYNormal = goog.vec.Vec3.createFloat32FromValues(0, 0, 1);

  var _XYRASTransform = X.parser.xyrasTransform(_sliceNormal, _XYNormal);
  var _RASToXY = _XYRASTransform[0];
  var _XYToRAS = _XYRASTransform[1];
  var _rasSpacing = goog.vec.Vec4.createFloat32FromValues(object._RASSpacing[0], object._RASSpacing[1], object._RASSpacing[2], 0);
  var _xySpacing = goog.vec.Vec4.createFloat32();

  goog.vec.Mat4.multVec4(_RASToXY, _rasSpacing, _xySpacing);

  var _sliceDirection = goog.vec.Vec4.createFloat32();
  // scale
  goog.vec.Vec4.scale(_sliceNormal,_xySpacing[2],_sliceDirection);

  // by default the minimum in plane spacing is 0.1
   if(Math.abs(_xySpacing[0]) < 0.1){
     _xySpacing[0] =  0.1;
   }

   if(Math.abs(_xySpacing[1]) < 0.1){
     _xySpacing[1] =  0.1;
   }

   // increase resolution if needed
   _xySpacing[0] /= object._resolutionFactor;
   _xySpacing[1] /= object._resolutionFactor;

  object._childrenInfo[_index]._sliceXYSpacing = [Math.abs(_xySpacing[0]), Math.abs(_xySpacing[1])];
  object._childrenInfo[_index]._sliceSpacing = _xySpacing[2];
  object._childrenInfo[_index]._sliceDirection = _sliceDirection;

  // ------------------------------------------
  // GET NUMBER OF SLICES
  // ------------------------------------------

  var _nb = Math.floor(Math.abs(_dist/_xySpacing[2]));
  object._range[_index] = _nb + 1;
  object._childrenInfo[_index]._nb = _nb + 1;

  // order solutionsIn in _sliceDirection
  if(object._childrenInfo[_index]._solutionsLine [0][0][0] > object._childrenInfo[_index]._solutionsLine [0][1][0]){
    if(_sliceDirection[0] > 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }
  else  if(object._childrenInfo[_index]._solutionsLine [0][0][0] < object._childrenInfo[_index]._solutionsLine [0][1][0]){
    if(_sliceDirection[0] < 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }
  else if(object._childrenInfo[_index]._solutionsLine [0][0][1] > object._childrenInfo[_index]._solutionsLine [0][1][1]){
    if(_sliceDirection[1] > 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][1] < object._childrenInfo[_index]._solutionsLine [0][1][1]){
    if(_sliceDirection[1] < 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }
  else if(object._childrenInfo[_index]._solutionsLine [0][0][2] > object._childrenInfo[_index]._solutionsLine [0][1][2]){
    if(_sliceDirection[2] > 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][2] < object._childrenInfo[_index]._solutionsLine [0][1][2]){
    if(_sliceDirection[2] < 0){
      // invert
      var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
      object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
      object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
  }

    object._childrenInfo[_index]._originD = -(_sliceNormal[0]*_solutionsInLine[0][0] + _sliceNormal[1]*_solutionsInLine[0][1] + _sliceNormal[2]*_solutionsInLine[0][2]);

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
  
  var _IJKVolumes = X.parser.createIJKVolume(object._data, object._dimensions, object._max, object._min);
  // real volume
  object._IJKVolume = _IJKVolumes[0];
  // normalized volume
  object._IJKVolumeN = _IJKVolumes[1];
  X.TIMER(this._classname + '.reslice');

  // ------------------------------------------
  // SETUP LABEL MAPS AND COLOR TABLES
  // ------------------------------------------
  object.hasLabelMap = object._labelmap != null;
  if (object._colortable) {
    object._colorTable = object._colortable._map;
  }

  // ------------------------------------------
  // SET GLOBAL VALUES/TRANSFORMS
  // ------------------------------------------
  object.range = [0,0,0];
  object._RASCenter = [object._RASOrigin[0] + (object._RASDimensions[0] - 1)/2,
                    object._RASOrigin[1] + (object._RASDimensions[1] - 1)/2,
                    object._RASOrigin[2] + (object._RASDimensions[2] - 1)/2
                    ];

  object._BBox = [Math.min(object._RASOrigin[0],object._RASOrigin[0] + object._RASDimensions[0] - 1),
                      Math.max(object._RASOrigin[0],object._RASOrigin[0] + object._RASDimensions[0] - 1),
                      Math.min(object._RASOrigin[1],object._RASOrigin[1] + object._RASDimensions[1] - 1),
                      Math.max(object._RASOrigin[1],object._RASOrigin[1] + object._RASDimensions[1] - 1),
                      Math.min(object._RASOrigin[2],object._RASOrigin[2] + object._RASDimensions[2] - 1),
                      Math.max(object._RASOrigin[2],object._RASOrigin[2] + object._RASDimensions[2] - 1)
                      ];
  object._childrenInfo = [{}, {}, {}];

  // ------------------------------------------
  // GO RESLICE!
  // ------------------------------------------

  // ------------------------------------------
  // GO SAGITTAL
  // ------------------------------------------

  // CENTER
  var _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
      object._RASCenter[0],
      object._RASCenter[1],
      object._RASCenter[2]);
  object._childrenInfo[0]._sliceOrigin = _sliceOrigin;

  // NORMAL
  var _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
     1.00,
     0.00,
     0.00);
  goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
  object._childrenInfo[0]._sliceNormal = _sliceNormal;

  // COLOR
  var _color = [ 1, 0, 0 ];
  object._childrenInfo[0]._color = _color;

  // UPDATE SLICE INFO
  this.updateSliceInfo(0, _sliceOrigin, _sliceNormal, object);
  // Create empty array for all slices in this direction
  object._children[0]._children = new Array(object._childrenInfo[0]._nb);

  _sliceOrigin[0] = object._childrenInfo[0]._solutionsLine[0][0][0] + object._childrenInfo[0]._sliceDirection[0]*Math.floor(object._childrenInfo[0]._nb/2);
  _sliceOrigin[1] = object._childrenInfo[0]._solutionsLine[0][0][1] + object._childrenInfo[0]._sliceDirection[1]*Math.floor(object._childrenInfo[0]._nb/2);
  _sliceOrigin[2] = object._childrenInfo[0]._solutionsLine[0][0][2] + object._childrenInfo[0]._sliceDirection[2]*Math.floor(object._childrenInfo[0]._nb/2);

  var _slice = X.parser.reslice2(_sliceOrigin, object._childrenInfo[0]._sliceXYSpacing, object._childrenInfo[0]._sliceNormal, object._childrenInfo[0]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);

  if (object.hasLabelMap) {
    // if this object has a labelmap,
    // we have it loaded at this point (for sure)
    // ..so we can attach it as the second texture to this slice
    _slice._labelmap = object._labelmap._children[0]._children[Math.floor(object._childrenInfo[0]._nb/2)]._texture;
  }

  object._children[0]._children[Math.floor(object._childrenInfo[0]._nb/2)] = _slice;

  object._indexX = Math.floor(object._childrenInfo[0]._nb/2);
  object._indexXold = Math.floor(object._childrenInfo[0]._nb/2);

  // ------------------------------------------
  // GO CORONAL
  // ------------------------------------------

  // CENTER

  _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
      object._RASCenter[0],
      object._RASCenter[1],
      object._RASCenter[2]);
  object._childrenInfo[1]._sliceOrigin = _sliceOrigin;

  // NORMAL
  _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
     0,
     1,
     0);
    goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
  object._childrenInfo[1]._sliceNormal = _sliceNormal;

  // COLOR
  _color = [ 0, 1, 0 ];
  object._childrenInfo[1]._color = _color;

  // UPDATE SLICE INFO
  this.updateSliceInfo(1, _sliceOrigin, _sliceNormal, object);
  // Create empty array for all slices in this direction
  object._children[1]._children = new Array(object._childrenInfo[1]._nb);

  _sliceOrigin[0] = object._childrenInfo[1]._solutionsLine[0][0][0] + object._childrenInfo[1]._sliceDirection[0]*Math.floor(object._childrenInfo[1]._nb/2);
  _sliceOrigin[1] = object._childrenInfo[1]._solutionsLine[0][0][1] + object._childrenInfo[1]._sliceDirection[1]*Math.floor(object._childrenInfo[1]._nb/2);
  _sliceOrigin[2] = object._childrenInfo[1]._solutionsLine[0][0][2] + object._childrenInfo[1]._sliceDirection[2]*Math.floor(object._childrenInfo[1]._nb/2);

  _slice = X.parser.reslice2(_sliceOrigin, object._childrenInfo[1]._sliceXYSpacing, object._childrenInfo[1]._sliceNormal, object._childrenInfo[1]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);

  if (object.hasLabelMap) {
    // if this object has a labelmap,
    // we have it loaded at this point (for sure)
    // ..so we can attach it as the second texture to this slice
    _slice._labelmap = object._labelmap._children[1]._children[Math.floor(object._childrenInfo[1]._nb/2)]._texture;
  }

  object._children[1]._children[Math.floor(object._childrenInfo[1]._nb/2)] = _slice;

  object._indexY = Math.floor(object._childrenInfo[1]._nb/2);
  object._indexYold = Math.floor(object._childrenInfo[1]._nb/2);

  // ------------------------------------------
  // GO AXIAL
  // ------------------------------------------

  // CENTER
  _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
      object._RASCenter[0],
      object._RASCenter[1],
      object._RASCenter[2]);
  object._childrenInfo[2]._sliceOrigin = _sliceOrigin;

  // NORMAL
  _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
     0,
     0,
     1);
  goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
  object._childrenInfo[2]._sliceNormal = _sliceNormal;

  // COLOR
  _color = [ 0, 0.392, 0.804 ];
  object._childrenInfo[2]._color = _color;

  // UPDATE SLICE INFO
  this.updateSliceInfo(2, _sliceOrigin, _sliceNormal, object);
  // Create empty array for all slices in this direction
  object._children[2]._children = new Array(object._childrenInfo[2]._nb);

  _sliceOrigin[0] = object._childrenInfo[2]._solutionsLine[0][0][0] + object._childrenInfo[2]._sliceDirection[0]*Math.floor(object._childrenInfo[2]._nb/2);
  _sliceOrigin[1] = object._childrenInfo[2]._solutionsLine[0][0][1] + object._childrenInfo[2]._sliceDirection[1]*Math.floor(object._childrenInfo[2]._nb/2);
  _sliceOrigin[2] = object._childrenInfo[2]._solutionsLine[0][0][2] + object._childrenInfo[2]._sliceDirection[2]*Math.floor(object._childrenInfo[2]._nb/2);

  _slice = X.parser.reslice2(_sliceOrigin, object._childrenInfo[2]._sliceXYSpacing, object._childrenInfo[2]._sliceNormal, object._childrenInfo[2]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);

  if (object.hasLabelMap) {
    // if this object has a labelmap,
    // we have it loaded at this point (for sure)
    // ..so we can attach it as the second texture to this slice
    _slice._labelmap = object._labelmap._children[2]._children[Math.floor(object._childrenInfo[2]._nb/2)]._texture;
  }

  object._children[2]._children[Math.floor(object._childrenInfo[2]._nb/2)] = _slice;

  object._indexZ = Math.floor(object._childrenInfo[2]._nb/2);
  object._indexZold = Math.floor(object._childrenInfo[2]._nb/2);

  X.TIMERSTOP(this._classname + '.reslice');

  return object._IJKVolume;
};

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
  // scan space
  var _space = object._info.space;
  // scan space orientation
  var _space_orientation = object._info.space_orientation;
  // Go to Right-Anterior-Superior for now!
  var _ras_space_orientation = object._info.ras_space_orientation;
  var _norm_cosine = object._info.norm_cosine;
  // labelmap and color tables
  var hasLabelMap = object._labelmap != null;
  var _colorTable = null;
  if (object._colortable) {
    _colorTable = object._colortable._map;
  }
  // _orient might be useful too
  // allocate volume
  // rows, cols and slices (ijk dimensions)
  var _dim = object._dimensions;
  var _spacing = object._spacing;
  var max = object._info.max;
  var datastream = object._info.data;
  var image = new Array(_dim[0]);
  // use real image to return real values
  var realImage = new Array(_dim[0]);
  var _i = 0, _j = 0, _k = 0;
  for (_i = 0; _i < _dim[0]; _i++) {
    image[_i] = new Array(_dim[1]);
    realImage[_i] = new Array(_dim[1]);
    _j = 0;
    for (_j = 0; _j < _dim[1]; _j++) {
      image[_i][_j] = new object._info.data.constructor(_dim[2]);
      realImage[_i][_j] = new object._info.data.constructor(_dim[2]);
    }
  }
  // XYS to IJK
  // (fill volume)
  var _nb_pix_per_slice = _dim[0] * _dim[1];
  var _pix_value = 0;
  _k = 0;
  var _data_pointer = 0;
  for (_k = 0; _k < _dim[2]; _k++) {
    // get current slice
    var _current_k = datastream.subarray(_k * (_nb_pix_per_slice), (_k + 1)
        * _nb_pix_per_slice);
    // now loop through all pixels of the current slice
    _i = 0;
    _j = 0;
    _data_pointer = 0; // just a counter
    for (_j = 0; _j < _dim[1]; _j++) {
      for (_i = 0; _i < _dim[0]; _i++) {
        // go through row (i) first :)
        // 1 2 3 4 5 6 ..
        // .. .... .. . .
        // 
        // not
        // 1 .. ....
        // 2 ...
        // map pixel values
        _pix_value = _current_k[_data_pointer];
        image[_i][_j][_k] = 255 * (_pix_value / object._info.max);
        realImage[_i][_j][_k] = _pix_value;
        _data_pointer++;
      }
    }
  }
  // IJK to XYS
  // (Axial, Sagittal, Coronal)
  // reslice image
  // use 3 orientation matrices to extract slices
  // slice in scan direction without texture yet
  // slice in scan next direction
  // slice in scan next - next direction
  var xyz = 0;
  for (xyz = 0; xyz < 3; xyz++) {
    var _ti = xyz;
    var _tj = (_ti + 1) % 3;
    var _tk = (_ti + 2) % 3;
    var textureSize = 4 * _dim[_ti] * _dim[_tj];
    _k = 0;
    var imax = _dim[_ti];
    var jmax = _dim[_tj];
    var kmax = _dim[_tk];
    // CREATE SLICE in normal direction
    var halfDimension = (kmax - 1) / 2;
    var _indexCenter = halfDimension;
    // up = i direction
    var _right = _norm_cosine[_ti];
    // up = i direction
    var _up = _norm_cosine[_tj];
    // front = normal direction
    var _front = _norm_cosine[_tk];
    // color
    var _color = [ 1, 1, 1 ];
    if (_norm_cosine[_tk][2] != 0) {
      _color = [ 1, 0, 0 ];
    } else if (_norm_cosine[_tk][1] != 0) {
      _color = [ 0, 1, 0 ];
    } else {
      _color = [ 1, 1, 0 ];
    }
    // size
    // var _width = imax * _spacing[_ti];
    // var _height = jmax * _spacing[_tj];
    var _width = imax * _spacing[_ti];
    var _height = jmax * _spacing[_tj];
    for (_k = 0; _k < kmax; _k++) {
      _j = 0;
      var _p = 0;
      // CREATE SLICE
      // position
      var _position = (-halfDimension * _spacing[_tk]) + (_k * _spacing[_tk]);
      // center
      var _center = [ object._center[0], object._center[1], object._center[2] ];
      // move center along normal
      // 0 should be hard coded
      // find normal direction and use it!
      _center[0] += _norm_cosine[_tk][0] * _position;
      _center[1] += _norm_cosine[_tk][1] * _position;
      _center[2] += _norm_cosine[_tk][2] * _position;
      // create the slice
      // .. new slice
      var _slice = new X.slice();
      var borders = true;
      // for labelmaps, don't create the borders since this would create them 2x
      // hasLabelMap == true means we are the volume
      // hasLabelMap == false means we are the labelmap
      if (goog.isDefAndNotNull(object._volume) && !hasLabelMap) {
        borders = false;
      }
      
      _slice.setup(_center, _front, _up, _right, _width, _height, borders, _color);
      // map slice to volume
      _slice._volume = object;
      // only show the middle slice, hide everything else
      if (object._info.orientation[_tk] > 0) {
        _slice['visible'] = (_k == Math.floor(_indexCenter));
      } else {
        _slice['visible'] = (_k == Math.ceil(_indexCenter));
      }
      var targetSlice = _slice;
      var textureForCurrentSlice = new Uint8Array(textureSize);
      for (_j = 0; _j < jmax; _j++) {
        _i = 0;
        for (_i = 0; _i < imax; _i++) {
          var _pix_val = 0;
          if (xyz == 0) {
            _pix_val = realImage[_i][_j][_k];
          } else if (xyz == 1) {
            _pix_val = realImage[_k][_i][_j];
          } else {
            _pix_val = realImage[_j][_k][_i];
          }
          var pixelValue_r = pixelValue_g = pixelValue_b = pixelValue_a = 0;
          if (_colorTable) {
            // color table!
            var lookupValue = _colorTable.get(Math.floor(_pix_val));
            // check for out of range and use the last label value in this case
            if (!lookupValue) {
              lookupValue = [ 0, 1, 0.1, 0.2, 1 ];
            }
            pixelValue_r = 255 * lookupValue[1];
            pixelValue_g = 255 * lookupValue[2];
            pixelValue_b = 255 * lookupValue[3];
            pixelValue_a = 255 * lookupValue[4];
          } else {
            pixelValue_r = pixelValue_g = pixelValue_b = 255 * (_pix_val / object._info.max);
            pixelValue_a = 255;
          }
          var textureStartIndex = _p * 4;
          textureForCurrentSlice[textureStartIndex] = pixelValue_r;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
          _p++;
        }
      }
      var pixelTexture = new X.texture();
      pixelTexture._rawData = textureForCurrentSlice;
      pixelTexture._rawDataWidth = imax;
      pixelTexture._rawDataHeight = jmax;
      targetSlice._texture = pixelTexture;
      // push slice
      if (object._info.orientation[_tk] > 0) {
        object._children[xyz]._children.push(targetSlice);
      } else {
        object._children[xyz]._children.unshift(targetSlice);
      }
      if (hasLabelMap) {
        // if this object has a labelmap,
        // we have it loaded at this point (for sure)
        // ..so we can attach it as the second texture to this slice
        targetSlice._labelmap = object._labelmap._children[xyz]._children[_k]._texture;
      }
    }
    // set slice index
    // by default, all the 'middle' slices are shown
    if (xyz == 0) {
      object._indexX = halfDimension;
      object._indexXold = halfDimension;
    } else if (xyz == 1) {
      object._indexY = halfDimension;
      object._indexYold = halfDimension;
    } else if (xyz == 2) {
      object._indexZ = halfDimension;
      object._indexZold = halfDimension;
    }
  }
  object._dirty = true;
  X.TIMERSTOP(this._classname + '.reslice');
  return realImage;
};

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
 * @param {!Object}
 *          MRI The MRI object which contains the min, max, data and type.
 * @return {!Array} The volume data as a 3D Array.
 */
X.parser.prototype.reslice = function(object, MRI) {
  // scan space
  var _space = MRI.space;
  // scan space orientation
  var _space_orientation = MRI.space_orientation;
  console.log('space: ' + _space);
  console.log('space orientation: ' + _space_orientation);
  // Go to Right-Anterior-Superior for now!
  var _ras_space_orientation = _space_orientation;
  if (_space[0] != 'right') {
    _ras_space_orientation[0] = -_ras_space_orientation[0];
    _ras_space_orientation[3] = -_ras_space_orientation[3];
    _ras_space_orientation[6] = -_ras_space_orientation[6];
  }
  if (_space[1] != 'anterior') {
    _ras_space_orientation[1] = -_ras_space_orientation[1];
    _ras_space_orientation[4] = -_ras_space_orientation[4];
    _ras_space_orientation[7] = -_ras_space_orientation[7];
  }
  if (_space[2] != 'superior') {
    _ras_space_orientation[2] = -_ras_space_orientation[2];
    _ras_space_orientation[5] = -_ras_space_orientation[5];
    _ras_space_orientation[8] = -_ras_space_orientation[8];
  }
  console.log('RAS space orientation: ' + _ras_space_orientation);
  // Go to IJK space
  // Get ijk orientation
  var _x_cosine = _space_orientation.slice(0, 3);
  var _x_abs_cosine = _x_cosine.map(function(v) {
    return Math.abs(v);
  });
  var _x_max = _x_abs_cosine.indexOf(Math.max.apply(Math, _x_abs_cosine));
  var _x_norm_cosine = [ 0, 0, 0 ];
  _x_norm_cosine[_x_max] = _x_cosine[_x_max] < 0 ? -1 : 1;
  var _y_cosine = _space_orientation.slice(3, 6);
  var _y_abs_cosine = _y_cosine.map(function(v) {
    return Math.abs(v);
  });
  var _y_max = _y_abs_cosine.indexOf(Math.max.apply(Math, _y_abs_cosine));
  var _y_norm_cosine = [ 0, 0, 0 ];
  _y_norm_cosine[_y_max] = _y_cosine[_y_max] < 0 ? -1 : 1;
  var _z_cosine = _space_orientation.slice(6, 9);
  var _z_abs_cosine = _z_cosine.map(function(v) {
    return Math.abs(v);
  });
  var _z_max = _z_abs_cosine.indexOf(Math.max.apply(Math, _z_abs_cosine));
  var _z_norm_cosine = [ 0, 0, 0 ];
  _z_norm_cosine[_z_max] = _z_cosine[_z_max] < 0 ? -1 : 1;
  var _orient = [ _x_norm_cosine[_x_max], _y_norm_cosine[_y_max],
      _z_norm_cosine[_z_max] ];
  // allocate volume
  // rows, cols and slices (ijk dimensions)
  var _dim = object._dimensions;
  var _spacing = object._spacing;
  var max = MRI.max;
  var datastream = MRI.data;
  var image = new Array(_dim[0]);
  // use real image to return real values
  var realImage = new Array(_dim[0]);
  var _i = 0, _j = 0, _k = 0;
  for (_i = 0; _i < _dim[0]; _i++) {
    image[_i] = new Array(_dim[1]);
    realImage[_i] = new Array(_dim[1]);
    _j = 0;
    for (_j = 0; _j < _dim[1]; _j++) {
      image[_i][_j] = new MRI.data.constructor(_dim[2]);
      realImage[_i][_j] = new MRI.data.constructor(_dim[2]);
    }
  }
  console.log('Empty image:');
  console.log(image);
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
        // to ensure it fits in matrix,
        // then in the reslice, we also take orientation into account
        // var _li = (_dim[0] + _orient[0] * _i) % _dim[0];
        // var _lj = (_dim[1] + _orient[1] * _j) % _dim[1];
        // var _lk = (_dim[2] + _orient[2] * _k) % _dim[2];
        image[_i][_j][_k] = 255 * (_pix_value / MRI.max);
        realImage[_i][_j][_k] = _pix_value;
        // image[_li][_lj][_lk] = 255 * (_pix_value / MRI.max);
        // realImage[_li][_lj][_lk] = _pix_value;
        _data_pointer++;
      }
    }
  }
  console.log('Full image:');
  console.log(image);
  // IJK to XYS
  // (Axial, Sagittal, Coronal)
  // reslice image
  // use 3 orientation matrices to extract slices
  // slice in scan direction without texture yet
  // slice in scan next direction
  // slice in scan next - next direction
  console.log(_x_norm_cosine);
  console.log(_y_norm_cosine);
  console.log(_z_norm_cosine);
  
  // might be usefull to loop
  var _norm_cosine = [_x_norm_cosine, _y_norm_cosine, _z_norm_cosine];
  // _orient might be useful too
  
  var xyz = 0;
  for (xyz = 0; xyz < 1; xyz++) {
    var _ti = xyz;
    var _tj = (_ti + 1) % 3;
    var _tk = (_ti + 2) % 3;
    var textureSize = 4 * _dim[_ti] * _dim[_tj];
    _k = 0;
    var imax = _dim[_ti];
    var jmax = _dim[_tj];
    var kmax = _dim[_tk];
    console.log('**SLICING**');
    console.log('k: ' + kmax);
    console.log('j: ' + jmax);
    console.log('i: ' + imax);
    console.log('textureSize: ' + textureSize);
    console.log('x axis: ' + _norm_cosine[_ti]);
    console.log('y axis: ' + _norm_cosine[_tj]);
    console.log('normal: ' + _norm_cosine[_tk]);
    console.log('first: ' + image.length);
    console.log('second: ' + image[0].length);
    console.log('third: ' +  image[0][0].length);
    
    // CREATE SLICE in normal direction
    var halfDimension = (kmax - 1) / 2;
    var _indexCenter = halfDimension;
    // up = i direction
    var _up = _norm_cosine[_ti];
    // front = normal direction
    var _front = _norm_cosine[_tk];
    // color
    var _color = [1,1,1];
    if(_norm_cosine[_tk][2] != 0){
      _color = [1,0,0];
    }
    else if(_norm_cosine[_tk][1] != 0){
      _color = [0,1,0];
    }
    else{
      _color = [1,1,0];
    }
    // size
    var _width = imax * _spacing[_ti];
    var _height = jmax * _spacing[_tj];

    console.log('spacing: ' +  _spacing);
    console.log('width: ' +  _width);
    console.log('height: ' +  _height);
    
    for(_k = 0; _k < kmax; _k++){
      _j = 0;
      var _p = 0;
      
      // CREATE SLICE
      // position
      var _position = (-halfDimension * _spacing[_tk]) +
      (_k * _spacing[_tk]);
      // center
      var _center = [object._center[0],object.center[1],object.center[2]];
      // move center along normal
      // 0 should be hard coded
      _center[0] += _position;
      
      // create the slice
      // .. new slice
      var _slice = new X.slice();
      _slice.setup(_center, _front, _up, _width, _height, true,
          _color);
      // map slice to volume
      _slice._volume = object;
      // only show the middle slice, hide everything else
      _slice['visible'] = (_k == Math.floor(_indexCenter));

      var targetSlice = _slice;
      var textureForCurrentSlice = new Uint8Array(textureSize);
      for(_j = 0; _j < jmax; _j++){
        _i = 0;
        for(_i = 0; _i < imax; _i++){
          var _pix_val = 0;
          // order pixels based on cosine directions
          var _li = (_dim[_ti] + _orient[_ti] * _i) % _dim[_ti];
          var _lj = (_dim[_tj] + _orient[_tj] * _j) % _dim[_tj];
          var _lk = (_dim[_tk] + _orient[_tk] * _k) % _dim[_tk];
          
          // use normal to know how pixels are arranged
          if(_norm_cosine[_tk][0] != 0){
            // use slice orientation?
            _pix_val = image[_lk][_li][_lj];
          }
          else if(_norm_cosine[_tk][1] != 0){
            // use slice orientation?
            _pix_val = image[_lj][_lk][_li];
          }
          else{
            _pix_val = image[_li][_lj][_lk];
          }
          
           var pixelValue_r = _pix_val;
           var pixelValue_g = _pix_val;
           var pixelValue_b = _pix_val;
           var pixelValue_a = 255;
           var textureStartIndex = _p * 4;
           textureForCurrentSlice[textureStartIndex] = pixelValue_r;
           textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
           textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
           textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
          _p++;
        }
      }
      
      // slice normal?
      // slice orientation?
      var pixelTexture = new X.texture();
      pixelTexture._rawData = textureForCurrentSlice;
      pixelTexture._rawDataWidth = imax;
      pixelTexture._rawDataHeight = jmax;
      targetSlice._texture = pixelTexture;
      
      // push slice
      object._children[_tk]._children.push(targetSlice);
    }
    
    /*
     * for (_k = 0; _k < kmax; _k++) { var textureForCurrentSlice = new
     * Uint8Array(textureArraySize); var p = 0; _j = 0; for (_j = 0; _j < jmax;
     * _j++) { _i = 0; for (_i = 0; _i < imax; _i++) { var pixelValue = 0; //
     * map i,j,k given orientation... var textureStartIndex = p * 4; /* var _li =
     * (_dim[0] + _orient[0] * _i) % _dim[0]; var _lj = (_dim[1] + _orient[1] *
     * _j) % _dim[1]; var _lk = (_dim[2] + _orient[2] * _k) % _dim[2];
     */
    /*
     * if (xyz == 0) { // sagittal pixelValue = image[_i][_j][_k]; } else if
     * (xyz == 1) { // coronal pixelValue = image[_k][_i][_j]; } else { // axial
     * pixelValue = image[_j][_k][_i]; }
     * 
     * //var pixelValue_r = pixelValue; //var pixelValue_g = pixelValue; //var
     * pixelValue_b = pixelValue; //var pixelValue_a = 255;
     * //textureForCurrentSlice[textureStartIndex] = pixelValue_r;
     * //textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
     * //textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
     * //textureForCurrentSlice[++textureStartIndex] = pixelValue_a; //p++; } }
     */
    // var pixelTexture = new X.texture();
    // pixelTexture._rawData = textureForCurrentSlice;
    // pixelTexture._rawDataWidth = jmax;
    // pixelTexture._rawDataHeight = kmax;
    // use orientation for target too
    // var _ind = _i;
    /*
     * // invert y axis for y-slice index if (xyz == 1) { _ind = imax - 1 - i; }
     */
    // var currentSlice = targetSlice._children[_ind];
    // currentSlice._texture = pixelTexture;
    // }
  }
  return realImage;
  // scan direction? AXIAL, CORONAL OR SAGITTAL?
  // http://www.mathworks.com/matlabcentral/fileexchange/22508-siemens-dicom-sort-and-convert-to-nifti/content/get_header_parameters.m
  // 0 + 1: x + y = z: SAGITTAL...
  // etc.
  var _scan_direction_int = _x_max + _y_max;
  var _scan_direction = "";
  switch (_scan_direction_int) {
  case 1:
    _scan_direction = "AXIAL";
    _scan_direction_int = 2;
    break;
  case 2:
    _scan_direction = "CORONAL";
    _scan_direction_int = 1;
    break;
  case 3:
    _scan_direction = "SAGITTAL";
    _scan_direction_int = 0;
    break;
  default:
    _scan_direction = "unrecognized - assume SAGITTAL";
    _scan_direction_int = 0;
    break;
  }
  var _orient = _scan_direction_int;
  _scan_direction_int = _scan_direction_int % 3;
  console.log('_orient: ' + _orient);
  console.log('orient: ' + orient);
  console.log('RESLICING!');
  X.TIMER(this._classname + '.reslice');
  var sizes = object._dimensions;
  var max = MRI.max;
  var datastream = MRI.data;
  // number of slices in scan direction
  var slices = sizes[2];
  // number of rows in each slice in scan direction
  var rowsCount = sizes[1];
  // number of cols in each slice in scan direction
  var colsCount = sizes[0];
  // do we have a labelmap?
  var hasLabelMap = object._labelmap != null;
  // slice dimensions in scan direction
  var numberPixelsPerSlice = rowsCount * colsCount;
  // console.log(image);
  var pixelValue = 0;
  // reference the color table for easy access
  var _colorTable = null;
  if (object._colortable) {
    _colorTable = object._colortable._map;
  }
  // 1- Create 3D volume
  // allocate volume [x][y][y]
  // create slices in all directions
  var ind_nb_sagittal = (((_scan_direction_int + 1) % 3) * (2 - (_scan_direction_int) % 2)) % 3;
  var ind_nb_coronal = (((_scan_direction_int + 1) % 3)
      * (2 - (_scan_direction_int) % 2) + 1) % 3;
  var ind_nb_axial = (((_scan_direction_int + 1) % 3)
      * (2 - (_scan_direction_int) % 2) + 2) % 3;
  console.log('nb sag');
  console.log(sizes[ind_nb_sagittal]);
  console.log('nb coro');
  console.log(sizes[ind_nb_coronal]);
  console.log('nb ax');
  console.log(sizes[ind_nb_axial]);
  // GO SAGITAL!
  // texture array size
  // slices dimensions
  var x = 0;
  var xmax = sizes[(((_scan_direction_int + 1) % 3) * (2 - (_scan_direction_int) % 2)) % 3];
  var y = 0;
  var ymax = sizes[(1 + ((_scan_direction_int + 1) % 3)
      * (2 - (_scan_direction_int) % 2)) % 3];
  var z = 0;
  var zmax = sizes[(2 + ((_scan_direction_int + 1) % 3)
      * (2 - (_scan_direction_int) % 2)) % 3];
  console.log('**ALLOCATION**');
  console.log('xmax: ' + xmax);
  console.log('ymax: ' + ymax);
  console.log('zmax: ' + zmax);
  // allocate 3d image array [slices][rows][cols]
  // use image for fast looping
  var image = new Array(xmax);
  // use real image to return real values
  var realImage = new Array(xmax);
  for (x = 0; x < xmax; x++) {
    image[x] = new Array(ymax);
    realImage[x] = new Array(ymax);
    y = 0;
    for (y = 0; y < ymax; y++) {
      image[x][y] = new MRI.data.constructor(zmax);
      realImage[x][y] = new MRI.data.constructor(zmax);
    }
  }
  console.log('**FILLING**');
  console.log('slice: ' + slices);
  console.log('row: ' + rowsCount);
  console.log('col: ' + colsCount);
  // fill volume
  // using scan orientation
  var slice = 0;
  var row = 0;
  var col = 0;
  var p = 0;
  for (slice = 0; slice < slices; slice++) {
    // grab the pixels for the current slice in scan direction
    var currentSlice = datastream.subarray(slice * (numberPixelsPerSlice),
        (slice + 1) * numberPixelsPerSlice);
    // now loop through all pixels of the current slice
    row = 0;
    col = 0;
    p = 0; // just a counter
    for (row = 0; row < rowsCount; row++) {
      for (col = 0; col < colsCount; col++) {
        // map pixel values
        pixelValue = currentSlice[p];
        // save the pixelValue in the 3d image data
        // map slice/row/col to xyz
        // using orientation
        // todo direction too
        // ijk to ras
        var _slice = (slices + orient[2] * slice) % slices;
        var _row = (rowsCount + orient[1] * row) % rowsCount;
        var _col = (colsCount + orient[0] * col) % colsCount;
        if (_scan_direction_int == 0) {
          // sagittal
          // use vectors
          image[_slice][_col][_row] = 255 * (pixelValue / max);
          realImage[_slice][_col][_row] = pixelValue;
        } else if (_scan_direction_int == 1) {
          // coronal
          image[_col][_slice][_row] = 255 * (pixelValue / max);
          realImage[_col][_slice][_row] = pixelValue;
        } else {
          // axial
          // image[_row][_col][slice] = 255 * (pixelValue / max);
          // realImage[_row][_col][slice] = pixelValue;
          image[_col][_row][_slice] = 255 * (pixelValue / max);
          realImage[_col][_row][_slice] = pixelValue;
        }
        p++;
      }
    }
  }
  // create slices in all directions
  // xyz = 0 -> SAGITTAL
  // 1 -> CORONAL
  // 2 -> AXIAL
  var arr1 = [];
  var arr2 = [];
  var xyz = 0;
  for (xyz = 0; xyz < 3; xyz++) {
    var _xyz = (xyz + ((_scan_direction_int + 1) % 3)
        * (2 - (_scan_direction_int) % 2)) % 3;
    var _rows = (_xyz + 1) % 3;
    var _cols = (_xyz + 2) % 3;
    var textureArraySize = 4 * sizes[_cols] * sizes[_rows];
    var targetSlice = object._children[xyz]
    var i = 0;
    var imax = sizes[_xyz];
    var jmax = sizes[_rows];
    var kmax = sizes[_cols];
    console.log('**SLICING**');
    console.log('xyz: ' + xyz);
    console.log('_xyz: ' + _xyz);
    console.log('i: ' + imax);
    console.log('j: ' + jmax);
    console.log('k: ' + kmax);
    for (i = 0; i < imax; i++) {
      var textureForCurrentSlice = new Uint8Array(textureArraySize);
      var p = 0;
      var j = 0;
      for (j = 0; j < jmax; j++) {
        var k = 0;
        for (k = 0; k < kmax; k++) {
          var pixelValue = 0;
          // map i,j,k given orientation...
          var textureStartIndex = p * 4;
          if (xyz == 0) {
            // sagittal
            pixelValue = image[i][j][k];
          } else if (xyz == 1) {
            // coronal
            pixelValue = image[k][i][j];
          } else {
            // axial
            pixelValue = image[j][k][i];
          }
          var pixelValue_r = pixelValue;
          var pixelValue_g = pixelValue;
          var pixelValue_b = pixelValue;
          var pixelValue_a = 255;
          textureForCurrentSlice[textureStartIndex] = pixelValue_r;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
          textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
          p++;
        }
      }
      var pixelTexture = new X.texture();
      pixelTexture._rawData = textureForCurrentSlice;
      pixelTexture._rawDataWidth = kmax;
      pixelTexture._rawDataHeight = jmax;
      // use orientation for target too
      var _ind = i;
      // invert y axis for y-slice index
      if (xyz == 1) {
        _ind = imax - 1 - i;
      }
      var currentSlice = targetSlice._children[_ind];
      currentSlice._texture = pixelTexture;
    }
  }
  X.TIMERSTOP(this._classname + '.reslice');
  return realImage;
};
/**
 * Create Slice for a given volume in one direction
 * 
 * @param {!number}
 *          sizeX The volume size in X direction.
 * @param {!number}
 *          sizeY The volume size in Y direction.
 * @param {!number}
 *          sizeZ The volume size in Z direction.
 * @param {!Array}
 *          image The array containing the image.
 * @param {!number}
 *          max The object's max intensity.
 * @param {!X.object}
 *          targetSlice The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap The object containing the labelmap if any.
 * @param {!boolean}
 *          invert invert rows and columns when accessing pixel value
 * @protected
 */
X.parser.prototype.reslice1D_ = function(sizeX, sizeY, sizeZ, image, max,
    targetSlice, targetLabelMap, invert) {
  console.log(targetSlice);
  var textureArraySize = 4 * sizeX * sizeY;
  var col = 0;
  for (col = 0; col < sizeZ; col++) {
    var textureForCurrentSlice = new Uint8Array(textureArraySize);
    var z = 0;
    var p = 0;
    for (z = 0; z < sizeX; z++) {
      var row = 0;
      var imagez = image[z];
      for (row = 0; row < sizeY; row++) {
        var pixelValue;
        if (invert) {
          pixelValue = imagez[col][row];
        } else {
          pixelValue = imagez[row][col];
        }
        var pixelValue_r = pixelValue;
        var pixelValue_g = pixelValue;
        var pixelValue_b = pixelValue;
        var pixelValue_a = 255;
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        p++;
      }
    }
    var pixelTexture = new X.texture();
    pixelTexture._rawData = textureForCurrentSlice;
    pixelTexture._rawDataWidth = sizeY;
    pixelTexture._rawDataHeight = sizeX;
    var currentSlice = targetSlice._children[col];
    currentSlice._texture = pixelTexture;
    if (targetLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelmap = targetLabelMap._children[col]._texture;
    }
  }
};
/**
 * Create Slice for a given colortable in one direction
 * 
 * @param {!number}
 *          sizeX The volume size in X direction.
 * @param {!number}
 *          sizeY The volume size in Y direction.
 * @param {!number}
 *          sizeZ The volume size in Z direction.
 * @param {!Array}
 *          image The array containing the image.
 * @param {!number}
 *          max The object's max intensity.
 * @param {!X.colortable}
 *          colorTable The colortable.
 * @param {!X.object}
 *          targetSlice The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap The object containing the labelmap if any.
 * @param {!boolean}
 *          invert invert rows and columns when accessing pixel value
 * @protected
 */
X.parser.prototype.reslice1DColorTable_ = function(sizeX, sizeY, sizeZ, image,
    max, colorTable, targetSlice, targetLabelMap, invert) {
  var _colorTable = colorTable._map;
  var textureArraySize = 4 * sizeX * sizeY;
  var col = 0;
  for (col = 0; col < sizeZ; col++) {
    var textureForCurrentSlice = new Uint8Array(textureArraySize);
    var z = 0;
    var p = 0; // just a counter
    for (z = 0; z < sizeX; z++) {
      var imagez = image[z];
      var row = 0;
      for (row = 0; row < sizeY; row++) {
        var pixelValue;
        if (invert) {
          pixelValue = imagez[col][row];
        } else {
          pixelValue = imagez[row][col];
        }
        // color table!
        var lookupValue = _colorTable.get(Math.floor(pixelValue));
        // check for out of range and use the last label value in this case
        if (!lookupValue) {
          var all_colors = _colorTable.getValues();
          lookupValue = all_colors[all_colors.length - 1];
        }
        var pixelValue_r = 255 * lookupValue[1];
        var pixelValue_g = 255 * lookupValue[2];
        var pixelValue_b = 255 * lookupValue[3];
        var pixelValue_a = 255 * lookupValue[4];
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        p++;
      }
    }
    var pixelTexture = new X.texture();
    pixelTexture._rawData = textureForCurrentSlice;
    pixelTexture._rawDataWidth = sizeY;
    pixelTexture._rawDataHeight = sizeX;
    var currentSlice = targetSlice._children[col];
    currentSlice._texture = pixelTexture;
    if (targetLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelmap = targetLabelMap._children[col]._texture;
    }
  }
};
/**
 * Create Slices for a given volume in two direction
 * 
 * @param {!number}
 *          sizeX The volume size in X direction.
 * @param {!number}
 *          sizeY The volume size in Y direction.
 * @param {!number}
 *          sizeZ The volume size in Z direction.
 * @param {!Array}
 *          image The array containing the image.
 * @param {!number}
 *          max The object's max intensity.
 * @param {!X.object}
 *          targetSlice1 The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap1 The object containing the labelmap if any.
 * @param {!X.object}
 *          targetSlice2 The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap2 The object containing the labelmap if any.
 * @protected
 */
X.parser.prototype.reslice2D_ = function(sizeX, sizeY, sizeZ, image, max,
    targetSlice1, targetLabelMap1, targetSlice2, targetLabelMap2) {
  var textureArraySize = 4 * sizeX * sizeY;
  var col = 0;
  for (col = 0; col < sizeZ; col++) {
    var textureForCurrentSlice = new Uint8Array(textureArraySize);
    var textureForCurrentSlice2 = new Uint8Array(textureArraySize);
    var p = 0; // just a counter
    var z = 0;
    for (z = 0; z < sizeX; z++) {
      var imagez = image[z];
      var row = 0;
      for (row = 0; row < sizeY; row++) {
        // first direction
        var pixelValue = imagez[row][col];
        var pixelValue_r = pixelValue;
        var pixelValue_g = pixelValue;
        var pixelValue_b = pixelValue;
        var pixelValue_a = 255;
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        // second direction
        var pixelValue2 = imagez[col][row];
        var pixelValue_r2 = pixelValue2;
        var pixelValue_g2 = pixelValue2;
        var pixelValue_b2 = pixelValue2;
        var pixelValue_a2 = 255;
        textureStartIndex = p * 4;
        textureForCurrentSlice2[textureStartIndex] = pixelValue_r2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_g2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_b2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_a2;
        // increment counter
        p++;
      }
    }
    var pixelTexture = new X.texture();
    pixelTexture._rawData = textureForCurrentSlice;
    pixelTexture._rawDataWidth = sizeY;
    pixelTexture._rawDataHeight = sizeX;
    var t1 = targetSlice1._children[col];
    t1._texture = pixelTexture;
    if (targetLabelMap1) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      t1._labelmap = targetLabelMap1._children[col]._texture;
    }
    var pixelTexture2 = new X.texture();
    pixelTexture2._rawData = textureForCurrentSlice2;
    pixelTexture2._rawDataWidth = sizeY;
    pixelTexture2._rawDataHeight = sizeX;
    var t2 = targetSlice2._children[col];
    t2._texture = pixelTexture2;
    if (targetLabelMap2) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      t2._labelmap = targetLabelMap2._children[col]._texture;
    }
  }
};
/**
 * Create Slices for a colortable in two direction
 * 
 * @param {!number}
 *          sizeX The volume size in X direction.
 * @param {!number}
 *          sizeY The volume size in Y direction.
 * @param {!number}
 *          sizeZ The volume size in Z direction.
 * @param {!Array}
 *          image The array containing the image.
 * @param {!number}
 *          max The object's max intensity.
 * @param {!X.colortable}
 *          colorTable The colortable.
 * @param {!X.object}
 *          targetSlice1 The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap1 The object containing the labelmap if any.
 * @param {!X.object}
 *          targetSlice2 The object containing the slices to be computed.
 * @param {?X.volume}
 *          targetLabelMap2 The object containing the labelmap if any.
 * @protected
 */
X.parser.prototype.reslice2DColorTable_ = function(sizeX, sizeY, sizeZ, image,
    max, colorTable, targetSlice1, targetLabelMap1, targetSlice2,
    targetLabelMap2) {
  var _colorTable = colorTable._map;
  var textureArraySize = 4 * sizeX * sizeY;
  var col = 0;
  for (col = 0; col < sizeZ; col++) {
    var textureForCurrentSlice = new Uint8Array(textureArraySize);
    var textureForCurrentSlice2 = new Uint8Array(textureArraySize);
    var p = 0; // just a counter
    var z = 0;
    for (z = 0; z < sizeX; z++) {
      var imagez = image[z];
      var row = 0;
      for (row = 0; row < sizeY; row++) {
        // first direction
        var pixelValue = imagez[row][col];
        // color table!
        var lookupValue = _colorTable.get(Math.floor(pixelValue));
        // check for out of range and use the last label value in this case
        if (!lookupValue) {
          var all_colors = _colorTable.getValues();
          lookupValue = all_colors[all_colors.length - 1];
        }
        var pixelValue_r = 255 * lookupValue[1];
        var pixelValue_g = 255 * lookupValue[2];
        var pixelValue_b = 255 * lookupValue[3];
        var pixelValue_a = 255 * lookupValue[4];
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        // second direction
        var pixelValue2 = imagez[col][row];
        // color table!
        var lookupValue2 = _colorTable.get(Math.floor(pixelValue2));
        // check for out of range and use the last label value in this case
        if (!lookupValue2) {
          var all_colors = _colorTable.getValues();
          lookupValue2 = all_colors[all_colors.length - 1];
        }
        var pixelValue_r2 = 255 * lookupValue2[1];
        var pixelValue_g2 = 255 * lookupValue2[2];
        var pixelValue_b2 = 255 * lookupValue2[3];
        var pixelValue_a2 = 255 * lookupValue2[4];
        textureStartIndex = p * 4;
        textureForCurrentSlice2[textureStartIndex] = pixelValue_r2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_g2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_b2;
        textureForCurrentSlice2[++textureStartIndex] = pixelValue_a2;
        // increment counter
        p++;
      }
    }
    var pixelTexture = new X.texture();
    pixelTexture._rawData = textureForCurrentSlice;
    pixelTexture._rawDataWidth = sizeY;
    pixelTexture._rawDataHeight = sizeX;
    var t1 = targetSlice1._children[col];
    t1._texture = pixelTexture;
    if (targetLabelMap1) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      t1._labelmap = targetLabelMap1._children[col]._texture;
    }
    var pixelTexture2 = new X.texture();
    pixelTexture2._rawData = textureForCurrentSlice2;
    pixelTexture2._rawDataWidth = sizeY;
    pixelTexture2._rawDataHeight = sizeX;
    var t2 = targetSlice2._children[col];
    t2._texture = pixelTexture2;
    if (targetLabelMap2) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      t2._labelmap = targetLabelMap2._children[col]._texture;
    }
  }
};

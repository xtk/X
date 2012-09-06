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
  this._nativeLittleEndian = new Int8Array(new Int16Array([1]).buffer)[0] > 0;
  
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
 * @param {!X.base} container A container which holds the loaded data. This can
 *          be an X.object as well.
 * @param {!X.object} object The object to configure.
 * @param {!ArrayBuffer} data The data to parse.
 * @param {*} flag An additional flag.
 * @throws {Error} An exception if something goes wrong.
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
 * @param {!Array} data The data array to analyze.
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
  return [_min, _max];
};


/**
 * Jump to a position in the byte stream.
 * 
 * @param {!number} position The new offset.
 */
X.parser.prototype.jumpTo = function(position) {

  this._dataPointer = position;
};


/**
 * Scan binary data relative to the internal position in the byte stream.
 * 
 * @param {!string} type The data type to scan, f.e.
 *          'uchar','schar','ushort','sshort','uint','sint','float'
 * @param {!number=} chunks The number of chunks to scan. By default, 1.
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
 * @param {!Object} array Typed array to flip.
 * @param {!number} chunkSize The size of each element.
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
 * @param {!X.object} object The X.volume to fill.
 * @param {!Object} MRI The MRI object which contains the min, max, data and
 *          type.
 * @return {!Array} The volume data as a 3D Array.
 */
X.parser.prototype.reslice = function(object, MRI) {

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
  // allocate 3d image array [slices][rows][cols]
  // use image for fast looping
  var image = new Array(slices);
  // use real image to return real values
  var realImage = new Array(slices);
  // console.log(image);
  var pixelValue = 0;
  
  // reference the color table for easy access
  var _colorTable = null;
  if (object._colortable) {
    _colorTable = object._colortable._map;
  }
  
  // loop through all slices in scan direction
  //
  // this step creates the slices in X-direction and fills the 3d image array at
  // the same time
  // combining the two operations saves some time..
  var z = 0;
  var row = 0;
  var col = 0;
  var p = 0;
  var textureArraySize = 4 * numberPixelsPerSlice;
  for (z = 0; z < slices; z++) {
    image[z] = new Array(rowsCount);
    realImage[z] = new Array(rowsCount);
    // grab the pixels for the current slice z
    var currentSlice = datastream.subarray(z * (numberPixelsPerSlice), (z + 1) *
        numberPixelsPerSlice);
    // the texture has 3 times the pixel value + 1 opacity value for all pixels
    var textureForCurrentSlice = new Uint8Array(textureArraySize);
    // now loop through all pixels of the current slice
    row = 0;
    col = 0;
    p = 0; // just a counter
    for (row = 0; row < rowsCount; row++) {
      image[z][row] = new MRI.data.constructor(colsCount);
      realImage[z][row] = new MRI.data.constructor(colsCount);
      for (col = 0; col < colsCount; col++) {
        // map pixel values
        pixelValue = currentSlice[p];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;
        if (_colorTable) {
          // color table!
          var lookupValue = _colorTable.get(Math.floor(pixelValue));
          // check for out of range and use the last label value in this case
          if (!lookupValue) {
            var all_colors = _colorTable.getValues();
            lookupValue = all_colors[all_colors.length - 1];
          }
          pixelValue_r = 255 * lookupValue[1];
          pixelValue_g = 255 * lookupValue[2];
          pixelValue_b = 255 * lookupValue[3];
          pixelValue_a = 255 * lookupValue[4];
        } else {
          // no color table, 1-channel gray value
          pixelValue_r = pixelValue_g = pixelValue_b = 255 * (pixelValue / max);
          pixelValue_a = 255;
        }
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        // save the pixelValue in the 3d image data
        image[z][row][col] = 255 * (pixelValue / max);
        realImage[z][row][col] = pixelValue;
        
        p++;
      }
    }
    // create the texture for slices in X-direction
    var pixelTexture = new X.texture();
    pixelTexture._rawData = textureForCurrentSlice;
    pixelTexture._rawDataWidth = colsCount;
    pixelTexture._rawDataHeight = rowsCount;
    currentSlice = object._slicesZ._children[z];
    currentSlice._texture = pixelTexture;
    if (hasLabelMap) {
      // if this object has a labelmap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelmap = object._labelmap._slicesZ._children[z]._texture;
    }
  }
  
  // RESLICE 1D which is a special when the cols == rows to speed up the reslice
  if (colsCount != rowsCount) {
    
    if (hasLabelMap) {
      if (!object._colortable) {
        this.reslice1D_(slices, colsCount, rowsCount, image, max,
            object._slicesY, object._labelmap._slicesY, true);
        this.reslice1D_(slices, rowsCount, colsCount, image, max,
            object._slicesX, object._labelmap._slicesX, false);
      } else {
        this.reslice1DColorTable_(slices, colsCount, rowsCount, realImage, max,
            object._colortable, object._slicesY, object._labelmap._slicesY,
            true);
        this.reslice1DColorTable_(slices, rowsCount, colsCount, realImage, max,
            object._colortable, object._slicesX, object._labelmap._slicesX,
            false);
      }
    } else {
      if (!object._colortable) {
        this.reslice1D_(slices, colsCount, rowsCount, image, max,
            object._slicesY, null, true);
        this.reslice1D_(slices, rowsCount, colsCount, image, max,
            object._slicesX, null, false);
      } else {
        this.reslice1DColorTable_(slices, colsCount, rowsCount, realImage, max,
            object._colortable, object._slicesY, null, true);
        this.reslice1DColorTable_(slices, rowsCount, colsCount, realImage, max,
            object._colortable, object._slicesX, null, false);
      }
    }
    
  } else {
    
    // RESLICE 2D
    if (hasLabelMap) {
      if (!object._colortable) {
        this.reslice2D_(slices, colsCount, rowsCount, image, max,
            object._slicesX, object._labelmap._slicesX, object._slicesY,
            object._labelmap._slicesY);
      } else {
        this.reslice2DColorTable_(slices, colsCount, rowsCount, image, max,
            object._colortable, object._slicesX, object._labelmap._slicesX,
            object._slicesY, object._labelmap._slicesY);
      }
    } else {
      if (!object._colortable) {
        this.reslice2D_(slices, colsCount, rowsCount, image, max,
            object._slicesX, null, object._slicesY, null);
      } else {
        this.reslice2DColorTable_(slices, colsCount, rowsCount, realImage, max,
            object._colortable, object._slicesX, null, object._slicesY, null);
      }
    }
  }
  
  X.TIMERSTOP(this._classname + '.reslice');
  
  return realImage;
  
};


/**
 * Create Slice for a given volume in one direction
 * 
 * @param {!number} sizeX The volume size in X direction.
 * @param {!number} sizeY The volume size in Y direction.
 * @param {!number} sizeZ The volume size in Z direction.
 * @param {!Array} image The array containing the image.
 * @param {!number} max The object's max intensity.
 * @param {!X.object} targetSlice The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap The object containing the labelmap if any.
 * @param {!boolean} invert invert rows and columns when accessing pixel value
 * @protected
 */
X.parser.prototype.reslice1D_ = function(sizeX, sizeY, sizeZ, image, max,
    targetSlice, targetLabelMap, invert) {

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
 * @param {!number} sizeX The volume size in X direction.
 * @param {!number} sizeY The volume size in Y direction.
 * @param {!number} sizeZ The volume size in Z direction.
 * @param {!Array} image The array containing the image.
 * @param {!number} max The object's max intensity.
 * @param {!X.colortable} colorTable The colortable.
 * @param {!X.object} targetSlice The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap The object containing the labelmap if any.
 * @param {!boolean} invert invert rows and columns when accessing pixel value
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
 * @param {!number} sizeX The volume size in X direction.
 * @param {!number} sizeY The volume size in Y direction.
 * @param {!number} sizeZ The volume size in Z direction.
 * @param {!Array} image The array containing the image.
 * @param {!number} max The object's max intensity.
 * @param {!X.object} targetSlice1 The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap1 The object containing the labelmap if any.
 * @param {!X.object} targetSlice2 The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap2 The object containing the labelmap if any.
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
 * @param {!number} sizeX The volume size in X direction.
 * @param {!number} sizeY The volume size in Y direction.
 * @param {!number} sizeZ The volume size in Z direction.
 * @param {!Array} image The array containing the image.
 * @param {!number} max The object's max intensity.
 * @param {!X.colortable} colorTable The colortable.
 * @param {!X.object} targetSlice1 The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap1 The object containing the labelmap if any.
 * @param {!X.object} targetSlice2 The object containing the slices to be
 *          computed.
 * @param {?X.volume} targetLabelMap2 The object containing the labelmap if any.
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

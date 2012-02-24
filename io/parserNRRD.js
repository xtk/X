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
 * CREDITS
 * 
 *   - the .NRRD Fileparser is based on a version of Michael Lauer (https://github.com/mrlauer/webgl-sandbox)
 *     which did not support gzip/gz encoding or other types than int/short, so we added that :)
 *   
 */

// provides
goog.provide('X.parserNRRD');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for .NRRD files.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserNRRD = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'parserNRRD';
  
};
// inherit from X.parser
goog.inherits(X.parserNRRD, X.parser);


/**
 * @inheritDoc
 */
X.parserNRRD.prototype.parse = function(object, data) {

  
  // the position in the file
  var position = 0;
  
  // grab the header
  var headerRegexMatch = data.match(/^([\s\S]*?)\r?\n\r?\n/);
  position = headerRegexMatch[0].length; // the one _with_ the blank line
  var header = headerRegexMatch[1]; // the one without the blank line
  
  // parse the header
  this.parseHeader(header);
  
  // now we have all kinds of things attached to this reader..
  // this was done by M. Lauer
  // I don't really like it but it works..
  
  var _data = 0; // the data without header
  
  console.log(new Date());
  
  console.log(this);
  

  if (this.encoding == 'gzip' || this.encoding == 'gz') {
    // we need to decompress the datastream
    _data = new JXG.Util.Unzip(data.substr(position)).unzip()[0][0];
  } else {
    // we can use the data directly
    _data = data.substr(position);
  }
  
  console.log("after gzip: " + new Date());
  

  // we know enough to create the object
  object._dimensions = [this.sizes[2], this.sizes[1], this.sizes[0]];
  object.create_();
  
  var numberOfPixels = this.sizes[0] * this.sizes[1] * this.sizes[2];
  
  // var a = this.parseUInt16Array(_data, 0, numberOfPixels);
  // max = a[1];
  // min = a[2];
  // a = a[0];
  


  //
  //
  //
  var datastream = new Array(numberOfPixels);
  
  var max = -Infinity;
  var min = Infinity;
  
  var i;
  for (i = 0; i < numberOfPixels; i++) {
    var pixelValue = this.parseFunc(_data, 0 + (i * this.parseBytes));
    datastream[i] = pixelValue;
    max = Math.max(max, pixelValue);
    min = Math.min(min, pixelValue);
  }
  

  window.console.log('done parsing.. ', new Date());
  
  this.reslice(object, datastream, this.sizes, min, max);
  
  window.console.log('create slices done.. ', new Date());
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

X.parserNRRD.prototype.reslice = function(object, datastream, sizes, min, max) {

  // number of slices in scan direction
  var slices = sizes[2];
  var size0 = sizes[0];
  var size1 = sizes[1];
  
  // slice dimensions in scan direction
  var sliceDimensions = size0 * size1;
  // var tmp = new Array(size0 * slices);
  // var tmp2 = [];
  
  // allocate 3d image array
  var image = new Array(slices);
  for ( var iS = 0; iS < slices; iS++) {
    image[iS] = new Array(size0);
    for ( var iR = 0; iR < size0; iR++) {
      image[iS][iR] = new Uint8Array(size1);
    }
  }
  
  console.log(image);
  console.log(image.length * image[0].length * image[0][0].length);
  console.log(slices * size0 * size1);
  console.log(slices, size0, size1);
  
  // loop through all slices in scan direction
  var z = 0;
  for (z = 0; z < slices; z++) {
    
    // grab the pixels for the current slice z
    var currentSlice = datastream.slice(z * (sliceDimensions), (z + 1) *
        sliceDimensions);
    // the texture has 3 times the pixel value + 1 opacity value for all pixels
    var textureForCurrentSlice = new Uint8Array(4 * sliceDimensions);
    
    // loop through all pixels of the current slice
    var row = 0;
    var col = 0;
    // var i = 1;
    // var j = 1;
    var p = 0;
    
    for (r = 0; r < size0; r++) {
      
      for (c = 0; c < size1; c++) {
        
        p = c + r * size1;
        
        var pixelValue = currentSlice[p];
        pixelValue = 255 * (pixelValue / max);
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = 255; // fully opaque
        
        image[z][r][c] = pixelValue;
        
      }
      
    }
    
    // for (p = 0; p < sliceDimensions; p++) {
    
    // var pixelValue = currentSlice[p];
    // pixelValue = 255 * (pixelValue / max);
    // var textureStartIndex = p * 4;
    // textureForCurrentSlice[textureStartIndex] = pixelValue;
    // textureForCurrentSlice[++textureStartIndex] = pixelValue;
    // textureForCurrentSlice[++textureStartIndex] = pixelValue;
    // textureForCurrentSlice[++textureStartIndex] = 255; // fully opaque
    // //
    // if (col >= size0) {
    // // one row completed
    // row++;
    // col = 0;
    // } else {
    // col++;
    // }
    
    // console.log('setting ', z, row, col);
    // console.log(p);
    // image[z][row][col] = pixelValue;
    


    // if (row == 5) {
    //        
    // tmp.push(pixelValue);
    // tmp.push(pixelValue);
    // tmp.push(pixelValue);
    // tmp.push(255);
    //        
    // }
    //      
    // if (col == 5) {
    // console.log('55:' + pixelValue);
    // tmp2.push(pixelValue);
    // tmp2.push(pixelValue);
    // tmp2.push(pixelValue);
    // tmp2.push(255);
    //        
    // }
    //      
    //
    // if ((p >= size0 * 81) && (p <= size0 * 82)) {
    // tmp.push(pixelValue);
    // tmp.push(pixelValue);
    // tmp.push(pixelValue);
    // tmp.push(255);
    // }
    //      
    // if (p % 144) {
    // tmp2.push(pixelValue);
    // tmp2.push(pixelValue);
    // tmp2.push(pixelValue);
    // tmp2.push(255);
    //        
    // }
    
    // }
    
    // console.log('slice: ' + z + ' row: ' + row + ' col: ' + col);
    
    // create the texture
    var pixelTexture = new X.texture();
    pixelTexture.setRawData(textureForCurrentSlice);
    pixelTexture.setRawDataWidth(size0);
    pixelTexture.setRawDataHeight(size1);
    object._slicesX.children()[z].setTexture(pixelTexture);
    
  }
  

  // for Y
  // all slices are along the rows of the image
  // all rows are along the slices of the image
  // all cols are along the cols of the image
  

  for (z = 0; z < size0; z++) {
    
    var textureForCurrentSlice = new Uint8Array(4 * sliceDimensions);
    
    for (r = 0; r < slices; r++) {
      
      for (c = 0; c < size1; c++) {
        
        p = c + r * slices;
        
        pixelValue = image[r][z][c];
        
        // console.log(pixelValue);
        
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = pixelValue;
        textureForCurrentSlice[++textureStartIndex] = 255; // fully opaque
        
      }
      


    }
    
    // create the texture
    var pixelTexture = new X.texture();
    pixelTexture.setRawData(textureForCurrentSlice);
    pixelTexture.setRawDataWidth(size0);
    pixelTexture.setRawDataHeight(size1);
    object._slicesY.children()[r].setTexture(pixelTexture);
    

  }
  


  // //
  // console.log(tmp.length);
  // console.log(tmp2.length);
  // //
  // // create the texture
  // var pixelTexture2 = new X.texture();
  // pixelTexture2.setRawData(new Uint8Array(tmp));
  // pixelTexture2.setRawDataWidth(size0);
  // pixelTexture2.setRawDataHeight(slices);
  // object._slicesZ.children()[5].setTexture(pixelTexture2);
  //  
  // // create the texture
  // var pixelTexture3 = new X.texture();
  // pixelTexture3.setRawData(new Uint8Array(tmp2));
  // pixelTexture3.setRawDataWidth(size0);
  // pixelTexture3.setRawDataHeight(slices);
  // object._slicesY.children()[5].setTexture(pixelTexture3);
  

};

X.parserNRRD.prototype.parseHeader = function(header) {

  var data, field, fn, i, l, lines, m, _i, _len, _results;
  lines = header.split(/\r?\n/);
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    l = lines[_i];
    if (l.match(/NRRD\d+/)) {
      this.isNrrd = true;
    } else if (l.match(/^#/)) {
    } else if (m = l.match(/(.*):(.*)/)) {
      field = m[1].trim();
      data = m[2].trim();
      fn = this.fieldFunctions[field];
      if (fn) {
        fn.call(this, data);
      } else {
        this[field] = data;
      }
    }
  }
  if (!this.isNrrd) {
    throw new Error('Not an NRRD file');
  }
  if (this.encoding !== 'raw' && this.encoding !== 'gzip' &&
      this.encoding !== 'gz') {
    throw new Error('Only raw or gz/gzip encoding is allowed');
  }
  if (!(this.vectors != null)) {
    this.vectors = [new goog.math.Vec3(1, 0, 0), new goog.math.Vec3(0, 1, 0),
                    new goog.math.Vec3(0, 0, 1)];
    if (this.spacings) {
      _results = [];
      for (i = 0; i <= 2; i++) {
        _results.push(!isNaN(this.spacings[i]) ? this.vectors[i]
            .scale(this.spacings[i]) : void 0);
      }
      return _results;
    }
  }
};

X.parserNRRD.prototype.fieldFunctions = {
  'type': function(data) {

    switch (data) {
    case 'unsigned char':
    case 'uint8':
      this.parseFunc = this.parseUChar8;
      this.parseBytes = 1;
      break;
    case 'signed char':
    case 'int8':
      this.parseFunc = this.parseSChar8;
      this.parseBytes = 1;
      break;
    case 'short':
    case 'signed short':
    case 'unsigned short':
    case 'short int':
    case 'int16':
      this.parseFunc = this.parseUInt16;
      this.parseBytes = 2;
      break;
    case 'int':
    case 'int32':
      break;
    case 'float':
      this.parseFunc = this.parseFloat32;
      this.parseBytes = 4;
      break;
    default:
      throw new Error('Only short/int/int8 data is allowed and not: ' + data);
    }
    return this.type = data;
  },
  'endian': function(data) {

    return this.endian = data;
  },
  'encoding': function(data) {

    return this.encoding = data;
  },
  'dimension': function(data) {

    return this.dim = parseInt(data, 10);
  },
  'sizes': function(data) {

    var i;
    return this.sizes = (function() {

      var _i, _len, _ref, _results;
      _ref = data.split(/\s+/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(parseInt(i, 10));
      }
      return _results;
    })();
  },
  'space directions': function(data) {

    var f, parts, v;
    parts = data.match(/\(.*?\)/g);
    return this.vectors = (function() {

      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        v = parts[_i];
        _results.push((function() {

          var _j, _len2, _ref, _results2;
          _ref = v.slice(1, -1).split(/,/);
          _results2 = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            f = _ref[_j];
            _results2.push(parseFloat(f));
          }
          return _results2;
        })());
      }
      return _results;
    })();
  },
  'spacings': function(data) {

    var f, parts;
    parts = data.split(/\s+/);
    return this.spacings = (function() {

      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        f = parts[_i];
        _results.push(parseFloat(f));
      }
      return _results;
    })();
  }
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNRRD', X.parserNRRD);
goog.exportSymbol('X.parserNRRD.prototype.parse', X.parserNRRD.prototype.parse);

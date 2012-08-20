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
 *
 */

// provides
goog.provide('X.parserDCM');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.parserHelper');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for .nii/.nii.gz files.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserDCM = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserDCM';
  
};
// inherit from X.parser
goog.inherits(X.parserDCM, X.parser);


/**
 * @inheritDoc
 */
X.parserDCM.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var _data = data;
  

  // parse the byte stream
  var MRI = this.parseStream(_data);
  
  // grab the dimensions
  var _dimensions = [MRI.dim[0], MRI.dim[1], MRI.dim[2]];
  object._dimensions = _dimensions;
  
  // grab the spacing
  var _spacing = [MRI.pixdim[0], MRI.pixdim[1], MRI.pixdim[2]];
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
  
  // create the object
  object.create_();
  
  X.TIMERSTOP(this._classname + '.parse');
  
  // re-slice the data according each direction
  object._image = this.reslice(object, MRI);
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Parse the data stream according to the .nii/.nii.gz file format and return an
 * MRI structure which holds all parsed information.
 * 
 * @param {!ArrayBuffer} data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserDCM.prototype.parseStream = function(data) {

  // attach the given data
  this._data = data;
  
  //
  // the header fields + 1 field for data
  var MRI = {
    rows: 0,
    cols: 0,
    pixdim: null,
    bits_allocated: 0,
    bits_stored: 0,
    number_of_images: 1,
    slice_location: 0,
    data: null,
    min: Infinity,
    max: -Infinity
  };
  
  // skip the preamble
  // this.jumpTo(132);
  
  var _bytes = this.scan('ushort', this._data.byteLength);
  var _bytePointer = 66;
  
  var _tagGroup = null;
  var _tagSpecific = null;
  var _VR = null;
  var _VL = null;
  
  var _tagCount = 7;
  
  var _data_byte_size = 0;
  while (_tagCount > 1) {
    
    // read short
    _tagGroup = _bytes[_bytePointer++];// this.scan('ushort');
    
    if (_tagGroup == 0x0028) {
      
      // Group of GENERAL IMAGE SPECS
      _tagSpecific = _bytes[_bytePointer++];
      
      _VR = _bytes[_bytePointer++];
      _VL = _bytes[_bytePointer++];
      
      switch (_tagSpecific) {
      
      case 0x0010:
        // rows
        MRI.rows = _bytes[_bytePointer++];
        _tagCount--;
        break;
      case 0x0011:
        // cols
        MRI.cols = _bytes[_bytePointer++];
        _tagCount--;
        break;
      case 0x0100:
        // bits allocated
        MRI.bits_allocated = _bytes[_bytePointer++];
        _tagCount--;
        break;
      case 0x0101:
        // bits stored
        MRI.bits_stored = _bytes[_bytePointer++];
        _tagCount--;
        break;
      case 0x0002:
        // number of images
        MRI.number_of_images = _bytes[_bytePointer++];
        _tagCount--;
        break;
      case 0x0030:
        // pixel spacing
        

        var _short = _bytes[_bytePointer++];
        
        // var _char0 = _short & 0x00FF;
        // var _char1 = (_short & 0xFF00) >> 8;
        
        MRI.pixdim = [1, 1, 1];
        
        _tagCount--;
        break;
      //        
      // // in x direction
      // var _px_spacingX = 0;
      // var _px_char = this.scan('uchar', _VL / 2 - 1);
      // if (_px_char instanceof Uint8Array) {
      // _px_spacingX = parseFloat(String.fromCharCode.apply(null, _px_char));
      // } else {
      // _px_spacingX = parseFloat(String.fromCharCode(_px_char));
      // }
      //        
      // // scan delimiter
      // this.scan('uchar');
      //        
      // // in y direction
      // var _px_spacingY = 0;
      // _px_char = this.scan('uchar', _VL / 2);
      // if (_px_char instanceof Uint8Array) {
      // _px_spacingY = parseFloat(String.fromCharCode.apply(null, _px_char));
      // } else {
      // _px_spacingY = parseFloat(String.fromCharCode(_px_char));
      // }
      //        
      // MRI.pixdim = [_px_spacingX, _px_spacingY, 1];
      //        
      // _tagCount--;
      //        
      // break;
      
      case 0x1052: // rescale intercept
      case 0x1053: // rescale slope
      case 0x1050: // WindowCenter
      case 0x1051: // WindowWidth
      case 0x0004: // "Photometric Interpretation"
      case 0x0102: // "High Bit"
      case 0x0103: // "Pixel Representation"
      case 0x1054: // "Rescale Type"
      case 0x2110: // "Lossy Image Compression"
      
      }
      

    }
    
  }
  
  var _vol_size = MRI.rows * MRI.cols;
  
  this.jumpTo(this._data.byteLength - _vol_size * 2);
  
  // type check
  MRI.data = this.scan('ushort', _vol_size);
  
  MRI.dim = [MRI.cols, MRI.rows, 1];
  
  console.log(MRI);
  
  // get the min and max intensities
  var min_max = this.arrayMinMax(MRI.data);
  MRI.min = min_max[0];
  MRI.max = min_max[1];
  
  return MRI;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserDCM', X.parserDCM);
goog.exportSymbol('X.parserDCM.prototype.parse', X.parserDCM.prototype.parse);

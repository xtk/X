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
 * CREDITS: Thank you to Thomas J. Re for his initial implementation.
 *
 */

// provides
goog.provide('X.parserDCM');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for DICOM files.
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

  // X.TIMER(this._classname + '.parse');
  
  var _data = data;
  
  // parse the byte stream
  var MRI = this.parseStream(_data, object);
  
  // X.TIMERSTOP(this._classname + '.parse');
  
  // check if all slices were completed loaded
  if (MRI.loaded_files == MRI.number_of_slices) {
    
    // we got everything loaded
    
    // we now sort the existing data according to their acquisition index
    //
    // this is required if not all slices of a series are available
    var _sorting_table_len = MRI.sorting_table.length;
    var _i;
    var _j = 0;
    for (_i = 0; _i < _sorting_table_len; _i++) {
      
      var unsorted_index = MRI.sorting_table[_i];
      
      if (unsorted_index !== undefined) {
        
        var unsorted_start = unsorted_index * MRI.vol_size;
        var unsorted_end = unsorted_start + MRI.vol_size;
        
        var __data = MRI.data_unsorted.subarray(unsorted_start, unsorted_end);
        
        MRI.data.set(__data, _j * MRI.vol_size);
        _j++;
      }
      
    }
    

    // grab the dimensions
    var _dimensions = [MRI.dim[0], MRI.dim[1], MRI.dim[2]];
    object._dimensions = _dimensions;
    
    // grab the spacing
    var _spacing = [MRI.pixdim[0], MRI.pixdim[1], MRI.pixdim[2]];
    object._spacing = _spacing;
    
    // get the min and max intensities
    var min_max = this.arrayMinMax(MRI.data);
    var min = min_max[0];
    var max = min_max[1];
    
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
    
    // X.TIMER('create');
    // create the object
    object.create_();
    // X.TIMERSTOP('create');
    
    // re-slice the data according each direction
    object._image = this.reslice(object, MRI);
    
  }
  
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
 * @param {!X.object} object The parent object.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserDCM.prototype.parseStream = function(data, object) {

  // attach the given data
  this._data = data;
  
  if (!goog.isDefAndNotNull(object.MRI)) {
    
    // this is the _first slice_
    
    //
    // the header fields + 1 field for data
    var MRI = {
      rows: 0,
      cols: 0,
      pixdim: null,
      bits_allocated: 0,
      bits_stored: 0,
      number_of_slices: 1,
      number_of_images: 1,
      instance_number_start: 0,
      instance_number_length: 0,
      loaded_files: 0,
      vol_size: 0,
      data_unsorted: null,
      position_unsorted: 0,
      sorting_table: [],
      data: null,
      min: Infinity,
      max: -Infinity
    };
    
    // check how many slices we have
    MRI.number_of_slices = object._file.length;
    if (!goog.isDefAndNotNull(MRI.number_of_slices)) {
      
      MRI.number_of_slices = 1;
      
    }
    
    // scan the whole file as short (2 bytes)
    var _bytes = this.scan('ushort', this._data.byteLength);
    
    var _bytePointer = 66; // skip the 132 byte preamble
    
    var _tagGroup = null;
    var _tagSpecific = null;
    var _VR = null;
    var _VL = null;
    
    // the instance number a.k.a slice index
    var _position = '';
    
    // we only need 7 tags of the DICOM header
    var _tagCount = 7;
    
    while (_tagCount > 0) {
      
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
          
          var _pixel_spacing = '';
          
          // pixel spacing is a delimited string (ASCII)
          var i = 0;
          for (i = 0; i < _VL / 2; i++) {
            
            var _short = _bytes[_bytePointer++];
            
            var _b0 = _short & 0x00FF;
            var _b1 = (_short & 0xFF00) >> 8;
            
            _pixel_spacing += String.fromCharCode(_b0);
            _pixel_spacing += String.fromCharCode(_b1);
            
          }
          
          _pixel_spacing = _pixel_spacing.split("\\");
          
          MRI.pixdim = [+_pixel_spacing[0], +_pixel_spacing[1], 1];
          
          _tagCount--;
          break;
        
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
        
      } else if (_tagGroup == 0x0020) {
        
        // Group of SLICE INFO
        _tagSpecific = _bytes[_bytePointer++];
        
        // here we are only interested in the InstanceNumber
        if (_tagSpecific == 0x0013) {
          
          _VR = _bytes[_bytePointer++];
          _VL = _bytes[_bytePointer++];
          
          MRI.instance_number_start = _bytePointer;
          MRI.instance_number_length = _VL;
          
          for (i = 0; i < _VL / 2; i++) {
            
            var _short = _bytes[_bytePointer++];
            
            var _b0 = _short & 0x00FF;
            var _b1 = (_short & 0xFF00) >> 8;
            
            _position += String.fromCharCode(_b0);
            _position += String.fromCharCode(_b1);
            _position = parseInt(_position, 10);
            
          }
          
          _tagCount--;
          
        }
        
      }
      
    }
    
    object.MRI = MRI;
    
    // initially set the dimensions
    MRI.dim = [MRI.cols, MRI.rows, 1];
    MRI.vol_size = MRI.rows * MRI.cols;
    
    // allocate the data array depending on the type
    switch (MRI.bits_allocated) {
    
    case 8:
      MRI.data_unsorted = new Uint8Array(MRI.cols * MRI.rows *
          MRI.number_of_slices);
      MRI.data = new Uint8Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    case 16:
      MRI.data_unsorted = new Uint16Array(MRI.cols * MRI.rows *
          MRI.number_of_slices);
      MRI.data = new Uint16Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    case 32:
      MRI.data_unsorted = new Uint32Array(MRI.cols * MRI.rows *
          MRI.number_of_slices);
      MRI.data = new Uint32Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    
    }
    
  } else {
    
    var MRI = object.MRI;
    
    var _bytePointer = MRI.instance_number_start;
    var _VL = MRI.instance_number_length;
    
    // scan a part of the header
    this.jumpTo(_bytePointer * 2);
    
    var _partial_header = this.scan('uchar', _VL);
    
    var _ascii_position = String.fromCharCode.apply(null, _partial_header);
    _position = parseInt(_ascii_position, 10);
    
    // increase the Z dimensions since we have a new slice
    MRI.dim[2]++;
    
  } // end of check for first slice
  

  // jump to the beginning of the pixel data
  this.jumpTo(this._data.byteLength - MRI.vol_size * 2);
  
  // check for data type and parse accordingly
  var _data = null;
  switch (MRI.bits_allocated) {
  
  case 8:
    _data = this.scan('uchar', MRI.vol_size);
    break;
  case 16:
    _data = this.scan('ushort', MRI.vol_size);
    break;
  case 32:
    _data = this.scan('uint', MRI.vol_size);
    break;
  
  }
  
  MRI.sorting_table[_position] = MRI.position_unsorted;
  MRI.data_unsorted.set(_data, MRI.position_unsorted * MRI.vol_size);
  MRI.position_unsorted++;
  
  // increase the number of loaded files
  ++MRI.loaded_files;
  
  return MRI;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserDCM', X.parserDCM);
goog.exportSymbol('X.parserDCM.prototype.parse', X.parserDCM.prototype.parse);

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

  // parse the byte stream
  this.parseStream(data, object);

  // return;
  // X.TIMERSTOP(this._classname + '.parse');
  // check if all slices were completed loaded
  if (object.slices.length == object._file.length) {

    window.console.log("ALL FILES HAVE BEEN PARSED");
    // needed, for renderer2d and 3d...
    object.MRI = {};
    object.MRI.loaded_files = object._file.length;

    // sort slices per series
    var series = {};
    for (var i = 0; i < object.slices.length; i++) {

      if(!series.hasOwnProperty(object.slices[i].series_instance_uid)){
        // series undefined yet
        series[object.slices[i].series_instance_uid] = new Array();

      }

      series[object.slices[i].series_instance_uid].push(object.slices[i]);

    }

    window.console.log(series);

    // order slices
    for(var seriesInstanceUID in series) {
      series[seriesInstanceUID].sort(function(a,b){return a["instance_number"]-b["instance_number"]});
    }

    // starts at 1
    var first_image = series[seriesInstanceUID];
    var first_image_stacks = first_image.length;
    window.console.log("First image stacks: " + first_image_stacks);
    var first_image_height = first_image[ first_image_stacks - 1].instance_number - first_image[0].instance_number;
    window.console.log("First image height: " + first_image_height);
    var first_slice_size = first_image[0].columns * first_image[0].rows;
    window.console.log("First slice size: " + first_slice_size);
    var first_image_size = first_slice_size * (first_image_height + 1);
    window.console.log("First image size: " + first_image_size);
    var first_image_data = null;

    // create data container
    switch (first_image[0].bits_allocated) {
      case 8:
        first_image_data = new Uint8Array(first_image_size);
        break;
      case 16:
        first_image_data = new Uint16Array(first_image_size);
        break;
      case 32:
        first_image_data = new Uint32Array(first_image_size);
      default:
        window.console.log("Unknown number of bits allocated - using default: 32 bits");
        break;
    }

    window.console.log("SLICES CONTAINER");
    window.console.log(first_image_data.length);

    // fill data container
    // respect slice instance_number:
    // 
    // only 3 slices provided
    //
    // 1234123 -> instance_number == 1
    // 1234211 -> instance_number == 2
    // 0000000
    // 1232414 -> instance_number == 4

    for (var _i = 0; _i < first_image_stacks; _i++) {
      window.console.log("SLICE");
      window.console.log(first_image[_i].data.length);

      // get data
      var _data = first_image[_i].data;
      // starts at 0
      var _instance = first_image[_i].instance_number - first_image[0].instance_number;
            window.console.log(_instance * first_slice_size);
      //, _instance * first_slice_size
      first_image_data.set(_data, _instance * first_slice_size);
    }

    // format data for visualization!
    var first_image_dimensions = [first_image[0].rows, first_image[0].columns, first_image_height + 1];

    object._dimensions = first_image_dimensions;

    var MRI = {};
    MRI.dimensions = first_image_dimensions;

    // grab the spacing
    if(isNaN(first_image[0].pixel_spacing[0])){
      first_image[0].pixel_spacing[0] = 1.;
    }

    if(isNaN(first_image[0].pixel_spacing[1])){
      first_image[0].pixel_spacing[1] = 1.;
    }

    if (first_image[0].pixel_spacing[2] == Infinity) {

      if( first_image_stacks > 1) {

        // get position of first
        var _first_position = first_image[ 0 ].image_position_patient;
        var _last_image_position = first_image[ first_image_stacks - 1].image_position_patient;
        var _x = _last_image_position[0] - _first_position[0];
        var _y = _last_image_position[1] - _first_position[1];
        var _z = _last_image_position[2] - _first_position[2];
        var _distance_position = Math.sqrt(_x*_x + _y*_y  + _z*_z);
        first_image[0].pixel_spacing[2] = _distance_position/first_image_height;

      }
      else {

        first_image[0].pixel_spacing[2] = 1.0;

      }
    }

    var _spacing = first_image[0].pixel_spacing;

    object._spacing = _spacing;

    // get the min and max intensities
    window.console.log("first image data...");
    window.console.log(first_image_data);
    var min_max = this.arrayMinMax(first_image_data);
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

    // get origin == highest slice position?
    // or depends on Z orientation?

    // 0, 0, 0 or first slice
    // for CT, this one is not defined
    var _origin = [0, 0, 0]
    if(first_image[ 0 ].hasOwnProperty("image_position_patient")){
      _origin = first_image[ 0 ].image_position_patient;
    }
    

    // Create IJKtoXYZ matrix
    var _x_cosine = new goog.math.Vec3(first_image[0].image_orientation_patient[0],
          first_image[ 0 ].image_orientation_patient[1], first_image[ 0 ].image_orientation_patient[2]);
    var _y_cosine = new goog.math.Vec3(first_image[ 0 ].image_orientation_patient[3],
        first_image[ 0 ].image_orientation_patient[4], first_image[ 0 ].image_orientation_patient[5]);
    var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

    // if(object._spacing[2] >0) {

    //   _z_cosine.invert();
      
    // }

    var IJKToRAS = goog.vec.Mat4.createFloat32();
    // NOTE THE '-' for the LPS to RAS conversion
    goog.vec.Mat4.setRowValues(IJKToRAS,
      0,
      -first_image[ 0 ].image_orientation_patient[0]*first_image[0].pixel_spacing[0],
      -first_image[ 0 ].image_orientation_patient[3]*first_image[0].pixel_spacing[1],
      -_z_cosine.x*first_image[0].pixel_spacing[2],
      -_origin[0]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      1,
      -first_image[ 0 ].image_orientation_patient[1]*first_image[0].pixel_spacing[0],
      -first_image[ 0 ].image_orientation_patient[4]*first_image[0].pixel_spacing[1],
      -_z_cosine.y*first_image[0].pixel_spacing[2],
      -_origin[1]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      2,
      first_image[ 0 ].image_orientation_patient[2]*first_image[0].pixel_spacing[0],
      first_image[ 0 ].image_orientation_patient[5]*first_image[0].pixel_spacing[1],
      _z_cosine.z*first_image[0].pixel_spacing[2],
      _origin[2]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);

    MRI.data = first_image_data;
    object._data = first_image_data;
    MRI.IJKToRAS = IJKToRAS;
    MRI.RASToIJK = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.invert(MRI.IJKToRAS, MRI.RASToIJK);
  
    // get bounding box
    // Transform ijk (0, 0, 0) to RAS
    var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
    var res = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar, res);
    // Transform ijk (spacingX, spacinY, spacingZ) to RAS
    var tar2 = goog.vec.Vec4.createFloat32FromValues(_spacing[0], _spacing[1], _spacing[2], 1);
    var res2 = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);
  
    // get location of 8 corners and update BBox
    //
    var _shifDimensions = [0, object._dimensions[0], object._dimensions[1], object._dimensions[2]];
    
    var _rasBB = X.parser.computeRASBBox(IJKToRAS, _shifDimensions);

    // grab the RAS Dimensions
    MRI.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
  
    // grab the RAS Dimensions
    MRI.RASDimensions = [_rasBB[1] - _rasBB[0], _rasBB[3] - _rasBB[2], _rasBB[5] - _rasBB[4]];
  
    // grab the RAS Origin
    MRI.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];

    // create the object
    object.create_(MRI);

    // re-slice the data according each direction
    object._image = this.reslice(object);

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
 * @param {!ArrayBuffer}
 *          data The data stream.
 * @param {!X.object}
 *          object The parent object.
 * @return {Object} The MRI structure which holds all parsed information.
 */

 X.parserDCM.prototype.handleDefaults = function(_bytes, _bytePointer, _VR, _VL) {
    switch (_VR){
      case 16975:
        // UL
      case 20819:
        // SQ
      case 20053:
        // UN
      case 22351:
        // OW

      // bytes to bits
      function byte2bits(a)
        {
          var tmp = "";
          for(var i = 128; i >= 1; i /= 2)
              tmp += a&i?'1':'0';
          return tmp;
        }

      _VL = _bytes[_bytePointer++];
      var _VLT = _bytes[_bytePointer++];

      var _b0 = _VL & 0x00FF;
      var _b1 = (_VL & 0xFF00) >> 8;

      var _b2 = _VLT & 0x00FF;
      var _b3 = (_VLT & 0xFF00) >> 8;

      var _VLb0 = byte2bits(_b0);
      var _VLb1 = byte2bits(_b1);
      var _VLb = _VLb1 + _VLb0;

      var _VLTb0 = byte2bits(_b2);
      var _VLTb1 = byte2bits(_b3);
      var _VLTb = _VLTb1 + _VLTb0;

      var _VL2 =  _VLTb + _VLb ;
      _VL = parseInt(_VL2, 2);

      // flag undefined sequence length
      if(_VL == 4294967295){
        _VL = 0;
      }

      _bytePointer+=_VL/2;
      break;

    default:
      _bytePointer+=_VL/2;
        break;
    }

  return _bytePointer;
}


X.parserDCM.prototype.parseStream = function(data, object) {

  // attach the given data
  this._data = data;

  if( typeof(object.slices) == "undefined" || object.slices == null ){
    object.slices = new Array();
  }

  // set slice default minimum required parameters
  var slice = {};

  // scan the whole file as short (2 bytes)
  var _bytes = this.scan('ushort', this._data.byteLength);
  var _bytePointer = 66; // skip the 132 byte preamble
  var _tagGroup = null;
  var _tagSpecific = null;
  var _VR = null;
  var _VL = null;

  while (_bytePointer <  _bytes.length) {

    _tagGroup = _bytes[_bytePointer++];
    _tagElement = _bytes[_bytePointer++];

    _VR = _bytes[_bytePointer++];
    _VL = _bytes[_bytePointer++];

    switch (_tagGroup) {
      case 0x0028:
      // Group of IMAGE INFO
        switch (_tagElement) {
          case 0x0010:
            // rows
            slice.rows = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0011:
            // cols
            slice.columns = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0100:
            // bits allocated
            slice.bits_allocated = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0101:
            // bits stored
            slice.bits_stored = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0002:
            // number of images
            slice.number_of_images = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
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
            slice.pixel_spacing = [ parseFloat(_pixel_spacing[0]), parseFloat(_pixel_spacing[1]), Infinity ];
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

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;
      
      case 0x0020:
        // Group of SLICE INFO
        switch (_tagElement) {
          case 0x000e:
            // Series instance UID
            slice.series_instance_uid = "";
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              slice.series_instance_uid += String.fromCharCode(_b0);
              slice.series_instance_uid += String.fromCharCode(_b1);
            }
            break;
          case 0x0013:
            var _position = '';
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _position = String.fromCharCode(_b0);
              _position += String.fromCharCode(_b1);
            }
            slice.instance_number = parseInt(_position, 10); 
            break;
          case 0x0032:
            // image position
            var _image_position = '';
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _image_position += String.fromCharCode(_b0);
              _image_position += String.fromCharCode(_b1);
            }
            _image_position = _image_position.split("\\");
            slice.image_position_patient = [ parseFloat(_image_position[0]), parseFloat(_image_position[1]),
                parseFloat(_image_position[2]) ];
            // _tagCount--;
            break;
          case 0x0037:
            // image orientation
            // pixel spacing
            var _image_orientation = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _image_orientation += String.fromCharCode(_b0);
              _image_orientation += String.fromCharCode(_b1);
            }
            _image_orientation = _image_orientation.split("\\");
            slice.image_orientation_patient = [ parseFloat(_image_orientation[0]),
                parseFloat(_image_orientation[1]), parseFloat(_image_orientation[2]),
                parseFloat(_image_orientation[3]), parseFloat(_image_orientation[4]),
                parseFloat(_image_orientation[5]) ];
            // _tagCount--;
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;

    case 0xfffe:
        // Group of undefined item
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0xe000:
          // start item
          case 0xe00d:
          // end item
          case 0xe0dd:
          // end sequence
          default:
            _VL = 0;
            _bytePointer+=_VL/2;
            break;
          }

        break;

    case 0x0008:
        // Group of SLICE INFO
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0x0018:
            // Image instance UID
            slice.sop_instance_uid = "";
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              slice.sop_instance_uid += String.fromCharCode(_b0);
              slice.sop_instance_uid += String.fromCharCode(_b1);
            }
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;


    case 0x0010:
        // Group of SLICE INFO
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0x2210:
            // anatomical orientation
            // pixel spacing
            var _anatomical_orientation = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _anatomical_orientation += String.fromCharCode(_b0);
              _anatomical_orientation += String.fromCharCode(_b1);
            }
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;
            // case 0x7fe0:
    //     // Group of SLICE INFO
    //     // here we are only interested in the InstanceNumber
    //     switch (_tagElement) {
    //       case 0x0010:
    //         var _data = null;
    //         switch (slice.bits_allocated) {
    //           case 8:
    //             slice.data = new Uint8Array(slice.columns * slice.rows);
    //             slice.data = this.scan('uchar', slice.columns * slice.rows);
    //             break;
    //           case 16:
    //             slice.data = new Uint16Array(slice.columns * slice.rows);
    //             slice.data = this.scan('ushort', slice.columns * slice.rows);
    //             break;
    //           case 32:
    //             slice.data = new Uint32Array(slice.columns * slice.rows);
    //             slice.data = this.scan('uint', slice.columns * slice.rows);
    //             break;
    //         }

    //         break;

    //       default:
    //         _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
    //         break;
    //       }

      default:
        _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
        break;
      }

    }



    switch (slice.bits_allocated) {
      case 8:
        slice.data = new Uint8Array(slice.columns * slice.rows);
        break;
      case 16:
        slice.data = new Uint16Array(slice.columns * slice.rows);
        break;
      case 32:
        slice.data = new Uint32Array(slice.columns * slice.rows);
        break;
    }

  // no need to jump anu
  // jump to the beginning of the pixel data
  this.jumpTo(this._data.byteLength - slice.columns * slice.rows * 2);
  // check for data type and parse accordingly
  var _data = null;

  switch (slice.bits_allocated) {
  case 8:
    _data = this.scan('uchar', slice.columns * slice.rows);
    break;
  case 16:
    _data = this.scan('ushort', slice.columns * slice.rows);

    break;
  case 32:
    _data = this.scan('uint', slice.columns * slice.rows);
    break;
  }

  slice.data = _data;

  object.slices.push(slice);

  return object;
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserDCM', X.parserDCM);
goog.exportSymbol('X.parserDCM.prototype.parse', X.parserDCM.prototype.parse);

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
      var unsorted_index = MRI.sorting_table[_sorting_table_len - 1 -_i];
      if (unsorted_index !== undefined) {
        var unsorted_start = unsorted_index * MRI.vol_size;
        var unsorted_end = unsorted_start + MRI.vol_size;
        var __data = MRI.data_unsorted.subarray(unsorted_start, unsorted_end);
        MRI.data.set(__data, _j * MRI.vol_size);
        _j++;
      }
    }
    // grab the dimensions
    var _dimensions = [ MRI.dim[0], MRI.dim[1], MRI.dim[2] ];
    object._dimensions = _dimensions;
    // grab the spacing
    if(isNaN(MRI.pixdim[0])){
      MRI.pixdim[0] = 1.;
    }

    if(isNaN(MRI.pixdim[1])){
      MRI.pixdim[1] = 1.;
    }

    if (MRI.pixdim[2] == Infinity) {

      if( MRI.location.length > 1) {

        MRI.location.sort(function(a,b) {return a-b;});
        MRI.pixdim[2] = Math.abs(MRI.location[0] - MRI.location[1]);
      }
      else {

        MRI.pixdim[2] = 1.0;

      }
    }

    var _spacing = [ MRI.pixdim[0], MRI.pixdim[1], MRI.pixdim[2] ];
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

    // get origin == highest slice position?
    // or depends on Z orientation?

    // for CT, this one is not defined
    var _origin = [0, 0, 0]
    if(MRI.positionAll.length > 0){
    var i = 0, m = MRI.positionAll[0], mI = 0;

    window.console.log(MRI.positionAll);

    while(++i < MRI.positionAll.length) {
      if(MRI.positionAll[i] > m) {
          mI = i;
          m = MRI.positionAll[i];
      }
    }
    _origin = MRI.originAll[mI].split("\\");
    }
    

    // Create IJKtoXYZ matrix
    var _x_cosine = new goog.math.Vec3(MRI.spaceorientation[0],
          MRI.spaceorientation[1], MRI.spaceorientation[2]);
    var _y_cosine = new goog.math.Vec3(MRI.spaceorientation[3],
        MRI.spaceorientation[4], MRI.spaceorientation[5]);
    var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

    // if(object._spacing[2] >0) {

    //   _z_cosine.invert();
      
    // }

    var IJKToRAS = goog.vec.Mat4.createFloat32();
    // NOTE THE '-' for the LPS to RAS conversion
    goog.vec.Mat4.setRowValues(IJKToRAS,
      0,
      -MRI.spaceorientation[0]*MRI.pixdim[0],
      -MRI.spaceorientation[3]*MRI.pixdim[1],
      -_z_cosine.x*MRI.pixdim[2],
      -_origin[0]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      1,
      -MRI.spaceorientation[1]*MRI.pixdim[0],
      -MRI.spaceorientation[4]*MRI.pixdim[1],
      -_z_cosine.y*MRI.pixdim[2],
      -_origin[1]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      2,
      MRI.spaceorientation[2]*MRI.pixdim[0],
      MRI.spaceorientation[5]*MRI.pixdim[1],
      _z_cosine.z*MRI.pixdim[2],
      _origin[2]);
    goog.vec.Mat4.setRowValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);

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
X.parserDCM.prototype.parseStream = function(data, object) {
  // attach the given data
  this._data = data;
  // the instance number a.k.a slice index
  var _position = 0;
  if (!goog.isDefAndNotNull(object.MRI)) {

    window.console.log("START PARSING!");
    // this is the _first slice_
    //
    // the header fields + 1 field for data
    var MRI = {
      rows : 0,
      cols : 0,
      pixdim : [1, 1, 1],
      bits_allocated : 0,
      bits_stored : 0,
      number_of_slices : 1,
      number_of_images : 1,
      last_slicelocation : null,
      loaded_files : 0,
      vol_size : 0,
      data_unsorted : null,
      position_unsorted : 0,
      sorting_table : [],
      data : null,
      min : Infinity,
      max : -Infinity,
      location : [],
      originAll: [],
      positionAll: [],
      spaceorientation : [1, 0, 0, 0, 1, 0]
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
    // we only need 9 tags of the DICOM header
    var _tagCount = 10;

    var count = 0;

    while (_tagCount > 0) {

      _tagGroup = _bytes[_bytePointer++];
      _tagElement = _bytes[_bytePointer++];

      window.console.log('(' + _tagGroup.toString(16) + ',' + _tagElement.toString(16) +')');
      _VR = _bytes[_bytePointer++];
      _VL = _bytes[_bytePointer++];

      var _b0 = _VR & 0x00FF;
      var _b1 = (_VR & 0xFF00) >> 8;
      window.console.log(_VR);
      window.console.log(String.fromCharCode( _b0 ) + String.fromCharCode( _b1 ));
      window.console.log(_VL);

      count++;
      
       if(count == 200){
       return;
     }

      switch (_tagGroup) {
        case 0x0028:
        // Group of IMAGE INFO
          switch (_tagElement) {
            case 0x0010:
              // rows
              MRI.rows = _bytes[_bytePointer+=_VL/2];
              _tagCount--;
              break;
            case 0x0011:
              // cols
              MRI.cols = _bytes[_bytePointer+=_VL/2];
              _tagCount--;
              break;
            case 0x0100:
              // bits allocated
              MRI.bits_allocated = _bytes[_bytePointer+=_VL/2];
              _tagCount--;
              break;
            case 0x0101:
              // bits stored
              MRI.bits_stored = _bytes[_bytePointer+=_VL/2];
              _tagCount--;
              break;
            case 0x0002:
              // number of images
              MRI.number_of_images = _bytes[_bytePointer+=_VL/2];
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
              MRI.pixdim = [ parseFloat(_pixel_spacing[0]), parseFloat(_pixel_spacing[1]), Infinity ];
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

            default:
              switch (_VR){
                case 16975:
                  // UL
                case 20819:
                  // SQ
                case 20053:
                  // UN
                case 22351:
                  // OW
                  _VL = _bytes[_bytePointer++];
                  _bytePointer++;
                  window.console.log("new VL:" + _VL);
                default:
                  _bytePointer+=_VL/2;
                  break;
              }
              break;
          }

        break;
      
      case 0x0020:
        // Group of SLICE INFO
        switch (_tagElement) {
          case 0x0013:
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _position += String.fromCharCode(_b0);
              _position += String.fromCharCode(_b1);
              _position = parseInt(_position, 10);
            }
            _tagCount--;
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
            MRI.origin = [ parseFloat(_image_position[0]), parseFloat(_image_position[1]),
                parseFloat(_image_position[2]) ];
            _tagCount--;
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
            MRI.spaceorientation = [ parseFloat(_image_orientation[0]),
                parseFloat(_image_orientation[1]), parseFloat(_image_orientation[2]),
                parseFloat(_image_orientation[3]), parseFloat(_image_orientation[4]),
                parseFloat(_image_orientation[5]) ];
            _tagCount--;
            break;

          default:
            switch (_VR){
              case 16975:
                // UL
              case 20819:
                // SQ
              case 20053:
                // UN
              case 22351:
                // OW
                _VL = _bytes[_bytePointer++];
                _bytePointer++;
                window.console.log("new VL:" + _VL);
              default:
                _bytePointer+=_VL/2;
                break;
            }
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
            switch (_VR){
              case 16975:
                // UL
              case 20819:
                // SQ
              case 20053:
                // UN
              case 22351:
                // OW
                _VL = _bytes[_bytePointer++];
                _bytePointer++;
                window.console.log("new VL:" + _VL);
              default:
                _bytePointer+=_VL/2;
                break;
            }
            break;
          }

        break;

      default:
        window.console.log('unused tag group');
        // switch
        // got a special VR
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
          default:
            _bytePointer+=_VL/2;
            break;
        }
        break;
      }

    }
    object.MRI = MRI;
    // initially set the dimensions
    MRI.dim = [ MRI.cols, MRI.rows, 1 ];
    MRI.vol_size = MRI.rows * MRI.cols;
    // allocate the data array depending on the type
    switch (MRI.bits_allocated) {
    case 8:
      MRI.data_unsorted = new Uint8Array(MRI.cols * MRI.rows
          * MRI.number_of_slices);
      MRI.data = new Uint8Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    case 16:
      MRI.data_unsorted = new Uint16Array(MRI.cols * MRI.rows
          * MRI.number_of_slices);
      MRI.data = new Uint16Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    case 32:
      MRI.data_unsorted = new Uint32Array(MRI.cols * MRI.rows
          * MRI.number_of_slices);
      MRI.data = new Uint32Array(MRI.cols * MRI.rows * MRI.number_of_slices);
      break;
    }
  } else {

    window.console.log("CONTINUE PARSING!");
    var MRI = object.MRI;
    // scan the whole header as short (2 bytes), we know the volume size
    // now so we can reduce the byte array
    var _bytes = this.scan('ushort', this._data.byteLength - MRI.vol_size * 2);
    var _bytePointer = 0;
    // now find the instance number flag
    var _tagCount = 3;
    while (_tagCount > 0) {
      // read short
      _tagGroup = _bytes[_bytePointer++];
      if (_tagGroup == 0x0020) {
        // Group of SLICE INFO
        _tagSpecific = _bytes[_bytePointer++];
        // here we are only interested in the InstanceNumber
        if (_tagSpecific == 0x0013) {
          _VR = _bytes[_bytePointer++];
          _VL = _bytes[_bytePointer++];
          for (i = 0; i < _VL / 2; i++) {
            var _short = _bytes[_bytePointer++];
            var _b0 = _short & 0x00FF;
            var _b1 = (_short & 0xFF00) >> 8;
            _position += String.fromCharCode(_b0);
            _position += String.fromCharCode(_b1);
            _position = parseInt(_position, 10);
          }
          MRI.positionAll.push(_position);
          _tagCount--;
        }
        else if (_tagSpecific == 0x0032) {
          _VR = _bytes[_bytePointer++];
          _VL = _bytes[_bytePointer++];
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
          MRI.originAll.push(_image_position);
          //window.console.log(_image_position);
          _tagCount--;
        }
        else if (_tagSpecific == 0x1041) {
          // this is the slicelocation so we can grab the
          // z-spacing
          _VR = _bytes[_bytePointer++];
          _VL = _bytes[_bytePointer++];
          var _slicelocation = '';
          // slice location is a string in the dicom header
          for (i = 0; i < _VL / 2; i++) {
            var _short = _bytes[_bytePointer++];
            var _b0 = _short & 0x00FF;
            var _b1 = (_short & 0xFF00) >> 8;
            _slicelocation += String.fromCharCode(_b0);
            _slicelocation += String.fromCharCode(_b1);
          }
          // store all locations
          MRI.location.push(_slicelocation);
          _tagCount--;
        }

      }
    }
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

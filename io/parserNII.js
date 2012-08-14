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
goog.provide('X.parserNII');

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
X.parserNII = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserNII';
  
};
// inherit from X.parser
goog.inherits(X.parserNII, X.parser);


/**
 * @inheritDoc
 */
X.parserNII.prototype.parse = function(container, object, data, flag) {

  var b_zipped = flag;
  
  // the position in the file
  var position = 0;
  
  var _data = 0;
  
  if (b_zipped) {
    // we need to decompress the datastream
    _data = new JXG.Util.Unzip(data.substr(position)).unzip()[0][0];
  } else {
    // we can use the data directly
    _data = data.substr(position);
  }
  

  var MRI = this.parseStream(_data);
  
  // object.MRI = MRI;
  var _dimensions = [MRI.dim[1], MRI.dim[2], MRI.dim[3]];
  object._dimensions = _dimensions;
  
  var _spacing = [MRI.pixdim[1], MRI.pixdim[2], MRI.pixdim[3]];
  object._spacing = _spacing;
  
  var min = this._lastMin;
  var max = this._lastMax;
  
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
  
  object.create_();
  
  this.reslice(object, MRI.data, _dimensions, min, max);
  
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
 * @param {!String} data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserNII.prototype.parseStream = function(data) {

  var MRI = {
    sizeof_hdr: 0,
    dim_info: null,
    dim: [], // *!< Data array dimensions.*/ /* short dim[8]; */
    intent_p1: 0, // *!< 1st intent parameter. */ /* short unused8; */
    intent_p2: 0, // *!< 2nd intent parameter. */ /* short unused10; */
    intent_p3: 0, // *!< 3rd intent parameter. */ /* short unused12; */
    intent_code: 0, // *!< NIFTI_INTENT_* code. */ /* short unused14; */
    datatype: 0, // *!< Defines data type! */ /* short datatype; */
    bitpix: 0, // *!< Number bits/voxel. */ /* short bitpix; */
    slice_start: 0, // *!< First slice index. */ /* short dim_un0; */
    pixdim: [], // *!< Grid spacings. */ /* float pixdim[8]; */
    vox_offset: 0, // *!< Offset into .nii file */ /* float vox_offset; */
    scl_slope: 0, // *!< Data scaling: slope. */ /* float funused1; */
    scl_inter: 0, // *!< Data scaling: offset. */ /* float funused2; */
    slice_end: 0, // *!< Last slice index. */ /* float funused3; */
    slice_code: null, // *!< Slice timing order. */
    xyzt_units: null, // *!< Units of pixdim[1..4] */
    cal_max: 0, // *!< Max display intensity */ /* float cal_max; */
    cal_min: 0, // *!< Min display intensity */ /* float cal_min; */
    slice_duration: 0, // *!< Time for 1 slice. */ /* float compressed; */
    toffset: 0, // *!< Time axis shift. */ /* float verified; */
    descrip: null, // *!< any text you like. */ /* char descrip[80]; */
    aux_file: null, // *!< auxiliary filename. */ /* char aux_file[24]; */
    qform_code: 0, // *!< NIFTI_XFORM_* code. */ /*-- all ANALYZE 7.5 ---*/
    sform_code: 0, // *!< NIFTI_XFORM_* code. */ /* fields below here */
    quatern_b: 0, // *!< Quaternion b param. */
    quatern_c: 0, // *!< Quaternion c param. */
    quatern_d: 0, // *!< Quaternion d param. */
    qoffset_x: 0, // *!< Quaternion x shift. */
    qoffset_y: 0, // *!< Quaternion y shift. */
    qoffset_z: 0, // *!< Quaternion z shift. */
    srow_x: [], // *!< 1st row affine transform. */
    srow_y: [], // *!< 2nd row affine transform. */
    srow_z: [], // *!< 3rd row affine transform. */
    intent_name: null, // *!< 'name' or meaning of data. */
    magic: [], // *!< MUST be "ni1\0" or "n+1\0". */
    data: []
  };
  
  this._data = data;
  


  MRI.sizeof_hdr = this.scan('uint');
  
  this.scan('uchar', 28);
  this.scan('uint');
  this.scan('ushort');
  this.scan('uchar');
  
  MRI.dim_info = this.scan('uchar');
  MRI.dim = this.scan('ushort', 8);
  var volsize = MRI.dim[1] * MRI.dim[2] * MRI.dim[3];
  
  MRI.intent_p1 = this.scan('float');
  MRI.intent_p2 = this.scan('float');
  MRI.intent_p3 = this.scan('float');
  
  MRI.intent_code = this.scan('ushort');
  MRI.datatype = this.scan('ushort');
  MRI.bitpix = this.scan('ushort');
  MRI.slice_start = this.scan('ushort');
  
  MRI.pixdim = this.scan('float', 8);
  MRI.vox_offset = this.scan('float');
  MRI.scl_slope = this.scan('float');
  MRI.scl_inter = this.scan('float');
  
  MRI.slice_end = this.scan('ushort');
  MRI.slice_code = this.scan('uchar');
  MRI.xyzt_units = this.scan('uchar');
  
  MRI.cal_max = this.scan('float');
  MRI.cal_min = this.scan('float');
  MRI.slice_duration = this.scan('float');
  MRI.toffset = this.scan('float');
  
  // todo grab 2 more ints
  
  MRI.descrip = this.scan('uchar', 80);
  MRI.aux_file = this.scan('uchar', 24);
  
  MRI.qform_code = this.scan('ushort');
  MRI.sform_code = this.scan('ushort');
  
  MRI.quatern_b = this.scan('float');
  MRI.quatern_c = this.scan('float');
  MRI.quatern_d = this.scan('float');
  MRI.qoffset_x = this.scan('float');
  MRI.qoffset_y = this.scan('float');
  MRI.qoffset_z = this.scan('float');
  
  MRI.srow_x = this.scan('float', 4);
  MRI.srow_y = this.scan('float', 4);
  MRI.srowz = this.scan('float', 4);
  
  MRI.intent_name = this.scan('uchar', 16);
  MRI.magic = this.scan('uchar', 4);
  


  // jump to vox_offset which is very important since the
  // header can be shorter as the usual 348 bytes
  this.jumpTo(parseInt(MRI.vox_offset, 10));
  
  var _pixelData = null;
  
  switch (MRI.datatype) {
  case 2:
    // unsigned char
    _pixelData = this.scan('uchar', volsize);
    break;
  case 4:
    // signed short
    _pixelData = this.scan('sshort', volsize);
    break;
  case 8:
    // signed int
    _pixelData = this.scan('sint', volsize);
    break;
  case 16:
    // float
    _pixelData = this.scan('float', volsize);
    break;
  case 256:
    // signed char
    _pixelData = this.scan('schar', volsize);
    break;
  case 512:
    // unsigned short
    _pixelData = this.scan('ushort', volsize);
    break;
  case 768:
    // unsigned int
    _pixelData = this.scan('uint', volsize);
    break;
  
  default:
    throw new Error('Unsupported NII data type: ' + MRI.datatype);
  }
  
  MRI.data = _pixelData;
  
  return MRI;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNII', X.parserNII);
goog.exportSymbol('X.parserNII.prototype.parse', X.parserNII.prototype.parse);

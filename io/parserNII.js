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
  var MRItype = {
    MRI_UCHAR: {
      value: 0,
      name: "uchar",
      size: 1,
      func_arrayRead: this.parseUChar8Array.bind(this)
    },
    MRI_SCHAR: {
      value: 0,
      name: "schar",
      size: 1,
      func_arrayRead: this.parseSChar8Array.bind(this)
    },
    MRI_UINT32: {
      value: 1,
      name: "uint32",
      size: 4,
      func_arrayRead: this.parseUInt32Array.bind(this)
    },
    MRI_FLOAT: {
      value: 3,
      name: "float",
      size: 4,
      func_arrayRead: this.parseFloat32Array.bind(this)
    },
    MRI_USHORT: {
      value: 4,
      name: "ushort",
      size: 2,
      func_arrayRead: this.parseUInt16Array.bind(this)
    },
    MRI_SSHORT: {
      value: 5,
      name: "sshort",
      size: 2,
      func_arrayRead: this.parseSInt16Array.bind(this)
    }
  };
  // syslog('Reading .nii/.nii.gz header');
  var dataptr = new X.parserHelper(data);
  
  dataptr
      .setParseFunction(this.parseUInt32Array.bind(this), dataptr._sizeOfInt);
  MRI.sizeof_hdr = dataptr.read();
  dataptr.setParseFunction(this.parseUChar8Array.bind(this),
      dataptr._sizeOfChar);
  dataptr.read(28);
  dataptr
      .setParseFunction(this.parseUInt32Array.bind(this), dataptr._sizeOfInt);
  dataptr.read(1);
  dataptr.setParseFunction(this.parseUInt16Array.bind(this),
      dataptr._sizeOfShort);
  dataptr.read(1);
  dataptr.setParseFunction(this.parseUChar8Array.bind(this),
      dataptr._sizeOfChar);
  dataptr.read(1);
  MRI.dim_info = dataptr.read(1);
  dataptr.setParseFunction(this.parseUInt16Array.bind(this),
      dataptr._sizeOfShort);
  MRI.dim = dataptr.read(8);
  var volsize = MRI.dim[1] * MRI.dim[2] * MRI.dim[3];
  
  dataptr.setParseFunction(this.parseFloat32Array.bind(this),
      dataptr._sizeOfFloat);
  MRI.intent_p1 = dataptr.read();
  MRI.intent_p2 = dataptr.read();
  MRI.intent_p3 = dataptr.read();
  dataptr.setParseFunction(this.parseUInt16Array.bind(this),
      dataptr._sizeOfShort);
  MRI.intent_code = dataptr.read();
  MRI.datatype = dataptr.read();
  MRI.bitpix = dataptr.read();
  MRI.slice_start = dataptr.read();
  dataptr.setParseFunction(this.parseFloat32Array.bind(this),
      dataptr._sizeOfFloat);
  MRI.pixdim = dataptr.read(8);
  MRI.vox_offset = dataptr.read();
  MRI.scl_slope = dataptr.read();
  MRI.scl_inter = dataptr.read();
  dataptr.setParseFunction(this.parseUInt16Array.bind(this),
      dataptr._sizeOfShort);
  MRI.slice_end = dataptr.read();
  dataptr.setParseFunction(this.parseUChar8Array.bind(this),
      dataptr._sizeOfChar);
  MRI.slice_code = dataptr.read();
  MRI.xyzt_units = dataptr.read();
  dataptr.setParseFunction(this.parseFloat32Array.bind(this),
      dataptr._sizeOfFloat);
  MRI.cal_max = dataptr.read();
  MRI.cal_min = dataptr.read();
  MRI.slice_duration = dataptr.read();
  MRI.toffset = dataptr.read();
  dataptr.setParseFunction(this.parseUChar8Array.bind(this),
      dataptr._sizeOfChar);
  MRI.descrip = dataptr.read(80);
  MRI.aux_file = dataptr.read(24);
  dataptr.setParseFunction(this.parseUInt16Array.bind(this),
      dataptr._sizeOfShort);
  MRI.qform_code = dataptr.read();
  MRI.sform_code = dataptr.read();
  dataptr.setParseFunction(this.parseFloat32Array.bind(this),
      dataptr._sizeOfFloat);
  MRI.quatern_b = dataptr.read();
  MRI.quatern_c = dataptr.read();
  MRI.quatern_d = dataptr.read();
  MRI.qoffset_x = dataptr.read();
  MRI.qoffset_y = dataptr.read();
  MRI.qoffset_z = dataptr.read();
  
  MRI.srow_x = dataptr.read(4);
  MRI.srow_y = dataptr.read(4);
  MRI.srow_z = dataptr.read(4);
  dataptr.setParseFunction(this.parseUChar8Array.bind(this),
      dataptr._sizeOfChar);
  MRI.intent_name = dataptr.read(16);
  MRI.magic = dataptr.read(4);
  

  switch (MRI.datatype) {
  case 2:
    MRI.MRIdatatype = MRItype.MRI_UCHAR;
    break;
  case 4:
    MRI.MRIdatatype = MRItype.MRI_SSHORT;
    break;
  case 16:
    MRI.MRIdatatype = MRItype.MRI_FLOAT;
    break;
  case 256:
    MRI.MRIdatatype = MRItype.MRI_SCHAR;
    break;
  case 512:
    MRI.MRIdatatype = MRItype.MRI_USHORT;
    break;
  case 768:
    MRI.MRIdatatype = MRItype.MRI_UINT32;
    break;
  default:
    throw new Error('Unsupported NII data type: ' + MRI.datatype);
  }
  
  // dataptr
  // .setParseFunction(MRI.MRIdatatype.func_arrayRead, MRI.MRIdatatype.size);
  // var a_ret = dataptr.read(volsize);
  
  //
  // we can grab the min max values like this and skip the stats further down
  //
  var a_ret = MRI.MRIdatatype.func_arrayRead(data, dataptr._dataPointer,
      volsize);
  MRI.data = a_ret[0];
  MRI.min = a_ret[2];
  MRI.max = a_ret[1];
  
  // console.time('stats')
  // syslog('Calculating data/image stats...');
  // MRI.stats = this.stats_calc(MRI.v_data);
  // syslog('.nii/.nii.gz data stream END.');
  // console.timeEnd('stats')
  return MRI;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNII', X.parserNII);
goog.exportSymbol('X.parserNII.prototype.parse', X.parserNII.prototype.parse);

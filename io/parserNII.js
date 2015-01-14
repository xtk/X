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
goog.require('X.triplets');
goog.require('goog.vec.Mat3');
goog.require('goog.vec.Mat4');
goog.require('Zlib.Gunzip');


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
  
  var _data = data;
  
  if (!this.verifyNII(_data)) {
      // it's either big endian, or compressed, or both

    try {
      // first, try to decompress the datastream    
      // here we start the unzipping and get a typed Uint8Array back
      // .. and use the underlying array buffer
      var inflate = new Zlib.Gunzip(new Uint8Array(_data));
      _data = inflate.decompress().buffer;
    
      // check endianness
      if (!this.verifyNII(_data)) {
        // it must be compressed big endian
        this._littleEndian = false;
      }
    } catch (e) {
        // it must be uncompressed big endian       
        this._littleEndian = false;
    }
  }
  
  // parse the byte stream
  var MRI = this.parseStream(_data);
  
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
  
  // Create IJKtoXYZ matrix
  var IJKToRAS = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.setRowValues(IJKToRAS,
      3,
      0,
      0,
      0,
      1);

  // NO RESLICING, only use the spacing
  if(object['reslicing'] == 'false' || object['reslicing'] == false){

    var xd = 1.0, yd = 1.0, zd = 1.0;
    
    // scaling factors
    if(MRI.pixdim[1] > 0.0) {

      xd = MRI.pixdim[1];

    }
    
    if(MRI.pixdim[2] > 0.0) {

      yd = MRI.pixdim[2];

    }
    
    if(MRI.pixdim[2] > 0.0) {

      zd = MRI.pixdim[3];

    }
    
    // qfac left handed
    if(MRI.pixdim[0] < 0.0) {

      zd = -zd;

    }

    goog.vec.Mat4.setRowValues(IJKToRAS,
        0,
        xd,
        0,
        0,
        0
        );
    goog.vec.Mat4.setRowValues(IJKToRAS,
        1,
        0,
        yd,
        0,
        0
        );
    goog.vec.Mat4.setRowValues(IJKToRAS,
        2,
        0,
        0,
        zd,
        0
        );
  }
  else if(MRI.qform_code > 0) {
    //https://github.com/Kitware/ITK/blob/master/Modules/IO/NIFTI/src/itkNiftiImageIO.cxx
    
    var a = 0.0, b = MRI.quatern_b, c = MRI.quatern_c, d = MRI.quatern_d;
    var xd = 1.0, yd = 1.0, zd = 1.0;
    var qx = MRI.qoffset_x, qy = MRI.qoffset_y, qz = MRI.qoffset_z;
    
    // compute a
    a = 1.0 - (b*b + c*c + d*d) ;
    if( a < 0.0000001 ){                   /* special case */

      a = 1.0 / Math.sqrt(b*b+c*c+d*d) ;
      b *= a ; c *= a ; d *= a ;        /* normalize (b,c,d) vector */
      a = 0.0;                       /* a = 0 ==> 180 degree rotation */

    } else {

      a = Math.sqrt(a) ;                     /* angle = 2*arccos(a) */

    }
    
    // scaling factors
    if(MRI.pixdim[1] > 0.0) {

      xd = MRI.pixdim[1];

    }
    
    if(MRI.pixdim[2] > 0.0) {

      yd = MRI.pixdim[2];

    }
    
    if(MRI.pixdim[2] > 0.0) {

      zd = MRI.pixdim[3];

    }
    
    // qfac left handed
    if(MRI.pixdim[0] < 0.0) {

      zd = -zd;

    }
    
    // fill IJKToRAS

    goog.vec.Mat4.setRowValues(IJKToRAS,
        0,
        (a*a+b*b-c*c-d*d)*xd,
        2*(b*c-a*d)*yd,
        2*(b*d+a*c)*zd,
        qx
        );
    goog.vec.Mat4.setRowValues(IJKToRAS,
        1,
        2*(b*c+a*d)*xd,
        (a*a+c*c-b*b-d*d)*yd,
        2*(c*d-a*b)*zd,
        qy
        );
    goog.vec.Mat4.setRowValues(IJKToRAS,
        2,
        2*(b*d-a*c )*xd,
        2*(c*d+a*b)*yd,
        (a*a+d*d-c*c-b*b)*zd,
        qz
        );
  }
  else if(MRI.sform_code > 0) {  

    var sx = MRI.srow_x, sy = MRI.srow_y, sz = MRI.srow_z;
    // fill IJKToRAS
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, sx[0], sx[1], sx[2], sx[3]);
    goog.vec.Mat4.setRowValues(IJKToRAS, 1, sy[0], sy[1], sy[2], sy[3]);
    goog.vec.Mat4.setRowValues(IJKToRAS, 2, sz[0], sz[1], sz[2], sz[3]);

  }
  else if(MRI.qform_code == 0) {

    // fill IJKToRAS
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, MRI.pixdim[1], 0, 0, 0);
    goog.vec.Mat4.setRowValues(IJKToRAS, 1, 0, MRI.pixdim[2], 0, 0);
    goog.vec.Mat4.setRowValues(IJKToRAS, 2, 0, 0, MRI.pixdim[3], 0);

  }
  else {

    window.console.log('UNKNOWN METHOD IN PARSER NII');

  }
  
  // IJK to RAS and invert
  MRI.IJKToRAS = IJKToRAS;
  MRI.RASToIJK = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.invert(MRI.IJKToRAS, MRI.RASToIJK);
  
  // get bounding box
  // Transform ijk (0, 0, 0) to RAS
  var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
  var res = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(IJKToRAS, tar, res);
  // Transform ijk (spacingX, spacinY, spacingZ) to RAS
  var tar2 = goog.vec.Vec4.createFloat32FromValues(1, 1, 1, 1);
  var res2 = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);
  
  // get location of 8 corners and update BBox
  //
  var _dims = [MRI.dim[1], MRI.dim[2], MRI.dim[3]];
  var _rasBB = X.parser.computeRASBBox(IJKToRAS, _dims);

  // grab the RAS Dimensions
  MRI.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
  
  // grab the RAS Dimensions
  MRI.RASDimensions = [_rasBB[1] - _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];
  
  // grab the RAS Origin
  MRI.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];
  
  // grab the  IJK dimensions
  object._dimensions = _dims;
  
  // create the object
  object.create_(MRI);
  
  // re-slice the data according each direction.
  object._image = this.reslice(object);
    
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
X.parserNII.prototype.parseStream = function(data) {

  // attach the given data
  this._data = data;
  
  //
  // the header fields + 1 field for data
  var MRI = {
    sizeof_hdr: 0,
    data_type: null, /* !< ++UNUSED++ *//* char data_type[10]; */
    db_name: null, /* !< ++UNUSED++ *//* char db_name[18]; */
    extents: 0, /* !< ++UNUSED++ *//* int extents; */
    session_error: 0, /* !< ++UNUSED++ *//* short session_error; */
    regular: 0, /* !< ++UNUSED++ *//* char regular; */
    dim_info: null,/* !< MRI slice ordering. *//* char hkey_un0; */
    dim: null, // *!< Data array dimensions.*/ /* short dim[8]; */
    intent_p1: 0, // *!< 1st intent parameter. */ /* short unused8; */
    intent_p2: 0, // *!< 2nd intent parameter. */ /* short unused10; */
    intent_p3: 0, // *!< 3rd intent parameter. */ /* short unused12; */
    intent_code: 0, // *!< NIFTI_INTENT_* code. */ /* short unused14; */
    datatype: 0, // *!< Defines data type! */ /* short datatype; */
    bitpix: 0, // *!< Number bits/voxel. */ /* short bitpix; */
    slice_start: 0, // *!< First slice index. */ /* short dim_un0; */
    pixdim: null, // *!< Grid spacings. */ /* float pixdim[8]; */
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
    glmax: 0,/* !< ++UNUSED++ *//* int glmax; */
    glmin: 0, /* !< ++UNUSED++ *//* int glmin; */
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
    srow_x: null, // *!< 1st row affine transform. */
    srow_y: null, // *!< 2nd row affine transform. */
    srow_z: null, // *!< 3rd row affine transform. */
    intent_name: null, // *!< 'name' or meaning of data. */
    magic: null, // *!< MUST be "ni1\0" or "n+1\0". */
    data: null,
    min: Infinity,
    max: -Infinity
  };
  
  // header_key substruct
  MRI.sizeof_hdr = this.scan('uint');
  MRI.data_type = this.scan('uchar', 10);
  MRI.db_name = this.scan('uchar', 18);
  MRI.extents = this.scan('uint');
  MRI.session_error = this.scan('ushort');
  MRI.regular = this.scan('uchar');
  MRI.dim_info = this.scan('uchar');
  
  // image_dimension substruct
  MRI.dim = this.scan('ushort', 8);
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
  MRI.glmax = this.scan('uint', 1);
  MRI.glmin = this.scan('uint', 1);
  
  // data_history substruct
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
  MRI.srow_z = this.scan('float', 4);
  
  MRI.intent_name = this.scan('uchar', 16);
  
  MRI.magic = this.scan('uchar', 4);
  

  // jump to vox_offset which is very important since the
  // header can be shorter as the usual 348 bytes
  this.jumpTo(parseInt(MRI.vox_offset, 10));
  
  // number of pixels in the volume
  var volsize = MRI.dim[1] * MRI.dim[2] * MRI.dim[3];
  
  // scan the pixels regarding the data type
  switch (MRI.datatype) {
  case 2:
    // unsigned char
    MRI.data = this.scan('uchar', volsize);
    break;
  case 4:
    // signed short
    MRI.data = this.scan('sshort', volsize);
    break;
  case 8:
    // signed int
    MRI.data = this.scan('sint', volsize);
    break;
  case 16:
    // float
    MRI.data = this.scan('float', volsize);
    break;
  case 32:
    // complex
    MRI.data = this.scan('complex', volsize);
    break;
  case 64:
    // double
    MRI.data = this.scan('double', volsize);
    break;
  case 256:
    // signed char
    MRI.data = this.scan('schar', volsize);
    break;
  case 512:
    // unsigned short
    MRI.data = this.scan('ushort', volsize);
    break;
  case 768:
    // unsigned int
    MRI.data = this.scan('uint', volsize);
    break;
  
  default:
    throw new Error('Unsupported NII data type: ' + MRI.datatype);
  }
  
  // get the min and max intensities
  var min_max = this.arrayMinMax(MRI.data);
  MRI.min = min_max[0];
  MRI.max = min_max[1];
  
  return MRI;
  
};

/**
 * Verify the nifti file by checking sizeof_hdr value (must be 348)
 *
 * @param {!ArrayBuffer} data The data of nifti file.
 * @return {!boolean} If this is an uncompressed small endian nifti file
 */
X.parserNII.prototype.verifyNII = function(data) {

  // check if this data is compressed or big endian ,
  // then this int != 348
  var _check = -1;
  if (typeof DataView == 'undefined') {
    _check = new Int32Array(data, 0, 1)[0];
  } else {
    var dataview = new DataView(data, 0);
    _check = dataview.getInt32(0, true);
  }
  
  if (_check == 348) {
    return true;
  } else {
    return false;
  }
}


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNII', X.parserNII);
goog.exportSymbol('X.parserNII.prototype.parse', X.parserNII.prototype.parse);

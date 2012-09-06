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
goog.provide('X.parserMGZ');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for .MGZ files. Note: MGH/MGZ files are BIG ENDIAN so we need
 * to take care of that..
 * 
 * @constructor
 * @extends X.parser
 */
X.parserMGZ = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserMGZ';
  
  /**
   * Here, the data stream is big endian.
   * 
   * @inheritDoc
   */
  this._littleEndian = false;
  
};
// inherit from X.parser
goog.inherits(X.parserMGZ, X.parser);


/**
 * @inheritDoc
 */
X.parserMGZ.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var b_zipped = flag;
  
  var _data = data;
  
  if (b_zipped) {
    
    // we need to decompress the datastream
    
    // here we start the unzipping and get a typed Uint8Array back
    _data = new JXG.Util.Unzip(new Uint8Array(data)).unzip();
    
    // .. and use the underlying array buffer
    _data = _data.buffer;
    
  }
  

  // parse the byte stream
  var MRI = this.parseStream(_data);
  
  // grab the dimensions
  var _dimensions = [MRI.ndim1, MRI.ndim2, MRI.ndim3];
  object._dimensions = _dimensions;
  
  // grab the spacing
  var _spacing = MRI.v_voxelsize;
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
 * Parse the data stream according to the MGH/MGZ file format and return an MRI
 * structure which holds all parsed information.
 * 
 * @param {!ArrayBuffer} data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserMGZ.prototype.parseStream = function(data) {

  // attach the given data to the internal scan function
  this._data = data;
  
  var MRI = {
    version: 0,
    Tr: 0,
    Te: 0,
    flipangle: 0,
    Ti: 0,
    ndim1: 0,
    ndim2: 0,
    ndim3: 0,
    nframes: 0,
    type: 0,
    dof: 0,
    rasgoodflag: 0,
    MRIreader: null,
    M_ras: null,
    v_voxelsize: null,
    data: null, // data as single vector
    min: Infinity,
    max: -Infinity
  };
  

  MRI.version = this.scan('uint');
  MRI.ndim1 = this.scan('uint');
  MRI.ndim2 = this.scan('uint');
  MRI.ndim3 = this.scan('uint');
  MRI.nframes = this.scan('uint');
  MRI.type = this.scan('uint');
  MRI.dof = this.scan('uint');
  
  MRI.rasgoodflag = this.scan('ushort');
  
  if (MRI.rasgoodflag > 0) {
    
    // Read in voxel size and RAS matrix
    MRI.v_voxelsize = this.scan('float', 3);
    
    var _ras = [];
    
    // X
    _ras.push(this.scan('float', 3));
    
    // Y
    _ras.push(this.scan('float', 3));
    
    // Z
    _ras.push(this.scan('float', 3));
    
    // C
    _ras.push(this.scan('float', 3));
    
    MRI.M_ras = _ras;
    
  }
  
  // jump to the image data which starts at byte 284,
  // according to http://surfer.nmr.mgh.harvard.edu/fswiki/FsTutorial/MghFormat
  this.jumpTo(284);
  
  // number of pixels in the volume
  var volsize = MRI.ndim1 * MRI.ndim2 * MRI.ndim3;
  
  // scan the pixels regarding the data type
  switch (MRI.type) {
  case 0:
    // unsigned char
    MRI.data = this.scan('uchar', volsize);
    break;
  case 1:
    // unsigned int
    MRI.data = this.scan('uint', volsize);
    break;
  // case 2:
  // long
  // break;
  case 3:
    // float
    MRI.data = this.scan('float', volsize);
    break;
  case 4:
    // unsigned short
    MRI.data = this.scan('ushort', volsize);
    break;
  // case 5:
  // bitmap
  // break;
  default:
    throw new Error('Unsupported MGH/MGZ data type: ' + MRI.type);
  }
  
  // get the min and max intensities
  var min_max = this.arrayMinMax(MRI.data);
  MRI.min = min_max[0];
  MRI.max = min_max[1];
  

  // Now for the final MRI parameters at the end of the data stream:
  if (this._dataPointer + 4 * 4 < this._data.byteLength) {
    
    MRI.Tr = this.scan('float');
    MRI.flipangle = this.scan('float');
    MRI.Te = this.scan('float');
    MRI.Ti = this.scan('float');
    
  }
  
  return MRI;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserMGZ', X.parserMGZ);
goog.exportSymbol('X.parserMGZ.prototype.parse', X.parserMGZ.prototype.parse);

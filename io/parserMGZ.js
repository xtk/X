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
goog.require('X.parserHelper');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for .MGZ files.
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
  this['_className'] = 'parserMGZ';
  
};
// inherit from X.parser
goog.inherits(X.parserMGZ, X.parser);

f
/**
 * @inheritDoc
 */
X.parserMGZ.prototype.parse = function(object, data) {

  // the position in the file
  var position = 0;

  var _data = 0; 
  
  if (this.encoding == 'gzip' || this.encoding == 'gz') {
    // we need to decompress the datastream
    _data = new JXG.Util.Unzip(data.substr(position)).unzip()[0][0];
  } else {
    // we can use the data directly
    _data = data.substr(position);
  }

  
  
  var numberOfPixels = this.sizes[0] * this.sizes[1] * this.sizes[2];
  
  //
  // parse the (unzipped) data to a datastream of the correct type
  //
  var datastream = new Array(numberOfPixels);
  
  
  // all done..
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

X.parserMGZ.prototype.parseStream = function (data) {
	b_consoleOut	= true;
	if(typeof ab_consoleOut == 'undefined') b_consoleOut = false;

	var MRI = {
			version:		0,
			Tr: 			0, 
			Te: 			0, 
			flipangle:		0,
			Ti:				0,
			ndim1:			0,
			ndim2:			0,
			ndim3:			0,
			nframes: 		0,
			type:			0,
			dof:			0,
			rasgoodflag:	0,
			MRIreader:		null,
			M_ras:			[
			      			 [0, 0, 0, 0],
			      			 [0, 0, 0, 0],
			      			 [0, 0, 0, 0]
			      			 ],
			v_voxelsize:	[],
			v_data:			[],		// data as single vector
			V_data: 		[]		// data as volume 
			};	

	var MRItype = {
		MRI_UCHAR	: {	value: 0,	name: "uchar",	size:	1, 
						func_arrayRead: parseUChar8Array },
		MRI_INT		: {	value: 1, 	name: "int",	size:	4,
						func_arrayRead: parseUInt32EndianSwappedArray },
		MRI_LONG	: {	value: 2, 	name: "long",	size:   8,
						func_arrayRead: null },	// NOT YET DEFINED!
		MRI_FLOAT	: {	value: 3, 	name: "float", 	size:	4,
						func_arrayRead: parseFloat32EndianSwappedArray },
		MRI_SHORT	: { value: 4, 	name: "short", 	size:	2,
						func_arrayRead: parseUInt16EndianSwappedArray },
		MRI_BITMAP 	: {	value: 5, 	name: "bitmap", size:  	8,
						func_arrayRead: null}	// NOT YET DEFINED!
	};
	
	var UNUSED_SPACE_SIZE	= 256;
	var MGH_VERSION			= 1;
	var sizeof_char			= 1;
	var sizeof_short		= 2;
	var sizeof_int			= 4;
	var	sizeof_float		= 4;
	var sizeof_double		= 8;
	var USED_SPACE_SIZE		= (3*sizeof_float+4*3*sizeof_float);
	var unused_space_size	= UNUSED_SPACE_SIZE;
	
	syslog('FreeSurfer MGH/MGZ data stream START.');
	syslog('Reading MGH/MGZ header');
	dataptr			= new dstream(data, parseUInt32EndianSwappedArray, sizeof_int);
	dataptr.b_verbose(false);
	MRI.version		= dataptr.read();
	MRI.ndim1		= dataptr.read();
	MRI.ndim2		= dataptr.read();
	MRI.ndim3		= dataptr.read();
	MRI.nframes		= dataptr.read();
	MRI.type		= dataptr.read();
	switch(MRI.type) {
		case 0:	MRI.MRIdatatype = MRItype.MRI_UCHAR; 	break;
		case 1: MRI.MRIdatatype = MRItype.MRI_INT;		break;
		case 2: MRI.MRIdatatype = MRItype.MRI_LONG; 	break;
		case 3: MRI.MRIdatatype = MRItype.MRI_FLOAT;	break;
		case 4:	MRI.MRIdatatype = MRItype.MRI_SHORT;	break;
		case 5: MRI.MRIdatatype = MRItype.MRI_BITMAP;	break;
		// case else?
	}
	MRI.dof			= dataptr.read();
	dataptr.array_parse_set(parseUInt16EndianSwappedArray, sizeof_short);
	MRI.rasgoodflag	= dataptr.read();
	
	unused_space_size -= sizeof_short;
	
	if(b_consoleOut) MRI_headerPrint(MRI, 1, 0);

	if(MRI.rasgoodflag > 0) {
		dataptr.array_parse_set(parseFloat32EndianSwappedArray, sizeof_float);
		// Read in voxel size and RAS matrix
		unused_space_size -= USED_SPACE_SIZE;
		MRI.v_voxelsize[0]	= dataptr.read();
		MRI.v_voxelsize[1]	= dataptr.read();
		MRI.v_voxelsize[2] 	= dataptr.read();
		
		// X
		MRI.M_ras[0][0]		= dataptr.read();
		MRI.M_ras[1][0]		= dataptr.read();
		MRI.M_ras[2][0]		= dataptr.read();

		// Y
		MRI.M_ras[0][1]		= dataptr.read();
		MRI.M_ras[1][1]		= dataptr.read();
		MRI.M_ras[2][1]		= dataptr.read();
		
		// Z
		MRI.M_ras[0][2]		= dataptr.read();
		MRI.M_ras[1][2]		= dataptr.read();
		MRI.M_ras[2][2]		= dataptr.read();

		// C
		MRI.M_ras[0][3]		= dataptr.read();
		MRI.M_ras[1][3]		= dataptr.read();
		MRI.M_ras[2][3]		= dataptr.read();

		if(b_consoleOut) {
			MRI_voxelSizesPrint(MRI);
			MRI_rasMatrixPrint(MRI);
		}
	}
	//cprintf('unused space size', unused_space_size);
	dataptr.array_parse_set(parseUChar8Array, sizeof_char);
	dataptr.read(unused_space_size);
	var volsize	= MRI.ndim1 * MRI.ndim2 * MRI.ndim3;
	
	syslog('Reading MGH/MGZ image data');
	syslog(sprintf('Accessing %d %s vals (%d bytes)', volsize, MRI.MRIdatatype.name, 
			volsize*MRI.MRIdatatype.size));
	dataptr.array_parse_set(MRI.MRIdatatype.func_arrayRead, MRI.MRIdatatype.size);
	a_ret	= dataptr.read(volsize);
	MRI.v_data	= a_ret;
	
	// Now for the final MRI parameters at the end of the data stream:
	if(dataptr.dataPointer()+4*sizeof_float < dataptr.dataStream().length) {
		syslog('Reading MGH/MGZ MRI parameters');
		dataptr.array_parse_set(parseFloat32EndianSwappedArray, sizeof_float);
		MRI.Tr	 		= dataptr.read();
		MRI.flipangle	= dataptr.read();
		MRI.Te			= dataptr.read();
		MRI.Ti			= dataptr.read();
		if(b_consoleOut) MRI_headerPrint(MRI, 0, 1);
	}
	syslog('Calculating data/image stats...');
	stats = stats_calc(MRI.v_data);
	if(b_consoleOut) stats_print(stats);
	syslog('FreeSurfer MGH/MGZ data stream END.');
	return MRI;
}




// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserMGZ', X.parserMGZ);
goog.exportSymbol('X.parserMGZ.prototype.parse', X.parserMGZ.prototype.parse);

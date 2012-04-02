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

function MRI_headerPrint(MRI, b_prefix, b_suffix) {
	
	b_prefix	= typeof b_prefix !== 'undefined' ? b_prefix : 1;
	b_suffix	= typeof b_suffix !== 'undefined' ? b_suffix : 1;

	if (b_prefix) {
		console.log(sprintf('%20s = %10d\n', 'version',	MRI.version));
		console.log(sprintf('%20s = %10d\n', 'ndim1', 	MRI.ndim1));
		console.log(sprintf('%20s = %10d\n', 'ndim2', 	MRI.ndim2));
		console.log(sprintf('%20s = %10d\n', 'ndim3', 	MRI.ndim3));
		console.log(sprintf('%20s = %10d\n', 'nframes', MRI.nframes));
		console.log(sprintf('%20s = %10d\n', 'type', 	MRI.type));
		console.log(sprintf('%20s = %10d\n', 'dof', 	MRI.dof));
		console.log(sprintf('%20s = %10d\n', 'rasgoodflag', 	
													MRI.rasgoodflag));
	}
	if (b_suffix) {
		console.log(sprintf('%20s = %10.5f [ms]\n', 	
							'Tr',			MRI.Tr));
		console.log(sprintf('%20s = %10.5f [radians]\n',
							'flipangle',	MRI.flipangle));
		console.log(sprintf('%20s = %10.5f [degrees]\n',
							'flipangle',	MRI.flipangle * 180 / Math.PI));
		console.log(sprintf('%20s = %10.5f [ms]\n',
							'Te',			MRI.Te));
		console.log(sprintf('%20s = %10.5f [ms]\n',
							'Ti',			MRI.Ti));
	}
}

function MRI_voxelSizesPrint(MRI) {
	console.log('Voxel sizes = %f x %f x %f [mm]\n',
				MRI.v_voxelsize[0],
				MRI.v_voxelsize[1],
				MRI.v_voxelsize[2]);
}

function MRI_rasMatrixPrint(MRI) {
	var	width	= 10;
	var	prec	= 5;
	console.log(sprintf('| %10.5f%10.5f%10.5f%15.5f |\n',
		MRI.M_ras[0][0], MRI.M_ras[0][1], MRI.M_ras[0][2], MRI.M_ras[0][3]));
	console.log(sprintf('| %10.5f%10.5f%10.5f%15.5f |\n',
		MRI.M_ras[1][0], MRI.M_ras[1][1], MRI.M_ras[1][2], MRI.M_ras[1][3]));
	console.log(sprintf('| %10.5f%10.5f%10.5f%15.5f |\n',
		MRI.M_ras[2][0], MRI.M_ras[2][1], MRI.M_ras[2][2], MRI.M_ras[2][3]));
}

function dobj(data, array_parse, dataSize, numElements) {
	this.data			= [];
	this._dataPointer	= 0;
	this._sizeofChunk	= 1;
	this._chunks		= 1;
	this._b_verbose		= false;

	// A function that 'reads' from the data stream, returning
	// an array of _chunks. If _chunkSizeOf is 1, then return
	// only the _chunk.
	this.array_parse	= null;
 
	if(typeof data 			!== 'undefined') this.data 			= data;
	if(typeof array_parse 	!== 'undefined') this.array_parse	= array_parse;
	if(typeof dataSize 		!== 'undefined') this._sizeofChunk	= dataSize;	
	if(typeof numElements   !== 'undefined') this._chunks		= numElements;
}

dobj.prototype.sizeofChunk	= function(size) {
	if(typeof size == 'undefined') return this._sizeofChunk;
	this._sizeofChunk = size;
};

dobj.prototype.dataPointer	= function(dataPointer) {
	if(typeof dataPointer == 'undefined') return this._dataPointer;
	this._dataPointer = dataPointer;
};

dobj.prototype.b_verbose	= function(verbosity) {
	if(typeof verbosity == 'undefined') return this._b_verbose;
	this._b_verbose = verbosity;
};

dobj.prototype.array_parse_set = function(array_parse, sizeofChunk) {
	this.array_parse	= array_parse;
	this._sizeofChunk	= sizeofChunk;
};

dobj.prototype.read		= function(chunks) {
	// By default, read and return a single chunk
	if(typeof chunks == 'undefined') {
		chunks = 1;
	}
	ret			= this.array_parse(this.data, this._dataPointer, chunks);
	arr_byte	= ret[0];
	if(this._b_verbose) {
		cprints(sprintf('%d', this._dataPointer), arr_byte);
	}
	this._dataPointer += this._sizeofChunk * chunks;
	if(chunks == 1) {
		return arr_byte[0];
	} else {
		return arr_byte;
	}
};


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
			MRI_UCHAR	: {value: 0, name: "uchar",	size:	1},
			MRI_INT		: {value: 1, name: "int",	size:	4},
			MRI_LONG	: {value: 2, name: "long",	size:   8},
			MRI_FLOAT	: {value: 3, name: "float", size:	4},
			MRI_SHORT	: {value: 4, name: "short", size:	2},
			MRI_BITMAP 	: {value: 5, name: "bitmap", size:  8}
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
	
	dstream			= new dobj(data, parseUInt32EndianSwappedArray, sizeof_int);
	dstream.b_verbose(false);
	console.log(dstream.read());
	console.log(dstream.read());
	console.log(dstream.read());
	console.log(dstream.read());
	console.log(dstream.read());
	console.log(dstream.read());
	console.log(dstream.read());
	dstream.array_parse_set(parseUInt16EndianSwappedArray, sizeof_short);
	console.log(dstream.read());
	dstream.array_parse_set(parseFloat32EndianSwappedArray, sizeof_float);
	console.log('%f', dstream.read());
	console.log('%f', dstream.read());
	console.log('%f', dstream.read());
	
	MRI.version		= parseUInt32EndianSwapped(data, dp(sizeof_int));
	MRI.ndim1		= parseUInt32EndianSwapped(data, dp());
	MRI.ndim2		= parseUInt32EndianSwapped(data, dp());
	MRI.ndim3		= parseUInt32EndianSwapped(data, dp());
	MRI.nframes		= parseUInt32EndianSwapped(data, dp());
	MRI.type		= parseUInt32EndianSwapped(data, dp());
	MRI.dof			= parseUInt32EndianSwapped(data, dp());
	MRI.rasgoodflag	= parseUInt16EndianSwapped(data, dp(sizeof_short)); //dp now 30
	unused_space_size -= sizeof_short;
	
	MRI_headerPrint(MRI, 1, 0);

	if(MRI.rasgoodflag > 0) {
		// Read in voxel size and RAS matrix
		unused_space_size -= USED_SPACE_SIZE;
		MRI.v_voxelsize[0]	= parseFloat32EndianSwapped(data, dp(sizeof_float));
		MRI.v_voxelsize[1]	= parseFloat32EndianSwapped(data, dp());
		MRI.v_voxelsize[2] 	= parseFloat32EndianSwapped(data, dp());
		
		// X
		MRI.M_ras[0][0]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[1][0]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[2][0]		= parseFloat32EndianSwapped(data, dp());

		// Y
		MRI.M_ras[0][1]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[1][1]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[2][1]		= parseFloat32EndianSwapped(data, dp());
		
		// Z
		MRI.M_ras[0][2]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[1][2]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[2][2]		= parseFloat32EndianSwapped(data, dp());

		// C
		MRI.M_ras[0][3]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[1][3]		= parseFloat32EndianSwapped(data, dp());
		MRI.M_ras[2][3]		= parseFloat32EndianSwapped(data, dp()); //dp = 90

		MRI_voxelSizesPrint(MRI);
		MRI_rasMatrixPrint(MRI);
	}
	cprintf('unused space size', unused_space_size);
	dp(sizeof_char, unused_space_size);
	var volsize	= MRI.ndim1 * MRI.ndim2 * MRI.ndim3;
	
	var MRIdata;
	switch(MRI.type) {
	case MRItype.MRI_UCHAR.value:
		MRIdata		= MRItype.MRI_UCHAR;
		console.log('Reading UCHAR vals: %d\n', volsize);
		a_ret		= parseUChar8Array(data, dp(sizeof_char, volsize), volsize);
		MRI.v_data	= a_ret[0];
		break;
	case MRItype.MRI_INT.value:
		MRIdata		= MRItype.MRI_INT;
		console.log('Reading INT vals: %d\n', volsize);
		a_ret		= parseUInt32EndianSwappedArray(data, pointer, volsize);
		MRI.v_data	= a_ret[0];
		break;
	}
	
	// Now for the final MRI parameters at the end of the data stream:
	pointer			= 284 + volsize*MRIdata.size;
	console.log('reading final mr_params...\n');
	MRI.Tr	 		= parseFloat32EndianSwapped(data, dp(sizeof_float));
	MRI.flipangle	= parseFloat32EndianSwapped(data, dp());
	MRI.Te			= parseFloat32EndianSwapped(data, dp());
	MRI.Ti			= parseFloat32EndianSwapped(data, dp());
	MRI_headerPrint(MRI, 0, 1);
	
	stats_determine(MRI.v_data);
	return MRI;
}




// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserMGZ', X.parserMGZ);
goog.exportSymbol('X.parserMGZ.prototype.parse', X.parserMGZ.prototype.parse);

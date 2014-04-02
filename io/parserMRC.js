/*
*Parser for MRC files
*
*/

// provides
goog.provide('X.parserMRC');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.vec.Mat3');
goog.require('goog.vec.Mat4');
goog.require('Zlib.Gunzip');

/**
 * Create a parser for .mrc files.
 *
 * @constructor
 * @extends X.parser
 */
X.parserMRC = function() {

	//
	// call the standard constructor of X.parser
	goog.base(this);

	//
	// class attributes

	/*
	 * @inheritDoc
	 * @const
	*/
	this._classname = 'parserMRC';
};
// inhert from X.parser
goog.inherits(X.parserMRC, X.parser);

/**
 * @inheritDoc
 */
X.parserMRC.prototype.parse = function(container, object, data, flag) {
	
	X.TIMER(this._classname + '.parse');

	var _data = data;

	// parse the byte stream
	var MRI = this.parseStream(_data);

	// min and max intensities
	var min = MRI.min;
	var max = MRI.max;

	//get dimsensions
	var _dimensions = [MRI.nx, MRI.ny, MRI.nz];
	object._dimensions = _dimensions

	//get pixel spacing = xlen/mx
	var spacingX = MRI.xlen / MRI.mx;
	var spacingY = MRI.ylen / MRI.my;
	var spacingZ = MRI.zlen / MRI.mz;
	object._spacing = [ spacingX, spacingY, spacingZ ];

	// attach the scalar range to the volume
	object._min = object._windowLow = min;
	object._max = object._windowHigh = max;
	
	// set the default threshold
	if (object._lowerThreshold == -Infinity) {
		object._lowerThreshold = min;
	}
	if (object._upperThreshold == Infinity) {
		object._upperThreshold = max;
	}
	
	// Create IJKtoXYZ matris
	var IJKToRAS = goog.vec.Mat4.createFloat32();
	goog.vec.Mat4.setRowValues(IJKToRAS,
		3,
		0,
		0,
		0,
		1);
			
	// fill in IJKToRas
	
	goog.vec.Mat4.setRowValues(IJKToRAS, 0, -1, 0, 0, MRI.nx);
	goog.vec.Mat4.setRowValues(IJKToRAS, 1, 0, 0, -1, MRI.ny);
	goog.vec.Mat4.setRowValues(IJKToRAS, 2, 0, -1, 0, MRI.nz);
	
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
	var _dims = [MRI.nx, MRI.ny, MRI.nz];
	var _rasBB = X.parser.computeRASBBox(IJKToRAS, _dims);
	
	// grab the RAS dimensions
	MRI.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
	MRI.RASDimensions = [_rasBB[1] + _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];
	
	// grab the RAS Origin
	MRI.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];
	
	//grab the IJK dimensions
	object._dimensions = _dims;
	
	// create the object
	object.create_(MRI);
	
	// re-slice the data according each direction.
	object._image = this.reslice(object);

	X.TIMERSTOP(this._classname + '.parse');

	// the object should be set up here, so let's fire a modified event
	var modifiedEvent = new X.event.ModifiedEvent();
	modifiedEvent._object = object;
	modifiedEvent._container = container;
	this.dispatchEvent(modifiedEvent);

};

/**
 *Parse the data stream following the MRC file format
 *File format specifications can be found at http://bio3d.colorado.edu/imod/doc/mrc_format.txt
 *
 * @param {!ArrayBuffer} data The data stream
 * @return {Object} the MRI structure which holds all parsed information
 */
X.parserMRC.prototype.parseStream = function(data) {

	this._data = data;

	var MRI = {
		nx: 0, //Number of Columns
		ny: 0, //Number of Rows
		nz: 0, //Number of Sections
		mode: 0, //Type of pixel in image. Values used by IMOD
		nxstart: 0, //Startin poin to sub image (not used in IMOD)
		nystart: 0,
		nzstart: 0,
		mx: 0, //Grid size in X, Y, Z
		my: 0,
		mz: 0,
		xlen: 0, //Cell size; pixel spacing = xlen/mx...
		ylen: 0,
		zlen: 0,
		alpha: 0, //cell angles - ignored by IMOD
		beta: 0,
		gamma: 0,
		mapc: 0, //map column
		mapr: 0, //map row
		maps: 0, //map section
		amin: 0, //Minimum pixel value
		amax: 0, //Maximum pixel value
		amean: 0, //mean pixel value
		ispg: 0, //space group numbe (ignored by IMOD0
		next: 0, //number of bytes in extended header
		creatid: 0, //is 0 
		extra: null, 
		nint: 0, // number of intergers or bytes per section
		nreal: 0, // Number of reals per section
		extra: null,
		imodStamp: 0, //1146047817 = file created by IMOD
		imodFlags: 0, //Bit flags
		idtype: 0,
		lens: 0,
		nd1: 0,
		nd2: 0,
		vd1: 0,
		vd2: 0,
		tiltangles: null,
		xorg: 0, //Orgin of the image
		yorg: 0,
		zorg: 0,
		cmap: 0, //Contains "MAP "
		stamp: 0, //Frist two bytes = 17 17 for bin-endian or 68 and 65 for littl-edian
		rms: 0, //RMS deviation of densitites from mean density
		nlabl: 0, //number of lables with useful data
		data: null, //10 lables of 80 characters
		min: Infinity,
		max: -Infinity,
		mean: 0,
		space: null,
		spaceorientation: null,
		rasspaceorientation: null,
		orientation: null,
		normcosine: null
	};		
	
	this.jumpTo(parseInt(0, 10));
	// Reading the data. Names are the names used in C code.
	MRI.nx = this.scan('sint');
	MRI.ny = this.scan('sint');
	MRI.nz = this.scan('sint');
	MRI.mode = this.scan('sint');

	// size of the image
	var volsize = MRI.nx * MRI.ny * MRI.nz ;

	// Read for the type of pixels
	this.jumpTo(parseInt(1024, 10));
	switch (MRI.mode) {
	case 0:
		MRI.data = this.scan('schar', volsize);
		break;
	case 1:
		MRI.data = this.scan('sshort', volsize);
		break;
	case 2:
		MRI.data = this.scan('float', volsize);
		break;
	case 3:
		MRI.data = this.scan('uint', volsize);
		break;
	case 4:
		MRI.data = this.scan('double', volsize);
		break;
	case 6:
		MRI.data = this.scan('ushort', volsize);
		break;
	case 16:
		MRI.data = this.scan('uchar', volsize);
		break;

	default:
		throw new Error('Unsupported MRC data type: ' +MRI.mode);
	}

	this.jumpTo(parseInt(28, 10));

	MRI.mx = this.scan('sint');
	MRI.my = this.scan('sint');
	MRI.mz = this.scan('sint');
	
	// pixel spacing = xlem/mx
	MRI.xlen = this.scan('float');
	MRI.ylen = this.scan('float');
	MRI.zlen = this.scan('float');
	MRI.alpha = this.scan('float');
	MRI.beta = this.scan('float');
	MRI.gamma = this.scan('float');
	MRI.mapc = this.scan('sint');
	MRI.mapr = this.scan('sint');
	MRI.maps = this.scan('sint');
	MRI.amin = this.scan('float');
	MRI.amax = this.scan('float');
	MRI.amean = this.scan('float');
	MRI.ispeg = this.scan('sint');
	MRI.next = this.scan('sint');
	MRI.creatid = this.scan('short');
	//Not sure what to do with the extra data, says 30 for size
	MRI.nint = this.scan('short');
	MRI.nreal = this.scan('short');
	//Need to figure out extra data, 20 for size
	MRI.imodStamp = this.scan('sint');
	MRI.imodFLags = this.scan('sint');
	MRI.idtype = this.scan('short');
	MRI.lens = this.scan('short');
	MRI.nd1 = this.scan('short');
	MRI.nd2 = this.scan('short');
	MRI.vd1 = this.scan('short');
	MRI.vd2 = this.scan('short');
	
	// loop this around (6 different ones)
	MRI.tiltangles = this.scan('float',6);

	this.jumpTo(parseInt(196, 10));

	MRI.xorg = this.scan('float');
	MRI.yorg = this.scan('float');
	MRI.zorg = this.scan('float');
	
	this.jumpTo(parseInt(216, 10));

	MRI.rms = this.scan('float');
	
	MRI.nlabl = this.scan('sint');

	// 10 of 80 characters
	MRI.lables = this.scan('schar', 10);

	//Dealing with extended header
	if (MRI.next != 0) {
		this.jumpTo(parseInt(MRI.next+1024, 10))
		switch (MRI.mode) {
		case 0:
			MRI.data = this.scan('schar', volsize);
			break;
		case 1:
			MRI.data = this.scan('sshort', volsize);
			break;
		case 2:
			MRI.data = this.scan('float', volsize);
			break;
		case 3:
			MRI.data = this.scan('uint', volsize);
			break;
		case 4:
			MRI.data = this.scan('double', volsize);
			break;
		case 6:
			MRI.data = this.scan('ushort', volsize);
			break;
		case 16:
			MRI.data = this.scan('uchar', volsize);
			break;

		default:
			throw new Error('Unsupported MRC data type: ' +MRI.mode);
		};
	}
		

	// minimum, maximum, mean intensities
	// centered on the mean for best viewing ability
	if (MRI.amean - (MRI.amax - MRI.amean) < 0) {	
		MRI.min = MRI.amin;
		MRI.max = MRI.amean + (MRI.amean - MRI.amin);
	}
	else {
		MRI.min = MRI.amean - (MRI.amax - MRI.amean);
		MRI.max = MRI.amax
	}

	return MRI;

};

// export symbols (required fro advanced compilatoin)
goog.exportSymbol('X.parserMRC', X.parserMRC);
goog.exportSymbol('X.parserMRC.prototype.parse', X.parserMRC.prototype.parse);



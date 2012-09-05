/*
 * Zhizhong Liu <zhizhong.liu@loni.ucla.edu>
 * UCLA Laboratory of Neuro Imaging
 * http://www.loni.ucla.edu
 * 
 * Based on https://github.com/xtk/X/blob/master/io/parserNII.js
 * Under MIT License: http://www.opensource.org/licenses/mit-license.php
 */

// provides
goog.provide('X.parserIMG');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.parserHelper');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');

/**
 * Create a parser for .img files.
 *
 * @constructor
 * @extends X.parser
 */
X.parserIMG = function() {

	//
	// call the standard constructor of X.parser
	goog.base(this);

	//
	// class attributes

	/**
	 * @inheritDoc
	 * @const
	 */
	this._classname = 'parserIMG';

};
// inherit from X.parser
goog.inherits(X.parserIMG, X.parser);

/**
 * Parse header and data files and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.base} container A container which holds the loaded data. This can
 *          be an X.object as well.
 * @param {!X.object} object The object to configure.
 * @param {!ArrayBuffer} hdrdata The header (hdr) to parse.
 * @param {!ArrayBuffer} data The data (img) to parse.
 * @param {*} flag An additional flag.
 * @throws {Error} An exception if something goes wrong.
 */
X.parserIMG.prototype.parse = function(container, object, hdrdata, data, flag) {

	X.TIMER(this._classname + '.parse');
  
	var _data = data;

	if (flag) {
		// we need to decompress the datastream

		// here we start the unzipping and get a typed Uint8Array back
		_data = new JXG.Util.Unzip(new Uint8Array(data)).unzip();

		// .. and use the underlying array buffer
		_data = _data.buffer;
	}

	// check if this data is compressed, then this int != 348
	var sizeof_hdr = new Uint32Array(hdrdata, 0, 1)[0];

	if (sizeof_hdr != 348) {
		// this is big endian
		this._littleEndian = false;
	}

	var MRI = this.parseStream(hdrdata, _data);

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
	
	X.TIMERSTOP(this._classname + '.parse');
	
	this.reslice(object, MRI);

	// the object should be set up here, so let's fire a modified event
	var modifiedEvent = new X.event.ModifiedEvent();
	modifiedEvent._object = object;
	modifiedEvent._container = container;
	this.dispatchEvent(modifiedEvent);

};

/**
 * Parse the data stream according to the .img file format and return an
 * MRI structure which holds all parsed information.
 *
 * @param {!ArrayBuffer} hdrdata The header stream.
 * @param {!ArrayBuffer} data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserIMG.prototype.parseStream = function(hdrdata, data) {

	var MRI = {
		dim : [], // *!< Data array dimensions.*/ /* short dim[8]; */
		datatype : 0, // *!< Defines data type! */ /* short datatype; */
		pixdim : [], // *!< Grid spacings. */ /* float pixdim[8]; */
		data : []
	};
	
	// read header first
	this._data = hdrdata;
	
	this.jumpTo(40);
	MRI.dim = this.scan('ushort', 8);
	
	this.jumpTo(70);
	MRI.datatype = this.scan('ushort');
	
	this.jumpTo(76);
	MRI.pixdim = this.scan('float', 8);
	
	var volsize = MRI.dim[1] * MRI.dim[2] * MRI.dim[3];

	// window.console.log("MRI.datatype " + MRI.datatype);
	// window.console.log(MRI.dim[1] + "x" + MRI.dim[2] + "x" + MRI.dim[3]);
	// window.console.log(MRI.pixdim[1] + "x" + MRI.pixdim[2] + "x" + MRI.pixdim[3]);

	// read data
	this._data = data;
	this.jumpTo(0);
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

		default:
			window.console.log('Unsupported IMG data type: ' + MRI.datatype);
			throw new Error('Unsupported IMG data type: ' + MRI.datatype);
	}

	// get the min and max intensities
	var min_max = this.arrayMinMax(MRI.data);
	MRI.min = min_max[0];
	MRI.max = min_max[1];

	return MRI;

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserIMG', X.parserIMG);
goog.exportSymbol('X.parserIMG.prototype.parse', X.parserIMG.prototype.parse);

/*
 * Zhizhong Liu <zhizhong.liu@loni.ucla.edu>
 * UCLA Laboratory of Neuro Imaging
 * http://loni.ucla.edu
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
 * @inheritDoc
 */
X.parserIMG.prototype.parse = function(container, object, hdrdata, data, flag) {

	var b_zipped = flag;

	// the position in the file
	var position = 0;

	var _data = 0;
	var _hdrdata = 0;

	if (b_zipped) {
		// we need to decompress the datastream
		_data = new JXG.Util.Unzip(data.substr(position)).unzip()[0][0];
		_hdrdata = new JXG.Util.Unzip(hdrdata.substr(position)).unzip()[0][0];
	} else {
		// we can use the data directly
		_data = data.substr(position);
		_hdrdata = hdrdata.substr(position);
	}

	var MRI = this.parseStream(_hdrdata, _data);

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
 * Parse the data stream according to the .img file format and return an
 * MRI structure which holds all parsed information.
 *
 * @param {!String} data The data stream.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserIMG.prototype.parseStream = function(hdrdata, data) {

	var MRI = {
		dim : [], // *!< Data array dimensions.*/ /* short dim[8]; */
		datatype : 0, // *!< Defines data type! */ /* short datatype; */
		pixdim : [], // *!< Grid spacings. */ /* float pixdim[8]; */
		data : []
	};
	var MRItype = {
		MRI_UCHAR : {
			value : 0,
			name : "uchar",
			size : 1,
			func_arrayRead : this.parseUChar8ArrayEndian.bind(this)
		},
		MRI_SSHORT : {
			value : 3,
			name : "short",
			size : 2,
			func_arrayRead : this.parseSInt16ArrayEndian.bind(this)
		},
		MRI_SINT : {
			value : 5,
			name : "sint",
			size : 4,
			func_arrayRead : this.parseSInt32ArrayEndian.bind(this)
		},
		MRI_FLOAT : {
			value : 6,
			name : "float",
			size : 4,
			func_arrayRead : this.parseFloat32ArrayEndian.bind(this)
		}
	};
	// syslog('Reading .img header');
	var dataptr = new X.parserHelper(hdrdata);

	var bigEndian = true;

	dataptr.setParseFunction(this.parseUInt32Array.bind(this), dataptr._sizeOfInt);
	if (dataptr.read() == 348) {
		dataptr.setBigEndian(true);
	} else {
		dataptr.jumpTo(0);
		dataptr.setParseFunction(this.parseUInt32EndianSwappedArray.bind(this), dataptr._sizeOfInt);
		if (dataptr.read() == 348) {
			bigEndian = false;
			dataptr.setBigEndian(false);
		} else {
			window.console.log('Invalid IMG header: sizeof_hdr is not 348');
			throw new Error('Invalid IMG header: sizeof_hdr is not 348');
		} 
	}
	
	dataptr.jumpTo(40);
	dataptr.setParseFunction(this.parseUInt16ArrayEndian.bind(this), dataptr._sizeOfShort);
	MRI.dim = dataptr.read(8);
	var volsize = MRI.dim[1] * MRI.dim[2] * MRI.dim[3];

	dataptr.jumpTo(70);
	MRI.datatype = dataptr.read();
	
	dataptr.jumpTo(76);
	dataptr.setParseFunction(this.parseFloat32ArrayEndian.bind(this), dataptr._sizeOfFloat);
	MRI.pixdim = dataptr.read(8);

	window.console.log("MRI.datatype " + MRI.datatype);
	window.console.log(MRI.dim[1] + "x" + MRI.dim[2] + "x" + MRI.dim[3]);
	window.console.log(MRI.pixdim[1] + "x" + MRI.pixdim[2] + "x" + MRI.pixdim[3]);

	switch (MRI.datatype) {
		case 2:
			// unsigned char
			MRI.MRIdatatype = MRItype.MRI_UCHAR;
			break;
		case 4:
			// signed short
			MRI.MRIdatatype = MRItype.MRI_SSHORT;
			break;
		case 8:
			// signed int
			MRI.MRIdatatype = MRItype.MRI_SINT;
			break;
		case 16:
			// float
			MRI.MRIdatatype = MRItype.MRI_FLOAT;
			break;

		default:
			window.console.log('Unsupported IMG data type: ' + MRI.datatype);
			throw new Error('Unsupported IMG data type: ' + MRI.datatype);
	}

	//
	// we can grab the min max values like this and skip the stats further down
	//
	var a_ret = MRI.MRIdatatype.func_arrayRead(data, 0, volsize, bigEndian);
	MRI.data = a_ret[0];
	MRI.min = a_ret[2];
	MRI.max = a_ret[1];

	return MRI;

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserIMG', X.parserIMG);
goog.exportSymbol('X.parserIMG.prototype.parse', X.parserIMG.prototype.parse);

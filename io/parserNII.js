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
		dim : [], // *!< Data array dimensions.*/ /* short dim[8]; */
		datatype : 0, // *!< Defines data type! */ /* short datatype; */
		pixdim : [], // *!< Grid spacings. */ /* float pixdim[8]; */
		vox_offset : 0, // *!< Offset into .nii file */ /* float vox_offset; */
		data : []
	};
	var MRItype = {
		MRI_UCHAR : {
			value : 0,
			name : "uchar",
			size : 1,
			func_arrayRead : this.parseUChar8ArrayEndian.bind(this)
		},
		MRI_SCHAR : {
			value : 1,
			name : "schar",
			size : 1,
			func_arrayRead : this.parseSChar8ArrayEndian.bind(this)
		},
		MRI_USHORT : {
			value : 2,
			name : "ushort",
			size : 2,
			func_arrayRead : this.parseUInt16ArrayEndian.bind(this)
		},
		MRI_SSHORT : {
			value : 3,
			name : "short",
			size : 2,
			func_arrayRead : this.parseSInt16ArrayEndian.bind(this)
		},
		MRI_UINT : {
			value : 4,
			name : "uint",
			size : 4,
			func_arrayRead : this.parseUInt32ArrayEndian.bind(this)
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
	// syslog('Reading .nii/.nii.gz header');
	var dataptr = new X.parserHelper(data);

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
			window.console.log('Invalid NII header: sizeof_hdr is not 348');
			throw new Error('Invalid NII header: sizeof_hdr is not 348');
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
	MRI.vox_offset = dataptr.read(1);

	// jump to vox_offset which is very important since the
	// header can be shorter as the usual 348 bytes
	dataptr.jumpTo(parseInt(MRI.vox_offset, 10));

	window.console.log("MRI.vox_offset " + parseInt(MRI.vox_offset, 10));
	window.console.log("MRI.datatype " + MRI.datatype);
	window.console.log(MRI.dim[1] + "x" + MRI.dim[2] + "x" + MRI.dim[3]);

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
		case 256:
			// signed char
			MRI.MRIdatatype = MRItype.MRI_SCHAR;
			break;
		case 512:
			// unsigned short
			MRI.MRIdatatype = MRItype.MRI_USHORT;
			break;
		case 768:
			// unsigned int
			MRI.MRIdatatype = MRItype.MRI_UINT;
			break;

		default:
			throw new Error('Unsupported NII data type: ' + MRI.datatype);
			window.console.log('Unsupported NII data type: ' + MRI.datatype);
	}

	//
	// we can grab the min max values like this and skip the stats further down
	//
	var a_ret = MRI.MRIdatatype.func_arrayRead(data, dataptr._dataPointer, volsize, bigEndian);
	MRI.data = a_ret[0];
	MRI.min = a_ret[2];
	MRI.max = a_ret[1];

	return MRI;

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNII', X.parserNII);
goog.exportSymbol('X.parserNII.prototype.parse', X.parserNII.prototype.parse);

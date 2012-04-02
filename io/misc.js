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
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

goog.provide('X.misc');

// requires
goog.require('X.base');
goog.require('X.event');


stats = function(a){
	var r = {
			mean: 		0, 
			variance: 	0, 
			deviation: 	0, 
			prod: 		1, 
			sum: 		0, 
			min: 		0,
			minIndex:	0,
			max: 		0,
			maxIndex:	0
			};
	var t = a.length;
	for(var m = 0, p = 1, s = 0, l = t; l--; l>=0) {
		s += a[l];
		p *= a[l];
		if(r.min >= a[l]) {
			r.min 		= a[l]; 
			r.minIndex 	= l;
		}
		if(r.max <= a[l]) {
			r.max 		= a[l];
			r.maxIndex 	= l;
		}
	};
	r.prod 	= p;
	r.sum	= s;
	for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
	return r.deviation = Math.sqrt(r.variance = s / t), r;
}

function cprintd(str_left, val) {
	console.log(sprintf('%20s%25s\n', str_left, sprintf('[ %d ]', val)));
}

function cprintf(str_left, f_val) {
	console.log(sprintf('%20s%25s\n', str_left, sprintf('[ %19.5f ]', f_val)));
}

function cprints(str_left, str_right) {
	console.log(sprintf('%20s%25s\n', str_left, sprintf('[ %s ]', str_right)));
}

function stats_determine(a) {
	var astats				= stats(a);
	
	cprintd('Size', 		a.length);
	cprints('Min@(index)',	sprintf('%10.5f (%d)', astats.min, astats.minIndex));
	cprints('Max@(index)',	sprintf('%10.5f (%d)', astats.max, astats.maxIndex));
	cprintf('Mean',			astats.mean);
	cprintf('Std',			astats.deviation);
	cprintf('Sum',			astats.sum);
	cprintf('Prod',			astats.prod);
	cprintf('Var',			astats.variance);
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
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends X.base
 */
X.parser = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'parser';
  
};
// inherit from X.base
goog.inherits(X.parser, X.base);

/**
 * Parse data and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.object} object The object to configure.
 * @param {!String} data The data to parse.
 * @throws {Error} An exception if something goes wrong.
 */
X.parser.prototype.parse = function(object, data) {

  throw new Error('The function parse() should be overloaded.');
  
};


// TODO acknowledge the FNNDSC webGL viewer

X.parser.prototype.parseString = function(data, offset, length) {

  return data.substr(offset, length);
  
};


X.parser.prototype.parseFloat32 = function(data, offset) {

  var b3 = this.parseUChar8(data, offset), b2 = this.parseUChar8(data,
      offset + 1), b1 = this.parseUChar8(data, offset + 2), b0 = this
      .parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};

X.parser.prototype.parseFloat32EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};

X.parser.prototype.parseFloat32Array = function(data, offset, elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseFloat32(data, offset + (i * 4));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseUInt32 = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3);
  
  return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
};

X.parser.prototype.parseUInt32EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3);
  
  return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
};


X.parser.prototype.parseUInt24EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2);
  

  return ((b0 << 16) + (b1 << 8) + (b2)) & 0x00FFFFFF;
};

X.parser.prototype.parseUInt16 = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1);
  
  return (b1 << 8) + b0;
  
};

X.parser.prototype.parseUInt16Array = function(data, offset, elements) {

  var arr = new Array();
  

  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseUInt16(data, offset + (i * 2));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};

X.parser.prototype.parseSChar8 = function(data, offset) {

  var b = this.parseUChar8(data, offset);
  return b > 127 ? b - 256 : b;
  
};

X.parser.prototype.parseUChar8 = function(data, offset) {

  return data.charCodeAt(offset) & 0xff;
};

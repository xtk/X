/*
 * ${HEADER}
 */

// provides
goog.provide('X.parser');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.exception');



/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends {X.base}
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
  this._className = 'parser';
  
};
// inherit from X.base
goog.inherits(X.parser, X.base);


/**
 * Supported data types by extension.
 * 
 * @enum {string}
 */
X.parser.extensions = {
  // support for the following extensions
  STL: 'STL',
  VTK: 'VTK',
  TRK: 'TRK'
};


/**
 * Parse data and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.object} object The object to configure.
 * @param {!String} data The data to parse.
 * @throws {X.exception} An exception if something goes wrong.
 */
X.parser.prototype.parse = function(object, data) {

  throw new X.exception('Fatal: The function parse() should be overloaded!');
  
};


// TODO acknowledge the FNNDSC webGL viewer
X.parser.prototype.parseFloat32 = function(data, offset) {

  var b3 = parseUChar8(data, offset), b2 = parseUChar8(data, offset + 1), b1 = parseUChar8(
      data, offset + 2), b0 = parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};

X.parser.prototype.parseFloat32EndianSwapped = function(data, offset) {

  var b0 = parseUChar8(data, offset), b1 = parseUChar8(data, offset + 1), b2 = parseUChar8(
      data, offset + 2), b3 = parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};

X.parser.prototype.parseFloat32Array = function(data, offset, elements) {

  var arr = new Array();
  var i;
  for (i = 0; i < elements; i++) {
    var val = parseFloat32(data, offset + (i * 4));
    arr[i] = val;
  }
  
  return arr;
};


X.parser.prototype.parseUInt32 = function(data, offset) {

  var b0 = parseUChar8(data, offset), b1 = parseUChar8(data, offset + 1), b2 = parseUChar8(
      data, offset + 2), b3 = parseUChar8(data, offset + 3);
  
  return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
};

X.parser.prototype.parseUInt32EndianSwapped = function(data, offset) {

  var b0 = parseUChar8(data, offset), b1 = parseUChar8(data, offset + 1), b2 = parseUChar8(
      data, offset + 2), b3 = parseUChar8(data, offset + 3);
  
  return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
};


X.parser.prototype.parseUInt24EndianSwapped = function(data, offset) {

  var b0 = parseUChar8(data, offset), b1 = parseUChar8(data, offset + 1), b2 = parseUChar8(
      data, offset + 2);
  

  return ((b0 << 16) + (b1 << 8) + (b2)) & 0x00FFFFFF;
};

X.parser.prototype.parseUInt16 = function(data, offset) {

  var b0 = parseUChar8(data, offset), b1 = parseUChar8(data, offset + 1);
  
  return (b1 << 8) + b0;
  
};

X.parser.prototype.parseUInt16Array = function(data, offset, elements) {

  var arr = new Array();
  var i;
  for (i = 0; i < elements; i++) {
    var val = parseUInt16(data, offset + (i * 2));
    arr[i] = val;
  }
  
  return arr;
};

X.parser.prototype.parseSChar8 = function(data, offset) {

  var b = parseUChar8(data, offset);
  return b > 127 ? b - 256 : b;
  
};

X.parser.prototype.parseUChar8 = function(data, offset) {

  return data.charCodeAt(offset) & 0xff;
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parser', X.parser);
goog.exportSymbol('X.parser.extensions', X.parser.extensions);
goog.exportSymbol('X.parser.prototype.parse', X.parser.prototype.parse);

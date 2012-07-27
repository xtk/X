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

// provides
goog.provide('X.parserSTL');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the .STL format. ASCII or binary format is supported.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserSTL = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserSTL';

};
// inherit from X.parser
goog.inherits(X.parserSTL, X.parser);


/**
 * @inheritDoc
 */
X.parserSTL.prototype.parse = function(container, object, data, flag) {

  // the size which can be either number of lines for ASCII data
  // or the number of triangles for binary data
  var _size = 0;
  
  var _parseFunction = null;
  
  // check if this is an ascii STL file or a binary one
  if ( data.substr(0, 5) == 'solid' ) {

    // this is an ascii STL file
    
    data = data.split('\n');

    // get the number of lines
    _size = data.length;

    // set the parse function for ASCII
    _parseFunction = this.parseLine.bind(this);

  } else {

    // this is a binary STL file (http://en.wikipedia.org/wiki/STL_(file_format))

    // A binary STL file has an 80 character header (which is generally
    // ignored, but which should never begin with 'solid' because that will
    // lead most software to assume that this is an ASCII STL file).
    var header_data = data.slice(0, 80);

    // Following the header is a 4 byte unsigned integer indicating
    // the number of triangular facets in the file.
    _size = this.parseUInt32(data, 80);

    // set the parse function for binary
    _parseFunction = this.parseBytes.bind(this);

  }

  var p = object._points;
  var n = object._normals;

  //
  // THE LOOP
  //
  // This uses an optimized loop.
  //

  //
  // This one is shorter but Fast Duff's Device is slightly faster on average.
  //
  // var i = numberOfLines;
  // do {
  // i--;
  //    
  // this.parseLine_(p, n, dataAsArray[i]);
  //    
  // } while (i > 0);

  /*
   * Fast Duff's Device @author Miller Medeiros <http://millermedeiros.com>
   * 
   * @version 0.3 (2010/08/25)
   */
  var i = 0;
  var n2 = _size % 8;
  while (n2--) {
    _parseFunction(p, n, data, i);
    i++;
  }

  n2 = (_size * 0.125) ^ 0;
  while (n2--) {
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
    _parseFunction(p, n, data, i);
    i++;
  }

  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);

};


/**
 * Parses a line of .STL data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!string} data The data to parse.
 * @param {!number} index The index of the current line.
 * @protected
 */
X.parserSTL.prototype.parseLine = function(p, n, data, index) {

  // grab the current line
  var _data = data[index];

  // trim the line
  var line = _data.replace(/^\s+|\s+$/g, '');

  // split to array
  var lineFields = line.split(' ');

  if ( lineFields[0] == 'vertex' ) {

    // add point
    var x = parseFloat(lineFields[1]);
    var y = parseFloat(lineFields[2]);
    var z = parseFloat(lineFields[3]);
    p.add(x, y, z);

  } else if ( lineFields[0] == 'facet' ) {

    // add normals
    var x = parseFloat(lineFields[2]);
    var y = parseFloat(lineFields[3]);
    var z = parseFloat(lineFields[4]);
    n.add(x, y, z);
    n.add(x, y, z);
    n.add(x, y, z);

  }

};


/**
 * Parses a triangle of .STL data and modifies the given X.triplets containers.
 * Original embodiment by Matthew Goodman (meawoppl@gmail.com)
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!string} data The data to parse.
 * @param {!number} index The index of the current triangle.
 */
X.parserSTL.prototype.parseBytes = function(p, n, data, index) {

  // each triangle consists of 50 bytes to parse
  // so incorporate it in the individual offset
  // and also add the 84 bytes from the header
  var offset = 84 + index * 50;
  
  // foreach triangle
  // REAL32[3] â Normal vector
  normal = this.parseFloat32Array(data, offset, 3)[0];
  offset += 3 * 4;

  // REAL32[3] â Vertex 1
  v1 = this.parseFloat32Array(data, offset, 3)[0];
  offset += 3 * 4;

  // REAL32[3] â Vertex 2
  v2 = this.parseFloat32Array(data, offset, 3)[0];
  offset += 3 * 4;

  // REAL32[3] â Vertex 3
  v3 = this.parseFloat32Array(data, offset, 3)[0];
  offset += 3 * 4;

  // MRG TODO:
  // The above could probably be made faster by
  // making a single read of 12 float32 values.

  // UINT16 â Attribute byte count
  attributes = this.parseUInt16(data, offset)[0];
  offset += 2;

  // Add the vertices
  p.add(v1[0], v1[1], v1[2]);
  p.add(v2[0], v2[1], v2[2]);
  p.add(v3[0], v3[1], v3[2]);

  // Add the Normals
  n.add(normal[0], normal[1], normal[2]);
  n.add(normal[0], normal[1], normal[2]);
  n.add(normal[0], normal[1], normal[2]);

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserSTL', X.parserSTL);
goog.exportSymbol('X.parserSTL.prototype.parse', X.parserSTL.prototype.parse);

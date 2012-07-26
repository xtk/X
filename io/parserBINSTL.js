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
goog.provide('X.parserBINSTL');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the binary .STL format.
 * 
 * Original embodiment by Matthew Goodman (meawoppl@gmail.com)
 * @constructor
 * @extends X.parser
 */
X.parserBINSTL = function() {
  // call the standard constructor of X.base
  goog.base(this);
  
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserBINSTL';
  
};

// inherit from X.parser
goog.inherits(X.parserBINSTL, X.parser);

/**
 * @inheritDoc
 */
X.parserBINSTL.prototype.parse = function(container, object, data, flag) {

    var p = object._points;
    var n = object._normals;
    
    // A binary STL file has an 80 character header (which is generally ignored – 
    // but which should never begin with 'solid' because that will lead most 
    // software to assume that this is an ASCII STL file).
    var header_data = data.slice(0,80)
    
    // Following the header is a 4 byte unsigned integer indicating the number of triangular facets in the file. 
    var triangle_count = this.parseUInt32(data, 80);
    
    window.console["debug"]("triangle count:" + triangle_count);

    var i = 0;

    var normal, attributes;
    var v1, v2, v3;

    var offset = 84;

    for( i = 0; i < triangle_count; i++)
    {
	//  foreach triangle
	// REAL32[3] – Normal vector
	normal = this.parseFloat32Array(data, offset, 3)[0];
	offset += 3 * 4;

	//  REAL32[3] – Vertex 1
	v1 = this.parseFloat32Array(data, offset, 3)[0];
	offset += 3 * 4;

	//  REAL32[3] – Vertex 2
	v2 = this.parseFloat32Array(data, offset, 3)[0];
	offset += 3 * 4;

	//  REAL32[3] – Vertex 3
	v3 = this.parseFloat32Array(data, offset, 3)[0];
	offset += 3 * 4;

	// MRG TODO:
	// The above could probably be made faster by 
	// making a single read of 12 float32 values.

	//  UINT16 – Attribute byte count
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
    }
	

    //
    // LOOP THROUGH ALL LINES
    //

  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserBINSTL', X.parserSTL);
goog.exportSymbol('X.parserBINSTL.prototype.parse', X.parserSTL.prototype.parse);

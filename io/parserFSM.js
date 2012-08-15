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
 * CREDITS
 * 
 *   - the .FSM Fileparser is based on a version of Dan Ginsburg, Children's Hospital Boston (see LICENSE)
 *   
 */

// provides
goog.provide('X.parserFSM');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');



/**
 * Create a parser for the binary freesurfer meshes
 * 
 * @constructor
 * @extends X.parser
 */
X.parserFSM = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserFSM';
  
  /**
   * Here, the data stream is big endian.
   * 
   * @inheritDoc
   */
  this._littleEndian = false;
  
};
// inherit from X.parser
goog.inherits(X.parserFSM, X.parser);


/**
 * @inheritDoc
 */
X.parserFSM.prototype.parse = function(container, object, data, flag) {

  this._data = data;
  
  var p = object._points;
  var n = object._normals;
  var ind = object._pointIndices;
  
  // Go through two newlines
  var iters = 0;
  var curChar;
  do {
    curChar = this.scan('uchar');
    iters++;
  } while ((iters < 200) && (curChar != 0x0A))

  // Read one more newline
  curChar = this.scan('uchar');
  
  // get the number of vertices
  var numberOfVertices = this.scan('uint');
  
  // get the number of triangles
  var numberOfTriangles = this.scan('uint');
  
  // parse the vertex coordinates and store them in an array
  // x1,y1,z1,x2,y2,z2...
  var _vertices = this.scan('float', numberOfVertices * 3);
  
  // parse the triangle indices
  var _triangles = this.scan('uint', numberOfTriangles * 3);
  
  // .. then do the loop
  var t;
  for (t = 0; t < numberOfTriangles; t++) {
    
    var i = t * 3;
    
    // grab the three indices which define a triangle
    var index1 = _triangles[i];
    var index2 = _triangles[i + 1];
    var index3 = _triangles[i + 2];
    
    // store the ordered vertex indices
    ind.push(index1);
    ind.push(index2);
    ind.push(index3);
    
    // grab the 3 corresponding vertices
    var v1 = [_vertices[index1], _vertices[index1 + 1], _vertices[index1 + 2]];
    var v2 = [_vertices[index2], _vertices[index2 + 1], _vertices[index2 + 2]];
    var v3 = [_vertices[index3], _vertices[index3 + 1], _vertices[index3 + 2]];
    
    p.add(v1[0], v1[1], v1[2]);
    p.add(v2[0], v2[1], v2[2]);
    p.add(v3[0], v3[1], v3[2]);
    
    n.add(1, 1, 1);
    n.add(1, 1, 1);
    n.add(1, 1, 1);
    
    // normals[index1] = normals[index1].add(normal);
    
  }
  


  // .. and set the objectType to triangles
  object._type = X.displayable.types.TRIANGLES;
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserFSM', X.parserFSM);
goog.exportSymbol('X.parserFSM.prototype.parse', X.parserFSM.prototype.parse);

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
  
};
// inherit from X.parser
goog.inherits(X.parserFSM, X.parser);


/**
 * @inheritDoc
 */
X.parserFSM.prototype.parse = function(object, data) {

  var p = object._points;
  var n = object._normals;
  var ind = object._pointIndices;
  
  // in .FSM files, the points are not ordered for rendering, so we need to
  // buffer everything in X.triplets containers and then order it
  var unorderedPoints = new X.triplets();
  
  var currentOffset = 0;
  
  // parse some magic bytes
  this.parseString(data, currentOffset, 3);
  currentOffset += 3;
  
  // Go through two newlines
  var iters = 0;
  var curChar;
  do {
    curChar = this.parseUChar8(data, currentOffset++);
    iters++;
  } while ((iters < 200) && (curChar != 0x0A))

  // Read one more newline
  curChar = this.parseUChar8(data, currentOffset++);
  
  // get the number of vertices
  var numberOfVertices = this.parseUInt32EndianSwapped(data, currentOffset);
  currentOffset += 4;
  
  // get the number of triangles
  var numberOfTriangles = this.parseUInt32EndianSwapped(data, currentOffset);
  currentOffset += 4;
  
  // we count the appearance of indices to be able to average the normals
  var indexCounter = [];
  
  // parse the coordinates from the data
  var v = 0;
  for (v = 0; v < numberOfVertices; v++) {
    
    // grab 3 floats which are X,Y,Z in world coordinates
    var x = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var y = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var z = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    
    // initialize the index counter with 0
    indexCounter[v] = 0;
    
    // store the points unordered
    unorderedPoints.add(x, y, z);
    
  }
  
  // a list of triangles composed by indices
  var triangles = [];
  
  // a list of normals stored by index
  var normals = [];
  
  // parse the indices from the data
  var t;
  for (t = 0; t < numberOfTriangles; t++) {
    
    // grab the three indices which define a triangle
    var index1 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var index2 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var index3 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    
    // we count the appearance of the indices
    indexCounter[index1] += 1;
    indexCounter[index2] += 1;
    indexCounter[index3] += 1;
    
    triangles.push([index1, index2, index3]);
    normals.push(new goog.math.Vec3(0, 0, 0));
  }
  
  // compute the triangle normals using the indices
  for (t = 0; t < numberOfTriangles; t++) {
    
    var index1 = triangles[t][0];
    var index2 = triangles[t][1];
    var index3 = triangles[t][2];
    
    // create a triangle with the 3 vertices
    var v1 = unorderedPoints.get(index1);
    var v2 = unorderedPoints.get(index2);
    var v3 = unorderedPoints.get(index3);
    
    //
    // compute the normals
    var v1v = new goog.math.Vec3(v1[0], v1[1], v1[2]);
    var v2v = new goog.math.Vec3(v2[0], v2[1], v2[2]);
    var v3v = new goog.math.Vec3(v3[0], v3[1], v3[2]);
    
    var n1 = v2v.clone().subtract(v1v);
    var n2 = v3v.clone().subtract(v1v);
    
    var normal = goog.math.Vec3.cross(n1, n2).normalize();
    
    normals[index1] = normals[index1].add(normal);
    normals[index2] = normals[index2].add(normal);
    normals[index3] = normals[index3].add(normal);
    
  }
  
  // configure the points and normals for the X.object
  for (t = 0; t < numberOfTriangles; t++) {
    
    var index1 = triangles[t][0];
    var index2 = triangles[t][1];
    var index3 = triangles[t][2];
    
    // create a triangle with the 3 vertices
    var v1 = unorderedPoints.get(index1);
    var v2 = unorderedPoints.get(index2);
    var v3 = unorderedPoints.get(index3);
    
    // store the ordered vertex indices
    ind.push(index1);
    ind.push(index2);
    ind.push(index3);
    
    // store the ordered vertices
    p.add(v1[0], v1[1], v1[2]);
    p.add(v2[0], v2[1], v2[2]);
    p.add(v3[0], v3[1], v3[2]);
    
    // transform triangle normals to vertex normals
    var normal1 = normals[index1].scale(1 / indexCounter[index1]).normalize();
    var normal2 = normals[index2].scale(1 / indexCounter[index2]).normalize();
    var normal3 = normals[index3].scale(1 / indexCounter[index3]).normalize();
    
    // .. add'em
    n.add(normal1.x, normal1.y, normal1.z);
    n.add(normal2.x, normal2.y, normal2.z);
    n.add(normal3.x, normal3.y, normal3.z);
    
  }
  
  // .. and set the objectType to triangles
  object._type = X.displayable.types.TRIANGLES;
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserFSM', X.parserFSM);
goog.exportSymbol('X.parserFSM.prototype.parse', X.parserFSM.prototype.parse);

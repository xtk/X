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
goog.provide('X.parserFSM');

// requires
goog.require('X.exception');
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
  this._className = 'parserFSM';
  
};
// inherit from X.parser
goog.inherits(X.parserFSM, X.parser);


/**
 * @inheritDoc
 */
X.parserFSM.prototype.parse = function(object, data) {

  var p = object.points();
  var n = object.normals();
  
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
  
  var normalsCounter = [];
  
  var v = 0;
  for (v = 0; v < numberOfVertices; v++) {
    
    // grab 3 floats which are X,Y,Z in world coordinates
    var x = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var y = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var z = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    
    normalsCounter[v] = 0;
    
    unorderedPoints.add(x, y, z);
    
  }
  
  var normals = [];
  
  var t = 0;
  // numberOfTriangles = 100;
  for (t = 0; t < numberOfTriangles; t++) {
    
    var index1 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var index2 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    var index3 = this.parseUInt32EndianSwapped(data, currentOffset);
    currentOffset += 4;
    
    normalsCounter[index1] += 1;
    normalsCounter[index2] += 1;
    normalsCounter[index3] += 1;
    
    // create a triangle with 3 vertices
    var v1 = unorderedPoints.get(index1);
    var v2 = unorderedPoints.get(index2);
    var v3 = unorderedPoints.get(index3);
    
    // store the ordered vertices
    p.add(v1[0], v1[1], v1[2]);
    p.add(v2[0], v2[1], v2[2]);
    p.add(v3[0], v3[1], v3[2]);
    
    //
    // compute the normals
    var v1v = new goog.math.Vec3(v1[0], v1[1], v1[2]);
    var v2v = new goog.math.Vec3(v2[0], v2[1], v2[2]);
    var v3v = new goog.math.Vec3(v3[0], v3[1], v3[2]);
    
    var n1 = v2v.clone().subtract(v1v);
    var n2 = v3v.clone().subtract(v2v);
    
    // store'em
    var normal = goog.math.Vec3.cross(n1, n2).normalize();
    
    // normals.push(normal);
    // normals.push(normal);
    // normals.push(normal);
    n.add(normal.x, normal.y, normal.z);
    n.add(normal.x, normal.y, normal.z);
    n.add(normal.x, normal.y, normal.z);
    
  }
  
  // var x;
  // for (x = 0; x < normals.length; x++) {
  //    
  // normals[x][0] /= normalsCounter[x];
  // normals[x][1] /= normalsCounter[x];
  // normals[x][2] /= normalsCounter[x];
  //    
  // n.add(normals[x][0], normals[x][1], normals[x][2]);
  // }
  //  
  // for (v = 0; v < numberOfVertices; v++) {
  //    
  // var normalsCount = normalsCounter[v];
  // var normal = normals[v];
  //    
  // n.add(normal.x / normalsCount, normal.y / normalsCount, normal.z /
  // normalsCount);
  //    
  //
  // }
  
  console.log(n.length());
  console.log(p.length());
  
  // .. and set the objectType to triangles
  object.setType(X.object.types.TRIANGLES);
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserFSM', X.parserFSM);
goog.exportSymbol('X.parserFSM.prototype.parse', X.parserFSM.prototype.parse);

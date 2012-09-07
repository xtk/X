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
goog.provide('X.constructable');

// requires
goog.require('X.base');
goog.require('X.object');
goog.require('CSG');
goog.require('csgVector');
goog.require('csgVertex');
goog.require('csgPolygon');



/**
 * Injective mix-in for all constructable solids using the CSG library.
 * 
 * @constructor
 */
X.constructable = function() {

};


/**
 * Convert this X.object to a CSG object.
 * 
 * @return {!CSG} The created CSG object.
 */
X.constructable.prototype.toCSG = function() {

  var numberOfPoints = this._points.count;
  
  var polygons = [];
  
  var p = 0;
  for (p = 0; p < numberOfPoints; p = p + 3) {
    
    var point1 = this._points.get(p);
    var point2 = this._points.get(p + 1);
    var point3 = this._points.get(p + 2);
    
    var normal1 = this._normals.get(p);
    var normal2 = this._normals.get(p + 1);
    var normal3 = this._normals.get(p + 2);
    
    // get the object color
    var color = this._color;
    
    // if point colors are defined on this X.object, use'em
    if ((this._colors && this._colors.length > 0)) {
      
      // we only grab the color of the first point since CSG only supports
      // colors per triangle not per point
      color = this._colors.get(p);
      
    }
    
    //
    // create a new CSG.Polygon
    //
    
    var vertices = [];
    vertices.push(new csgVertex(point1, normal1));
    vertices.push(new csgVertex(point2, normal2));
    vertices.push(new csgVertex(point3, normal3));
    
    polygons.push(new csgPolygon(vertices, color));
    
  }
  
  //
  // create and return a new CSG object
  return CSG.fromPolygons(polygons);
  
};


/**
 * Convert a CSG object to this X.object.
 * 
 * @param {!CSG} csg The CSG object.
 * @throws {Error} An error if the given object is invalid.
 */
X.constructable.prototype.fromCSG = function(csg) {

  if (!goog.isDefAndNotNull(csg) || !(csg instanceof CSG)) {
    
    throw new Error('Invalid CSG object.');
    
  }
  
  var indexer = new X.indexer();
  
  // .. a temp. array to store the triangles using vertex indices
  var triangles = new Array();
  // grab points, normals and colors
  var csg2poly = csg.toPolygons();
  goog.array.map(csg2poly, function(p) {

    var indices = new Array();
    var ver = p.vertices();
    var shared = p.shared();
    indices = goog.array.map(ver, function(vertex) {

      vertex.color = shared;
      return indexer.add(vertex);
    });
    
    var i = 2;
    for (i = 2; i < indices.length; i++) {
      triangles.push([indices[0], indices[i - 1], indices[i]]);
    }
    
  }.bind(this));
  
  this.__vertices = goog.array.map(indexer.unique(), function(v) {

    return [v.pos().x(), v.pos().y(), v.pos().z()];
  });
  
  this.__normals = goog.array.map(indexer.unique(), function(v) {

    return [v.normal().x(), v.normal().y(), v.normal().z()];
  });
  this.__colors = goog.array.map(indexer.unique(), function(v) {

    if (!v.color) {
      
      return null;
      
    }
    return [v.color[0], v.color[1], v.color[2]];
  });
  
  //
  // setup the points, normals and colors for this X.object
  // by converting the triangles to the X.object API
  
  this._points = new X.triplets(triangles.length*9);
  this._normals = new X.triplets(triangles.length*9);
  this._colors = new X.triplets(triangles.length*9);
  
  goog.array.map(triangles, function(i) {

    // grab the three vertices of this triangle
    var i0 = i[0];
    var i1 = i[1];
    var i2 = i[2];
    
    var vertices = this.__vertices;
    var normals = this.__normals;
    var colors = this.__colors;
    
    // add the points
    this._points.add(vertices[i0][0], vertices[i0][1], vertices[i0][2]);
    this._points.add(vertices[i1][0], vertices[i1][1], vertices[i1][2]);
    this._points.add(vertices[i2][0], vertices[i2][1], vertices[i2][2]);
    
    // add the normals
    this._normals.add(normals[i0][0], normals[i0][1], normals[i0][2]);
    this._normals.add(normals[i1][0], normals[i1][1], normals[i1][2]);
    this._normals.add(normals[i2][0], normals[i2][1], normals[i2][2]);
    
    // if colors are set for this triangle, add'em
    if (colors[i0]) {
      this._colors.add(colors[i0][0], colors[i0][1], colors[i0][2]);
    }
    if (colors[i1]) {
      this._colors.add(colors[i1][0], colors[i1][1], colors[i1][2]);
    }
    if (colors[i2]) {
      this._colors.add(colors[i2][0], colors[i2][1], colors[i2][2]);
    }
    
  }.bind(this));
  
  // check if colors were actually added
  if (this._colors._dataPointer == 0) {
    
    // no colors were added, let's remove all
    this._colors = null;
    
  };
  
  // we only support CSG in TRIANGLES rendering mode
  this._type = X.displayable.types.TRIANGLES;
  
};


/**
 * Union this X.object with either another X.object or a CSG object and return a
 * new X.object.
 * 
 * @param {!CSG|X.object} object The other X.object or CSG object.
 * @return {X.object} A new X.object.
 * @throws {Error} An error if the given object is invalid.
 * @suppress {missingProperties}
 */
X.constructable.prototype.union = function(object) {

  if (!goog.isDefAndNotNull(object) ||
      (!(object instanceof CSG) && !(object instanceof X.object))) {
    
    throw new Error('Invalid object.');
    
  }
  
  var csg = object;
  
  // if we operate on another X.object, we gotta convert
  if (object instanceof X.object) {
    
    csg = csg.toCSG();
    
  }
  
  var result = new X.object();
  inject(result, new X.constructable()); // give a special injection
  result.fromCSG(this.toCSG().union(csg));
  
  return result;
  
};


/**
 * Subtract an X.object or a CSG object from this X.object and return a new
 * X.object.
 * 
 * @param {!CSG|X.object} object The object to subtract.
 * @return {X.object} A new X.object.
 * @throws {Error} An error if the given object is invalid.
 * @suppress {missingProperties}
 */
X.constructable.prototype.subtract = function(object) {

  if (!goog.isDefAndNotNull(object) ||
      (!(object instanceof CSG) && !(object instanceof X.object))) {
    
    throw new Error('Invalid object.');
    
  }
  
  var csg = object;
  
  // if we operate on another X.object, we gotta convert
  if (object instanceof X.object) {
    
    csg = csg.toCSG();
    
  }
  
  var result = new X.object();
  inject(result, new X.constructable()); // give a special injection
  result.fromCSG(this.toCSG().subtract(csg));
  
  return result;
  
};


/**
 * Intersect an X.object or a CSG object with this X.object and return a new
 * X.object.
 * 
 * @param {!CSG|X.object} object The object to use for the intersect operation.
 * @return {X.object} A new X.object.
 * @throws {Error} An error if the given object is invalid.
 * @suppress {missingProperties}
 */
X.constructable.prototype.intersect = function(object) {

  if (!goog.isDefAndNotNull(object) ||
      (!(object instanceof CSG) && !(object instanceof X.object))) {
    
    throw new Error('Invalid object.');
    
  }
  
  var csg = object;
  
  // if we operate on another X.object, we gotta convert
  if (object instanceof X.object) {
    
    csg = csg.toCSG();
    
  }
  
  var result = new X.object();
  inject(result, new X.constructable()); // give a special injection
  result.fromCSG(this.toCSG().intersect(csg));
  

  return result;
  
};


/**
 * Inverse this X.object and return a new X.object.
 * 
 * @return {X.object} A new X.object.
 * @suppress {missingProperties}
 */
X.constructable.prototype.inverse = function() {

  var result = new X.object();
  inject(result, new X.constructable()); // give a special injection
  result.fromCSG(this.toCSG().inverse());
  
  return result;
  
};

goog.exportSymbol('X.constructable', X.constructable);
goog.exportSymbol('X.constructable.prototype.intersect',
    X.constructable.prototype.intersect);
goog.exportSymbol('X.constructable.prototype.inverse',
    X.constructable.prototype.inverse);
goog.exportSymbol('X.constructable.prototype.subtract',
    X.constructable.prototype.subtract);
goog.exportSymbol('X.constructable.prototype.union',
    X.constructable.prototype.union);

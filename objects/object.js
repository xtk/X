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
goog.provide('X.object');

// requires
goog.require('CSG');
goog.require('csgVector');
goog.require('csgVertex');
goog.require('csgPolygon');

goog.require('X.base');
goog.require('X.colortable');
goog.require('X.displayable');
goog.require('X.indexer');
goog.require('X.loadable');
goog.require('X.scalars');
goog.require('X.triplets');


/**
 * Create a displayable object. Objects may have points, colors, a texture, or
 * may be loaded from a file in addition to opacity and visibility settings. If
 * another X.object is passed to this constructor, the properties from this
 * X.object are used to configure the new one.
 * 
 * @constructor
 * @param {X.object=} object Another X.object to use as a template.
 * @extends X.base
 */
X.object = function(object) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'object';
  
  /**
   * The children of this object.
   * 
   * @type {?Array}
   * @protected
   */
  this._children = null;
  
  this._hideChildren = false;
  
  if (goog.isDefAndNotNull(object)) {
    
    // copy the properties of the given object over
    this.copy_(object);
    
  }
  
  /**
   * The color table of this object.
   * 
   * @type {?X.colortable}
   * @protected
   */
  this._colortable = null;
  
  /**
   * The scalars of this object.
   * 
   * @type {?X.scalars}
   * @protected
   */
  this._scalars = null;
  
  this._dirty = true;
  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  inject(this, new X.displayable()); // this object is displayable
  
};
// inherit from X.base
goog.inherits(X.object, X.base);


/**
 * Copies the properties from a given object to this object. The texture,
 * textureCoordinateMap and the children are not copied but linked.
 * 
 * @param {!X.object} object The given object.
 * @protected
 */
X.object.prototype.copy_ = function(object) {

  this._type = object._type;
  
  // this._transform._matrix = new X.matrix(object._transform._matrix.array_);
  
  this._color = object._color.slice();
  
  this._points = new X.triplets(object._points);
  
  this._normals = new X.triplets(object._normals);
  
  this._colors = new X.triplets(object._colors);
  
  // do we need to copy this? maybe not
  this._texture = object._texture;
  this._textureCoordinateMap = object._textureCoordinateMap;
  
  if (object._file) {
    // only if a file is configured
    this._file = new X.file(new String(object._file._path).toString());
  }
  
  this._opacity = object._opacity;
  
  // 
  // children
  this.children().length = 0; // remove old ones
  var _oldChildren = object._children;
  if (_oldChildren) {
    var _oldChildrenLength = _oldChildren.length;
    var i = 0;
    for (i = 0; i < _oldChildrenLength; i++) {
      
      this['_child'] = _oldChildren[i];
      this['_newChild'] = this['_child'];
      
      // dynamic duck typing
      var classname = this['_child']._classname;
      eval("this['_newChild'] = new X." + classname + "(this['_child']);");
      
      this.children().push(this['_newChild']);
      
    }
  }
  
  this._visible = object._visible;
  
  this._pointsize = object._pointsize;
  
  this._linewidth = object._linewidth;
  
  if (object._caption) {
    // only if a caption is configured
    this._caption = new String(object._caption).toString();
  }
  
  this._magicmode = object._magicmode;
  
  this._dirty = true;
  
};


X.object.prototype.toCSG = function() {

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
    if ((this._colors.length > 0)) {
      
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


X.object.prototype.fromCSG = function(csg) {

  if (!goog.isDefAndNotNull(csg) || !(csg instanceof CSG)) {
    
    throw new Error('Invalid CSG object.');
    
  }
  
  // remove all previous points
  this._points.clear();
  this._normals.clear();
  this._colors.clear();
  
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
  
  // we only support CSG in TRIANGLES rendering mode
  this._type = X.displayable.types.TRIANGLES;
  
};


/**
 * The color table associated with this object.
 * 
 * @return {?X.colortable} The color table.
 */
X.object.prototype.__defineGetter__('colortable', function() {

  if (!this._colortable) {
    
    this._colortable = new X.colortable();
    
  }
  
  return this._colortable;
  
});


X.object.prototype.union = function(object) {

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
  result.fromCSG(this.toCSG().union(csg));
  
  return result;
  
};


X.object.prototype.subtract = function(object) {

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
  result.fromCSG(this.toCSG().subtract(csg));
  
  return result;
  
};


X.object.prototype.intersect = function(object) {

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
  result.fromCSG(this.toCSG().intersect(csg));
  
  return result;
  
};


X.object.prototype.inverse = function(object) {

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
  result.fromCSG(this.toCSG().inverse(csg));
  
  return result;
  
};



/**
 * Fire a modified event for this object.
 */
X.object.prototype.modified = function() {

  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = this;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Get the children of this object. Each object can have N children which get
 * automatically rendered when the top level object gets rendered.
 * 
 * @return {!Array} The children of this object which are again objects.
 */
X.object.prototype.children = function() {

  if (!this._children) {
    
    this._children = new Array();
    
  }
  
  return this._children;
  
};


/**
 * Check if this object has children.
 * 
 * @return {boolean} TRUE if this object has children, if not FALSE.
 */
X.object.prototype.hasChildren = function() {

  if (!this._children) {
    
    return false;
    
  }
  
  if (this._hideChildren) {
    
    return false;
    
  }
  
  return (this._children.length > 0);
  
};



/**
 * The scalars associated with this object.
 * 
 * @return {?X.scalars} The scalars.
 */
X.object.prototype.scalars = function() {

  return this._scalars;
  
};


/**
 * Set the scalars for this object.
 * 
 * @param {?X.scalars|string} scalars The new scalars or a file path.
 * @throws {Error} An error if the scalars are invalid.
 */
X.object.prototype.setScalars = function(scalars) {

  if (!goog.isDefAndNotNull(scalars)) {
    
    // null scalars are allowed
    this._scalars = null;
    return;
    
  }
  
  if (goog.isString(scalars)) {
    
    // a string has to be converted to a new X.scalars
    var scalarsFile = scalars;
    scalars = new X.scalars();
    scalars._file = new X.file(scalarsFile);
    
  }
  
  if (!(scalars instanceof X.scalars)) {
    
    throw new Error('Invalid scalars.');
    
  }
  
  this._scalars = scalars;
  
};


/**
 * Compare two X.objects by their opacity values and their distance to the
 * viewer's eye. Fully opaque objects should be always ordered before
 * transparent ones, and the transparent ones should be ordered back-to-front in
 * terms of the distance to the viewer's eye.
 * 
 * @param {X.object} object1 Object1 to compare against Object2.
 * @param {X.object} object2 Object2 to compare against Object1.
 * @return {!number} 1, if Object1 should be ordered after Object2. -1, if
 *         Object1 should be ordered before Object2
 */
X.object.OPACITY_COMPARATOR = function(object1, object2) {

  // check if we have two valid objects to compare
  if (!goog.isDefAndNotNull(object1) || !goog.isDefAndNotNull(object2) ||
      !(object1 instanceof X.object) || !(object2 instanceof X.object)) {
    
    throw new Error('Fatal: Two valid X.objects are required for comparison.');
    
  }
  
  // full opaque objects should always be rendered first
  if (object1._opacity == 1) {
    
    // always put object1 before object2
    return -1;
    
  }
  if (object2._opacity == 1) {
    
    // always put object2 before object1
    return 1;
    
  }
  
  if (goog.isDefAndNotNull(object1._distance) &&
      goog.isDefAndNotNull(object2._distance)) {
    
    // order back-to-front from the viewer's eye
    
    if (object1._distance > object2._distance) {
      
      // object2 is closer so object1 should be ordered (drawn) before object2
      return -1;
      
    } else if (object1._distance <= object2._distance) {
      
      // object 1 is closer so object1 should be ordered (drawn) after object2
      return 1;
      
    }
    

  }
  
  return 1;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.object', X.object);
goog.exportSymbol('X.object.prototype.scalars', X.object.prototype.scalars);
goog.exportSymbol('X.object.prototype.setScalars',
    X.object.prototype.setScalars);
goog.exportSymbol('X.object.prototype.intersect', X.object.prototype.intersect);
goog.exportSymbol('X.object.prototype.inverse', X.object.prototype.inverse);
goog.exportSymbol('X.object.prototype.subtract', X.object.prototype.subtract);
goog.exportSymbol('X.object.prototype.union', X.object.prototype.union);
goog.exportSymbol('X.object.prototype.children', X.object.prototype.children);
goog.exportSymbol('X.object.prototype.modified', X.object.prototype.modified);

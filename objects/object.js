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
goog.require('X.file');
goog.require('X.indexer');
goog.require('X.scalars');
goog.require('X.triplets');
goog.require('X.texture');
goog.require('X.transform');



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
   * The rendering type of this object, default is {X.object.types.TRIANGLES}.
   * 
   * @type {X.object.types}
   * @protected
   */
  this['_type'] = X.object.types.TRIANGLES;
  
  /**
   * The transform of this object.
   * 
   * @type {!X.transform}
   * @protected
   */
  this._transform = new X.transform();
  
  /**
   * The object color. By default, this is white.
   * 
   * @type {!Array}
   * @public
   */
  this['_color'] = [1, 1, 1];
  
  /**
   * The points of this object.
   * 
   * @type {!X.triplets}
   * @protected
   */
  this._points = new X.triplets();
  
  /**
   * The normals of this object.
   * 
   * @type {!X.triplets}
   * @protected
   */
  this._normals = new X.triplets();
  
  /**
   * The point colors of this object.
   * 
   * @type {!X.triplets}
   * @protected
   */
  this._colors = new X.triplets();
  
  /**
   * The texture of this object.
   * 
   * @type {?X.texture}
   * @protected
   */
  this._texture = null;
  
  /**
   * The mapping between object and texture coordinates.
   * 
   * @type {?Array}
   * @protected
   */
  this._textureCoordinateMap = null;
  
  /**
   * The file of this object.
   * 
   * @type {?X.file}
   * @protected
   */
  this._file = null;
  
  /**
   * The opacity of this object.
   * 
   * @type {number}
   * @public
   */
  this['_opacity'] = 1.0;
  
  /**
   * The children of this object.
   * 
   * @type {?Array}
   * @protected
   */
  this._children = null;
  
  this._hideChildren = false;
  
  /**
   * The visibility of this object.
   * 
   * @type {boolean}
   * @public
   */
  this['_visible'] = true;
  
  /**
   * The point size, only used in X.object.types.POINTS mode.
   * 
   * @type {number}
   * @protected
   */
  this['_pointSize'] = 1;
  
  /**
   * The line width, only used in X.object.types.LINES mode.
   * 
   * @type {number}
   * @protected
   */
  this['_lineWidth'] = 1;
  
  /**
   * The caption of this object.
   * 
   * @type {?string}
   * @protected
   */
  this['_caption'] = null;
  
  /**
   * The flag for the magic mode.
   * 
   * @type {!boolean}
   * @protected
   */
  this['_magicMode'] = false;
  
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
  
  /**
   * An array reflecting the point or vertex indices.
   * 
   * @type {!Array}
   * @protected
   */
  this._pointIndices = [];
  
  /**
   * This distance of this object to the viewer's eye.
   * 
   * @type {number}
   * @protected
   */
  this._distance = 0;
  
  this._dirty = true;
  
};
// inherit from X.base
goog.inherits(X.object, X.base);


/**
 * Different render types for an X.object.
 * 
 * @enum {string}
 */
X.object.types = {
  // the render event
  TRIANGLES: 'TRIANGLES',
  TRIANGLE_STRIPS: 'TRIANGLE_STRIPS',
  LINES: 'LINES',
  POINTS: 'POINTS',
  POLYGONS: 'POLYGONS'
};


/**
 * Copies the properties from a given object to this object. The texture,
 * textureCoordinateMap and the children are not copied but linked.
 * 
 * @param {!X.object} object The given object.
 * @protected
 */
X.object.prototype.copy_ = function(object) {

  this['_type'] = object['_type'];
  
  this._transform._matrix = new X.matrix(object._transform._matrix.array_);
  
  this['_color'] = object['_color'].slice();
  
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
  
  this['_opacity'] = object['_opacity'];
  
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
  
  this['_visible'] = object['_visible'];
  
  this['_pointSize'] = object['_pointSize'];
  
  this['_lineWidth'] = object['_lineWidth'];
  
  if (object['_caption']) {
    // only if a caption is configured
    this['_caption'] = new String(object['_caption']).toString();
  }
  
  this['_magicMode'] = object['_magicMode'];
  
  this._dirty = true;
  
};


X.object.prototype.toCSG = function() {

  var numberOfPoints = this._points.count();
  
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
    var color = this['_color'];
    
    // if point colors are defined on this X.object, use'em
    if ((this._colors.length() > 0)) {
      
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
  this.setType(X.object.types.TRIANGLES);
  
};


/**
 * Get the texture of this object.
 * 
 * @return {!X.texture} The texture.
 */
X.object.prototype.__defineGetter__('texture', function() {

  if (!this._texture) {
    
    this._texture = new X.texture();
    
  }
  
  return this._texture;
  
});


/**
 * Get the rendering type of this object.
 * 
 * @return {X.object.types} The rendering type.
 */
X.object.prototype.type = function() {

  return this['_type'];
  
};


/**
 * Set the rendering type of this object.
 * 
 * @param {X.object.types} type The rendering type.
 */
X.object.prototype.setType = function(type) {

  this['_type'] = type;
  
};


/**
 * Get the transform of this object.
 * 
 * @return {!X.transform} The transform.
 */
X.object.prototype.transform = function() {

  return this._transform;
  
};


/**
 * Get the points of this object.
 * 
 * @return {!X.triplets} The points.
 */
X.object.prototype.points = function() {

  return this._points;
  
};


/**
 * Get the normals of this object.
 * 
 * @return {!X.triplets} The normals.
 */
X.object.prototype.normals = function() {

  return this._normals;
  
};


/**
 * Get the point colors of this object.
 * 
 * @return {!X.triplets} The point colors.
 */
X.object.prototype.colors = function() {

  return this._colors;
  
};


/**
 * Get the object color.
 * 
 * @return {!Array} The object color.
 */
X.object.prototype.color = function() {

  return this['_color'];
  
};


/**
 * The color table associated with this object.
 * 
 * @return {?X.colortable} The color table.
 */
X.object.prototype.colortable = function() {

  return this._colortable;
  
};


/**
 * Set the color table for this object.
 * 
 * @param {?X.colortable|string} colortable The new color table or a file path.
 * @throws {Error} An error if the color table is invalid.
 */
X.object.prototype.setColorTable = function(colortable) {

  if (!goog.isDefAndNotNull(colortable)) {
    
    // null colortables are allowed
    this._colortable = null;
    return;
    
  }
  
  if (goog.isString(colortable)) {
    
    // a string has to be converted to a new X.texture
    var colortableFile = colortable;
    colortable = new X.colortable();
    colortable.file = colortableFile;
    
  }
  
  if (!(colortable instanceof X.colortable)) {
    
    throw new Error('Invalid colortable.');
    
  }
  
  this._colortable = colortable;
  
};


/**
 * Get the mapping between texture and object coordinates.
 * 
 * @return {?Array} The texture coordinate map.
 */
X.object.prototype.textureCoordinateMap = function() {

  return this._textureCoordinateMap;
  
};


/**
 * Set the object color. This overrides any point colors.
 * 
 * @param {!number} r The Red value in the range of 0..1
 * @param {!number} g The Green value in the range of 0..1
 * @param {!number} b The Blue value in the range of 0..1
 * @throws {Error} An exception if the given color values are invalid.
 */
X.object.prototype.setColor = function(r, g, b) {

  // we accept only numbers as arguments
  if ((!goog.isNumber(r) && r < 0.0 && r > 1.0) ||
      (!goog.isNumber(g) && g < 0.0 && g > 1.0) ||
      (!goog.isNumber(b) && b < 0.0 && b > 1.0)) {
    
    throw new Error('Invalid color.');
    
  }
  
  if (this.hasChildren()) {
    
    // loop through the children and propagate the new color
    var children = this.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      children[c].setColor(r, g, b);
      
    }
    
  }
  
  this['_color'][0] = r;
  this['_color'][1] = g;
  this['_color'][2] = b;
  
  this._dirty = true;
  
};


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
 * Get the opacity of this object. If the object is fully opaque, this returns
 * 1.
 * 
 * @return {number} The opacity in the range 0..1.
 */
X.object.prototype.opacity = function() {

  return this['_opacity'];
  
};


/**
 * Get the caption of this object.
 * 
 * @return {?string} The caption of this object.
 */
X.object.prototype.caption = function() {

  return this['_caption'];
  
};


/**
 * Set the caption for this object.
 * 
 * @param {?string} caption The caption for this object.
 */
X.object.prototype.setCaption = function(caption) {

  this['_caption'] = caption;
  
  this._dirty = true;
  
};


/**
 * Set the visibility of this object.
 * 
 * @param {boolean} visible The object's new visibility.
 */
X.object.prototype.setVisible = function(visible) {

  if (this.hasChildren()) {
    
    // loop through the children and propagate the new visibility
    var children = this.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      children[c].setVisible(visible);
      
    }
    
  }
  
  this['_visible'] = visible;
  
  this._dirty = true;
  
};


/**
 * Get the visibility of this object.
 * 
 * @return {boolean} TRUE if the object is visible, FALSE otherwise.
 */
X.object.prototype.visible = function() {

  return this['_visible'];
  
};


/**
 * Set the opacity of this object.
 * 
 * @param {number} opacity The opacity value in the range 0..1.
 */
X.object.prototype.setOpacity = function(opacity) {

  // check if the given opacity is in the range 0..1
  if (!goog.isNumber(opacity) || opacity > 1.0 || opacity < 0.0) {
    
    throw new Error('Invalid opacity.');
    
  }
  
  if (this.hasChildren()) {
    
    // loop through the children and propagate the new opacity
    var children = this.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      children[c].setOpacity(opacity);
      
    }
    
  }
  
  this['_opacity'] = opacity;
  
  this._dirty = true;
  
};


/**
 * Load this object from a file path or reset the associated file path.
 * 
 * @param {?string} filepath The file path/URL to load. If null, reset the
 *          associated file.
 */
X.object.prototype.load = function(filepath) {

  if (!goog.isDefAndNotNull(filepath)) {
    
    // if path is null, we reset the associated X.file object
    
    this._file = null;
    return;
    
  }
  
  this._file = new X.file(filepath);
  

};


/**
 * Get the associated X.file for this object.
 * 
 * @return {?X.file} The associated X.file or null if no file is associated.
 */
X.object.prototype.file = function() {

  return this._file;
  
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
 * Set the line width for this object. The line width is only used in
 * X.object.types.LINES rendering mode.
 * 
 * @param {!number} width The line width.
 * @throws {Error} An exception if the given width is invalid.
 */
X.object.prototype.setLineWidth = function(width) {

  if (!goog.isNumber(width)) {
    
    throw new Error('Invalid line width.');
    
  }
  
  this['_lineWidth'] = width;
  
  this._dirty = true;
  
};


/**
 * Get the line width of this object. The line width is only used in
 * X.object.types.LINES rendering mode.
 * 
 * @return {!number} The line width.
 */
X.object.prototype.lineWidth = function() {

  return this['_lineWidth'];
  
};


/**
 * Set the point size for this object. The point size is only used in
 * X.object.types.POINTS rendering mode.
 * 
 * @param {!number} size The point size.
 * @throws {Error} An exception if the given size is invalid.
 */
X.object.prototype.setPointSize = function(size) {

  if (!goog.isNumber(size)) {
    
    throw new Error('Invalid point size.');
    
  }
  
  this['_pointSize'] = size;
  
  this._dirty = true;
  
};


/**
 * Get the point size of this object. The point size is only used in
 * X.object.types.POINTS rendering mode.
 * 
 * @return {!number} The point size.
 */
X.object.prototype.pointSize = function() {

  return this['_pointSize'];
  
};


/**
 * Get the magic mode flag.
 * 
 * @return {!boolean} The magic mode flag.
 */
X.object.prototype.magicMode = function() {

  return this['_magicMode'];
  
};


/**
 * Set the magic mode flag.
 * 
 * @param {!boolean} magicMode The magic mode flag.
 */
X.object.prototype.setMagicMode = function(magicMode) {

  if (!goog.isBoolean(magicMode)) {
    
    throw new Error('Invalid magicMode setting.');
    
  }
  
  this['_magicMode'] = magicMode;
  
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
  if (object1['_opacity'] == 1) {
    
    // always put object1 before object2
    return -1;
    
  }
  if (object2['_opacity'] == 1) {
    
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
goog.exportSymbol('X.object.prototype.type', X.object.prototype.type);
goog.exportSymbol('X.object.prototype.setType', X.object.prototype.setType);
goog.exportSymbol('X.object.prototype.transform', X.object.prototype.transform);
goog.exportSymbol('X.object.prototype.points', X.object.prototype.points);
goog.exportSymbol('X.object.prototype.normals', X.object.prototype.normals);
goog.exportSymbol('X.object.prototype.colortable',
    X.object.prototype.colortable);
goog.exportSymbol('X.object.prototype.setColorTable',
    X.object.prototype.setColorTable);
goog.exportSymbol('X.object.prototype.scalars', X.object.prototype.scalars);
goog.exportSymbol('X.object.prototype.setScalars',
    X.object.prototype.setScalars);
goog.exportSymbol('X.object.prototype.colors', X.object.prototype.colors);
goog.exportSymbol('X.object.prototype.color', X.object.prototype.color);
goog.exportSymbol('X.object.prototype.setColor', X.object.prototype.setColor);
goog.exportSymbol('X.object.prototype.opacity', X.object.prototype.opacity);
goog.exportSymbol('X.object.prototype.setOpacity',
    X.object.prototype.setOpacity);
goog.exportSymbol('X.object.prototype.lineWidth', X.object.prototype.lineWidth);
goog.exportSymbol('X.object.prototype.setLineWidth',
    X.object.prototype.setLineWidth);
goog.exportSymbol('X.object.prototype.pointSize', X.object.prototype.pointSize);
goog.exportSymbol('X.object.prototype.setPointSize',
    X.object.prototype.setPointSize);
goog.exportSymbol('X.object.prototype.load', X.object.prototype.load);
goog.exportSymbol('X.object.prototype.file', X.object.prototype.file);
goog.exportSymbol('X.object.prototype.caption', X.object.prototype.caption);
goog.exportSymbol('X.object.prototype.visible', X.object.prototype.visible);
goog.exportSymbol('X.object.prototype.setCaption',
    X.object.prototype.setCaption);
goog.exportSymbol('X.object.prototype.setVisible',
    X.object.prototype.setVisible);
goog.exportSymbol('X.object.prototype.magicMode', X.object.prototype.magicMode);
goog.exportSymbol('X.object.prototype.setMagicMode',
    X.object.prototype.setMagicMode);
goog.exportSymbol('X.object.prototype.intersect', X.object.prototype.intersect);
goog.exportSymbol('X.object.prototype.inverse', X.object.prototype.inverse);
goog.exportSymbol('X.object.prototype.subtract', X.object.prototype.subtract);
goog.exportSymbol('X.object.prototype.union', X.object.prototype.union);
goog.exportSymbol('X.object.prototype.children', X.object.prototype.children);
goog.exportSymbol('X.object.prototype.modified', X.object.prototype.modified);

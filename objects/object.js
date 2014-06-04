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
goog.require('X.base');
goog.require('X.colortable');
goog.require('X.displayable');
goog.require('X.indexer');
goog.require('X.loadable');
goog.require('X.scalars');


/**
 * Create a displayable object. Objects may have points, colors, a texture in
 * addition to opacity and visibility settings. If another X.object is passed to
 * this constructor, the properties from this X.object are used to configure the
 * new one.
 *
 * @constructor
 * @param {X.object=} object Another X.object to use as a template.
 * @extends X.base
 * @mixin X.displayable
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
   * @type {!Array}
   * @protected
   */
  this._children = new Array();

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


  // inject functionality
  inject(this, new X.displayable()); // this object is displayable

  if (goog.isDefAndNotNull(object)) {

    // copy the properties of the given object over
    this.copy_(object);

  }

};
// inherit from X.base
goog.inherits(X.object, X.base);


/**
 * Copies the properties from a given object to this object. The texture,
 * textureCoordinateMap and the children are not copied but linked.
 *
 * @param {*} object The given object.
 * @protected
 */
X.object.prototype.copy_ = function(object) {

  this._type = object._type;

  this._transform = new X.transform();
  this._transform._matrix = new Float32Array(object._transform._matrix);

  this._color = object._color.slice();

  if (object._points) {
    this._points = new X.triplets(object._points.length, object._points);
  }
  if (object._normals) {
    this._normals = new X.triplets(object._normals.length, object._normals);
  }
  if (object._colors) {
    this._colors = new X.triplets(object._colors.length, object._colors);
  }

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
  this._children.length = 0; // remove old ones
  var _oldChildren = object._children;
  if (_oldChildren) {
    var _oldChildrenLength = _oldChildren.length;
    var i = 0;
    for (i = 0; i < _oldChildrenLength; i++) {

      // dynamic duck typing
      var classname = _oldChildren[i]._classname;
      this._children.push(new X[classname](_oldChildren[i]));

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

  this._pickable = object._pickable;

  this._pointIndices = object._pointIndices.slice();

  this._dirty = true;

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


/**
 * The scalars associated with this object.
 *
 * @return {?X.scalars} The scalars.
 */
X.object.prototype.__defineGetter__('scalars', function() {

  if (!this._scalars) {

    this._scalars = new X.scalars();

  }

  return this._scalars;

});


/**
 * Get the children of this object. Each object can have N children which get
 * automatically rendered when the top level object gets rendered.
 *
 * @return {!Array} The children of this object which are again objects.
 */
X.object.prototype.__defineGetter__('children', function() {

  return this._children;

});

/**
 * Fire a modified event for this object.
 *
 * @param {?boolean=} propagateEvent An optional flag to stop propagating down to child classes.
 */
X.object.prototype.modified = function(propagateEvent) {

  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = this;
  this.dispatchEvent(modifiedEvent);

};

/**
 * Fire a remove event for this object.
 *
 * @param {?boolean=} propagateEvent An optional flag to stop propagating down to child classes.
 */
X.object.prototype.remove = function(propagateEvent) {

  var removeEvent = new X.event.RemoveEvent();
  removeEvent._object = this;
  this.dispatchEvent(removeEvent);

};

/**
 * Destroy an object and its children to free the allocated memory.
 */
X.object.prototype.destroy = function() {

  // extra security
  goog.events.removeAll(this);

  // check if this object has children
  if (this._children.length > 0) {

    // loop through the children and recursively remove the objects
    var children = this._children;
    var numberOfChildren = children.length;
    var c = 0;

    for (c = 0; c < numberOfChildren; c++) {
      if (typeof(children[c]) != "undefined"){
        this._children[c].destroy();
      }
    }
  }

  this._children.length = 0;
  this._colortable = null;
  this._scalars = null;
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
goog.exportSymbol('X.object.prototype.modified', X.object.prototype.modified);
goog.exportSymbol('X.object.prototype.remove', X.object.prototype.remove);
goog.exportSymbol('X.object.prototype.destroy', X.object.prototype.destroy);

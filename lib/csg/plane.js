// provides
goog.provide('csgPlane');

//required
goog.require('csgVector');

// # class Plane

// Represents a plane in 3D space.

/**
 * @constructor
 */
csgPlane = function(normal, w) {

    /**
      * @type {csgVector}
      * @protected
      */
  this.normal_ = normal;

    /**
      * @protected
      */
  this.w_ = w;
};

// `csgPlane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
// point is on the plane.
csgPlane.EPSILON = 1e-5;

/**
  * @param {csgVector} a
  * @param {csgVector} b
  * @param {csgVector} c
  *
  * @return {csgPlane}
  */
csgPlane.fromPoints = function(a, b, c) {

  var n = b.minus(a).cross(c.minus(a)).unit();
  return new csgPlane(n, n.dot(a));
};

csgPlane.prototype = {
  clone: function() {

    return new csgPlane(this.normal_.clone(), this.w_);
  },
  
  flip: function() {

    this.normal_ = this.normal_.negated();
    this.w_ = -this.w_;
  },

  w: function(){
    return this.w_;
  },

  /**
    * @return {csgVector}
    */
  normal: function(){
    return this.normal_;
  }
};

goog.exportSymbol('csgPlane', csgPlane);
goog.exportSymbol('csgPlane.prototype.w', csgPlane.prototype.w);
goog.exportSymbol('csgPlane.prototype.normal', csgPlane.prototype.normal);
goog.exportSymbol('csgPlane', csgPlane);

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
  this.w = w;
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

    return new csgPlane(this.normal_.clone(), this.w);
  },
  
  flip: function() {

    this.normal_ = this.normal_.negated();
    this.w = -this.w;
  },
  
  // Split `polygon` by this plane if needed, then put the polygon or polygon
  // fragments in the appropriate lists. Coplanar polygons go into either
  // `coplanarFront` or `coplanarBack` depending on their orientation with
  // respect to this plane. Polygons in front or in back of this plane go into
  // either `front` or `back`.
  splitPolygon: function(polygon, coplanarFront, coplanarBack, front, back) {

    var COPLANAR = 0;
    var FRONT = 1;
    var BACK = 2;
    var SPANNING = 3;
    
    // Classify each point as well as the entire polygon into one of the above
    // four classes.
    var polygonType = 0;
    var types = [];
    for ( var i = 0; i < polygon.vertices.length; i++) {
      var t = this.normal_.dot(polygon.vertices[i].pos) - this.w;
      var type = (t < -csgPlane.EPSILON) ? BACK
          : (t > csgPlane.EPSILON) ? FRONT : COPLANAR;
      polygonType |= type;
      types.push(type);
    }
    
    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
    case COPLANAR:
      (this.normal_.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack)
          .push(polygon);
      break;
    case FRONT:
      front.push(polygon);
      break;
    case BACK:
      back.push(polygon);
      break;
    case SPANNING:
      var f = [], b = [];
      for ( var i = 0; i < polygon.vertices.length; i++) {
        var j = (i + 1) % polygon.vertices.length;
        var ti = types[i], tj = types[j];
        var vi = polygon.vertices[i], vj = polygon.vertices[j];
        if (ti != BACK) {
          f.push(vi);
        }
        if (ti != FRONT) {
          b.push(ti != BACK ? vi.clone() : vi);
        }
        if ((ti | tj) == SPANNING) {
          var t = (this.w - this.normal_.dot(vi.pos)) /
              this.normal_.dot(vj.pos.minus(vi.pos));
          var v = vi.interpolate(vj, t);
          f.push(v);
          b.push(v.clone());
        }
      }
      /*
      if (f.length >= 3) {
        front.push(new csgPolygon(f, polygon.shared()));
      }
      if (b.length >= 3) {
        back.push(new csgPolygon(b, polygon.shared()));
      }*/
      break;
    }
  }
};



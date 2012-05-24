/*
 * Copyright (c) 2011 Evan Wallace (http://madebyevan.com/)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in the
 * Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

// provides
goog.provide('csgPolygon');

// required
goog.require('csgPlane');
goog.require('csgVertex');
// # class Polygon

// Represents a convex polygon. The vertices used to initialize a polygon must
// be coplanar and form a convex loop. They do not have to be `CSG.Vertex`
// instances but they must behave similarly (duck typing can be used for
// customization).
// 
// Each convex polygon has a `shared` property, which is shared between all
// polygons that are clones of each other or were split from the same polygon.
// This can be used to define per-polygon properties (such as surface color).

/**
 * @constructor
 * @param {!Array.<csgVertex>} vertices
 * @param {Object=} shared
 */
csgPolygon = function(vertices, shared) {

  /**
   * @type {Array.<csgVertex>}
   * @protected
   */
  this.vertices_ = vertices;
  /**
   * @protected
   */
  this.shared_ = shared;
  /**
   * @type {csgPlane}
   * @protected
   */
  this.plane_ = csgPlane.fromPoints(vertices[0].pos(), vertices[1].pos(),
      vertices[2].pos());
};

csgPolygon.prototype = {
  
  /**
   * @return {csgPolygon}
   */
  clone: function() {

    var vertices = this.vertices_.map(function(v) {

      return v.clone();
    });
    return new csgPolygon(vertices, this.shared_);
  },
  
  flip: function() {

    this.vertices_.reverse().map(function(v) {

      v.flip();
    });
    this.plane_.flip();
  },
  
  /**
   * @return {Array.<csgVertex>}
   */
  vertices: function() {

    return this.vertices_;
  },
  
  /**
   * @return {Object|undefined}
   */
  shared: function() {

    return this.shared_;
  },
  
  /**
   * Split `polygon` by this plane if needed, then put the polygon or polygon
   * fragments in the appropriate lists. Coplanar polygons go into either
   * `coplanarFront` or `coplanarBack` depending on their orientation with
   * respect to this plane. Polygons in front or in back of this plane go into
   * either `front` or `back`.
   * 
   * @param plane {csgPlane}
   */
  
  splitPolygon: function(plane, coplanarFront, coplanarBack, front, back) {

    var COPLANAR = 0;
    var FRONT = 1;
    var BACK = 2;
    var SPANNING = 3;
    
    // Classify each point as well as the entire polygon into one of the above
    // four classes.
    var polygonType = 0;
    var types = [];
    for ( var i = 0; i < this.vertices_.length; i++) {
      var t = plane.normal().dot(this.vertices_[i].pos()) - plane.w();
      var type = (t < -csgPlane.EPSILON) ? BACK
          : (t > csgPlane.EPSILON) ? FRONT : COPLANAR;
      polygonType |= type;
      types.push(type);
    }
    
    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
    case COPLANAR:
      (plane.normal().dot(this.plane_.normal()) > 0 ? coplanarFront
          : coplanarBack).push(this);
      break;
    case FRONT:
      front.push(this);
      break;
    case BACK:
      back.push(this);
      break;
    case SPANNING:
      var f = [], b = [];
      for ( var i = 0; i < this.vertices().length; i++) {
        var j = (i + 1) % this.vertices().length;
        var ti = types[i], tj = types[j];
        var vi = this.vertices()[i], vj = this.vertices()[j];
        if (ti != BACK) {
          f.push(vi);
        }
        if (ti != FRONT) {
          b.push(ti != BACK ? vi.clone() : vi);
        }
        if ((ti | tj) == SPANNING) {
          var t = (plane.w() - plane.normal().dot(vi.pos())) /
              plane.normal().dot(vj.pos().minus(vi.pos()));
          var v = vi.interpolate(vj, t);
          f.push(v);
          b.push(v.clone());
        }
      }
      
      if (f.length >= 3) {
        front.push(new csgPolygon(f, this.shared()));
      }
      if (b.length >= 3) {
        back.push(new csgPolygon(b, this.shared()));
      }
      break;
    }
  }


};

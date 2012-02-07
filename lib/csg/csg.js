// provides
goog.provide('CSG');


// required
goog.require('csgPolygon');
goog.require('csgNode');
//goog.require('CSG.Polygon');

// Constructive Solid Geometry (CSG) is a modeling technique that uses Boolean
// operations like union and intersection to combine 3D solids. This library
// implements CSG operations on meshes elegantly and concisely using BSP trees,
// and is meant to serve as an easily understandable implementation of the
// algorithm. All edge cases involving overlapping coplanar polygons in both
// solids are correctly handled.
// 
// Example usage:
// 
// var cube = CSG.cube();
// var sphere = CSG.sphere({ radius: 1.3 });
// var polygons = cube.subtract(sphere).toPolygons();
// 
// ## Implementation Details
// 
// All CSG operations are implemented in terms of two functions, `clipTo()` and
// `invert()`, which remove parts of a BSP tree inside another BSP tree and swap
// solid and empty space, respectively. To find the union of `a` and `b`, we
// want to remove everything in `a` inside `b` and everything in `b` inside `a`,
// then combine polygons from `a` and `b` into one solid:
// 
// a.clipTo(b);
// b.clipTo(a);
// a.build(b.allPolygons());
// 
// The only tricky part is handling overlapping coplanar polygons in both trees.
// The code above keeps both copies, but we need to keep them in one tree and
// remove them in the other tree. To remove them from `b` we can clip the
// inverse of `b` against `a`. The code for union now looks like this:
// 
// a.clipTo(b);
// b.clipTo(a);
// b.invert();
// b.clipTo(a);
// b.invert();
// a.build(b.allPolygons());
// 
// Subtraction and intersection naturally follow from set operations. If
// union is `A | B`, subtraction is `A - B = ~(~A | B)` and intersection is
// `A & B = ~(~A | ~B)` where `~` is the complement operator.
// 
// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT
// license.

// # class CSG

// Holds a binary space partition tree representing a 3D solid. Two solids can
// be combined using the `union()`, `subtract()`, and `intersect()` methods.

/**
 * @constructor
 */
CSG = function() {
  /**
   * @type {!Array.<csgPolygon>}
   */
  this.polygons_ = [];
};

/**
  * Construct a CSG solid from a list of `CSG.Polygon` instances.
  */
CSG.fromPolygons = function(polygons) {
  var csg = new CSG();
  csg.setPolygons(polygons);
  return csg;
};

CSG.prototype = {
  /**
   * Clone a CSG element
   * @return {CSG} 
   */
  clone: function() {

    var csg = new CSG();
    csg.setPolygons(this.polygons_.map(function(p) {

      return p.clone();
    }));
    return csg;
  },
  
  /**
   * Return polygon array from a CSG element
   * @return {Array.<csgPolygon>} 
   */
  toPolygons: function() {
    window.console.log("polygons: " + this.polygons_);
    window.console.log("polygons.vertices().pos().x(): " + this.polygons_[0].vertices()[0].pos().x());
    return this.polygons_;
  },
  
  /**
    * Return a new CSG solid representing space in either this solid or in the
    * solid `csg`. Neither this solid nor the solid `csg` are modified.
    * 
    * A.union(B)
    * 
    * +-------+ +-------+
    * |.......| | ......|
    * | A ....| |...... |
    * | +--+----+ = | +----+
    * +----+--+ | +----+ |
    * | B | | |
    * | | | |
    * +-------+ +-------+
    *
    * @return {CSG}
    */
  union: function(csg) {
  
    var a = new csgNode(this.clone().polygons());
    var b = new csgNode(csg.clone().polygons());
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return CSG.fromPolygons(a.allPolygons());
  },
  
  /**
    * Return a new CSG solid representing space in this solid but not in the
    * solid `csg`. Neither this solid nor the solid `csg` are modified.
    * 
    * A.subtract(B)
    * 
    * +-------+ +-------+
    * | | | |
    * | A | | |
    * | +--+----+ = | +--+
    * +----+--+ | +----+
    * | B |
    * | |
    * +-------+
    *
    * @return {CSG}
    */ 
  subtract: function(csg) {

    var a = new csgNode(this.clone().polygons());
    var b = new csgNode(csg.clone().polygons());
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  },
  
  /**
    * Return a new CSG solid representing space both this solid and in the
    * solid `csg`. Neither this solid nor the solid `csg` are modified.
    * 
    * A.intersect(B)
    * 
    * +-------+
    * | |
    * | A |
    * | +--+----+ = +--+
    * +----+--+ | +--+
    * | B |
    * | |
    * +-------+
    *
    * @return {CSG}
    */ 
  intersect: function(csg) {

    var a = new csgNode(this.clone().polygons());
    var b = new csgNode(csg.clone().polygons());
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  },
  
  /**
    * Return a new CSG solid with solid and empty space switched. This solid is
    * not modified.
    *   
    * @return {CSG}
    */
  inverse: function() {

    var csg = this.clone();
    csg.polygons().map(function(p) {

      p.flip();
    });
    return csg;
  },

  /**
   * Return the current polygons
   * @return {!Array}
   */
  polygons: function() {
    return this.polygons_;
  },

  setPolygons: function(polygons) {
    this.polygons_ = polygons;
    }
};

// export symbols
goog.exportSymbol('CSG', CSG);
goog.exportSymbol('CSG.fromPolygons', CSG.fromPolygons);
goog.exportSymbol('CSG.prototype.toPolygons', CSG.prototype.toPolygons);
goog.exportSymbol('CSG.prototype.union', CSG.prototype.union);
goog.exportSymbol('CSG.prototype.subtract', CSG.prototype.subtract);
goog.exportSymbol('CSG.prototype.intersect', CSG.prototype.intersect);
goog.exportSymbol('CSG.prototype.inverse', CSG.prototype.inverse);
goog.exportSymbol('CSG.prototype.polygons', CSG.prototype.polygons);
goog.exportSymbol('CSG.prototype.setPolygons', CSG.prototype.setPolygons);



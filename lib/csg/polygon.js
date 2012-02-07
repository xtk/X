// provides
goog.provide('csgPolygon')

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
  vertices: function(){
    return this.vertices_;
  },
  
  /**
    * @return {Object|undefined}
    */
  shared: function(){
    return this.shared_;
  }

};

// export
goog.exportSymbol('csgPolygon', csgPolygon);
goog.exportSymbol('csgPolygon.prototype.clone', csgPolygon.prototype.clone);
goog.exportSymbol('csgPolygon.prototype.flip', csgPolygon.prototype.flip);
goog.exportSymbol('csgPolygon.prototype.vertices', csgPolygon.prototype.vertices);
goog.exportSymbol('csgPolygon.prototype.shared', csgPolygon.prototype.shared);


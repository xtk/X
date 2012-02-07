//provides
goog.provide('csgVertex');

// requires
goog.require('csgVector');
// # class Vertex

// Represents a vertex of a polygon. Use your own vertex class instead of this
// one to provide additional features like texture coordinates and vertex
// colors. Custom vertex classes need to provide a `pos` property and `clone()`,
// `flip()`, and `interpolate()` methods that behave analogous to the ones
// defined by `csgVertex`. This class provides `normal` so convenience
// functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`
// is not used anywhere else.

/**
 * @constructor
 */
csgVertex = function(pos, normal) {

    /**
      * @type {csgVector}
      * @protected
      */
  this.pos_ = new csgVector(pos);
    /**
      * @type {csgVector}
      * @protected
      */
  this.normal_ = new csgVector(normal);
};

csgVertex.prototype = {

  /**
    * @return {csgVertex}
    */
  clone: function() {

    return new csgVertex(this.pos_.clone(), this.normal_.clone());
  },
  
  /**
    * Invert all orientation-specific data (e.g. vertex normal). Called when the
    * orientation of a polygon is flipped.
    */
  flip: function() {

    this.normal_ = this.normal_.negated();
  },
 
  /** 
    * Create a new vertex between this vertex and `other` by linearly
    * interpolating all properties using a parameter of `t`. Subclasses should
    * override this to interpolate additional properties.
    *
    * @return {csgVertex}
    */
  interpolate: function(other, t) {

    return new csgVertex(this.pos_.lerp(other.pos(), t), this.normal_.lerp(
        other.normal(), t));
  },

  /**
    * return position from vextex
    *
    * @return {csgVector}
    */
  pos: function(){
    return this.pos_;
  },

  /**
    * return normal from vextex
    *
    * @return {csgVector}
    */
  normal: function(){
    return this.normal_;
  }
};

// exports
goog.exportSymbol('csgVertex', csgVertex);
goog.exportSymbol('csgVertex.prototype.clone', csgVertex.prototype.clone);
goog.exportSymbol('csgVertex.prototype.flip', csgVertex.prototype.flip);
goog.exportSymbol('csgVertex.prototype.interpolate', csgVertex.prototype.interpolate);
goog.exportSymbol('csgVertex.prototype.pos', csgVertex.prototype.pos);
goog.exportSymbol('csgVertex.prototype.normal', csgVertex.prototype.normal);



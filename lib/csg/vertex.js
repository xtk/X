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
  pos: function() {

    return this.pos_;
  },
  
  /**
   * return normal from vextex
   * 
   * @return {csgVector}
   */
  normal: function() {

    return this.normal_;
  }
};

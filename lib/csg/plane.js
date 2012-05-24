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
goog.provide('csgPlane');

// required
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
  
  w: function() {

    return this.w_;
  },
  
  /**
   * @return {csgVector}
   */
  normal: function() {

    return this.normal_;
  }
};

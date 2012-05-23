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
goog.provide('csgVector');

// # class Vector

// Represents a 3D vector.
// 
// Example usage:
// 
// new csgVector(1, 2, 3);
// new csgVector([1, 2, 3]);
// new csgVector({ x: 1, y: 2, z: 3 });

/**
 * @constructor
 * @param {number|Array|boolean} ix
 * @param {number|boolean=} iy
 * @param {number|boolean=} iz
 */
csgVector = function(ix, iy, iz) {

  /**
   * @type {number}
   */
  this.x_ = 0;
  /**
   * @type {number}
   */
  this.y_ = 0;
  /**
   * @type {number}
   */
  this.z_ = 0;
  if (arguments.length == 3) {
    this.x_ = Number(ix);
    this.y_ = Number(iy);
    this.z_ = Number(iz);
  } else if (ix instanceof csgVector) {
    this.x_ = Number(ix.x());
    this.y_ = Number(ix.y());
    this.z_ = Number(ix.z());
  } else {
    this.x_ = Number(ix[0]);
    this.y_ = Number(ix[1]);
    this.z_ = Number(ix[2]);
  }
};

csgVector.prototype = {
  
  /**
   * Clone a vector
   * 
   * @return {csgVector}
   */
  clone: function() {

    return new csgVector(this.x_, this.y_, this.z_);
  },
  
  /**
   * Negate a vector
   * 
   * @return {csgVector}
   */
  negated: function() {

    return new csgVector(-this.x_, -this.y_, -this.z_);
  },
  
  /**
   * Add vector to a vector
   * 
   * @return {csgVector}
   */
  plus: function(a) {

    return new csgVector(this.x_ + a.x(), this.y_ + a.y(), this.z_ + a.z());
  },
  
  /**
   * Remove vector to a vector
   * 
   * @return {csgVector}
   */
  minus: function(a) {

    return new csgVector(this.x_ - a.x(), this.y_ - a.y(), this.z_ - a.z());
  },
  
  /**
   * Multiply a vector by a value
   * 
   * @return {csgVector}
   */
  times: function(a) {

    return new csgVector(this.x_ * a, this.y_ * a, this.z_ * a);
  },
  
  /**
   * Divide a vector by a value
   * 
   * @return {csgVector}
   */
  dividedBy: function(a) {

    return new csgVector(this.x_ / a, this.y_ / a, this.z_ / a);
  },
  
  /**
   * @return {!number}
   */
  dot: function(a) {

    var result = this.x_ * a.x() + this.y_ * a.y() + this.z_ * a.z();
    return result;
  },
  
  /**
   * Lerp
   * 
   * @return {csgVector}
   */
  lerp: function(a, t) {

    return this.plus(a.minus(this).times(t));
  },
  
  /**
   * Return length of a vector
   * 
   * @return {!number}
   */
  length: function() {

    return Math.sqrt(this.dot(this));
  },
  
  /**
   * @return {csgVector}
   */
  unit: function() {

    return this.dividedBy(this.length());
  },
  
  /**
   * @return {csgVector}
   */
  cross: function(a) {

    return new csgVector(this.y_ * a.z() - this.z_ * a.y(), this.z_ * a.x() -
        this.x_ * a.z(), this.x_ * a.y() - this.y_ * a.x());
  },
  
  /**
   * Return x value of the current vector
   * 
   * @return {number}
   */
  x: function() {

    return this.x_;
  },
  
  /**
   * Return y value of the current vector
   * 
   * @return {number}
   */
  y: function() {

    return this.y_;
  },
  
  /**
   * Return z value of the current vector
   * 
   * @return {number}
   */
  z: function() {

    return this.z_;
  }

};

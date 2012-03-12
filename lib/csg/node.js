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

// provide
goog.provide('csgNode');

goog.require('csgPlane');
goog.require('csgPolygon');

// # class csgNode

// Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
// by picking a polygon to split along. That polygon (and all other coplanar
// polygons) are added directly to that node and the other polygons are added to
// the front and/or back subtrees. This is not a leafy BSP tree since there is
// no distinction between internal and leaf nodes.

/**
 * @constructor
 * @param {Array=} polygons
 */
csgNode = function(polygons) {

  /**
   * @type {csgPlane}
   * @protected
   */
  this.plane_ = null;
  /**
   * @type {csgNode}
   * @protected
   */
  this.front_ = null;
  /**
   * @type {csgNode}
   * @protected
   */
  this.back_ = null;
  /**
   * @type {Array.<csgPolygon>}
   * @protected
   */
  this.polygons_ = [];
  
  if (polygons) {
    this.build(polygons);
  }
};

csgNode.prototype = {
  
  /**
   * @return {csgNode}
   */
  clone: function() {

    var node = new csgNode();
    node.setPlane(this.plane_ && this.plane_.clone());
    node.setFront(this.front_ && this.front_.clone());
    node.setBack(this.back_ && this.back_.clone());
    node.setPolygons(this.polygons_.map(function(p) {

      return p.clone();
    }));
    return node;
  },
  
  /**
   * Convert solid space to empty space and empty space to solid space.
   */
  invert: function() {

    for ( var i = 0; i < this.polygons_.length; i++) {
      this.polygons_[i].flip();
    }
    this.plane_.flip();
    if (this.front_) {
      this.front_.invert();
    }
    if (this.back_) {
      this.back_.invert();
    }
    var temp = this.front_;
    this.front_ = this.back_;
    this.back_ = temp;
  },
  
  /**
   * Recursively remove all polygons in `polygons` that are inside this BSP
   * tree.
   */
  clipPolygons: function(polygons) {

    if (!this.plane_) {
      return polygons.slice();
    }
    var front = [], back = [];
    for ( var i = 0; i < polygons.length; i++) {
      polygons[i].splitPolygon(this.plane_, front, back, front, back);
    }
    if (this.front_) {
      front = this.front_.clipPolygons(front);
    }
    if (this.back_) {
      back = this.back_.clipPolygons(back);
    } else {
      back = [];
    }
    return front.concat(back);
  },
  
  /**
   * Remove all polygons in this BSP tree that are inside the other BSP tree
   * `bsp`.
   */
  clipTo: function(bsp) {

    this.polygons_ = bsp.clipPolygons(this.polygons_);
    if (this.front_) {
      this.front_.clipTo(bsp);
    }
    if (this.back_) {
      this.back_.clipTo(bsp);
    }
  },
  
  /**
   * Return a list of all polygons in this BSP tree.
   */
  allPolygons: function() {

    var polygons = this.polygons_.slice();
    if (this.front_) {
      polygons = polygons.concat(this.front_.allPolygons());
    }
    if (this.back_) {
      polygons = polygons.concat(this.back_.allPolygons());
    }
    return polygons;
  },
  
  /**
   * Build a BSP tree out of `polygons`. When called on an existing tree, the
   * new polygons are filtered down to the bottom of the tree and become new
   * nodes there. Each set of polygons is partitioned using the first polygon
   * (no heuristic is used to pick a good split).
   */
  build: function(polygons) {

    if (!polygons.length) {
      return;
    }
    if (!this.plane_) {
      this.plane_ = polygons[0].plane_.clone();
    }
    var front = [], back = [];
    for ( var i = 0; i < polygons.length; i++) {
      polygons[i].splitPolygon(this.plane_, this.polygons_, this.polygons_,
          front, back);
    }
    if (front.length) {
      if (!this.front_) {
        this.front_ = new csgNode();
      }
      this.front_.build(front);
    }
    if (back.length) {
      if (!this.back_) {
        this.back_ = new csgNode();
      }
      this.back_.build(back);
    }
  },
  
  /**
   * @return {csgPlane}
   */
  plane: function() {

    return this.plane_;
  },
  
  /**
   * @param iplane {csgPlane}
   */
  setPlane: function(iplane) {

    this.plane_ = iplane;
  },
  
  /**
   * @return {csgNode}
   */
  front: function() {

    return this.front_;
  },
  
  /**
   * @param ifront {csgNode}
   */
  setFront: function(ifront) {

    this.front_ = ifront;
  },
  
  /**
   * @return {csgNode}
   */
  back: function() {

    return this.back_;
  },
  
  /**
   * @param iback {csgNode}
   */
  setBack: function(iback) {

    this.back_ = iback;
  },
  
  /**
   * @return {Array.<csgPolygon>}
   */
  polygons: function() {

    return this.polygons_;
  },
  
  /**
   * @param ipolygons {csgPolygon}
   */
  setPolygons: function(ipolygons) {

    this.polygons_ = ipolygons;
  }
};

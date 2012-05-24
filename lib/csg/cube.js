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
goog.provide('CSG.cube');

// requires
goog.require('CSG');
goog.require('csgVector');
goog.require('csgPolygon');
goog.require('csgVertex');

// Construct an axis-aligned solid cuboid. Optional parameters are `center` and
// `radius`, which default to `[0, 0, 0]` and `[1, 1, 1]`. The radius can be
// specified using a single number or a list of three numbers, one for each
// axis.
// 
// Example code:
// 
// var cube = CSG.cube({
// center: [0, 0, 0],
// radius: 1
// });

/**
 * @constructor
 * @extends CSG
 */
CSG.cube = function(options) {

  goog.base(this);
  
  options = options || {};
  var c = new csgVector(options.center || [0, 0, 0]);
  var r = !options.radius ? [1, 1, 1] : options.radius.length ? options.radius
      : [options.radius, options.radius, options.radius];
  return CSG.fromPolygons([[[0, 4, 6, 2], [-1, 0, 0]],
                           [[1, 3, 7, 5], [+1, 0, 0]],
                           [[0, 1, 5, 4], [0, -1, 0]],
                           [[2, 6, 7, 3], [0, +1, 0]],
                           [[0, 2, 3, 1], [0, 0, -1]],
                           [[4, 5, 7, 6], [0, 0, +1]]].map(function(info) {

    return new csgPolygon(info[0].map(function(i) {

      var pos = new csgVector(c.x() + r[0] * (2 * !!(i & 1) - 1), c.y() + r[1] *
          (2 * !!(i & 2) - 1), c.z() + r[2] * (2 * !!(i & 4) - 1));
      return new csgVertex(pos, new csgVector(info[1]));
    }));
  }));
};

goog.inherits(CSG.cube, CSG);

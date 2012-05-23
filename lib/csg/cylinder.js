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
goog.provide('CSG.cylinder');

// requires
goog.require('CSG');
goog.require('csgVector');
goog.require('csgPolygon');
goog.require('csgVertex');

// Construct a solid cylinder. Optional parameters are `start`, `end`,
// `radius`, and `slices`, which default to `[0, -1, 0]`, `[0, 1, 0]`, `1`, and
// `16`. The `slices` parameter controls the tessellation.
// 
// Example usage:
// 
// var cylinder = CSG.cylinder({
// start: [0, -1, 0],
// end: [0, 1, 0],
// radius: 1,
// slices: 16
// });

/**
 * @constructor
 * @extends CSG
 */
CSG.cylinder = function(options) {

  goog.base(this);
  
  options = options || {};
  var s = new csgVector(options.start || [0, -1, 0]);
  var e = new csgVector(options.end || [0, 1, 0]);
  var ray = e.minus(s);
  var r = options.radius || 1;
  var slices = options.slices || 16;
  var axisZ = ray.unit(), isY = (Math.abs(axisZ.y()) > 0.5);
  var axisX = new csgVector(isY, !isY, 0).cross(axisZ).unit();
  var axisY = axisX.cross(axisZ).unit();
  var start = new csgVertex(s, axisZ.negated());
  var end = new csgVertex(e, axisZ.unit());
  var polygons = [];
  function point(stack, slice, normalBlend) {

    var angle = slice * Math.PI * 2;
    var out = axisX.times(Math.cos(angle)).plus(axisY.times(Math.sin(angle)));
    var pos = s.plus(ray.times(stack)).plus(out.times(r));
    var normal = out.times(1 - Math.abs(normalBlend)).plus(
        axisZ.times(normalBlend));
    return new csgVertex(pos, normal);
  }
  for ( var i = 0; i < slices; i++) {
    var t0 = i / slices, t1 = (i + 1) / slices;
    polygons.push(new csgPolygon([start, point(0, t0, -1), point(0, t1, -1)]));
    polygons.push(new csgPolygon([point(0, t1, 0), point(0, t0, 0),
                                  point(1, t0, 0), point(1, t1, 0)]));
    polygons.push(new csgPolygon([end, point(1, t1, 1), point(1, t0, 1)]));
  }
  return CSG.fromPolygons(polygons);
};

goog.inherits(CSG.cylinder, CSG);

// provides
goog.provide('CSG.cylinder')

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

// export the basic shapes
goog.exportSymbol('CSG.cylinder', CSG.cylinder);

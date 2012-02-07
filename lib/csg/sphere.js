// provides
goog.provide('CSG.sphere')

// requires
goog.require('CSG');
goog.require('csgVector');
goog.require('csgPolygon');
goog.require('csgVertex');

// Construct a solid sphere. Optional parameters are `center`, `radius`,
// `slices`, and `stacks`, which default to `[0, 0, 0]`, `1`, `16`, and `8`.
// The `slices` and `stacks` parameters control the tessellation along the
// longitude and latitude directions.
// 
// Example usage:
// 
// var sphere = CSG.sphere({
// center: [0, 0, 0],
// radius: 1,
// slices: 16,
// stacks: 8
// });

/**
 * @constructor
 * @extends CSG
 */
CSG.sphere = function(options) {

  goog.base(this);

  options = options || {};

  var c = new csgVector(options.center || [0, 0, 0]);

  var r = options.radius || 1;
  var slices = options.slices || 16;
  var stacks = options.stacks || 8;
  var polygons = [], vertices;
  function vertex(theta, phi) {

    theta *= Math.PI * 2;
    phi *= Math.PI;
    var dir = new csgVector(Math.cos(theta) * Math.sin(phi), Math.cos(phi),
        Math.sin(theta) * Math.sin(phi));
    vertices.push(new csgVertex(c.plus(dir.times(r)), dir));
  }
  for ( var i = 0; i < slices; i++) {
    for ( var j = 0; j < stacks; j++) {
      vertices = [];
      vertex(i / slices, j / stacks);
      if (j > 0) {
        vertex((i + 1) / slices, j / stacks);
      }
      if (j < stacks - 1) {
        vertex((i + 1) / slices, (j + 1) / stacks);
      }
      vertex(i / slices, (j + 1) / stacks);
      polygons.push(new csgPolygon(vertices));
    }
  }
  
  return CSG.fromPolygons(polygons);
};

goog.inherits(CSG.sphere, CSG);

goog.exportSymbol('CSG.sphere', CSG.sphere);


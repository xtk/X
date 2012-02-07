// provides
goog.provide('CSG.cube')

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

goog.exportSymbol('CSG.cube', CSG.cube);

/*
 *
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x
 *                    x:::::x  x:::::x
 *                     x:::::xx:::::x
 *                      x::::::::::x
 *                       x::::::::x
 *                       x::::::::x
 *                      x::::::::::x
 *                     x:::::xx:::::x
 *                    x:::::x  x:::::x
 *                   x:::::x    x:::::x
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *
 *                  http://www.goXTK.com
 *
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 *
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 *
 *
 * CREDITS
 *
 *   - the .TRK Fileparser is based on a version of Dan Ginsburg, Children's Hospital Boston (see LICENSE)
 *
 */

goog.provide('X.parserTRK');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');



/**
 * Create a parser for the binary .TRK format.
 *
 * @constructor
 * @extends X.parser
 */
X.parserTRK = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserTRK';

};
// inherit from X.parser
goog.inherits(X.parserTRK, X.parser);


/**
 * @inheritDoc
 */
X.parserTRK.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');

  var p = object._points;
  var n = object._normals;
  var c = object._colors;

  this._data = data;

  // parse the header of the .TRK file
  // Documented here: http://trackvis.org/docs/?subsect=fileformat
  var header = {

    'id_string': this.scan('uchar', 6),
    'dim': this.scan('ushort', 3),
    'voxel_size': this.scan('float', 3),
    'origin': this.scan('float', 3),
    'n_scalars': this.scan('ushort'),
    'scalar_name': this.scan('uchar', 200),
    'n_properties': this.scan('ushort'),
    'property_name': this.scan('uchar', 200),
    'vox_to_ras': this.scan('float', 16),
    'reserved': this.scan('uchar', 444),
    'voxel_order': this.scan('uchar', 4),
    'pad2': this.scan('uchar', 4),
    'image_orientation_patient': this.scan('float', 6),
    'pad1': this.scan('uchar', 2),
    'invert_x': this.scan('uchar'),
    'invert_y': this.scan('uchar'),
    'invert_z': this.scan('uchar'),
    'swap_xy': this.scan('uchar'),
    'swap_yz': this.scan('uchar'),
    'swap_zx': this.scan('uchar'),
    'n_count': this.scan('uint'),
    'version': this.scan('uint'),
    'hdr_size': this.scan('uint')
  };

  //
  // parse the data

  // if n_count not provided, we parse the data until end of points
  var numberOfFibers = (header.n_count === 0) ? Infinity : header.n_count;
  var numberOfScalars = header.n_scalars;

  // loop through all fibers
  var fibers = [];
  var lengths = [];
  var minLength = Infinity;
  var maxLength = -Infinity;

  var minX = null;
  var maxX = null;
  var minY = null;
  var maxY = null;
  var minZ = null;
  var maxZ = null;

  var _numPoints = this.scan('uint', (this._data.byteLength - 1000) / 4);
  this.jumpTo(header.hdr_size);
  var _points = this.scan('float', (this._data.byteLength - 1000) / 4);

  var offset = 0;

  // keep track of the number of all points along all tracks
  var _totalPoints = 0;

  var i;
  for (i = 0; i < numberOfFibers; i++) {
    // if undefined, it means we have parsed all the data
    // (useful if n_count not defined or === 0)
    if(typeof(_numPoints[offset]) === 'undefined'){
      numberOfFibers = i;
      break;
    }

    var numPoints = _numPoints[offset];


    // console.log(numPoints, offset);


    var currentPoints = new X.triplets(numPoints * 3);

    var length = 0.0;

    // loop through the points of this fiber
    for ( var j = 0; j < numPoints; j++) {

      // read coordinates
      var x = _points[offset + j * 3 + j * numberOfScalars + 1];
      var y = _points[offset + j * 3 + j * numberOfScalars + 2];
      var z = _points[offset + j * 3 + j * numberOfScalars + 3];

      // console.log(x, y, z);

      // read scalars
      // var scalars = this.scan('float', header.n_scalars);

      // Convert coordinates to world space by dividing by spacing
      x = x / header.voxel_size[0];
      y = y / header.voxel_size[1];
      z = z / header.voxel_size[2];

      currentPoints.add(x, y, z);

      // fiber length
      if (j > 0) {

        // if not the first point, calculate length
        var oldPoint = currentPoints.get(j - 1);

        length += Math.sqrt(Math.pow(x - oldPoint[0], 2) +
            Math.pow(y - oldPoint[1], 2) + Math.pow(z - oldPoint[2], 2));

      }

      // increase the number of points if this is not the last track
      if (j < numPoints - 1) {
        _totalPoints += 6;
      }

    }

    offset += numPoints * 3 + numPoints * numberOfScalars + 1;


    // read additional properties
    // var properties = this.scan('float', header.n_properties);

    // we need to get the bounding box of the whole .trk file before we add the
    // points to properly setup normals

    var cMinX = currentPoints._minA;
    var cMaxX = currentPoints._maxA;
    var cMinY = currentPoints._minB;
    var cMaxY = currentPoints._maxB;
    var cMinZ = currentPoints._minC;
    var cMaxZ = currentPoints._maxC;

    if (!minX || cMinX < minX) {
      minX = cMinX;
    }
    if (!maxX || cMaxX > maxX) {
      maxX = cMaxX;
    }
    if (!minY || cMinY < minY) {
      minY = cMinY;
    }
    if (!maxY || cMaxY > maxY) {
      maxY = cMaxY;
    }
    if (!minZ || cMinZ < minZ) {
      minZ = cMinZ;
    }
    if (!maxZ || cMaxZ > maxZ) {
      maxZ = cMaxZ;
    }

    // append this track to our fibers list
    fibers.push(currentPoints);
    // .. and also the length
    lengths.push(length);

  } // end of loop through all tracks

  // calculate the center based on the bounding box of the whole .trk file
  var centerX = (minX + maxX) / 2;
  var centerY = (minY + maxY) / 2;
  var centerZ = (minZ + maxZ) / 2;

  // the scalar array
  var scalarArray = new Float32Array(_totalPoints);

  // setup the points and normals arrays
  object._points = p = new X.triplets(_totalPoints);
  object._normals = n = new X.triplets(_totalPoints);
  object._colors = c = new X.triplets(_totalPoints);

  var _scalarIndex = 0;

  // now we have a list of fibers
  for (i = 0; i < numberOfFibers; i++) {

    // grab the current points of this fiber
    var points = fibers[i];
    var numberOfPoints = points.count;

    // grab the length of this fiber
    var length = lengths[i];

    minLength = Math.min(minLength, length);
    maxLength = Math.max(maxLength, length);

    for ( var j = 0; j < numberOfPoints - 1; j++) {

      // TODO min max check?

      // grab the point with the currentIndex
      var currentPoint = points.get(j);
      // and connect it to the next one
      var nextPoint = points.get(j + 1);

      // .. and add both
      p.add(currentPoint[0], currentPoint[1], currentPoint[2]);
      p.add(nextPoint[0], nextPoint[1], nextPoint[2]);

      // calculate and add the normals for the two points
      var nCurrentPointX = currentPoint[0] - centerX;
      var nCurrentPointY = currentPoint[1] - centerY;
      var nCurrentPointZ = currentPoint[2] - centerZ;
      var nCurrentPointLength = Math.sqrt(nCurrentPointX * nCurrentPointX +
          nCurrentPointY * nCurrentPointY + nCurrentPointZ * nCurrentPointZ);
      var nNextPointX = nextPoint[0] - centerX;
      var nNextPointY = nextPoint[1] - centerY;
      var nNextPointZ = nextPoint[2] - centerZ;
      var nNextPointLength = Math.sqrt(nNextPointX * nNextPointX + nNextPointY *
          nNextPointY + nNextPointZ * nNextPointZ);

      n.add(nCurrentPointX / nCurrentPointLength, nCurrentPointY /
          nCurrentPointLength, nCurrentPointZ / nCurrentPointLength);
      n.add(nNextPointX / nNextPointLength, nNextPointY / nNextPointLength,
          nNextPointZ / nNextPointLength);

      var start = currentPoint;
      var end = nextPoint;

      var diff = [Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]),
                  Math.abs(end[2] - start[2])];

      var distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] *
          diff[2]);

      diff[0] /= distance;
      diff[1] /= distance;
      diff[2] /= distance;

      // add the color
      c.add(diff[0], diff[1], diff[2]);
      c.add(diff[0], diff[1], diff[2]);

      // add the length (6 times since we added two points with each 3
      // coordinates)
      scalarArray[_scalarIndex++] = length;
      scalarArray[_scalarIndex++] = length;
      scalarArray[_scalarIndex++] = length;
      scalarArray[_scalarIndex++] = length;
      scalarArray[_scalarIndex++] = length;
      scalarArray[_scalarIndex++] = length;

    } // loop through points

  } // loop through fibers

  // set the object type to LINES
  object._type = X.displayable.types.LINES;

  // attach the scalars
  var scalars = new X.scalars();
  scalars._min = minLength;
  scalars._max = maxLength;
  scalars._lowerThreshold = minLength;
  scalars._upperThreshold = maxLength;
  scalars._glArray = scalarArray; // the ordered, gl-Ready
  // version - use the setter to mark the scalars dirty
  scalars._replaceMode = false; // we don't want to replace - we want to
  // discard!
  scalars._dirty = true;
  object._scalars = scalars;

  // make sure the vox_to_ras is not null. Else, set to identity
  var vox_to_ras_defined = false;
  for (i = 0; i < 16; i++) {
     if(header.vox_to_ras[i] != 0 ){
       vox_to_ras_defined = true;
       break;
     }
  }

  if(vox_to_ras_defined == false){
    header.vox_to_ras[0] = header.vox_to_ras[5] = header.vox_to_ras[10] = header.vox_to_ras[15] = 1;
  }


  X.TIMERSTOP(this._classname + '.parse');

  // move tracks to RAS space (note: we switch from row-major to column-major by transposing)
  X.matrix.transpose(header.vox_to_ras, object._transform._matrix);

  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);

};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserTRK', X.parserTRK);
goog.exportSymbol('X.parserTRK.prototype.parse', X.parserTRK.prototype.parse);

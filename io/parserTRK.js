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
  this['_className'] = 'parserTRK';
  
};
// inherit from X.parser
goog.inherits(X.parserTRK, X.parser);


/**
 * @inheritDoc
 */
X.parserTRK.prototype.parse = function(object, data) {

  var p = object.points();
  var n = object.normals();
  var c = object.colors();
  
  var offset = 0;
  
  // parse the header of the .TRK file
  // Documented here: http://trackvis.org/docs/?subsect=fileformat
  var header = {
    'id_string': this.parseString(data, offset, 6),
    'dim': this.parseUInt16Array(data, offset + 6, 3),
    'voxel_size': this.parseFloat32Array(data, offset + 12, 3),
    'origin': this.parseFloat32Array(data, offset + 24, 3),
    'n_scalars': this.parseUInt16(data, offset + 36),
    'scalar_name': this.parseString(data, offset + 38, 200),
    'n_properties': this.parseUInt16(data, offset + 238),
    'property_name': this.parseString(data, offset + 240, 200),
    'vox_to_ras': this.parseFloat32Array(data, offset + 440, 16),
    'reserved': this.parseString(data, offset + 504, 444),
    'voxel_order': this.parseString(data, offset + 948, 4),
    'pad2': this.parseString(data, offset + 952, 4),
    'image_orientation_patient': this.parseFloat32Array(data, offset + 956, 6),
    'pad1': this.parseString(data, offset + 980, 2),
    'invert_x': this.parseUChar8(data, offset + 982),
    'invert_y': this.parseUChar8(data, offset + 983),
    'invert_z': this.parseUChar8(data, offset + 984),
    'swap_xy': this.parseUChar8(data, offset + 985),
    'swap_yz': this.parseUChar8(data, offset + 986),
    'swap_zx': this.parseUChar8(data, offset + 987),
    'n_count': this.parseUInt32(data, offset + 988),
    'version': this.parseUInt32(data, offset + 992),
    'hdr_size': this.parseUInt32(data, offset + 996)
  };
  
  //
  // parse the data
  offset = header.hdr_size;
  
  var numberOfFibers = header.n_count;
  
  // loop through all fibers
  var fibers = [];
  
  var minX = null;
  var maxX = null;
  var minY = null;
  var maxY = null;
  var minZ = null;
  var maxZ = null;
  
  var i;
  for (i = 0; i < numberOfFibers; i++) {
    var numPoints = this.parseUInt32(data, offset);
    
    var currentPoints = new X.triplets();
    
    offset += 4;
    
    // loop through the points of this fiber
    for ( var j = 0; j < numPoints; j++) {
      
      // read coordinates
      var x = this.parseFloat32(data, offset);
      offset += 4;
      
      var y = this.parseFloat32(data, offset);
      offset += 4;
      
      var z = this.parseFloat32(data, offset);
      offset += 4;
      
      // read scalars
      var scalars = null;
      if (header.n_scalars > 0) {
        scalars = this.parseFloat32Array(data, offset, header.n_scalars);
        offset += (header.n_scalars * 4);
      }
      
      // Convert coordinates to world space by dividing by spacing
      x = x / header.voxel_size[0];
      y = y / header.voxel_size[1];
      z = z / header.voxel_size[2];
      
      currentPoints.add(x, y, z);
      
    }
    
    // read additional properties, if existing
    // we don't support them right now in XTK
    if (header.n_properties > 0) {
      // var properties = this
      // .parseFloat32Array(data, offset, header.n_properties);
      offset += (header.n_properties * 4);
    }
    
    // calculate track length
    // we don't support it right now in XTK
    // var length = 0.0;
    // for (j = 0; j < numPoints - 1; j++) {
    // length += Math.sqrt(Math.pow(points[j + 1].position[0] -
    // points[j].position[0], 2) +
    // Math.pow(points[j + 1].position[1] - points[j].position[1], 2) +
    // Math.pow(points[j + 1].position[2] - points[j].position[2], 2));
    // }
    
    // we need to get the bounding box of the whole .trk file before we add the
    // points to properly setup normals
    
    var cMinX = currentPoints.minA();
    var cMaxX = currentPoints.maxA();
    var cMinY = currentPoints.minB();
    var cMaxY = currentPoints.maxB();
    var cMinZ = currentPoints.minC();
    var cMaxZ = currentPoints.maxC();
    
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
    
  } // end of loop through all tracks
  
  // calculate the center based on the bounding box of the whole .trk file
  var centerX = (minX + maxX) / 2;
  var centerY = (minY + maxY) / 2;
  var centerZ = (minZ + maxZ) / 2;
  
  // now we have a list of fibers
  for (i = 0; i < numberOfFibers; i++) {
    
    // grab the current points of this fiber
    var points = fibers[i];
    var numberOfPoints = points.count();
    
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
      
    } // loop through points
    
  } // loop through fibers
  
  // set the object type to LINES
  object.setType(X.object.types.LINES);
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserTRK', X.parserTRK);
goog.exportSymbol('X.parserTRK.prototype.parse', X.parserTRK.prototype.parse);

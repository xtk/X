/*
 * ${HEADER}
 */

// provides
goog.provide('X.parserTRK');

// requires
goog.require('X.exception');
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for the binary .TRK format.
 * 
 * @constructor
 * @extends {X.base}
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
  this._className = 'parserTRK';
  
};
// inherit from X.parser
goog.inherits(X.parserTRK, X.parser);


/**
 * @inheritDoc
 */
X.parserTRK.prototype.parse = function(object, data) {

  var p = object.points();
  var n = object.normals();
  
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
  
  // loop through all fibers
  for ( var i = 0; i < 2; i++) {
    var numPoints = this.parseUInt32(data, offset);
    console.log(numPoints);
    offset += 4;
    // continue;
    
    // loop through the points of this fiber
    for ( var j = 0; j < numPoints - 1; j++) {
      
      var x = this.parseFloat32(data, offset);
      offset += 4;
      
      var y = this.parseFloat32(data, offset);
      offset += 4;
      
      var z = this.parseFloat32(data, offset);
      offset += 4;
      
      var scalars = null;
      
      // read scalars
      if (header.n_scalars > 0) {
        scalars = this.parseFloat32Array(data, offset, header.n_scalars);
        offset += (header.n_scalars * 4);
      }
      
      // Convert coordinates to world space by dividing by spacing
      x = x / header.voxel_size[0];
      y = y / header.voxel_size[1];
      z = z / header.voxel_size[2];
      
      p.add(x, y, z);
      // p.add(x_next, y_next, z_next);
      
      // add artificial normals
      n.add(1, 1, 1);
      // n.add(1, 1, 1);
      
    }
    
    // read additional properties, if existing
    // we don't support them right now in XTK
    if (header.n_properties > 0) {
      var properties = this
          .parseFloat32Array(data, offset, header.n_properties);
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
    
  } // end of loop through all tracks
  


  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserTRK', X.parserTRK);
goog.exportSymbol('X.parserTRK.prototype.parse', X.parserTRK.prototype.parse);

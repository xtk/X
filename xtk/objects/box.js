/*
 * ${HEADER}
 */

// provides
goog.provide('X.box');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.object');
goog.require('X.points');
goog.require('goog.math.Vec3');



/**
 * Create a displayable box.
 * 
 * @constructor
 * @inheritDoc
 * @param {!goog.math.Vec3} center The center position in 3D space.
 * @param {!number} radiusX The radius of the box in X-direction.
 * @param {!number} radiusY The radius of the box in Y-direction.
 * @param {!number} radiusZ The radius of the box in Z-direction.
 * @extends {X.object}
 */
X.box = function(center, radiusX, radiusY, radiusZ, type) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof goog.math.Vec3)) {
    
    throw new X.exception('Fatal: Invalid center for the box!');
    
  }
  
  if (!goog.isNumber(radiusX) || !goog.isNumber(radiusY) ||
      !goog.isNumber(radiusZ)) {
    
    throw new X.exception('Fatal: Wrong edge lengths for the box!');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this, type);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'box';
  
  this._center = center;
  
  this._radiusX = radiusX;
  
  this._radiusY = radiusY;
  
  this._radiusZ = radiusZ;
  
  this._spacingX = 2 * radiusX;
  
  this._spacingY = 2 * radiusY;
  
  this._spacingZ = 2 * radiusZ;
  
  this._frontColor = null;
  
  this._topColor = null;
  
  this._rightColor = null;
  
  this._bottomColor = null;
  
  this._leftColor = null;
  
  this._backColor = null;
  
  /**
   * @inheritDoc
   * @const
   */
  this._textureCoordinateMap = [
  // Front face
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Back face
  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

  // Top face
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,

  // Bottom face
  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

  // Right face
  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

  // Left face
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, ];
  
  this.create_();
  
};
// inherit from X.base
goog.inherits(X.box, X.object);


/**
 * Set side colors for this X.box. This triggers the re-creation of all vertices
 * of this object after the colors are set.
 * 
 * @param {!X.color} front The X.color for the front (in positive Z direction)
 *          facing side.
 * @param {!X.color} top The X.color for the top (in positive Y direction)
 *          facing side.
 * @param {!X.color} right The X.color for the right (in positive X direction)
 *          facing side.
 * @param {!X.color} bottom The X.color for the bottom (in negative Y direction)
 *          facing side.
 * @param {!X.color} left The X.color for the left (in negative X direction)
 *          facing side.
 * @param {!X.color} back The X.color for the back (in negative Z direction)
 *          facing side.
 * @throws {X.exception} If the given colors are invalid.
 */
X.box.prototype.setColors = function(front, top, right, bottom, left, back) {

  if (!goog.isDefAndNotNull(front) || !(front instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for front side!');
    
  }
  
  if (!goog.isDefAndNotNull(top) || !(top instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for top side!');
    
  }
  
  if (!goog.isDefAndNotNull(right) || !(right instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for right side!');
    
  }
  
  if (!goog.isDefAndNotNull(bottom) || !(bottom instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for bottom side!');
    
  }
  
  if (!goog.isDefAndNotNull(left) || !(left instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for left side!');
    
  }
  
  if (!goog.isDefAndNotNull(back) || !(back instanceof X.color)) {
    
    throw new X.exception('Fatal: Wrong color for right side!');
    
  }
  
  this._frontColor = front;
  this._topColor = top;
  this._rightColor = right;
  this._bottomColor = bottom;
  this._leftColor = left;
  this._backColor = back;
  
  // re-setup the object
  this.create_();
  
};


/**
 * Set the spacing for this box. By default, the spacing is 1.0. This triggers
 * the re-creation of all vertices of this object after the spacing is set.
 * 
 * @param {number} spacing The new spacing.
 */
X.box.prototype.setSpacing = function(spacing) {

  if (!goog.isNumber(spacing)) {
    
    throw new X.exception('Fatal: Wrong spacing value!');
    
  }
  
  this._spacing = spacing;
  
  this.create_();
  
};


/**
 * Create the points and colors for this box.
 * 
 * @private
 */
X.box.prototype.create_ = function() {

  // TODO line rendering does not behave correctly right now
  // TODO spacing does not behave correctly right now
  
  // remove all old points and all colors
  this.points().clear();
  this.colors().clear();
  
  // the corners
  //
  // ....E____F
  // .../..../|
  // .A/___B/ |
  // .|....| / H
  // .|____|/
  // C.....D
  //
  // (G is the only invisible corner)
  
  var A = new goog.math.Vec3(this._center.x - this._radiusX, this._center.y +
      this._radiusY, this._center.z + this._radiusZ);
  
  var B = new goog.math.Vec3(this._center.x + this._radiusX, this._center.y +
      this._radiusY, this._center.z + this._radiusZ);
  
  var C = new goog.math.Vec3(this._center.x - this._radiusX, this._center.y -
      this._radiusY, this._center.z + this._radiusZ);
  
  var D = new goog.math.Vec3(this._center.x + this._radiusX, this._center.y -
      this._radiusY, this._center.z + this._radiusZ);
  
  var E = new goog.math.Vec3(this._center.x - this._radiusX, this._center.y +
      this._radiusY, this._center.z - this._radiusZ);
  
  var F = new goog.math.Vec3(this._center.x + this._radiusX, this._center.y +
      this._radiusY, this._center.z - this._radiusZ);
  
  var G = new goog.math.Vec3(this._center.x - this._radiusX, this._center.y -
      this._radiusY, this._center.z - this._radiusZ);
  
  var H = new goog.math.Vec3(this._center.x + this._radiusX, this._center.y -
      this._radiusY, this._center.z - this._radiusZ);
  

  // number of vertices for edge X
  var numberOfVerticesX = (2 * this._radiusX) / this._spacingX;
  
  // number of vertices for edge Y
  var numberOfVerticesY = (2 * this._radiusY) / this._spacingY;
  
  // number of vertices for edge Z
  var numberOfVerticesZ = (2 * this._radiusZ) / this._spacingZ;
  
  // indices for creating a side
  var i, j = 0;
  

  //
  // back facing surface
  
  // loop starts at E moves towards G, then column-wise towards F and H
  for (i = 0; i < numberOfVerticesX; ++i) {
    
    for (j = 0; j < numberOfVerticesY; ++j) {
      
      this.points().add(
          [E.x + (i * this._spacingX), E.y - (j * this._spacingY), E.z]);
      this.points().add(
          [E.x + (i * this._spacingX) + this._spacingX,
           E.y - (j * this._spacingY), E.z]);
      this.points().add(
          [E.x + (i * this._spacingX),
           E.y - (j * this._spacingY) - this._spacingY, E.z]);
      
      this.points().add(
          [E.x + (i * this._spacingX) + this._spacingX,
           E.y - (j * this._spacingY), E.z]);
      this.points().add(
          [E.x + (i * this._spacingX),
           E.y - (j * this._spacingY) - this._spacingY, E.z]);
      this.points().add(
          [E.x + (i * this._spacingX) + this._spacingX,
           E.y - (j * this._spacingY) - this._spacingY, E.z]);
      
      // if side colors are configured, set them
      if (this._backColor) {
        
        var cF;
        for (cF = 0; cF < 6; ++cF) {
          
          this.colors().add(this._backColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      

      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([0, 0, -1]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  

  //
  // top facing surface
  
  // loop starts at A moves towards B, then column-wise towards E and F
  for (i = 0; i < numberOfVerticesX; ++i) {
    
    for (j = 0; j < numberOfVerticesZ; ++j) {
      
      this.points().add(
          [A.x + (i * this._spacingX), A.y, A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX, A.y,
           A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x + (i * this._spacingX), A.y,
           A.z - (j * this._spacingZ) - this._spacingZ]);
      
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX, A.y,
           A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x + (i * this._spacingX), A.y,
           A.z - (j * this._spacingZ) - this._spacingZ]);
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX, A.y,
           A.z - (j * this._spacingZ) - this._spacingZ]);
      
      // if side colors are configured, set them
      if (this._topColor) {
        
        var cB;
        for (cB = 0; cB < 6; ++cB) {
          
          this.colors().add(this._topColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      
      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([0, 1, 0]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  


  // right facing surface
  
  // loop starts at B moves towards D, then column-wise towards F and H
  for (i = 0; i < numberOfVerticesY; ++i) {
    
    for (j = 0; j < numberOfVerticesZ; ++j) {
      
      this.points().add(
          [B.x, B.y - (i * this._spacingY), B.z - (j * this._spacingZ)]);
      this.points().add(
          [B.x, B.y - (i * this._spacingY) - this._spacingY,
           B.z - (j * this._spacingZ)]);
      this.points().add(
          [B.x, B.y - (i * this._spacingY),
           B.z - (j * this._spacingZ) - this._spacingZ]);
      
      this.points().add(
          [B.x, B.y - (i * this._spacingY) - this._spacingY,
           B.z - (j * this._spacingZ)]);
      this.points().add(
          [B.x, B.y - (i * this._spacingY),
           B.z - (j * this._spacingZ) - this._spacingZ]);
      this.points().add(
          [B.x, B.y - (i * this._spacingY) - this._spacingY,
           B.z - (j * this._spacingZ) - this._spacingZ]);
      
      // if side colors are configured, set them
      if (this._rightColor) {
        
        var cC;
        for (cC = 0; cC < 6; ++cC) {
          
          this.colors().add(this._rightColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      
      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([1, 0, 0]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  

  //
  // bottom facing surface
  
  // loop starts at C moves towards D, then column-wise towards G and H
  for (i = 0; i < numberOfVerticesX; ++i) {
    
    for (j = 0; j < numberOfVerticesZ; ++j) {
      
      this.points().add(
          [C.x + (i * this._spacingX), C.y, C.z - (j * this._spacingZ)]);
      this.points().add(
          [C.x + (i * this._spacingX) + this._spacingX, C.y,
           C.z - (j * this._spacingZ)]);
      this.points().add(
          [C.x + (i * this._spacingX), C.y,
           C.z - (j * this._spacingZ) - this._spacingZ]);
      
      this.points().add(
          [C.x + (i * this._spacingX) + this._spacingX, C.y,
           C.z - (j * this._spacingZ)]);
      this.points().add(
          [C.x + (i * this._spacingX), C.y,
           C.z - (j * this._spacingZ) - this._spacingZ]);
      this.points().add(
          [C.x + (i * this._spacingX) + this._spacingX, C.y,
           C.z - (j * this._spacingZ) - this._spacingZ]);
      
      // if side colors are configured, set them
      if (this._bottomColor) {
        
        var cD;
        for (cD = 0; cD < 6; ++cD) {
          
          this.colors().add(this._bottomColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      
      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([-1, 0, 0]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  

  //
  // left facing surface
  
  // loop starts at A moves towards C, then column-wise towards E and G
  for (i = 0; i < numberOfVerticesY; ++i) {
    
    for (j = 0; j < numberOfVerticesZ; ++j) {
      
      this.points().add(
          [A.x, A.y - (i * this._spacingY), A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x, A.y - (i * this._spacingY) - this._spacingY,
           A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x, A.y - (i * this._spacingY),
           A.z - (j * this._spacingZ) - this._spacingZ]);
      
      this.points().add(
          [A.x, A.y - (i * this._spacingY) - this._spacingY,
           A.z - (j * this._spacingZ)]);
      this.points().add(
          [A.x, A.y - (i * this._spacingY),
           A.z - (j * this._spacingZ) - this._spacingZ]);
      this.points().add(
          [A.x, A.y - (i * this._spacingY) - this._spacingY,
           A.z - (j * this._spacingZ) - this._spacingZ]);
      
      // if side colors are configured, set them
      if (this._leftColor) {
        
        var cE;
        for (cE = 0; cE < 6; ++cE) {
          
          this.colors().add(this._leftColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      
      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([0, -1, 0]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  

  //
  // front facing surface
  
  // loop starts at A moves towards C, then column-wise towards B and D
  for (i = 0; i < numberOfVerticesX; ++i) {
    
    for (j = 0; j < numberOfVerticesY; ++j) {
      
      this.points().add(
          [A.x + (i * this._spacingX), A.y - (j * this._spacingY), A.z]);
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX,
           A.y - (j * this._spacingY), A.z]);
      this.points().add(
          [A.x + (i * this._spacingX),
           A.y - (j * this._spacingY) - this._spacingY, A.z]);
      
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX,
           A.y - (j * this._spacingY), A.z]);
      this.points().add(
          [A.x + (i * this._spacingX),
           A.y - (j * this._spacingY) - this._spacingY, A.z]);
      this.points().add(
          [A.x + (i * this._spacingX) + this._spacingX,
           A.y - (j * this._spacingY) - this._spacingY, A.z]);
      
      // if side colors are configured, set them
      if (this._frontColor) {
        
        var cA;
        for (cA = 0; cA < 6; ++cA) {
          
          this.colors().add(this._frontColor);
          
        } // for loop of colors
        
      } // check if side colors are defined
      
      var count;
      for (count = 0; count < 6; ++count) {
        this.normals().add([0, 0, 1]);
      } // for loop of normals
      
    } // for j
    
  } // for i
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.box', X.box);
goog.exportSymbol('X.box.prototype.setSpacing', X.box.prototype.setSpacing);

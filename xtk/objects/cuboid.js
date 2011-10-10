/*
 * ${HEADER}
 */

// provides
goog.provide('X.cuboid');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.object');
goog.require('X.points');
goog.require('goog.math.Vec3');



/**
 * Create a displayable cuboid.
 *
 * @constructor
 * @inheritDoc
 * @param {!goog.math.Vec3} center The center position in 3D space.
 * @param {!number} radiusX The radius of the cuboid in X-direction.
 * @param {!number} radiusY The radius of the cuboid in Y-direction.
 * @param {!number} radiusZ The radius of the cuboid in Z-direction.
 * @extends {X.object}
 */
X.cuboid = function(center, radiusX, radiusY, radiusZ, type) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof goog.math.Vec3)) {

    throw new X.exception('Fatal: Invalid center for the cuboid!');

  }

  if (!goog.isNumber(radiusX) || !goog.isNumber(radiusY) ||
      !goog.isNumber(radiusZ)) {

    throw new X.exception('Fatal: Wrong edge lengths for the cuboid!');

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
  this._className = 'cuboid';

  this._center = center;

  this._radiusX = radiusX;

  this._radiusY = radiusY;

  this._radiusZ = radiusZ;

  this._spacing = 1.0;

  this._colorA = null;

  this._colorB = null;

  this._colorC = null;

  this._colorD = null;

  this._colorE = null;

  this._colorF = null;

  this.create_();

};
// inherit from X.base
goog.inherits(X.cuboid, X.object);


/**
 * Set side colors for this X.cuboid. This triggers the re-creation of all
 * vertices of this object after the colors are set.
 *
 * @param {!X.color} A The X.color for the front (in positive Z direction)
 *          facing side.
 * @param {!X.color} B The X.color for the top (in positive Y direction) facing
 *          side.
 * @param {!X.color} C The X.color for the right (in positive X direction)
 *          facing side.
 * @param {!X.color} D The X.color for the bottom (in negative Y direction)
 *          facing side.
 * @param {!X.color} E The X.color for the left (in negative X direction) facing
 *          side.
 * @param {!X.color} F The X.color for the back (in negative Z direction) facing
 *          side.
 * @throws {X.exception} If the given colors are invalid.
 */
X.cuboid.prototype.setColors = function(A, B, C, D, E, F) {

  if (!goog.isDefAndNotNull(A) || !(A instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side A!');

  }

  if (!goog.isDefAndNotNull(B) || !(B instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side B!');

  }

  if (!goog.isDefAndNotNull(C) || !(C instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side C!');

  }

  if (!goog.isDefAndNotNull(D) || !(D instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side D!');

  }

  if (!goog.isDefAndNotNull(E) || !(E instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side E!');

  }

  if (!goog.isDefAndNotNull(F) || !(F instanceof X.color)) {

    throw new X.exception('Fatal: Wrong color for side F!');

  }

  this._colorA = A;
  this._colorB = B;
  this._colorC = C;
  this._colorD = D;
  this._colorE = E;
  this._colorF = F;

  // re-setup the object
  this.create_();

};


/**
 * Set the spacing for this cuboid. By default, the spacing is 1.0. This
 * triggers the re-creation of all vertices of this object after the spacing is
 * set.
 *
 * @param {number} spacing The new spacing.
 */
X.cuboid.prototype.setSpacing = function(spacing) {

  if (!goog.isNumber(spacing)) {

    throw new X.exception('Fatal: Wrong spacing value!');

  }

  this._spacing = spacing;

  this.create_();

};


/**
 * Create the points and colors for this cuboid.
 *
 * @private
 */
X.cuboid.prototype.create_ = function() {

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
  var numberOfVerticesX = (2 * this._radiusX) / this._spacing;

  // number of vertices for edge Y
  var numberOfVerticesY = (2 * this._radiusY) / this._spacing;

  // number of vertices for edge Z
  var numberOfVerticesZ = (2 * this._radiusZ) / this._spacing;

  // indices for creating a side
  var i, j = 0;


  //
  // back facing surface

  // loop starts at E moves towards G, then column-wise towards F and H
  for (i = 0; i < numberOfVerticesX; ++i) {

    for (j = 0; j < numberOfVerticesY; ++j) {

      this.points().add(
          [E.x + (i * this._spacing), E.y - (j * this._spacing), E.z]);
      this.points().add(
          [E.x + (i * this._spacing) + 1, E.y - (j * this._spacing), E.z]);
      this.points().add(
          [E.x + (i * this._spacing), E.y - (j * this._spacing) - 1, E.z]);

      this.points().add(
          [E.x + (i * this._spacing) + 1, E.y - (j * this._spacing), E.z]);
      this.points().add(
          [E.x + (i * this._spacing), E.y - (j * this._spacing) - 1, E.z]);
      this.points().add(
          [E.x + (i * this._spacing) + 1, E.y - (j * this._spacing) - 1, E.z]);

      // if side colors are configured, set them
      if (this._colorF) {

        var cF;
        for (cF = 0; cF < 6; ++cF) {

          this.colors().add(this._colorF);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i


  //
  // top facing surface

  // loop starts at A moves towards B, then column-wise towards E and F
  for (i = 0; i < numberOfVerticesX; ++i) {

    for (j = 0; j < numberOfVerticesZ; ++j) {

      this.points().add(
          [A.x + (i * this._spacing), A.y, A.z - (j * this._spacing)]);
      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y, A.z - (j * this._spacing)]);
      this.points().add(
          [A.x + (i * this._spacing), A.y, A.z - (j * this._spacing) - 1]);

      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y, A.z - (j * this._spacing)]);
      this.points().add(
          [A.x + (i * this._spacing), A.y, A.z - (j * this._spacing) - 1]);
      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y, A.z - (j * this._spacing) - 1]);

      // if side colors are configured, set them
      if (this._colorB) {

        var cB;
        for (cB = 0; cB < 6; ++cB) {

          this.colors().add(this._colorB);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i


  //
  // right facing surface

  // loop starts at B moves towards D, then column-wise towards F and H
  for (i = 0; i < numberOfVerticesY; ++i) {

    for (j = 0; j < numberOfVerticesZ; ++j) {

      this.points().add(
          [B.x, B.y - (i * this._spacing), B.z - (j * this._spacing)]);
      this.points().add(
          [B.x, B.y - (i * this._spacing) - 1, B.z - (j * this._spacing)]);
      this.points().add(
          [B.x, B.y - (i * this._spacing), B.z - (j * this._spacing) - 1]);

      this.points().add(
          [B.x, B.y - (i * this._spacing) - 1, B.z - (j * this._spacing)]);
      this.points().add(
          [B.x, B.y - (i * this._spacing), B.z - (j * this._spacing) - 1]);
      this.points().add(
          [B.x, B.y - (i * this._spacing) - 1, B.z - (j * this._spacing) - 1]);

      // if side colors are configured, set them
      if (this._colorC) {

        var cC;
        for (cC = 0; cC < 6; ++cC) {

          this.colors().add(this._colorC);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i


  //
  // bottom facing surface

  // loop starts at C moves towards D, then column-wise towards G and H
  for (i = 0; i < numberOfVerticesX; ++i) {

    for (j = 0; j < numberOfVerticesZ; ++j) {

      this.points().add(
          [C.x + (i * this._spacing), C.y, C.z - (j * this._spacing)]);
      this.points().add(
          [C.x + (i * this._spacing) + 1, C.y, C.z - (j * this._spacing)]);
      this.points().add(
          [C.x + (i * this._spacing), C.y, C.z - (j * this._spacing) - 1]);

      this.points().add(
          [C.x + (i * this._spacing) + 1, C.y, C.z - (j * this._spacing)]);
      this.points().add(
          [C.x + (i * this._spacing), C.y, C.z - (j * this._spacing) - 1]);
      this.points().add(
          [C.x + (i * this._spacing) + 1, C.y, C.z - (j * this._spacing) - 1]);

      // if side colors are configured, set them
      if (this._colorD) {

        var cD;
        for (cD = 0; cD < 6; ++cD) {

          this.colors().add(this._colorD);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i


  //
  // left facing surface

  // loop starts at A moves towards C, then column-wise towards E and G
  for (i = 0; i < numberOfVerticesY; ++i) {

    for (j = 0; j < numberOfVerticesZ; ++j) {

      this.points().add(
          [A.x, A.y - (i * this._spacing), A.z - (j * this._spacing)]);
      this.points().add(
          [A.x, A.y - (i * this._spacing) - 1, A.z - (j * this._spacing)]);
      this.points().add(
          [A.x, A.y - (i * this._spacing), A.z - (j * this._spacing) - 1]);

      this.points().add(
          [A.x, A.y - (i * this._spacing) - 1, A.z - (j * this._spacing)]);
      this.points().add(
          [A.x, A.y - (i * this._spacing), A.z - (j * this._spacing) - 1]);
      this.points().add(
          [A.x, A.y - (i * this._spacing) - 1, A.z - (j * this._spacing) - 1]);

      // if side colors are configured, set them
      if (this._colorE) {

        var cE;
        for (cE = 0; cE < 6; ++cE) {

          this.colors().add(this._colorE);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i


  //
  // front facing surface

  // loop starts at A moves towards C, then column-wise towards B and D
  for (i = 0; i < numberOfVerticesX; ++i) {

    for (j = 0; j < numberOfVerticesY; ++j) {

      this.points().add(
          [A.x + (i * this._spacing), A.y - (j * this._spacing), A.z]);
      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y - (j * this._spacing), A.z]);
      this.points().add(
          [A.x + (i * this._spacing), A.y - (j * this._spacing) - 1, A.z]);

      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y - (j * this._spacing), A.z]);
      this.points().add(
          [A.x + (i * this._spacing), A.y - (j * this._spacing) - 1, A.z]);
      this.points().add(
          [A.x + (i * this._spacing) + 1, A.y - (j * this._spacing) - 1, A.z]);

      // if side colors are configured, set them
      if (this._colorA) {

        var cA;
        for (cA = 0; cA < 6; ++cA) {

          this.colors().add(this._colorA);

        } // for loop of colors

      } // check if side colors are defined

    } // for j

  } // for i



};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cuboid', X.cuboid);
goog.exportSymbol('X.cuboid.prototype.setSpacing',
    X.cuboid.prototype.setSpacing);

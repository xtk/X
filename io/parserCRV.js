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
 * CREDITS
 * 
 *   - the .CRV Fileparser is based on a version of Dan Ginsburg, Children's Hospital Boston (see LICENSE)
 *   
 */

// provides
goog.provide('X.parserCRV');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for the binary .CRV format of Freesurfer.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserCRV = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserCRV';
  
  /**
   * Here, the data stream is big endian.
   * 
   * @inheritDoc
   */
  this._littleEndian = false;
  
};
// inherit from X.parser
goog.inherits(X.parserCRV, X.parser);

X.parserCRV.prototype.terrainColorLabels_init = function(XScalarsObject) {
    //
    // This method initializes the label colors for terrain coloring.
    // A single label is assigned to a range of mesh values. This label
    // has a lower color bound, and an upper color bound. The color assigned
    // to the mesh point within a label's bound is a smooth interpolation
    // between the lower and upper label colors, based on the scalar value
    // at a mesh point.
    //
    
    //
    // initialize label'ed color ranges
    //
    v_labelMinColors    = new Float32Array(40);
    v_labelMaxColors    = new Float32Array(40);

    // Values on the mesh can be associated with different
    // label colors. Each label is defined by:
    // 1.  A range of values from the minimum mesh value to 
    //     the maximum mesh value that should be covered by
    //     a given label.
    // 2a. The "minimum" color that is assigned to the lowest
    //     mesh value associated with that label.
    // 2b. The "maximum" color that is assigned to the highest
    //     mesh value associated with that label.
    // 2c. Mesh values between the label min and max values are
    //     smoothly interpolated between the min and max colors.
    //     If min and max colors for a mesh label are identical,
    //     no interpolation is performed.
    
    // Colors are defined as [R, G, B, alpha] with
    // RGB values between 0.00 and 1.00.

    // Waters
    var v_deepBlue      = [0.00, 0.00, 0.33, 1.00];
    var v_darkBlue      = [0.00, 0.00, 0.60, 1.00];
    var v_cyan          = [0.10, 0.80, 0.80, 1.00];

    // Low to midLands
    var v_darkGreen     = [0.00, 0.20, 0.00, 1.00];
    var v_lightGreen    = [0.20, 0.80, 0.20, 1.00];
    var v_darkKhaki     = [0.70, 0.70, 0.40, 1.00];
    var v_khaki         = [0.94, 0.90, 0.55, 1.00];

    // Mountains
    var v_gray          = [0.20, 0.20, 0.20, 1.00];
    var v_white         = [1.00, 1.00, 1.00, 1.00];
    
    var colorSize = 4;
    v_labelMinColors.subArray_set(v_deepBlue,   0*colorSize);
    v_labelMaxColors.subArray_set(v_darkBlue,   0*colorSize);

    v_labelMinColors.subArray_set(v_darkBlue,   1*colorSize);
    v_labelMaxColors.subArray_set(v_cyan,       1*colorSize);

    v_labelMinColors.subArray_set(v_darkGreen,  2*colorSize);
    v_labelMaxColors.subArray_set(v_lightGreen, 2*colorSize);    
    
    v_labelMinColors.subArray_set(v_lightGreen, 3*colorSize);
    v_labelMaxColors.subArray_set(v_darkKhaki,  3*colorSize);

    v_labelMinColors.subArray_set(v_darkKhaki,  4*colorSize);
    v_labelMaxColors.subArray_set(v_khaki,      4*colorSize);

    v_labelMinColors.subArray_set(v_khaki,      5*colorSize);
    v_labelMaxColors.subArray_set(v_gray,       5*colorSize);

    v_labelMinColors.subArray_set(v_gray,       6*colorSize);
    v_labelMaxColors.subArray_set(v_white,      6*colorSize);

    XScalarsObject._labelsCount            = 7;
    XScalarsObject._labelMinColor          = v_labelMinColors;
    XScalarsObject._labelMaxColor          = v_labelMaxColors;
    
};


X.parserCRV.prototype.terrainColorLabels_interpolate = 
    function(aXScalarsObject, af_minScalar, af_maxScalar) {
    //
    // Setup intensities for "terrain" interpolation. In RGB space
    // terrain interpolation can be tricky since moving from one 
    // color to another can be non-linear. Since the shaders use
    // the v_intensity[] array for each label to find the interpolation,
    // we can "tune" the dynamic range of the interpolation slope somewhat
    // by setting v_intesity[1] to relatively large values. This biases
    // the color interpolation to be "closer" to v_intensity[0] and picks
    // up smaller detail if the scalar range is low.
    //
    // Intensity lookup are encoded as a vec3 tuple, with the
    // first and second values defining the lower and upper 
    // threshold values. The third value is currently unused.
    //
    // The entire color range is divided into 14 segments. The
    // lower 7 for shades of blue sea, the upper 7 for the earth's
    // green/brown/whites.
    //
    // More specifically:
    //                                      lightGreen
    //                                          |     khaki   white
    //                                          |       |       |
    //                                          V       V       V
    // -7  -6  -5  -4  -3  -2  -1   0   1   2   3   4   5   6   7
    //  |---|---|---|---|---|---|---|---|---|---|---|---|---|---|
    //  ^               ^           ^                 ^     ^   
    //  |               |           |                 |     |   
    //  +----+      deepBlue     +--+--+              |   gray
    //       |                   |     |              | 
    //   darkBlue              cyan  darkGreen     darkKhaki
    //
    var intensitySize = 3; 
    var v_intensity     = new Float32Array(3);
    var f_range         = af_maxScalar - af_minScalar;
    var f_regionSize    = f_range / 14;
    var f_zeroPoint     = 0.0;
    // If the scalar values are purely positive, set the "zeroPoint" to midway
    // between f_minScalar and f_maxScalar
    if(af_minScalar >= 0) {
        f_zeroPoint     = f_range / 2;
    }
    aXScalarsObject._labelIntensities.subArray_set(v_intensity, 0);
    for(var region = 0; region < aXScalarsObject._labelsCount; region++) {
        switch(region) {
        // The sea colours
        case 0:
            // deepBlue --> darkblue
            v_intensity[0]    = af_minScalar;
            v_intensity[1]    = af_minScalar + f_regionSize * 4.0;
            break;
        case 1:
            // darkBlue --> cyan    
            v_intensity[0]    = af_minScalar + f_regionSize * 4.0;
            v_intensity[1]    = f_zeroPoint;
            break;
        // Now the land masses
        case 2:
            // darkGreen --> lightGreen    
            v_intensity[0]    = f_zeroPoint;
            v_intensity[1]    = f_regionSize * 3.0;
            break;
        case 3:
            // lightGreen --> darkKhaki    
            v_intensity[0]    = f_zeroPoint + f_regionSize * 3.0;
            v_intensity[1]    = f_zeroPoint + f_regionSize * 7.0;
            break;
        case 4:
            // darkKhaki --> khaki    
            v_intensity[0]    = f_zeroPoint + f_regionSize * 4.5;
            v_intensity[1]    = f_zeroPoint + f_regionSize * 28.0;
            break;
        case 5:
            // khaki --> gray
            v_intensity[0]    = f_zeroPoint + f_regionSize * 5.0;
            v_intensity[1]    = f_zeroPoint + f_regionSize * 21.0;
            break;
        case 6:
            // gray --> white
            v_intensity[0]    = f_zeroPoint + f_regionSize * 6.0;
            v_intensity[1]    = f_zeroPoint + f_regionSize * 14.0;
            break;
        }
        
        v_intensity[2]    = -1.0;
        aXScalarsObject._labelIntensities.subArray_set(v_intensity, 
                (region)*intensitySize);
    }
};


/**
 * @inheritDoc
 */
X.parserCRV.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var ind = object._pointIndices;
  
  // we need point indices here, so fail if there aren't any
  if (ind.length == 0) {
    
    throw new Error('No _pointIndices defined on the X.object.');
    
  }
  
  // attach the given data
  this._data = data;
  
  // directly jump 3 bytes to skip the magic number
  this.jumpTo(3);
  
  var numVertices = this.scan('uint');
  var fnum = this.scan('uint');
  var valsPerVertex = this.scan('uint');
  
  var numPosValues = 0;
  var numNegValues = 0;
  var negSum = 0.0;
  var posSum = 0.0;
  var posMean = 0.0;
  var negMean = 0.0;
  var posStdDev = 0.0;
  var negStdDev = 0.0;
  var sum = 0.0;
  var mean = 0.0;
  var stdDev = 0.0;
  var numValues = 0;
  var minCurv = new Array(2);
  var maxCurv = new Array(2);
  
  // parse the curvature values
  var vertexCurvatures = this.scan('float', numVertices);
  
  // first loop to get min, max, posSum, negSum
  var k;
  for (k = 0; k < numVertices; k++) {
    
    var curv = vertexCurvatures[k];
    
    if (k == 0) {
      minCurv[0] = maxCurv[0] = curv;
    }
    if (curv >= 0.0) {
      numPosValues++;
      posSum += curv;
    } else {
      numNegValues++;
      negSum += curv;
    }
    
    sum += curv;
    numValues++;
    
    maxCurv[0] = Math.max(curv, maxCurv[0]);
    minCurv[0] = Math.min(curv, minCurv[0]);
    
    vertexCurvatures[k] = curv;
  }
  
  // calculate the means
  if (numPosValues != 0) {
    posMean = posSum / numPosValues;
  }
  
  if (numNegValues != 0) {
    negMean = negSum / numNegValues;
  }
  
  if (numValues != 0) {
    mean = sum / numValues;
  }
  
  posSum = 0.0;
  negSum = 0.0;
  sum = 0.0;
  
  // second loop to get the sums regarding the means
  var i;
  for (i = 0; i < numVertices; i++) {
    var curv = vertexCurvatures[i];
    var diffSq = 0;
    if (curv >= 0.0) {
      diffSq = Math.pow((curv - posMean), 2);
      posSum += diffSq;
    } else {
      diffSq = Math.pow((curv - negMean), 2);
      negSum += diffSq;
    }
    
    diffSq = Math.pow((curv - mean), 2);
    sum += diffSq;
  }
  
  // calculate the standard deviations
  if (numPosValues > 1) {
    posStdDev = Math.sqrt(posSum / (numPosValues - 1));
  }
  
  if (numNegValues > 1) {
    negStdDev = Math.sqrt(negSum / (numNegValues - 1));
  }
  
  if (numValues > 1) {
    stdDev = Math.sqrt(sum / (numValues - 1));
  }
  
  // Store also 2.5 standard deviations from each mean. This is
  // a more reasonable range to render with
  minCurv[1] = negMean - 2.5 * negStdDev;
  maxCurv[1] = posMean + 2.5 * posStdDev;
  
  //
  // If required, define the interpolation label scheme intensities
  //
  if(object._scalars._interpolation == 2) {
      this.terrainColorLabels_init(object._scalars);
      this.terrainColorLabels_interpolate(object.scalars, minCurv[1], maxCurv[1]);
  }
  
  //
  // now order the curvature values based on the indices
  //
  
  var numberOfIndices = ind.length;
  
  var orderedCurvatures = new Float32Array(numberOfIndices * 3);
  
  for (i = 0; i < numberOfIndices; i++) {
    
    var currentIndex = ind[i];
    
    // grab the current scalar
    var currentScalar = vertexCurvatures[currentIndex];
    
    // add the scalar 3x since we need to match the point array length
    var _i = i * 3;
    orderedCurvatures[_i] = currentScalar;
    orderedCurvatures[_i + 1] = currentScalar;
    orderedCurvatures[_i + 2] = currentScalar;
    
  }
  
  // attach min, max curvature values and the whole shebang!
  object._scalars._min = minCurv[1];
  object._scalars._max = maxCurv[1];
  // .. and set the default threshold
  // only if the threshold was not already set
  if (object._scalars._lowerThreshold == -Infinity) {
    object._scalars._lowerThreshold = minCurv[1];
  }
  if (object._scalars._upperThreshold == Infinity) {
    object._scalars._upperThreshold = maxCurv[1];
  }
  
  object._scalars._array = vertexCurvatures; // the un-ordered scalars
  object._scalars._glArray = orderedCurvatures; // the ordered, gl-Ready
  // now mark the scalars dirty
  object._scalars._dirty = true;
  
  X.TIMERSTOP(this._classname + '.parse');
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCRV', X.parserCRV);
goog.exportSymbol('X.parserCRV.prototype.parse', X.parserCRV.prototype.parse);

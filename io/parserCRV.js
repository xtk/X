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
      // Setup intensities for "terrain" interpolation. In a terrain
      // interpolation, the scalar "curvature" value at a mesh point
      // is assigned an interpolated value between defined label
      // values.
      //
      // Intensity lookup are encoded as a vec3 tuple, with the
      // first and second values defining the lower and upper 
      // threshold values. The third value is currently unused.
      //
      // The entire color range is divided into 12 segments. The
      // lower 6 for shades of blue sea, the upper six for the earth's
      // green/brown/whites.
      //
      // More specifically:
      //
      // -6  -5  -4  -3  -2  -1   0   1   2   3   4   5   6 
      //  |---|---|---|---|---|---|---|---|---|---|---|---|
      //  |<- deep blues->|<----->|<- green ->|<----->|<->|
      //                      ^                   ^     ^
      //                      |             +-----|     |
      //                 light blues        |       +---+
      //                                  brown     |
      //                                          white
      //
      var intensitySize = 3; 
      var v_intensity   = new Float32Array(3);
      var f_range       = maxCurv[1] - minCurv[1];
      var f_regionSize  = f_range / 12;
      if(minCurv[1] < 0 ) {
          object._scalars._labelIntensities.subArray_set(v_intensity, 0);
          for(var region = 0; region < 5; region++) {
              switch(region) {
              case 0:
                  v_intensity[0]    = minCurv[1];
                  v_intensity[1]    = minCurv[1] + f_regionSize * 4;
                  break;
              case 1:
                  v_intensity[0]    = minCurv[1] + f_regionSize * 4;
                  v_intensity[1]    = 0;
                  break;
              case 2:
                  v_intensity[0]    = 0;
                  v_intensity[1]    = f_regionSize * 3;
                  break;
              case 3:
                  v_intensity[0]    = f_regionSize * 3;
                  v_intensity[1]    = f_regionSize * 5;
                  break;
              case 4:
                  v_intensity[0]    = f_regionSize * 5;
                  v_intensity[1]    = f_regionSize * 6;
                  break;
              }
              v_intensity[2]    = -1.0;
              object._scalars._labelIntensities.subArray_set(v_intensity, 
                      (region)*intensitySize);
          }
      } else {
          // Dynamically set the "zero" point to the center of the
          // min-max range
          v_intensity[0]    =  minCurv[1];
          v_intensity[1]    =  minCurv[1] + 3*f_range;
          v_intensity[2]    = -1.0;
          var f_zeroPoint   = v_intensity[1];
          for(var region = 0; region < 3; region++) {
              v_intensity[0]    = f_zeroPoint + region * f_regionSize;
              v_intensity[1]    = f_zeroPoint + v_intensity[0] + f_regionSize;
              v_intensity[2]    = -1.0;
              object._scalars._labelIntensities.subArray_set(v_intensity, 
                      (region+1)*intensitySize);
          }
      }
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

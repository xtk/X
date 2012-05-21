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
goog.require('X.parserHelper');
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
  
};
// inherit from X.parser
goog.inherits(X.parserCRV, X.parser);


/**
 * @inheritDoc
 */
X.parserCRV.prototype.parse = function(object, data) {

  var ind = object._pointIndices;
  
  // we need point indices here, so fail if there aren't any
  if (ind.length == 0) {
    
    throw new Error('No _pointIndices defined on the X.object.');
    
  }
  
  var currentOffset = 0;
  
  var magicNumber = this.parseUInt24EndianSwapped(data, currentOffset);
  currentOffset += 3;
  
  // This hackery is the fact that the new version defines this
  // as a magic number to identify the new file type
  if (magicNumber != 16777215) {
    alert("Can't load curvature file, invalid magic number.");
    return;
  }
  
  var numVertices = this.parseUInt32EndianSwapped(data, currentOffset);
  
  currentOffset += 4;
  var fnum = this.parseUInt32EndianSwapped(data, currentOffset);
  currentOffset += 4;
  var valsPerVertex = this.parseUInt32EndianSwapped(data, currentOffset);
  currentOffset += 4;
  
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
  var vertexCurvatures = new Array(numVertices);
  var minCurv = new Array(2);
  var maxCurv = new Array(2);
  
  var k;
  for (k = 0; k < numVertices; k++) {
    var curv = this.parseFloat32EndianSwapped(data, currentOffset);
    currentOffset += 4;
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
  // now order the curvature values based on the indices
  //
  var numberOfScalars = numVertices;
  var numberOfIndices = ind.length;
  
  var orderedCurvatures = [];
  
  for (i = 0; i < numberOfIndices; i++) {
    
    var currentIndex = ind[i];
    
    // validate
    if (currentIndex > numberOfScalars) {
      
      throw new Error('Could not find scalar for vertex.');
      
    }
    
    // grab the current scalar
    var currentScalar = vertexCurvatures[currentIndex];
    
    // add the scalar 3x since we need to match the point array length
    orderedCurvatures.push(currentScalar);
    orderedCurvatures.push(currentScalar);
    orderedCurvatures.push(currentScalar);
    
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
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCRV', X.parserCRV);
goog.exportSymbol('X.parserCRV.prototype.parse', X.parserCRV.prototype.parse);

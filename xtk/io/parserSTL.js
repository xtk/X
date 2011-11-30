/*
 * ${HEADER}
 */

// provides
goog.provide('X.parserSTL');

// requires
goog.require('X.exception');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for the .STL format.
 * 
 * @constructor
 * @extends {X.base}
 */
X.parserSTL = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'parserSTL';
  
};
// inherit from X.parser
goog.inherits(X.parserSTL, X.parser);


/**
 * @inheritDoc
 */
X.parserSTL.prototype.parse = function(object, data) {

  var readAsArray = data.split('\n');
  
  var i;
  for (i = 0; i < readAsArray.length; i++) {
    
    var tmp = readAsArray[i];
    var tmpstr = tmp.split(' ');
    
    if (tmpstr[3] == 'vertex') {
      
      var x = parseFloat(tmpstr[4]);
      var y = parseFloat(tmpstr[5]);
      var z = parseFloat(tmpstr[6]);
      object.points().add(x, y, z);
      

    } else if (tmpstr[1] == 'facet') {
      var x = parseFloat(tmpstr[3]);
      var y = parseFloat(tmpstr[4]);
      var z = parseFloat(tmpstr[5]);
      object.normals().add(x, y, z);
      object.normals().add(x, y, z);
      object.normals().add(x, y, z);
      
    }
  }
  
  return object;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserSTL', X.parserSTL);
goog.exportSymbol('X.parserSTL.prototype.parse', X.parserSTL.prototype.parse);

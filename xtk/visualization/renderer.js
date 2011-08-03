
goog.provide('X.renderer');

goog.require('X.base');

X.renderer = function() {
  
  goog.base(this);
  
  this._className = 'renderer';  
  this._dimension = 2;
  
};
goog.inherits(X.renderer, X.base);

//
//
X.renderer.prototype.getDimension = function() {
  
  return this._dimension;
  
};


//
//
X.renderer.prototype.print = function() {

  output = goog.base(this, 'print');
  output += 'dimension: ' + this.getDimension() + '\n';
  
  return output;
  
};



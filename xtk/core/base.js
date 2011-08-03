goog.provide('X.base');

X.base = function() {
  
  this._className = 'base';
  
};

X.base.prototype.getClassName = function() {
  
  return this._className;
  
};

X.base.prototype.print = function() {
  
  output = '= X =\n';
  output += 'className: ' + this.getClassName() + '\n';
  
  return output;
  
};



goog.provide('X.base');

X.base = function() {
  
  this._className = 'base';
  
  this.getClassName = function() {
    
    return this._className;
    
  };

  this.print = function() {
    
    output = '= X =\n';
    output += 'className: ' + this.getClassName() + '\n';
    
    //return output;
    
  };
  
};



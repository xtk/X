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
 * 
 */
// provides
goog.provide('X.array');

// requires
goog.require('X.base');


/**
 * Create an array which can be sorted in-place using merge sort.
 * 
 * @constructor
 * @param {Function} comparator
 * @extends X.base
 */
X.array = function(comparator) {

  //
  // call the standard constructor
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this['_className'] = 'array';
  
  this._array = [];
  
  this._comparator = comparator;
  
};
// inherit from goog.math.Matrix
goog.inherits(X.array, X.base);


X.array.prototype.add = function(object) {

  this._array.push(object);
  
  return true;
  
};


X.array.prototype.clear = function() {

  this._array.length = 0;
  
};


X.array.prototype.swap_ = function(index1, index2) {

  // window.console.log('swapping');
  
  var tmp = this._array[index1];
  
  this._array[index1] = this._array[index2];
  
  this._array[index2] = tmp;
  
};


X.array.prototype.insert_ = function(begin, end, v) {

  // SOME COMPARISON
  // while (begin + 1 < end && this._array[begin + 1] < v) {
  while (begin + 1 < end && this._comparator(this._array[begin + 1], v) < 0) {
    
    this.swap_(begin, begin + 1);
    
    ++begin;
    
  }
  
  this._array[begin] = v;
  
};



X.array.prototype.merge_inplace_ = function(begin, begin_right, end) {

  for (; begin < begin_right; ++begin) {
    
    // SOME COMPARISON
    // if (this._array[begin] > this._array[begin_right]) {
    if (this._comparator(this._array[begin], this._array[begin_right]) > 0) {
      
      var v = this._array[begin];
      
      this._array[begin] = this._array[begin_right];
      
      this.insert_(begin_right, end, v);
      
    }
    
  }
  
};



X.array.prototype.msort_ = function(begin, end) {

  var size = end - begin;
  
  if (size < 2) {
    return;
  }
  
  var begin_right = begin + Math.floor(size / 2);
  
  this.msort_(begin, begin_right);
  
  this.msort_(begin_right, end);
  
  this.merge_inplace_(begin, begin_right, end);
  
};



X.array.prototype.sort = function() {

  this.msort_(0, this._array.length);
  
};

X.array.prototype.values = function() {

  return this._array;
  
};

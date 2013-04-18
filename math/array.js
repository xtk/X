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
   * @inheritDoc
   * @const
   */
  this._classname = 'array';

  /**
   * The underlying array.
   *
   * @type {!Array}
   * @protected
   */
  this._array = [];

  /**
   * The void pointer to a comparator function.
   *
   * @type {Function}
   * @protected
   */
  this._comparator = comparator;

};
// inherit from goog.math.Matrix
goog.inherits(X.array, X.base);


/**
 * Compare two arrays element by element.
 *
 * The length defines the range of comparison starting
 * from offset1 for the first array and offset2 for the
 * second array.
 *
 * @param {!Array|Float32Array} arr1 The first array.
 * @param {!Array|Float32Array} arr2 The second array.
 * @param {!number} offset1 The index offset of the first array.
 * @param {!number} offset2 The index offset of the second array.
 * @param {!number} _length The length for both arrays.
 * @return {boolean} TRUE if equal, FALSE if not equal.
 */
X.array.compare = function(arr1, arr2, offset1, offset2, _length) {

  for(var i = 0; i < _length; i++) {
    if(arr1[i + offset1] !== arr2[i + offset2]) {
      return false;
    }
  }

  return true;

};


/**
 * Add an object to the array.
 *
 * @param {*} object The object to add.
 * @return {boolean} TRUE if everything went fine.
 */
X.array.prototype.add = function(object) {

  this._array.push(object);

  return true;

};


/**
 * Remove an object from the array.
 *
 * @param {*} object The object to remove.
 * @return {boolean} TRUE if everything went fine.
 */
X.array.prototype.remove = function(object) {

  var _index = this._array.indexOf(object);

  if (_index > -1) {

    this._array.splice(_index, 1);

  }

  return true;

};


/**
 * Completely clear the array.
 */
X.array.prototype.clear = function() {

  this._array.length = 0;

};


/**
 * Swap two elements in the array.
 *
 * @param {!number} index1 Index of element1.
 * @param {!number} index2 Index of element2.
 */
X.array.prototype.swap_ = function(index1, index2) {

  var tmp = this._array[index1];

  this._array[index1] = this._array[index2];

  this._array[index2] = tmp;

};


/**
 * Orderly insert an element. This is part of the in-place sorting.
 *
 * @param {!number} begin The start index.
 * @param {!number} end The end index.
 * @param {*} v The value/object to insert.
 */
X.array.prototype.insert_ = function(begin, end, v) {

  // SOME COMPARISON
  // while (begin + 1 < end && this._array[begin + 1] < v) {
  while (begin + 1 < end && this._comparator(this._array[begin + 1], v) < 0) {

    this.swap_(begin, begin + 1);

    ++begin;

  }

  this._array[begin] = v;

};


/**
 * Merge component of the in-place sorting.
 *
 * @param {!number} begin The start index.
 * @param {!number} begin_right The start index from the right.
 * @param {!number} end The end index.
 */
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


/**
 * Recursive function to perform in-place merge sort.
 *
 * @param {!number} begin The start index.
 * @param {!number} end The end index.
 */
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


/**
 * Start the in-place merge sort on the complete array.
 */
X.array.prototype.sort = function() {

  this.msort_(0, this._array.length);

};


/**
 * Get the complete array.
 *
 * @return {!Array} The complete array.
 */
X.array.prototype.values = function() {

  return this._array;

};

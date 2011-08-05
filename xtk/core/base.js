/*
 * ${HEADER}
 */

// provides
goog.provide('X.base');

// requires
goog.require('X');



/**
 * The superclass class for all X.base-objects.
 *
 * @constructor
 */
X.base = function() {

  //
  // class attributes

  /**
   * The className of this class.
   *
   * @type {string}
   * @protected
   */
  this._className = 'base';

};


/**
 * Print the className of the current X.base-object.
 *
 * @return {string} The className of the current X.object.
 */
X.base.prototype.getClassName = function() {

  return this._className;

};


/**
 * Print the className and all attributes of the current X.base-object.
 *
 * @return {string} A string representation of the current X.base-object.
 */
X.base.prototype.print = function() {

  var attributes = Object.keys(this);
  var attributesStringList = '';
  var className = '<unknown>';

  // loop through the attributes of a class
  for (var a in attributes) {

    var aName = 'this.' + attributes[a];
    var aValue = eval(aName);

    // catch the className, since we want to display it differently
    if (aName == 'this._className') {
      className = aValue;
    } else {
      attributesStringList += aName + ': ' + aValue + '\n';
    }

  }

  // build string output
  var output = '== X.' + className + ' ==\n';
  output += attributesStringList;

  return output;

};

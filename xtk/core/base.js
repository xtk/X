/*
 * ${HEADER}
 */

// provides
goog.provide('X.base');

// requires
goog.require('X');
goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * The superclass class for all X.base-objects. All derived objects will be
 * registered for event handling.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
X.base = function() {

  //
  // register this class within the event system by calling the superclass
  // constructor
  goog.base(this);

  //
  // class attributes

  /**
   * The className of this class.
   *
   * @type {string}
   * @protected
   */
  this._className = 'base';

  /**
   * The uniqueId of this object. Each instance in XTK has a uniqueId.
   *
   * @type {string}
   * @protected
   */
  this._id = X.uniqueId('X');

};
// enable events
goog.inherits(X.base, goog.events.EventTarget);


/**
 * Print the className of the current X.base-object.
 *
 * @return {string} The className of the current X.object.
 */
X.base.prototype.className = function() {

  return this._className;

};


/**
 * Return the unique id of the current X.base-object.
 *
 * @return {string} The unique id of the current X.object.
 */
X.base.prototype.id = function() {

  return this._id;

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
  var a;
  for (a in attributes) {

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

// export symbols (required for advanced compilation)
goog.exportSymbol('X.base', X.base);
goog.exportSymbol('X.base.prototype.className', X.base.prototype.className);
goog.exportSymbol('X.base.prototype.id', X.base.prototype.id);
goog.exportSymbol('X.base.prototype.print', X.base.prototype.print);

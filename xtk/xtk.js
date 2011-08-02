
__importer = function(file) {

  var th = document.getElementsByTagName('head')[0];
  var s = document.createElement('script');
  s.setAttribute('type','text/javascript');
  s.setAttribute('src',file);
  th.appendChild(s);
  
};

__importer('thirdparty/closure/goog/base.js');

//

// namespace
goog.provide('X');
goog.provide('X.import');


X.import = __importer;

X.import('core/base.js');




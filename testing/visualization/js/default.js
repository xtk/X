/**
 * From http://javascript.about.com/library/bladdjs.htm Import javascript.
 * 
 * @param {string} jsname The js file path.
 * @param {string} pos 'head'/'body' as a position were to include.
 */
function addJavascript(jsname, pos) {

  var th = document.getElementsByTagName(pos)[0];
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', jsname);
  th.appendChild(s);
  
};

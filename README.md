# The X Toolkit: <i>WebGL&trade; for Scientific Visualization</i>

<b>XTK is <i>easy</i>, <i>lightweight</i> and <i>fast</i> !</b>

<ul>
<li>Native reading of <i>.vtk</i>, <i>.stl</i> and <i>.trk</i> files (more coming soon)</li>
<li>Integration of the <i><a href="http://evanw.github.com/csg.js/" target="_blank">Constructive Solid Geometry</a></i>-library supporting Boolean operations like union and intersection on meshes</li>
<li><i>Javascript and HTML5 based</i>: suppport of major browsers (Chrome, Firefox, Safari and Opera)</li>
<li><i>CDash</i> + <i>Google Closure Compiler</i> driven <a href="http://cdash.goxtk.com/index.php?project=XTK" target="_blank">build system</a></li>
</ul>

#### Demos ####
<a href="http://demos.goxtk.com/knee_atlas/"><img src="http://xtk.github.com/demos/knee_atlas/smallcaption.png" alt="knee_atlas" title="Click me!"></a>
<a href="http://demos.goxtk.com/brainfibers/"><img src="http://xtk.github.com/demos/brainfibers/smallcaption.png" alt="brainfibers" title="Click me!"></a>
<a href="http://demos.goxtk.com/aneurysm/"><img src="http://xtk.github.com/demos/aneurysm/smallcaption.png" alt="aneurysm" title="Click me!"></a>

#### Lessons ####
<a href="http://lessons.goxtk.com/00/"><img src="http://xtk.github.com/lessons/00/smallcaption.png" alt="lesson00" title="Click me!"></a>
<a href="http://lessons.goxtk.com/01/"><img src="http://xtk.github.com/lessons/01/smallcaption.png" alt="lesson01" title="Click me!"></a>
<a href="http://lessons.goxtk.com/02/"><img src="http://xtk.github.com/lessons/02/smallcaption.png" alt="lesson02" title="Click me!"></a>
<a href="http://lessons.goxtk.com/03/"><img src="http://xtk.github.com/lessons/03/smallcaption.png" alt="lesson03" title="Click me!"></a>
<br>
<a href="http://lessons.goxtk.com/04/"><img src="http://xtk.github.com/lessons/04/smallcaption.png" alt="lesson04" title="Click me!"></a>
<a href="http://lessons.goxtk.com/05/"><img src="http://xtk.github.com/lessons/05/smallcaption.png" alt="lesson05" title="Click me!"></a>
<a href="http://lessons.goxtk.com/06/"><img src="http://xtk.github.com/lessons/06/smallcaption.png" alt="lesson06" title="Click me!"></a>
<a href="http://lessons.goxtk.com/07/"><img src="http://xtk.github.com/lessons/07/smallcaption.png" alt="lesson07" title="Click me!"></a>

#### >>><br>>>> Get it right here: <a href="http://goXTK.com/xtk.js">xtk.js</a> !<br>>>>####

### Example Usage ###

    // create a new renderer
    var r = new X.renderer('r');
    r.init();
    
    // load a .vtk file
    var skull = new X.object();
    skull.load('skull.vtk');
    
    // add the object
    r.add(skull);
    
    // .. and render it
    r.render();

Click to see the <a href="http://lessons.goxtk.com/05/" target="_blank">live version</a>!

### API Documentation ###
The full documentation of the API is available <a href="http://api.goXTK.com" target="_blank">here</a>.

### More information... ###
...is available at <a href="http://wiki.goxtk.com" target="_blank"><b>Project X</b></a>, the X Toolkit wiki system.

### Contribute? ###
Yes, please! See the <a href="http://wiki.goxtk.com/index.php/X:DevelopersHeadsUp" target="_blank">Developer's Heads Up</a> and the <a href="http://wiki.goxtk.com/index.php/X:Future" target="_blank">X:Future page</a>.

### License ###
Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>

The X Toolkit (XTK) is licensed under the MIT License:
  <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">http://www.opensource.org/licenses/mit-license.php</a>

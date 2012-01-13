# The X Toolkit: <i>WebGL&trade; for Scientific Visualization</i>

<b>XTK is <i>easy</i>, <i>lightweight</i> and <i>fast</i> !</b>

<ul>
<li>Native reading of <i>.vtk</i>, <i>.stl</i> and <i>.trk</i> files (more coming soon)</li>
<li>Integration of the <i><a href="http://evanw.github.com/csg.js/" target="_blank">Constructive Solid Geometry</a></i>-library supporting Boolean operations like union and intersection on meshes</li>
<li>Javascript and HTML5 based: suppport of all major browsers (Chrome, Firefox, Safari and Opera)</li>
<li>CDash based <a href="http://cdash.goxtk.com/index.php?project=XTK" target="_blank">build system</a></li>
</ul>

#### Demos ####
<a href="http://demos.goxtk.com/knee_atlas/"><img src="http://xtk.github.com/demos/knee_atlas/caption.png" width="33%" alt="knee_atlas" title="Click me!"></a>
<a href="http://demos.goxtk.com/brainfibers/"><img src="http://xtk.github.com/demos/brainfibers/caption.png" width="33%" alt="brainfibers" title="Click me!"></a>
<a href="http://demos.goxtk.com/aneurysm/"><img src="http://xtk.github.com/demos/aneurysm/caption.png" width="33%" alt="aneurysm" title="Click me!"></a>

#### Lessons ####
<a href="http://lessons.goxtk.com/00/"><img src="http://xtk.github.com/lessons/00/caption.png" width="33%" alt="lesson00" title="Click me!"></a>

#### >>><br>>>> Get it right here: <a href="https://github.com/xtk/X/downloads">xtk.js</a> !<br>>>>####

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

Click to see the <a>live version</a>!

### API Documentation ###
The full documentation of the API is available <a href="http://api.goXTK.com" target="_blank">here</a>.

### More information... ###
...is available at <a href="http://wiki.goxtk.com" target="_blank"><b>Project X</b></a>, the X Toolkit wiki system.

### License ###
Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>

The X Toolkit (XTK) is licensed under the MIT License:
  http://www.opensource.org/licenses/mit-license.php

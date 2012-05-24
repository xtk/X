# The X Toolkit: <i>WebGL&trade; for Scientific Visualization</i>

<b>XTK is <i>easy</i>, <i>lightweight</i> and <i>fast</i> !</b>

<ul>
<li>Native reading of a <i><b>variety of scientific file formats</b></i> (see <a href="https://github.com/xtk/X/wiki/X:Fileformats">File formats</a>)</li>
<li><i><b>Volume rendering, thresholding and cross-sectional slicing</b></i> of 3d image data</li>
<li><i><b>Label maps, color tables and surface overlays</b></i> are supported, as well as <i><a href="http://evanw.github.com/csg.js/" target="_blank">Constructive Solid Geometry</a></i>
<li><i>Javascript and HTML5 based</i>: suppport of major browsers (Chrome, Firefox, Safari and Opera)</li>
<li>CDash + Google Closure driven <a href="http://cdash.goxtk.com/index.php?project=XTK" target="_blank"><i>build and test system</i></a></li>
</ul>

#### Demos ####
<a href="http://demos.goxtk.com/knee_atlas/"><img src="http://xtk.github.com/demos/knee_atlas/smallcaption2.png" alt="knee_atlas" title="Click me!"></a>
<a href="http://demos.goxtk.com/brainfibers/"><img src="http://xtk.github.com/demos/brainfibers/smallcaption2.png" alt="brainfibers" title="Click me!"></a>
<a href="http://demos.goxtk.com/aneurysm/"><img src="http://xtk.github.com/demos/aneurysm/smallcaption2.png" alt="aneurysm" title="Click me!"></a>
<a href="http://demos.goxtk.com/brain_atlas/"><img src="http://xtk.github.com/demos/brain_atlas/smallcaption2.png" alt="brain_atlas" title="Click me!"></a>
<br>
<a href="http://www.mindboggle.info/"><img src="http://xtk.github.com/demos/mindboggle/smallcaption2.png" alt="mindboggle" title="Click me!"></a>
<a href="http://demos.goxtk.com/daniels_brain/"><img src="http://xtk.github.com/demos/daniels_brain/smallcaption.png" alt="daniels_brain" title="Click me!"></a>
<a href="http://demos.goxtk.com/babybrains/"><img src="http://xtk.github.com/demos/babybrains/smallcaption.png" alt="babybrains" title="Click me!"></a>
<a href="http://ecm2.mathcs.emory.edu/aneurisk/"><img src="http://xtk.github.com/demos/aneuriskweb/smallcaption.png" alt="aneuriskweb" title="Click me!"></a>

#### Lessons ####

<table>
<tr>
<td valign="middle"><a href="http://lessons.goxtk.com/00/"><img src="http://xtk.github.com/lessons/00/minicaption.png" alt="lesson00" title="Click me!"></a></td>
<td valign="top"><b>Lesson 00: Hello cube!</b><br>The most simple XTK lesson displays a white cube.<br><span align='right'><img src='http://xtk.github.com/fiddlelogo_small.png'></span></td>
<td valign="middle"><a href="http://lessons.goxtk.com/01/"><img src="http://xtk.github.com/lessons/01/minicaption.png" alt="lesson01" title="Click me!"></a></td>
<td valign="top"><b>Lesson 01: Skin the cube and rotate it!</b><br>Skin the cube with an image and add some spinning..</td>
</tr>
</table>


 | | |
----|----|----|----
<a href="http://lessons.goxtk.com/00/"><img src="http://xtk.github.com/lessons/00/minicaption.png" alt="lesson00" title="Click me!"></a>|<b>Lesson 00: Hello cube!</b>|<a href="http://lessons.goxtk.com/00/"><img src="http://xtk.github.com/lessons/00/minicaption.png" alt="lesson00" title="Click me!"></a>|Lesson 00|



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
<br>
<a href="http://lessons.goxtk.com/08/"><img src="http://xtk.github.com/lessons/08/smallcaption.png" alt="lesson08" title="Click me!"></a>
<a href="http://lessons.goxtk.com/09/"><img src="http://xtk.github.com/lessons/09/smallcaption.png" alt="lesson09" title="Click me!"></a>
<a href="http://lessons.goxtk.com/10/"><img src="http://xtk.github.com/lessons/10/smallcaption.png" alt="lesson10" title="Click me!"></a>
<a href="http://lessons.goxtk.com/12/"><img src="http://xtk.github.com/lessons/12/smallcaption.png" alt="lesson12" title="Click me!"></a>
<br>
<a href="http://lessons.goxtk.com/11/"><img src="http://xtk.github.com/lessons/11/smallcaption.png" alt="lesson11" title="Click me!"></a>

#### >>><br>>>> Get it right here: <a href="http://get.goXTK.com/xtk.js">xtk.js</a> !<br>>>>####

### Example Usage ###

```javascript
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
```

Click to see the <a href="http://lessons.goxtk.com/05/" target="_blank">live version</a>!

### API Documentation ###
The full documentation of the API is available <a href="http://api.goXTK.com" target="_blank">here</a>.

### More information... ###
...is available at <a href="http://wiki.goxtk.com" target="_blank"><b>Project X</b></a>, the X Toolkit wiki system.

### Help? ###
We use <a href="http://stackoverflow.com/questions/tagged/xtk">http://stackoverflow.com/questions/tagged/xtk</a> for user support. Please ask and tag ([xtk]) your question there!

### Contribute? ###
Yes, please! See the <a href="https://github.com/xtk/X/wiki/X:DevelopersHeadsUp" target="_blank">Developer's Heads Up</a> and the <a href="https://github.com/xtk/X/wiki/X:Future" target="_blank">X:Future page</a>.

### License ###
Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>

The X Toolkit (XTK) is licensed under the MIT License:
  <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">http://www.opensource.org/licenses/mit-license.php</a>

### Affiliations and Sponsors ###
<a href="http://childrenshospital.org/FNNDSC"><img src="http://xtk.github.com/chb_logo.jpg" alt="Children's Hospital Boston" title="Children's Hospital Boston"></a>
<a href="http://hms.harvard.edu"><img src="http://xtk.github.com/hms_logo.jpg" alt="Harvard Medical School" title="Harvard Medical School"></a>
 
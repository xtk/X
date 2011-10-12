goog.provide('sampleApp');
goog.provide('sampleApp.run');

goog.require('X.color');
goog.require('X.colors');
goog.require('X.console');
goog.require('X.cube');
goog.require('X.cuboid');
goog.require('X.object');
goog.require('X.renderer2D');
goog.require('X.renderer3D');


/**
 * The main function of the sampleApp.
 */
sampleApp.run = function() {

  var c = new X.console();
  
  c.out('Starting sampleApp.init..');
  
  try {
    
    //
    // create three 2D renderers in the 2D divs (see ../index.html)
    // default color is black
    // also, we set the container here. If the container is ommited, the <body>
    // container is used
  
    // is lighting enabled?
    var lighting = document.getElementById("lighting").checked;
    
    var sliceView1 = new X.renderer2D(300, 300);
    sliceView1.setContainerById('sliceView1');
    sliceView1.init();
    sliceView1.setLighting(lighting);

    var sliceView2 = new X.renderer2D(300, 300);
    sliceView2.setContainerById('sliceView2');
    sliceView2.init();
    sliceView2.setLighting(lighting);

    var sliceView3 = new X.renderer2D(300, 300);
    sliceView3.setContainerById('sliceView3');
    sliceView3.init();
    sliceView3.setLighting(lighting);
    //
    // create a 'lightblue' 3D renderer in the div with id '3d' (see
    // ../index.html)
    var threeDView = new X.renderer3D(912, 400);
    threeDView.setContainerById('threeDView');
    threeDView.setBackgroundColor('#b3b3e7');
    threeDView.init();
    threeDView.setLighting(lighting);
    /*
    var object1 = new X.object();
    // we can add points as goog.math.Coordinate3 or just as 1-D arrays with 3
    // items
    object1.points().add([2, 2, 0]);
    object1.points().add([3, 3, 0]);
    object1.points().add([1, 2.5, 0]);
    // since we set an object color, individual point colors are overwritten
    object1.setColor(new X.color(1, 0, 0));
    object1.colors().add(new X.color(1, 1, 1));
    object1.colors().add(new X.color(1, 1, 1));
    object1.colors().add(new X.color(1, 1, 1));
    
    var object2 = new X.object(X.object.types.LINES);
    object2.points().add([20, 20, 0]);
    object2.points().add([30, 30, 0]);
    object2.points().add([10, 20.5, 0]);
    object2.points().add([10, 40.5, 0]);
    // here, we configure point colors properly
    object2.colors().add(new X.color(1, 1, 1));
    object2.colors().add(new X.color(1, 0, 0));
    object2.colors().add(new X.color(0, 0, 1));
    object2.colors().add(new X.color(0, 0, 1));
    object2.setOpacity(0.5);
    
    var object3 = new X.object();
    object3.points().add([-40, -40, 0]);
    object3.points().add([-50, -50, 0]);
    object3.points().add([-30, -30, 0]);
    object3.points().add([10, 20.5, 0]);
    // here, we do not configure any colors which should reset to default
    // (white)
    

    var color = new X.color(0, 1, 0);
    var object4 = new X.object();
    object4.points().add([-30, 40, 0]);
    object4.points().add([-50, 30, 0]);
    object4.points().add([-30, 30, 0]);
    object4.points().add([-10, 20, 0]);
    object4.setColor(color);
    object4.setOpacity(0.5);
    
    var color2 = new X.color(0, 1, 0);
    var object5 = new X.object();
    object5.points().add([-30, 40, -10]);
    object5.points().add([-50, 30, -10]);
    object5.points().add([-20, 10, -10]);
    object5.points().add([-10, 10, -10]);
    object5.setColor(color2);
    object5.setOpacity(0.1);*/
    
    // create a cuboid with different colored sides and decimated vertices
   /* var cuboid = new X.cuboid(new goog.math.Vec3(10, 10, 10), 5, 10, 20,
        X.object.types.LINES);
    cuboid
        .setColors(new X.color(1, 0, 0), new X.color(0, 1, 0), new X.color(0,
            0, 1), new X.color(1, 1, 0), new X.color(1, 0, 1), new X.color(0,
            1, 1));
    cuboid.setSpacing(1.0);
    
    // create a cube with a solid color
    var cube = new X.cube(new goog.math.Vec3(-10, -10, -10), 5);
    cube.setColor(new X.color(0, 0, 1));*/
    
    // create a cube with different colored sides
    var cube2 = new X.cube(new goog.math.Vec3(0, 0, 0), 3);
    cube2
        .setColors(new X.color(1, 0, 0), new X.color(0, 1, 0), new X.color(0,
            0, 1), new X.color(1, 1, 0), new X.color(1, 0, 1), new X.color(0,
            1, 1));
    
/*
    var trackfiber = new X.object(X.object.types.LINES);
    
    trackfiber.points().add([-50, -50, 30]);
    trackfiber.points().add([-40, -40, 30]);
    trackfiber.points().add([-40, -40, 30]);
    trackfiber.points().add([-20, -20, 00]);
    
    sliceView1.addObject(object1);
    sliceView2.addObject(object1);
    sliceView3.addObject(object1);
    threeDView.addObject(object1);
    threeDView.addObject(object2);
    threeDView.addObject(object3);
    threeDView.addObject(object4);
    threeDView.addObject(object5);*/
   //threeDView.addObject(cuboid);
   // threeDView.addObject(cube);

    threeDView.addObject(cube2);

    // we probably do not need to time this because of an appropriate event
    // mechanism?
    // temp, should update lighting like that, should use events!
     setInterval(function() {
     lighting = document.getElementById("lighting").checked;
     sliceView1.setLighting(lighting);
     sliceView1.render();
     sliceView2.setLighting(lighting);
     sliceView2.render();
     sliceView3.setLighting(lighting);
     sliceView3.render();
     threeDView.setLighting(lighting);
     threeDView.render();
     }, 15);

    c.out(sliceView1.print());
    c.out(sliceView2.print());
    c.out(sliceView3.print());
    c.out(threeDView.print());
    
    // goog.events.listen(threeDView.interactor(), 'mouseup', testCB);
    
    function testCB(e) {

      c.out(e);
      
    }
    

    // THE FOLLOWING IS A HACK UNTIL THE INTERACTOR IS READY
    function handleFileSelect(evt) {

      evt.stopPropagation();
      evt.preventDefault();
      
      var files = evt.dataTransfer.files; // FileList object.
      
      // files is a FileList of File objects. List some properties.
      
      var i, f = 0;
      for (i = 0; f = files[i]; i++) {
        
        var reader = new FileReader();
        
        reader.onloadend = testcallback;
        
        reader.readAsText(f);
        
      }
      
    }
    
    function testcallback(evt) {

      var result = evt.target.result;
      var readAsArray = result.split('\n');
      var objectN = new X.object();
      
      var i;
      for (i = 0; i < readAsArray.length; i++) {
        
        var tmp = readAsArray[i];
        var tmpstr = tmp.split(' ');
        
        if (tmpstr[3] == 'vertex') {
          
          var x = tmpstr[4];
          var y = tmpstr[5];
          var z = tmpstr[6];
          objectN.points().add([x, y, z]);
          
        }
        else if (tmpstr[1] == 'facet') {
            var x = tmpstr[3];
            var y = tmpstr[4];
            var z = tmpstr[5];
            objectN.normals().add([x, y, z]);
            objectN.normals().add([x, y, z]);
            objectN.normals().add([x, y, z]);
          }
      }
      
      threeDView.addObject(objectN);
      threeDView.render();
      
    }
    
    function handleDragOver(evt) {

      evt.stopPropagation();
      evt.preventDefault();
    }
    
    // Setup the dnd listeners.
    var dropZone = document.getElementById('threeDView');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    


  } catch (e) {
    
    // catch any X.exception and print the error to the error log
    
    if (e instanceof X.exception) {
      c.err(e.print());
    }
    
  }
  
};

// export symbols (requiered for advanced compilation)
goog.exportSymbol('sampleApp', sampleApp);
goog.exportSymbol('sampleApp.run', sampleApp.run);

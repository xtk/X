test = function() {

	//create a new test_renderer
	test_renderer = new X.renderer3D();
	test_renderer.init();
	
	//load a .mrc file
	var volume = new X.volume();
	volume.file = 'data/test.st';
	
	test_renderer.add(volume);
	
	test_renderer.render();
	
};
var scene, camera, renderer, canvas, ctx, holdObj, lego;
var mouseDown = false;
var dx = 0;
var dy = 0;
var zoomD = 0;
var mouse = [0,0];
var mouseNormalized = new THREE.Vector2(-1, -1);
var mouseSlowFactor = 333;
var raycaster = new THREE.Raycaster();
var holdObj = new THREE.Group();
var dioramaArray = [];

function buildDiorama(size, mesh){
	var arr = [];
	var size = size/2;
	for(var i = 0; i < size*2; i++){
		arr.push([]);
		for(var j = 0; j < size*2; j++){
			arr[i].push([]);
			for(var k = 0; k < size*2; k++){
				var newBlock = mesh.clone();
				newBlock.position.set(i-size, (j-size), k-size);
				newBlock.material = newBlock.material.clone();
				newBlock.material.color = new THREE.Color(j*j/(size*size*3), j*j/(size*size*3), j/size);
				newBlock.coords = [i, j, k];
				newBlock.visible = false;
				holdObj.add(newBlock);
				arr[i][j].push(newBlock);
			}
		}
	}
	scene.add(holdObj);

	return arr;
}

var options = function(){
	this.atom = '0';
	this.size = 10;
	this.materialLit = true;
	this.wireframeOn = false;
}

var opt = new options();
var gui = new dat.GUI();
window.onload = function(){
	var m = gui.addFolder('Model');
	m.add(opt, 'atom', {'Block': 0, 'Cube': 1, 'Plane': 2}).onFinishChange(function(){
		updateDiorama();
	});
	m.add(opt, 'size', 5, 30).onFinishChange(function(){
		updateDiorama();
	});
	m.add(opt, 'materialLit').onFinishChange(function(){
		updateDiorama();
	});
	opt.materialLit = true;
	m.add(opt, 'wireframeOn').onFinishChange(function(){
		updateDiorama();
	});
	opt.wireframeOn = false;
	m.open();

	var w = gui.addFolder('Waves')
	for(var i = 0; i < waves.length; i++){
		var wx = w.addFolder('Wave #' + (i+1));
		wx.add(waves[i], 'wavelength', 1, 50.0).onFinishChange(function (){recalcWaves()});
		wx.add(waves[i], 'directionX', -1.0, 1.0);
		wx.add(waves[i], 'directionY', -1.0, 1.0);
		wx.add(waves[i], 'amplitude', 0, 10);
		wx.add(waves[i], 'speed', 0, 5).onFinishChange(function() {recalcWaves()});

		if(i < 2){
			wx.open();
		}
	}
	
}

function recalcWaves() {
	for(var i = 0; i < waves.length; i++){
		waves[i].recalc();
	}
}


function updateDiorama() {
	var atomObj;
	if(opt.atom === '0'){
		atomObj = lego.clone();
		if(!opt.materialLit){
			atomObj.material = new THREE.MeshBasicMaterial({wireframe: opt.wireframeOn});
		}else{
			atomObj.material = new THREE.MeshPhongMaterial({shininess: 55, wireframe: opt.wireframeOn});
		}
	}else if(opt.atom === '1'){
		if(opt.materialLit){
			atomObj = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial({shininess: 55, wireframe: opt.wireframeOn}));
		}else{
			atomObj = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({wireframe: opt.wireframeOn}));
		}

	}else{
		if(opt.materialLit){
			atomObj = new THREE.Mesh(new THREE.PlaneGeometry(1,1,1), new THREE.MeshPhongMaterial({side: THREE.DoubleSide, wireframe: opt.wireframeOn}));

		}else{
			atomObj = new THREE.Mesh(new THREE.PlaneGeometry(1,1,1), new THREE.MeshBasicMaterial({side: THREE.DoubleSide, wireframe: opt.wireframeOn}));
		}
	}

	for(var i = 0; i < dioramaArray.length; i++){
		for(var j = 0; j < dioramaArray.length; j++){
			for(var k = 0; k < dioramaArray.length; k++){
				holdObj.remove(dioramaArray[i][j][k]);
			}		
		}		
	}
	scene.remove(holdObj);
	dioramaArray = buildDiorama(opt.size, atomObj);
}


function onMouseMove(e){
	e.preventDefault();
	if(mouseDown){
		dx += e.clientX - mouse[0];
		dy += e.clientY - mouse[1];

		mouse = [e.clientX, e.clientY];

	}

	mouseNormalized.x = (e.clientX/window.innerWidth)*2 - 1;
	mouseNormalized.y = -(e.clientY/window.innerHeight)*2 + 1;
}

function onTouchMove(e) {
	e.preventDefault();

	var t = e.touches[0];
	dx += (t.pageX - mouse[0])/2;
	dy += (t.pageY - mouse[1])/2;
	mouse = [e.pageX, e.pageY];
}

function onMouseDown(e){
	e.preventDefault();
	mouseDown = true;
	mouse = [e.clientX, e.clientY];
}

function onMosueUp(e){
	e.preventDefault();
	mouseDown = false;
}

function onLeaveWindow(e){
	mouseDown = false;
}

function onScroll(e){
	e.preventDefault();
	var d = e.wheelDelta;
	if(d === undefined){
		d = -e.detail;
	}

	zoomD += d;
}

function onResize(){
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function doMouse(c){
	c.addEventListener('mousemove', onMouseMove);
	c.addEventListener('touchmove', onTouchMove);

	c.addEventListener('mousedown', onMouseDown);
	c.addEventListener('mouseup', onMosueUp);

	c.addEventListener('mouseout', onLeaveWindow);
	c.addEventListener('DOMMouseScroll', onScroll);
	c.addEventListener('mousewheel', onScroll);
	window.onresize = onResize;
}

function updateRotation(){
	if(holdObj != undefined){
		holdObj.rotation.y += dx/mouseSlowFactor;
		dx -= dx/5;

		holdObj.rotation.x += dy/(mouseSlowFactor);
		dy -= dy/5;
		if(Math.abs(camera.position.z) > 9 || zoomD > 0){
			camera.position.z += zoomD/11;
			zoomD -= zoomD/3;
		}else{
			zoomD = 0;
		}
	}
}


function init() {
	renderer = new THREE.WebGLRenderer({antialias: true});
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 0.1, 1000);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	camera.position.z = 5;

	scene.background = new THREE.Color(0x000000);

	canvas = document.querySelector('#b canvas');


	scene.add(new THREE.AmbientLight(0x555555));
	var dLight = new THREE.DirectionalLight( 0x309099, 1, 5000 );
	dLight.position.set(11, 11, 11);
	scene.add(dLight);

	function loadingScreen(amt){

	}

	var manager = new THREE.LoadingManager();
	manager.onProgress = function(thing, loaded, total){

	}

	var text = new THREE.Texture();
	text.magFilter = THREE.NearestFilter;
	text.minFilter = THREE.NearestFilter;
	text.generateMipmaps = false;
	text.anisotropy = 0;

	var onProg = function(per){
		if(per.lengthComputable){
			var comp = per.loaded/per.total;
			loadingScreen(comp);
		}
	}

	var onError = function(per){

	}

	var loader = new THREE.ImageLoader(manager);
	loader.load('text.png', function(img){
		text.image = img;
		text.needsUpdate = true;
	});

	loader = new THREE.OBJLoader(manager);
	loader.load('lego.obj', function(obj){
		obj.traverse(function(child){
			if(child instanceof THREE.Mesh){
				child.material = new THREE.MeshPhongMaterial({color: 0x5555ff, shininess: 55});
			}
		});

		lego = obj.children[0];
	
		holdObj.rotation.set(Math.PI/4, Math.PI/4, 0);
		camera.position.z = opt.size*10;

		updateDiorama();
	}, onProg, onError);

}


function normalize2D(a) {
	var mag = Math.sqrt(a[0]*a[0] + a[1]*a[1]);
	return [a[0]/mag, a[1]/mag];
}


function wave(wavelength, dx, dy, amplitude, speed) {
	this.wavelength = wavelength;
	this.directionX = dx;
	this.directionY = dy;
	this.direction = normalize2D([dx, dy]);
	this.amplitude = amplitude;
	this.speed = speed;
	this.sp = (2*this.speed*Math.PI)/this.wavelength;
	this.w = 2*Math.PI/this.wavelength;

	this.update = function(x, y, curTime){
		return this.amplitude * Math.sin((this.direction[0]*x + this.direction[1]*y) * this.w + (curTime * this.sp)); 
	}

	this.recalc = function(){
		this.direction = normalize2D([this.directionX, this.directionY]);
		this.sp = (2*this.speed*Math.PI)/this.wavelength;
		this.w = 2*Math.PI/this.wavelength;
	}
}

var t = 0;
var waves = [new wave(20, 1, .5, 1, .3), new wave(50, -.1, .9, 5, .5), new wave(1, 1, 0, 0, 0), new wave(1, 1, 0, 0, 0), new wave(1, 1, 0, 0, 0)];

function updateWaves() {
	t += 1;
	for(var i = 0; i < dioramaArray.length; i++){
		for(var j = 0; j < dioramaArray.length; j++){
			for(var k = 0; k < dioramaArray.length; k++){
				dioramaArray[i][j][k].visible = false;
			}
		}
	}

	for(var i = 0; i < dioramaArray.length; i++){
		for(var j = 0; j < dioramaArray.length; j++){
			var h = 0
			for(var w = 0; w < waves.length; w++){
				h += waves[w].update(i, j, t);
			}
			for(var k = 0; k < h + dioramaArray.length/2; k++){
				if(dioramaArray[i][k] != undefined){
					dioramaArray[i][k][j].visible = true;						
				}
			}
		}		
	}
}




init();
doMouse(canvas);

var render = function () {
	requestAnimationFrame(render);
	updateRotation();
	updateWaves();
	renderer.render(scene, camera);
}
render();

















